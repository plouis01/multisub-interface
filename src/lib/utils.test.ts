import { describe, it, expect } from 'vitest'
import { cn, formatUSD, formatTokenAmount, formatBps, formatDuration } from './utils'

describe('Utility Functions', () => {
  describe('cn (className merge)', () => {
    it('should merge simple classes', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'active', false && 'hidden')).toBe('base active')
    })

    it('should merge Tailwind classes correctly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2') // Last wins
    })

    it('should handle arrays', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    it('should handle undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
    })
  })

  describe('formatUSD', () => {
    it('should format whole numbers', () => {
      const value = 1000n * 10n ** 18n // 1000 USD with 18 decimals
      expect(formatUSD(value)).toBe('1,000.00')
    })

    it('should format decimals correctly', () => {
      const value = (1234n * 10n ** 18n) / 100n // 12.34 USD
      expect(formatUSD(value)).toBe('12.34')
    })

    it('should handle zero', () => {
      expect(formatUSD(0n)).toBe('0.00')
    })

    it('should respect custom decimals', () => {
      const value = 1000n * 10n ** 6n // 1000 with 6 decimals (USDC-like)
      expect(formatUSD(value, 6)).toBe('1,000.00')
    })

    it('should format large numbers with commas', () => {
      const value = 1_234_567n * 10n ** 18n
      expect(formatUSD(value)).toBe('1,234,567.00')
    })
  })

  describe('formatTokenAmount', () => {
    it('should format whole numbers without trailing zeros', () => {
      const value = 100n * 10n ** 18n
      expect(formatTokenAmount(value)).toBe('100')
    })

    it('should format decimals up to 6 places', () => {
      const value = (123456789n * 10n ** 18n) / 10n ** 6n // 123.456789
      expect(formatTokenAmount(value)).toMatch(/123\.456/)
    })

    it('should handle very small amounts', () => {
      const value = 1n // Smallest unit
      expect(formatTokenAmount(value)).toBe('0')
    })

    it('should respect custom decimals', () => {
      const value = 1_000_000n // 1 USDC with 6 decimals
      expect(formatTokenAmount(value, 6)).toBe('1')
    })
  })

  describe('formatBps', () => {
    it('should convert basis points to percentage', () => {
      expect(formatBps(500)).toBe('5.00%')
      expect(formatBps(100)).toBe('1.00%')
      expect(formatBps(10000)).toBe('100.00%')
    })

    it('should handle bigint input', () => {
      expect(formatBps(250n)).toBe('2.50%')
    })

    it('should handle fractional percentages', () => {
      expect(formatBps(50)).toBe('0.50%')
      expect(formatBps(1)).toBe('0.01%')
    })

    it('should handle zero', () => {
      expect(formatBps(0)).toBe('0.00%')
    })
  })

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(300)).toBe('5m')
      expect(formatDuration(60)).toBe('1m')
    })

    it('should format hours and minutes', () => {
      expect(formatDuration(3660)).toBe('1h 1m')
      expect(formatDuration(3600)).toBe('1h')
    })

    it('should format days and hours', () => {
      expect(formatDuration(86400)).toBe('1d')
      expect(formatDuration(90000)).toBe('1d 1h')
    })

    it('should handle bigint input', () => {
      expect(formatDuration(86400n)).toBe('1d')
    })

    it('should handle multiple days', () => {
      expect(formatDuration(604800)).toBe('7d')
    })

    it('should handle complex durations', () => {
      // 2 days, 3 hours, 30 minutes
      const seconds = 2 * 86400 + 3 * 3600 + 30 * 60
      expect(formatDuration(seconds)).toBe('2d 3h')
    })
  })
})
