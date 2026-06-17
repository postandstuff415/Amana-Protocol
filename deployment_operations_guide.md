# Amana Protocol: Technical Deployment & Operations Guide
*Comprehensive guide for deploying and managing the Amana Protocol stack.*

## 1. System Architecture
The Amana Protocol consists of four primary layers:
- **On-Chain Layer**: Solidity smart contracts (Escrow, Revenue Split, Trust Score, Dispute Engine).
- **Relay Layer**: ERC-4337 middleware (Phone-to-Wallet mapping, Gas Sponsorship).
- **Communication Layer**: USSD Gateway (Interface for feature phones).
- **Admin Layer**: React-based dashboard for Market Ambassadors and protocol monitoring.

## 2. Prerequisites
- **Node.js** (v18+) & **npm/yarn**
- **Docker** & **Docker Compose**
- **Hardhat** (for contract deployment)
- **Africa's Talking API Key** (for USSD and SMS)
- **RPC Provider URL** (Celo Alfajores or Base Goerli)
- **Bundler URL** (e.g., Pimlico, StackUp for ERC-4337)

## 3. On-Chain Deployment (Hardhat)
Navigate to `amana-contracts/`:

1. **Install Dependencies**: `npm install`
2. **Configure `.env`**:
   ```env
   PRIVATE_KEY=your_deployer_key
   RPC_URL=https://alfajores-forno.celo-testnet.org
   USDC_ADDRESS=0x...
   USDT_ADDRESS=0x...
   ```
3. **Deploy Core Contracts**:
   ```bash
   npx hardhat run scripts/deploy.js --network alfajores
   ```
   *Note: Save the addresses for Escrow, EveryoneEats, TrustScore, and DisputeEngine.*

4. **Initialize Linking**:
   Run the setup script to link the contracts (e.g., setting the `DisputeEngine` address in the `Escrow` contract).

## 4. Backend Services Deployment
The backend services are containerized for easy deployment.

### 4.1 USSD Gateway (`ussd-gateway/`)
- **Port**: 3002
- **Key Env Vars**:
  - `AT_API_KEY`: Africa's Talking API key.
  - `AT_USERNAME`: Africa's Talking username.
  - `BACKEND_API_URL`: URL of the Merchant/Relayer API.

### 4.2 Relayer Service (`relayer-service/`)
- **Port**: 3003
- **Key Env Vars**:
  - `BUNDLER_RPC_URL`: URL of the ERC-4337 bundler.
  - `ENTRYPOINT_ADDRESS`: Address of the EntryPoint contract (v0.6).
  - `PAYMASTER_ADDRESS`: Address of the Amana Paymaster (for gas sponsorship).

### 4.3 Docker Compose (Full Stack)
In the root directory, run:
```bash
docker-compose up -d
```
This will spin up the USSD Gateway, Relayer, and the shared database.

## 5. Frontend Deployment
- **Landing Page**: Deploy to Vercel/Netlify from `frontend/landing-page/`.
- **Admin Dashboard**: Deploy to Vercel/Netlify from `frontend/admin-dashboard/`.
  - Ensure `VITE_API_URL` points to the load-balanced USSD Gateway/Relayer endpoints.

## 6. Environment Variable Reference
| Variable | Service | Description |
|---|---|---|
| `ESCROW_ADDRESS` | Relayer | The deployed AmanaEscrow contract address. |
| `TRUST_SCORE_ADDRESS`| Relayer | The deployed AmanaTrustScore contract address. |
| `REVENUE_SPLIT_ADDRESS`| Relayer | The deployed EveryoneEats contract address. |
| `DATABASE_URL` | All | SQLite/Postgres connection string. |

## 7. Operations & Troubleshooting
### 7.1 Monitoring Logs
- **USSD Sessions**: Monitor `POST /ussd` logs to ensure telco callbacks are reaching the gateway.
- **Relayer**: Monitor `POST /api/relayer/sponsor` to verify gas sponsorship is active.

### 7.2 Common Issues
- **Session Timeout**: USSD sessions usually timeout after 30-60 seconds. Ensure the state machine handles `END` events gracefully.
- **Gas Sponsorship Failure**: Check Paymaster balance on-chain. If depleted, the relayer will fail to submit UserOperations.
- **SIM Verification**: If a merchant's SIM isn't pre-vetted, the gateway will return an "Unauthorized" menu. Verify MSISDN in the database.

## 8. Security Procedures
- **Key Rotation**: Rotate `PRIVATE_KEY` for the Relayer/Sponsor monthly.
- **Multi-Sig Management**: Macro-disputes require 2-of-3 signatures from the Market Ambassador Chairman. Ensure signers use hardware wallets for the `IDisputeEngine` calls.
