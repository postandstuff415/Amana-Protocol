/**
 * Amana Protocol - Relayer Service
 *
 * Bridges USSD actions to on-chain smart contract calls via ERC-4337.
 * Sponsored gas means merchants never need to hold ETH for gas fees.
 *
 * Flow:
 *   1. Phone number → ERC-4337 wallet address (deterministic derivation)
 *   2. Construct UserOperation from the requested action
 *   3. Estimate gas via the bundler
 *   4. Apply paymaster sponsorship (Amana covers gas)
 *   5. Submit to the ERC-4337 bundler
 *   6. Return userOpHash for tracking
 */

import { ethers } from 'ethers';
import { walletService } from './walletService';
import { BundlerClient, UserOperation, DEFAULT_ENTRYPOINT } from './bundlerClient';
import { dexAggregator } from './dexAggregator';

export type EscrowAction =
  | 'create_escrow'
  | 'deposit_funds'
  | 'confirm_delivery'
  | 'release_funds'
  | 'refund_buyer'
  | 'file_dispute'
  | 'update_liquidity_floor';

export interface GasSponsorshipRequest {
  phoneNumber: string;
  action: EscrowAction;
  tradeId?: string;
  amount?: string;
  escrowAddress?: string;
  sourceToken?: string;
  targetToken?: string;
}

export interface GasSponsorshipResponse {
  success: boolean;
  userOpHash?: string;
  txHash?: string;
  error?: string;
  sponsoredGasWei?: string;
  walletAddress?: string;
  chainId?: number;
}

// Amana Paymaster address (for gas sponsorship)
const AMANA_PAYMASTER = '0x0000000000000000000000000000000000000A4E'; // Placeholder

export class Relayer {
  private bundler: BundlerClient;
  private provider: ethers.JsonRpcProvider;
  private sponsorWallet: ethers.Wallet;

  constructor() {
    // Read config from environment
    const bundlerRpcUrl = process.env.BUNDLER_RPC_URL || 'https://api.pimlico.io/v2/base-sepolia/rpc';
    const entryPointAddress = process.env.ENTRYPOINT_ADDRESS || DEFAULT_ENTRYPOINT;
    const sponsorKey = process.env.GAS_SPONSOR_PRIVATE_KEY || ethers.ZeroHash;

    // Default to Base Sepolia chain ID
    const chainId = parseInt(process.env.CHAIN_ID || '84532', 10);

    this.bundler = new BundlerClient({ rpcUrl: bundlerRpcUrl, entryPointAddress, chainId });

    // Connect to the RPC for gas estimation / nonce fetching
    const rpcUrl = process.env.RPC_URL || 'https://sepolia.base.org';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // The gas sponsor account — holds ETH to pay for gas
    this.sponsorWallet = new ethers.Wallet(sponsorKey, this.provider);
  }

  /**
   * Sponsor a gasless transaction for a merchant.
   *
   * 1. Look up or register the merchant's ERC-4337 wallet
   * 2. Construct the appropriate UserOperation
   * 3. Estimate gas via the bundler
   * 4. Apply paymaster sponsorship (Amana covers gas)
   * 5. Submit to bundler
   * 6. Return userOpHash
   */
  async sponsorTransaction(request: GasSponsorshipRequest): Promise<GasSponsorshipResponse> {
    try {
      // Step 1: Get or create wallet mapping
      let wallet = walletService.getByPhone(request.phoneNumber);
      if (!wallet) {
        // Auto-register if not found
        wallet = walletService.register(request.phoneNumber, '');
        if (!wallet) {
          return { success: false, error: 'Failed to register wallet' };
        }
      }

      // Step 2: Get the nonce for this wallet from the EntryPoint
      const nonce = await this.getNonce(wallet.walletAddress);

      // Step 3: Build call data for the requested action
      const callData = await this.buildCallData(request);

      // Step 4: Construct the UserOperation
      const userOp: Partial<UserOperation> = {
        sender: wallet.walletAddress,
        nonce: ethers.toBeHex(nonce),
        initCode: wallet.isDeployed ? '0x' : this.getInitCode(wallet.walletAddress),
        callData,
        callGasLimit: '0x',
        verificationGasLimit: '0x',
        preVerificationGas: '0x',
        maxFeePerGas: '0x',
        maxPriorityFeePerGas: '0x',
        paymasterAndData: AMANA_PAYMASTER,
        signature: '0x',
      };

      // Step 5: Estimate gas via bundler
      const gasEstimates = await this.bundler.estimateUserOperationGas(userOp);
      userOp.callGasLimit = gasEstimates.callGasLimit;
      userOp.verificationGasLimit = gasEstimates.verificationGasLimit;
      userOp.preVerificationGas = gasEstimates.preVerificationGas;

      // Step 6: Get current gas prices
      const feeData = await this.provider.getFeeData();
      userOp.maxFeePerGas = ethers.toBeHex(feeData.maxFeePerGas || 1000000000n);
      userOp.maxPriorityFeePerGas = ethers.toBeHex(feeData.maxPriorityFeePerGas || 100000000n);

      // Step 7: Sign the UserOperation with the sponsor wallet
      // In production: EIP-712 typed data signing for UserOperation
      userOp.signature = await this.signUserOperation(userOp as UserOperation);

      // Step 8: Submit to bundler
      const userOpHash = await this.bundler.sendUserOperation(userOp as UserOperation);

      // Step 9: Mark wallet as deployed if initCode was sent
      if (!wallet.isDeployed) {
        walletService.markDeployed(request.phoneNumber, userOpHash);
      }

      const sponsoredGas = ethers.formatEther(
        BigInt(gasEstimates.callGasLimit) + BigInt(gasEstimates.verificationGasLimit)
      );

      return {
        success: true,
        userOpHash,
        sponsoredGasWei: sponsoredGas,
        walletAddress: wallet.walletAddress,
        chainId: this.bundler['config'].chainId,
      };
    } catch (error: any) {
      console.error('[Relayer] Sponsorship failed:', error);
      return {
        success: false,
        error: error.message || 'Gas sponsorship failed',
      };
    }
  }

  /**
   * Build the call data for an escrow action.
   * In production, this encodes the function call to the escrow contract.
   */
  private async buildCallData(request: GasSponsorshipRequest): Promise<string> {
    // Check if multi-hop swap is needed
    if (request.sourceToken && request.targetToken && request.sourceToken !== request.targetToken && request.amount) {
      console.log(`[Relayer] Intercepting cross-border trade for multi-hop swap: ${request.sourceToken} -> ${request.targetToken}`);
      
      const chainId = this.bundler['config'].chainId;
      const bestPath = await dexAggregator.getBestPath(
        request.sourceToken,
        request.targetToken,
        request.amount,
        chainId
      );

      // In a real AA setup, we might use a MultiCall or a custom hook to swap and then escrow
      // For this simulation, we return the swap call data
      return dexAggregator.encodeSwap(bestPath.path, request.amount, bestPath.expectedOutput);
    }

    // Placeholder — in production, use ethers.Interface.encodeFunctionData()
    // Example:
    // const escrowIface = new ethers.Interface([...abi]);
    // return escrowIface.encodeFunctionData('createEscrow', [params...]);

    switch (request.action) {
      case 'create_escrow':
        return '0x'; // createEscrow(buyer, seller, amount, token)
      case 'deposit_funds':
        return '0x'; // depositFunds(tradeId)
      case 'confirm_delivery':
        return '0x'; // confirmDelivery(tradeId)
      case 'release_funds':
        return '0x'; // releaseFunds(tradeId)
      case 'refund_buyer':
        return '0x'; // refundBuyer(tradeId)
      case 'update_liquidity_floor':
        const escrowIface = new ethers.Interface([
          'function updateLiquidityFloor(uint256 _newFloor) external',
        ]);
        return escrowIface.encodeFunctionData('updateLiquidityFloor', [request.amount || '0']);
      default:
        return '0x';
    }
  }

  /**
   * Get the init code to deploy a counterfactual wallet.
   * In production, this encodes the factory call: factory.createAccount(salt, owner)
   */
  private getInitCode(senderAddress: string): string {
    // Placeholder — in production, encode factory deployment:
    // factory.createAccount(owner, salt)
    return '0x';
  }

  /**
   * Get the nonce for a wallet from the EntryPoint.
   */
  private async getNonce(walletAddress: string): Promise<bigint> {
    try {
      const entryPointIface = new ethers.Interface([
        'function getNonce(address sender, uint192 key) view returns (uint256 nonce)',
      ]);
      const data = entryPointIface.encodeFunctionData('getNonce', [walletAddress, 0]);
      const result = await this.provider.call({
        to: DEFAULT_ENTRYPOINT,
        data,
      });
      return BigInt(result);
    } catch {
      return 0n; // First nonce
    }
  }

  /**
   * Sign a UserOperation with the sponsor key.
   * In production this uses EIP-712 typed data signing.
   */
  private async signUserOperation(userOp: UserOperation): Promise<string> {
    // Placeholder — in production:
    // const domain = { name: 'Account', version: '1', chainId, verifyingContract: entryPoint }
    // const types = { UserOperation: [...] }
    // return await sponsorWallet.signTypedData(domain, types, userOp)
    return ethers.solidityPackedKeccak256(
      ['address', 'uint256'],
      [userOp.sender, BigInt(userOp.nonce)]
    );
  }

  /**
   * Get the gas sponsor's address (for display/funding purposes).
   */
  getSponsorAddress(): string {
    return this.sponsorWallet.address;
  }

  /**
   * Get the sponsor's ETH balance.
   */
  async getSponsorBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.sponsorWallet.address);
    return ethers.formatEther(balance);
  }
}

export const relayer = new Relayer();