import { describe, it, expect } from 'vitest'
import {
  addressSchema,
  txHashSchema,
  bpsSchema,
  bigintSchema,
  tokenAmountSchema,
  parseAddress,
  isValidAddress,
  isValidTxHash,
} from './schemas'

describe('Validation Schemas', () => {
  describe('addressSchema', () => {
    it('should accept valid addresses', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD61',
        '0x0000000000000000000000000000000000000000',
        '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
      ]

      validAddresses.forEach((addr) => {
        const result = addressSchema.safeParse(addr)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid addresses', () => {
      const invalidAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD6', // Too short
        '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD611', // Too long
        '742d35Cc6634C0532925a3b844Bc9e7595f2bD61', // Missing 0x
        '0xGGGd35Cc6634C0532925a3b844Bc9e7595f2bD61', // Invalid hex
        '',
        'not an address',
      ]

      invalidAddresses.forEach((addr) => {
        const result = addressSchema.safeParse(addr)
        expect(result.success).toBe(false)
      })
    })

    it('should lowercase addresses', () => {
      const result = addressSchema.parse('0x742D35CC6634C0532925A3B844BC9E7595F2BD61')
      expect(result).toBe('0x742d35cc6634c0532925a3b844bc9e7595f2bd61')
    })
  })

  describe('txHashSchema', () => {
    it('should accept valid transaction hashes', () => {
      const validHashes = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ]

      validHashes.forEach((hash) => {
        expect(txHashSchema.safeParse(hash).success).toBe(true)
      })
    })

    it('should reject invalid transaction hashes', () => {
      const invalidHashes = [
        '0x1234', // Too short
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // Missing 0x
      ]

      invalidHashes.forEach((hash) => {
        expect(txHashSchema.safeParse(hash).success).toBe(false)
      })
    })
  })

  describe('bpsSchema', () => {
    it('should accept valid basis points', () => {
      expect(bpsSchema.safeParse(0).success).toBe(true)
      expect(bpsSchema.safeParse(500).success).toBe(true)
      expect(bpsSchema.safeParse(10000).success).toBe(true)
    })

    it('should reject invalid basis points', () => {
      expect(bpsSchema.safeParse(-1).success).toBe(false)
      expect(bpsSchema.safeParse(10001).success).toBe(false)
      expect(bpsSchema.safeParse(500.5).success).toBe(false) // Not an integer
    })
  })

  describe('bigintSchema', () => {
    it('should convert string to bigint', () => {
      expect(bigintSchema.parse('123')).toBe(123n)
      expect(bigintSchema.parse('0')).toBe(0n)
      expect(bigintSchema.parse('999999999999999999999')).toBe(999999999999999999999n)
    })

    it('should reject invalid strings', () => {
      expect(bigintSchema.safeParse('-1').success).toBe(false)
      expect(bigintSchema.safeParse('1.5').success).toBe(false)
      expect(bigintSchema.safeParse('abc').success).toBe(false)
    })
  })

  describe('tokenAmountSchema', () => {
    it('should convert decimal amounts with 18 decimals', () => {
      const schema = tokenAmountSchema(18)
      expect(schema.parse('1')).toBe(1000000000000000000n)
      expect(schema.parse('1.5')).toBe(1500000000000000000n)
      expect(schema.parse('0.001')).toBe(1000000000000000n)
    })

    it('should handle 6 decimals (USDC-like)', () => {
      const schema = tokenAmountSchema(6)
      expect(schema.parse('1')).toBe(1000000n)
      expect(schema.parse('1.5')).toBe(1500000n)
      expect(schema.parse('100.123456')).toBe(100123456n)
    })

    it('should truncate extra decimals', () => {
      const schema = tokenAmountSchema(6)
      expect(schema.parse('1.1234567890')).toBe(1123456n)
    })
  })

  describe('Helper Functions', () => {
    describe('parseAddress', () => {
      it('should return lowercase address for valid input', () => {
        const result = parseAddress('0x742D35CC6634C0532925A3B844BC9E7595F2BD61')
        expect(result).toBe('0x742d35cc6634c0532925a3b844bc9e7595f2bd61')
      })

      it('should return null for invalid input', () => {
        expect(parseAddress('invalid')).toBeNull()
        expect(parseAddress('')).toBeNull()
      })
    })

    describe('isValidAddress', () => {
      it('should return true for valid addresses', () => {
        expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD61')).toBe(true)
      })

      it('should return false for invalid addresses', () => {
        expect(isValidAddress('invalid')).toBe(false)
        expect(isValidAddress('')).toBe(false)
      })
    })

    describe('isValidTxHash', () => {
      it('should return true for valid hashes', () => {
        const validHash =
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        expect(isValidTxHash(validHash)).toBe(true)
      })

      it('should return false for invalid hashes', () => {
        expect(isValidTxHash('0x1234')).toBe(false)
        expect(isValidTxHash('')).toBe(false)
      })
    })
  })
})
