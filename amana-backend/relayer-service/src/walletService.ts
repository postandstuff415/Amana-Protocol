/**
 * Amana Protocol - Wallet Service
 *
 * Maps SIM-authenticated phone numbers to ERC-4337 smart contract wallet addresses.
 * Uses ethers.js keccak256 for deterministic counterfactual address derivation.
 * Gas is sponsored by the protocol relayer.
 *
 * Architecture:
 *   phoneNumber → keccak256(domain + phoneNumber) → truncated → ERC-4337 wallet address
 *
 * In production, this uses CREATE2 with the phone number hash as salt.
 * The wallet is deployed via an ERC-4337 factory contract using
 * entryPoint.getSenderAddress() for counterfactual derivation.
 */

import { ethers } from 'ethers';

export interface WalletMapping {
  phoneNumber: string;
  merchantId: string;
  walletAddress: string;
  isDeployed: boolean;
  deployTxHash?: string;
  createdAt: number;
}

// In-memory store (in production, use the shared SQLite DB)
const walletMappings: Map<string, WalletMapping> = new Map();

export class WalletService {
  private readonly DOMAIN_SEPARATOR = 'amana-wallet-v1';
  private readonly ADDRESS_PREFIX = '0x';

  /**
   * Derive a counterfactual ERC-4337 wallet address from a phone number.
   *
   * Uses ethers.js keccak256 for proper Ethereum address derivation.
   * The address is deterministic — the same phone always produces the same address.
   *
   * Algorithm:
   *   1. Hash domain separator + phone number via keccak256
   *   2. Take the last 20 bytes (40 hex chars) as the address
   *   3. Prepend 0x and checksum via ethers.getAddress
   *
   * @param phoneNumber - E.164 phone number, e.g. +254712345678
   * @returns The deterministic checksummed wallet address
   */
  deriveAddress(phoneNumber: string): string {
    const input = `${this.DOMAIN_SEPARATOR}:${phoneNumber}`;
    const hash = ethers.keccak256(ethers.toUtf8Bytes(input));
    // Last 20 bytes = 40 hex chars of the hash
    const addressRaw = this.ADDRESS_PREFIX + hash.slice(26); // slice(2+40-40) = slice(26)
    return ethers.getAddress(addressRaw);
  }

  /**
   * Register a phone-to-wallet mapping.
   */
  register(phoneNumber: string, merchantId: string): WalletMapping {
    const existing = this.getByPhone(phoneNumber);
    if (existing) return existing;

    const walletAddress = this.deriveAddress(phoneNumber);

    const mapping: WalletMapping = {
      phoneNumber,
      merchantId,
      walletAddress,
      isDeployed: false,
      createdAt: Date.now(),
    };

    walletMappings.set(phoneNumber, mapping);
    return mapping;
  }

  /**
   * Get wallet mapping for a phone number.
   */
  getByPhone(phoneNumber: string): WalletMapping | undefined {
    return walletMappings.get(phoneNumber);
  }

  /**
   * Get wallet mapping by merchant ID.
   */
  getByMerchantId(merchantId: string): WalletMapping | undefined {
    for (const mapping of walletMappings.values()) {
      if (mapping.merchantId === merchantId) return mapping;
    }
    return undefined;
  }

  /**
   * Mark a wallet as deployed on-chain.
   */
  markDeployed(phoneNumber: string, txHash: string): WalletMapping | undefined {
    const mapping = walletMappings.get(phoneNumber);
    if (mapping) {
      mapping.isDeployed = true;
      mapping.deployTxHash = txHash;
    }
    return mapping;
  }

  /**
   * Get all registered wallets.
   */
  getAll(): WalletMapping[] {
    return Array.from(walletMappings.values());
  }
}

export const walletService = new WalletService();