/**
 * Application configuration
 * Controls feature flags and environment-specific settings
 */

/**
 * Claim-Only Mode
 *
 * When enabled (VITE_CLAIM_ONLY=true), the app only supports the "claim" role (id=1)
 * and hides spending limits, spending allowance, and acquired balances features.
 *
 * This simplified mode is designed for DAOs that only want to delegate
 * reward claiming to sub-accounts without spending tracking.
 *
 * Default: false (full mode with execute/transfer roles)
 */
export const IS_CLAIM_ONLY_MODE = import.meta.env.VITE_CLAIM_ONLY === 'true'
