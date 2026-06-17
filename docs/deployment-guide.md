# Amana Protocol: Technical Deployment Guide
*Step-by-step instructions for deploying the Amana Protocol stack.*

## 1. Prerequisites
- **Node.js**: v20.0 or higher.
- **Foundry**: For smart contract development and deployment.
- **Docker & Docker Compose**: For containerized backend services.
- **RPC Credentials**: Access to Celo Alfajores or Base Goerli testnets.

## 2. Smart Contract Deployment (Foundry)
Navigate to `amana-contracts/`:

1. **Setup Env**:
   ```bash
   export PRIVATE_KEY=0x...
   export RPC_URL=https://alfajores-forno.celo-testnet.org
   ```
2. **Deploy Core Suite**:
   ```bash
   forge script scripts/DeployAll.s.sol --rpc-url $RPC_URL --broadcast --verify
   ```
3. **Linking**: Execute the `LinkContracts.s.sol` script to set addresses for the DisputeEngine and EveryoneEats split within the Escrow contract.

## 3. Backend Services (Merchant API, USSD Gateway, Relayer)
All backend services are designed to run in Docker containers.

### USSD Gateway & Relayer Setup
- **Environment Variables**:
    - `AT_API_KEY`: Africa's Talking API key for GSM sessions.
    - `BUNDLER_RPC_URL`: Endpoint for the ERC-4337 bundler (Pimlico/StackUp).
    - `ENTRYPOINT_ADDRESS`: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789.
    - `ESCROW_ADDRESS`: Address of the deployed AmanaEscrow contract.

- **Running with Docker**:
   ```bash
   docker-compose up -d
   ```

## 4. Frontend Applications
- **Dashboard**: React-based admin tool. Run `npm run dev` in `frontend/admin-dashboard`.
- **Landing Page**: Static site in `frontend/landing-page`.
- **USSD Simulator**: Included in the USSD Gateway for local developer testing (`GET /api/ussd/simulate`).

## 5. Network Topology
```text
[GSM Feature Phone] 
      ↓ (USSD Dial *483#)
[Telco Towers] 
      ↓ (HTTP Callback)
[USSD Gateway (Node.js)] 
      ↓ (API Call)
[Merchant API / Relayer Service] 
      ↓ (ERC-4337 UserOperation)
[Bundler / EntryPoint] 
      ↓ (On-Chain Execution)
[Amana Smart Contracts (L2)]
```

## 6. Environment Variable Reference

| Variable | Scope | Description |
|---|---|---|
| `DATABASE_URL` | All | Postgres/SQLite connection string. |
| `PAYMASTER_ADDRESS`| Relayer | Address of the gas-sponsoring contract. |
| `TRUST_SCORE_ADDRESS`| Relayer | Address of the reputation contract. |
| `CORS_ALLOWED_ORIGINS`| API | Production domain for dashboard access. |

## 7. Troubleshooting FAQ

**Q: USSD session returns "Error 500"**
- **A**: Check if the Africa's Talking callback URL matches your USSD Gateway endpoint. Ensure your response is prefixed with `CON` or `END`.

**Q: Wallet address is different on USSD vs Simulator**
- **A**: Verify that both services use the same salt derivation logic (hashed MSISDN) and identical `ENTRYPOINT_ADDRESS`.

**Q: Gas sponsorship is failing**
- **A**: Check the Paymaster balance on-chain. If the balance falls below 0.1 native token, UserOperations will be rejected by the bundler.

**Artifact**: `/home/team/shared/docs/deployment-guide.md`
