# Amana Protocol: Smart Contract Specification
*Functional definition for the Smart Contract Engineering Team*

## 1. AmanaEscrow.sol
**Purpose**: Custodies stablecoins and manages the lifecycle of B2B trades.

### State Variables
- `mapping(uint256 => Trade) public trades`: Primary trade storage.
- `uint256 public tradeCounter`: Incremental ID for trades.
- `address public immutable entryPoint`: ERC-4337 EntryPoint address.

### Core Functions
- `createTrade(address seller, uint256 amount, address token, uint256 timeout) external`: Initiates a trade object.
- `lockFunds(uint256 tradeId) external`: Transfers tokens from buyer to contract (requires approval).
- `releaseFunds(uint256 tradeId) external`: Releases funds to seller. Accessible by `buyer` OR `DisputeEngine`.
- `initiateDispute(uint256 tradeId) external`: Transitions status to `Disputed`.

### Events
- `TradeCreated(uint256 indexed tradeId, address buyer, address seller)`
- `TradeReleased(uint256 indexed tradeId)`

---

## 2. EveryoneEats.sol
**Purpose**: Programmatic revenue distribution implementing the 35/40/25 split.

### State Variables
- `uint256 public constant FRONT_END_SHARE = 35`: Percent to merchant rebates.
- `uint256 public constant MIDDLE_END_SHARE = 40`: Percent to engineering/telco.
- `uint256 public constant BACK_END_SHARE = 25`: Percent to reserves/royalty.

### Core Functions
- `distributeRevenue(uint256 amount, address token) external`: Splits incoming fees into internal accounting buckets.
- `withdrawPool(uint256 poolId, address to, uint256 amount) external`: Admin-only withdrawal for specific budget lines.

---

## 3. AmanaTrustScore.sol
**Purpose**: Manages merchant reputation and velocity caps based on on-chain history.

### State Variables
- `mapping(address => uint256) public merchantScores`: Merchant reputation level.
- `mapping(address => uint256) public merchantCeilings`: Max transaction value for the merchant.

### Core Functions
- `incrementScore(address merchant, uint256 tradeValue) external`: Called by `Escrow` on successful release.
- `checkCeiling(address merchant, uint256 amount) external view`: Returns bool if trade is within limits.

---

## 4. AmanaDisputeEngine.sol
**Purpose**: Implements the two-tier dispute resolution logic.

### State Variables
- `address public ambassadorChairman`: Multi-sig address for macro-disputes.
- `mapping(address => uint256) public lastMicroDispute`: Cooldown tracker for Tier 1.

### Core Functions
- `resolveMicroDispute(uint256 tradeId) external`: Only if amount < $100 and cooldown passed. Calls `Escrow.refund()`.
- `resolveMacroDispute(uint256 tradeId, address winner, bytes signature) external`: Requires Chairman signature.

---

## 5. ERC-4337 Integration Details
- **EntryPoint**: All contracts must interface with `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`.
- **Validation**: User wallets (SIM-mapped) must implement `validateUserOp` to allow gas sponsorship via the Amana Paymaster.

**Artifact**: `/home/team/shared/docs/contract-spec.md`
