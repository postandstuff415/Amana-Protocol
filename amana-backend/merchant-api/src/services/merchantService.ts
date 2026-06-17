/**
 * Amana Protocol - Merchant Service
 * 
 * Business logic for merchant onboarding, verification, and profile management.
 * Phone numbers are the primary identifier — SIM-authenticated via USSD.
 */

import { merchantRepo, type CreateMerchantInput } from '../repositories/merchantRepository';
import type { Merchant, ApiResponse } from '../shared-types';

// Simple phone validation for East African corridors
const PHONE_PATTERNS: Record<string, RegExp> = {
  KE: /^\+254(7[0-9]|11)\d{7}$/,
  UG: /^\+256(7[0-9]|20)\d{7}$/,
  GH: /^\+233(2[0-9]|5[0-9]|24)\d{7}$/,
};

export class MerchantService {
  /**
   * Register a new merchant via USSD (SIM-authenticated phone number).
   * Phone number MUST already be verified by the telco layer.
   */
  register(input: CreateMerchantInput): ApiResponse<Merchant> {
    // Validate phone format
    const pattern = PHONE_PATTERNS[input.country];
    if (!pattern) {
      return { success: false, error: `Unsupported country: ${input.country}` };
    }
    if (!pattern.test(input.phoneNumber)) {
      return { success: false, error: `Invalid phone number format for ${input.country}` };
    }

    // Check for duplicates
    const existing = merchantRepo.findByPhone(input.phoneNumber);
    if (existing) {
      if (existing.status === 'active') {
        return { success: false, error: 'Merchant already registered with this phone number' };
      }
      // Reactivate pending/suspended
      if (existing.status === 'pending' || existing.status === 'suspended') {
        const updated = merchantRepo.updateStatus(existing.id, 'active');
        return { success: true, data: updated };
      }
      return { success: false, error: `Account is ${existing.status}. Contact support.` };
    }

    const merchant = merchantRepo.create(input);
    // New merchants start as 'pending' until SIM re-verified
    return { success: true, data: merchant, message: 'Registration pending SIM verification' };
  }

  /**
   * Activate a merchant after SIM verification confirmation from telco.
   */
  activate(phoneNumber: string): ApiResponse<Merchant> {
    const merchant = merchantRepo.findByPhone(phoneNumber);
    if (!merchant) {
      return { success: false, error: 'Merchant not found' };
    }
    const updated = merchantRepo.updateStatus(merchant.id, 'active');
    return { success: true, data: updated, message: 'Merchant activated' };
  }

  /**
   * Get merchant profile by phone number (from USSD session).
   */
  getByPhone(phoneNumber: string): ApiResponse<Merchant> {
    const merchant = merchantRepo.findByPhone(phoneNumber);
    if (!merchant) {
      return { success: false, error: 'Merchant not found' };
    }
    return { success: true, data: merchant };
  }

  /**
   * Get merchant profile by ID (from admin dashboard).
   */
  getById(id: string): ApiResponse<Merchant> {
    const merchant = merchantRepo.findById(id);
    if (!merchant) {
      return { success: false, error: 'Merchant not found' };
    }
    return { success: true, data: merchant };
  }

  /**
   * List all merchants (admin endpoint).
   */
  list(offset = 0, limit = 50): ApiResponse<Merchant[]> {
    const merchants = merchantRepo.findAll(offset, limit);
    return { success: true, data: merchants };
  }

  /**
   * Link a deployed ERC-4337 wallet to a merchant.
   */
  linkWallet(phoneNumber: string, walletAddress: string): ApiResponse<Merchant> {
    const merchant = merchantRepo.findByPhone(phoneNumber);
    if (!merchant) {
      return { success: false, error: 'Merchant not found' };
    }
    const updated = merchantRepo.setWalletAddress(merchant.id, walletAddress);
    return { success: true, data: updated };
  }

  /**
   * Suspend a merchant.
   */
  suspend(id: string): ApiResponse<Merchant> {
    const updated = merchantRepo.updateStatus(id, 'suspended');
    if (!updated) return { success: false, error: 'Merchant not found' };
    return { success: true, data: updated };
  }
}

export const merchantService = new MerchantService();