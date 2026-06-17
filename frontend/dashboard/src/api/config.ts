/**
 * Amana Protocol - Admin Dashboard API Configuration
 *
 * Central config for all API endpoints. Change API_BASE to point to
 * staging or production Merchant API servers.
 */

// Determine API base URL based on environment
const API_BASE: string =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : '/api'

export const API_CONFIG = {
  /** Base URL for all API requests (no trailing slash) */
  baseUrl: API_BASE,

  /** Timeout in ms for individual fetch calls */
  timeout: 8000,

  /** Auto-refresh interval in ms (0 = disabled) */
  refreshInterval: 30000,

  /** API endpoint paths (relative to baseUrl) */
  endpoints: {
    health: '/api/health',
    merchants: '/api/merchants',
    trades: '/api/trades',
    disputes: '/api/disputes',
  } as const,
} as const

export type ApiEndpoint = keyof typeof API_CONFIG.endpoints