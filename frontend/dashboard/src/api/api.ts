/**
 * Amana Protocol - Admin Dashboard API Utility
 *
 * Lightweight fetch wrapper with timeout, error handling, and type-safe responses.
 * All data-fetching logic lives here — tabs only consume data.
 */

import { API_CONFIG } from './config'

/* ─── Shared API Types ─── */

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface Merchant {
  id: string
  phoneNumber: string
  country: string
  name: string
  businessName: string
  status: 'pending' | 'active' | 'suspended' | 'banned'
  walletAddress: string
  trustedContacts: string[]
  totalTrades: number
  totalVolume: string
  createdAt: string
  updatedAt: string
}

export interface Trade {
  id: string
  sellerId: string
  buyerId: string
  amount: string
  currency: string
  fiatEquivalent: number
  fiatCurrency: string
  description: string
  status: string
  escrowContractAddress: string
  escrowId: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface Dispute {
  id: string
  tradeId: string
  filedBy: string
  tier: 'micro' | 'macro'
  reason: string
  evidence?: string
  status: 'open' | 'under_review' | 'resolved'
  resolution?: string
  createdAt: string
  resolvedAt?: string
}

/* ─── Fetch Wrapper ─── */

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = API_CONFIG.timeout
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Generic GET request with timeout and ApiResponse parsing.
 * Returns `ApiResponse<T>` on success or throws `ApiError`.
 */
export async function apiGet<T>(path: string): Promise<{ data: T[]; source: 'api' }> {
  const url = `${API_CONFIG.baseUrl}${path}`
  const response = await fetchWithTimeout(url)

  if (!response.ok) {
    throw new ApiError(
      `API returned ${response.status}: ${response.statusText}`,
      response.status
    )
  }

  const json: ApiResponse<T[]> = await response.json()

  if (!json.success) {
    throw new ApiError(json.error || 'API returned unsuccessful response', 400)
  }

  return { data: json.data || [], source: 'api' }
}

/**
 * Fetch all merchants from the API.
 */
export function fetchMerchants(): Promise<{ data: Merchant[]; source: 'api' }> {
  return apiGet<Merchant>(API_CONFIG.endpoints.merchants)
}

/**
 * Fetch all trades from the API.
 */
export function fetchTrades(): Promise<{ data: Trade[]; source: 'api' }> {
  return apiGet<Trade>(API_CONFIG.endpoints.trades)
}

/**
 * Fetch all disputes from the API.
 */
export function fetchDisputes(): Promise<{ data: Dispute[]; source: 'api' }> {
  return apiGet<Dispute>(API_CONFIG.endpoints.disputes)
}

/**
 * Fetch all data needed by the dashboard in parallel.
 */
export async function fetchAllDashboardData(): Promise<{
  merchants: Merchant[]
  trades: Trade[]
  disputes: Dispute[]
}> {
  const [merchants, trades, disputes] = await Promise.all([
    fetchMerchants(),
    fetchTrades(),
    fetchDisputes(),
  ])

  return {
    merchants: merchants.data,
    trades: trades.data,
    disputes: disputes.data,
  }
}