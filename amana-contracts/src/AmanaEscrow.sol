// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";

import "./AmanaTrustScore.sol";

/**
 * @title AmanaEscrow
 * @dev Core Escrow contract for the Amana Protocol.
 * Handles stablecoin custody, trade lifecycle, and dispute states.
 * Upgraded with Dynamic Capital-Yield model.
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

    // Dynamic Yield State
    uint256 public liquidityBufferFloor;
    uint256 public totalYieldAllocated;
    address public liquidityPredictorOracle;
    mapping(address => address) public yieldVaults; // token -> ERC4626 vault

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
    event LiquidityFloorUpdated(uint256 newFloor);
    event YieldVaultUpdated(address indexed token, address indexed vault);
    event YieldRecall(address indexed token, uint256 amount);

    modifier onlyAuthorized() {
        require(msg.sender == owner() || msg.sender == disputeEngine || msg.sender == liquidityPredictorOracle, "Not authorized");
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

    function setLiquidityPredictorOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Zero address: oracle");
        liquidityPredictorOracle = _oracle;
    }

    function setYieldVault(address _token, address _vault) external onlyOwner {
        require(_token != address(0), "Zero address: token");
        require(_vault != address(0), "Zero address: vault");
        yieldVaults[_token] = _vault;
        emit YieldVaultUpdated(_token, _vault);
    }

    function updateLiquidityFloor(uint256 _newFloor) external onlyAuthorized {
        liquidityBufferFloor = _newFloor;
        emit LiquidityFloorUpdated(_newFloor);
    }

    /**
     * @dev Create a new escrow trade. Funds are transferred from buyer to this contract.
     * Renamed from createTrade to match spec: initializeTrade.
     */
    function initializeTrade(address _seller, address _token, uint256 _amount) external nonReentrant returns (uint256) {
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

        // Dynamic Yield: Evaluate and route excess liquidity
        _evaluateAndRouteYield(_token);

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
     * Renamed from confirmReceipt to match spec: releaseEscrow.
     */
    function releaseEscrow(uint256 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer, "Only buyer can confirm receipt");
        require(trade.state == State.SHIPPED || trade.state == State.CREATED, "Invalid state");

        _completeTrade(_tradeId, trade);
    }

    function _completeTrade(uint256 _tradeId, Trade storage trade) internal {
        trade.state = State.COMPLETED;
        trade.updatedAt = block.timestamp;

        // Record successful trade in trust score
        trustScore.recordSuccessfulTrade(trade.buyer);
        trustScore.recordSuccessfulTrade(trade.seller);

        uint256 totalPayout = trade.amount;
        uint256 feePayout = trade.fee;

        // Ensure liquidity for payout
        _ensureLiquidity(trade.token, totalPayout + feePayout);

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

        if (_finalState == State.COMPLETED) {
            _completeTrade(_tradeId, trade);
        } else {
            refundEscrow(_tradeId);
        }

        emit TradeResolved(_tradeId, _finalState);
    }

    /**
     * @dev Refund a trade to the buyer.
     * Part of spec: refundEscrow.
     */
    function refundEscrow(uint256 _tradeId) public onlyAuthorized nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(trade.state == State.DISPUTED || trade.state == State.CREATED || trade.state == State.SHIPPED, "Invalid state");

        trade.state = State.REFUNDED;
        trade.updatedAt = block.timestamp;

        uint256 refundAmount = trade.amount + trade.fee;
        _ensureLiquidity(trade.token, refundAmount);
        IERC20(trade.token).safeTransfer(trade.buyer, refundAmount);
    }

    // --- Dynamic Yield Logic ---

    function _evaluateAndRouteYield(address _token) internal {
        address vault = yieldVaults[_token];
        if (vault == address(0)) return;

        uint256 balance = IERC20(_token).balanceOf(address(this));
        if (balance > liquidityBufferFloor) {
            uint256 excess = balance - liquidityBufferFloor;
            // Gas preservation: min variance check (avoid small deposits)
            if (excess > 100 * 1e6) { // Min $100 for yield routing
                IERC20(_token).safeApprove(vault, excess);
                IERC4626(vault).deposit(excess, address(this));
                totalYieldAllocated += excess;
            }
        }
    }

    function _ensureLiquidity(address _token, uint256 _amount) internal {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        if (balance < _amount) {
            _recallYieldCapital(_token, _amount - balance);
        }
    }

    function _recallYieldCapital(address _token, uint256 _amount) internal {
        address vault = yieldVaults[_token];
        require(vault != address(0), "No yield vault for token");

        // Withdraw from ERC4626 vault
        // Note: In production, handle potential slippage or withdrawal fees
        uint256 withdrawn = IERC4626(vault).withdraw(_amount, address(this), address(this));
        totalYieldAllocated -= withdrawn;

        emit YieldRecall(_token, withdrawn);
    }
}
