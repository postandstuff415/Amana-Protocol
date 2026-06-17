// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "../trust/AmanaTrustScore.sol";

/**
 * @title AmanaEscrow
 * @dev Core Escrow contract for the Amana Protocol.
 * Handles stablecoin custody, trade lifecycle, and dispute states.
 * Uses SafeERC20 for non-compliant token safety (e.g. USDT).
 */
contract AmanaEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum State { CREATED, SHIPPED, COMPLETED, DISPUTED, REFUNDED }

    struct Trade {
        address buyer;
        address seller;
        address token;
        uint256 amount;
        uint256 fee;
        State state;
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(uint256 => Trade) public trades;
    uint256 public tradeCount;

    address public revenueSplitter;
    AmanaTrustScore public trustScore;
    address public disputeEngine;

    uint256 public constant FEE_PERCENT = 100; // 1.0% (basis points: 100 / 10000)
    uint256 public constant FEE_DENOMINATOR = 10000;

    event TradeCreated(uint256 indexed tradeId, address indexed buyer, address indexed seller, uint256 amount, address token);
    event TradeShipped(uint256 indexed tradeId);
    event TradeCompleted(uint256 indexed tradeId);
    event TradeDisputed(uint256 indexed tradeId, address disputedBy);
    event TradeResolved(uint256 indexed tradeId, State finalState);
    event RevenueSplitterUpdated(address indexed newSplitter);
    event TrustScoreUpdated(address indexed newTrustScore);
    event DisputeEngineUpdated(address indexed newEngine);

    modifier onlyAuthorized() {
        require(msg.sender == owner() || msg.sender == disputeEngine, "Not authorized");
        _;
    }

    constructor(address _revenueSplitter, address _trustScore) Ownable(msg.sender) {
        require(_revenueSplitter != address(0), "Zero address: revenueSplitter");
        require(_trustScore != address(0), "Zero address: trustScore");
        revenueSplitter = _revenueSplitter;
        trustScore = AmanaTrustScore(_trustScore);
    }

    function setRevenueSplitter(address _revenueSplitter) external onlyOwner {
        require(_revenueSplitter != address(0), "Zero address: revenueSplitter");
        revenueSplitter = _revenueSplitter;
        emit RevenueSplitterUpdated(_revenueSplitter);
    }

    function setTrustScore(address _trustScore) external onlyOwner {
        require(_trustScore != address(0), "Zero address: trustScore");
        trustScore = AmanaTrustScore(_trustScore);
        emit TrustScoreUpdated(_trustScore);
    }

    function setDisputeEngine(address _disputeEngine) external onlyOwner {
        require(_disputeEngine != address(0), "Zero address: disputeEngine");
        disputeEngine = _disputeEngine;
        emit DisputeEngineUpdated(_disputeEngine);
    }

    /**
     * @dev Create a new escrow trade. Funds are transferred from buyer to this contract.
     */
    function createTrade(address _seller, address _token, uint256 _amount) external nonReentrant returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_seller != address(0), "Invalid seller address");
        require(_token != address(0), "Invalid token address");
        
        // Check trust score ceiling for the buyer
        require(trustScore.isWithinCeiling(msg.sender, _amount), "Trade amount exceeds trust ceiling");
        
        uint256 fee = (_amount * FEE_PERCENT) / FEE_DENOMINATOR;
        
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        uint256 tradeId = ++tradeCount;
        trades[tradeId] = Trade({
            buyer: msg.sender,
            seller: _seller,
            token: _token,
            amount: _amount - fee,
            fee: fee,
            state: State.CREATED,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit TradeCreated(tradeId, msg.sender, _seller, _amount, _token);
        return tradeId;
    }

    /**
     * @dev Seller marks the trade as shipped.
     */
    function markAsShipped(uint256 _tradeId) external {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.seller, "Only seller can mark as shipped");
        require(trade.state == State.CREATED, "Invalid state");

        trade.state = State.SHIPPED;
        trade.updatedAt = block.timestamp;

        emit TradeShipped(_tradeId);
    }

    /**
     * @dev Buyer confirms receipt and releases funds to seller.
     */
    function confirmReceipt(uint256 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer, "Only buyer can confirm receipt");
        require(trade.state == State.SHIPPED || trade.state == State.CREATED, "Invalid state");

        // Checks-Effects-Interactions: update state before external calls
        trade.state = State.COMPLETED;
        trade.updatedAt = block.timestamp;

        // Record successful trade in trust score (internal contract call)
        trustScore.recordSuccessfulTrade(trade.buyer);
        trustScore.recordSuccessfulTrade(trade.seller);

        uint256 totalPayout = trade.amount;
        uint256 feePayout = trade.fee;

        // Interactions: external token transfers
        IERC20(trade.token).safeTransfer(trade.seller, totalPayout);
        IERC20(trade.token).safeTransfer(revenueSplitter, feePayout);

        emit TradeCompleted(_tradeId);
    }

    /**
     * @dev Raise a dispute. Can be raised by buyer or seller.
     */
    function raiseDispute(uint256 _tradeId) external {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer || msg.sender == trade.seller, "Not authorized");
        require(trade.state == State.CREATED || trade.state == State.SHIPPED, "Invalid state");

        trade.state = State.DISPUTED;
        trade.updatedAt = block.timestamp;

        emit TradeDisputed(_tradeId, msg.sender);
    }

    /**
     * @dev Resolve a dispute. Only owner (or dispute engine) can resolve.
     */
    function resolveDispute(uint256 _tradeId, State _finalState) external onlyAuthorized nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(trade.state == State.DISPUTED, "Trade not in dispute");
        require(_finalState == State.COMPLETED || _finalState == State.REFUNDED, "Invalid resolution state");

        // Checks-Effects: update state before external calls
        trade.state = _finalState;
        trade.updatedAt = block.timestamp;

        // Interactions: external token transfers
        if (_finalState == State.COMPLETED) {
            IERC20(trade.token).safeTransfer(trade.seller, trade.amount);
            IERC20(trade.token).safeTransfer(revenueSplitter, trade.fee);
        } else {
            // Refunded
            IERC20(trade.token).safeTransfer(trade.buyer, trade.amount + trade.fee);
        }

        emit TradeResolved(_tradeId, _finalState);
    }
}