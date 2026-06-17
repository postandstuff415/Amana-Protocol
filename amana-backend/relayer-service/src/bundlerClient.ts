/**
 * Amana Protocol - ERC-4337 Bundler Client
 *
 * Communicates with an ERC-4337 bundler (Pimlico, StackUp, etc.) to
 * submit UserOperations with gas sponsorship.
 *
 * The bundler is an RPC endpoint that accepts UserOperations and
 * bundles them into a single transaction to the EntryPoint contract.
 *
 * Supported bundlers:
 *   - Pimlico: https://api.pimlico.io/v2/<chain>/rpc
 *   - StackUp: https://<chain>.bundler.stackup.sh
 *   - Local: http://localhost:4337
 */

import { ethers } from 'ethers';

export interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

export interface BundlerConfig {
  rpcUrl: string;
  entryPointAddress: string;
  chainId: number;
}

export class BundlerClient {
  private config: BundlerConfig;

  constructor(config: BundlerConfig) {
    this.config = config;
  }

  /**
   * Estimate gas for a UserOperation via the bundler.
   */
  async estimateUserOperationGas(userOp: Partial<UserOperation>): Promise<{
    callGasLimit: string;
    verificationGasLimit: string;
    preVerificationGas: string;
  }> {
    const response = await this.rpcCall('eth_estimateUserOperationGas', [
      userOp,
      this.config.entryPointAddress,
    ]);
    return {
      callGasLimit: response.callGasLimit,
      verificationGasLimit: response.verificationGasLimit,
      preVerificationGas: response.preVerificationGas,
    };
  }

  /**
   * Submit a UserOperation to the bundler.
   * Returns the userOpHash which can be used to track status.
   */
  async sendUserOperation(userOp: UserOperation): Promise<string> {
    const userOpHash = await this.rpcCall('eth_sendUserOperation', [
      userOp,
      this.config.entryPointAddress,
    ]);
    return userOpHash;
  }

  /**
   * Get the status of a UserOperation by its hash.
   */
  async getUserOperationReceipt(userOpHash: string): Promise<{
    userOpHash: string;
    entryPoint: string;
    sender: string;
    nonce: number;
    paymaster: string;
    actualGasUsed: number;
    success: boolean;
    receipt: any;
  } | null> {
    return this.rpcCall('eth_getUserOperationReceipt', [userOpHash]);
  }

  /**
   * Get the supported entry points from the bundler.
   */
  async getSupportedEntryPoints(): Promise<string[]> {
    return this.rpcCall('eth_supportedEntryPoints', []);
  }

  /**
   * Get chain ID from the bundler.
   */
  async getChainId(): Promise<number> {
    return this.rpcCall('eth_chainId', []);
  }

  /**
   * Make a JSON-RPC call to the bundler.
   */
  private async rpcCall(method: string, params: any[]): Promise<any> {
    const response = await fetch(this.config.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`Bundler RPC error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Bundler error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    return data.result;
  }
}

/**
 * Supported chain configurations for the bundler.
 */
export const SUPPORTED_CHAINS: Record<number, { name: string; bundlerUrl: string; entryPoint: string }> = {
  // Base Sepolia Testnet
  84532: {
    name: 'base-sepolia',
    bundlerUrl: 'https://api.pimlico.io/v2/base-sepolia/rpc',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  },
  // Celo Alfajores Testnet
  44787: {
    name: 'celo-alfajores',
    bundlerUrl: 'https://api.pimlico.io/v2/celo-alfajores/rpc',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  },
  // Ethereum Sepolia
  11155111: {
    name: 'eth-sepolia',
    bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  },
};

/**
 * Default EntryPoint address (same across all chains):
 * ERC-4337 EntryPoint v0.7: 0x0000000071727De22E5E9d8BAf0edAc6f37da032
 * ERC-4337 EntryPoint v0.6: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
 */
export const DEFAULT_ENTRYPOINT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';