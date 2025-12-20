import { describe, it, expect } from 'vitest'
import {
  addToQueue,
  consumeFromQueue,
  getOldestActiveTimestamp,
  calculateTotalBalance,
  type AcquiredBalanceQueue,
} from './fifo'

describe('FIFO Queue Operations', () => {
  const WINDOW_DURATION = 86400 // 24 hours in seconds

  describe('addToQueue', () => {
    it('should add entry to empty queue', () => {
      const queue: AcquiredBalanceQueue = []
      addToQueue(queue, 1000n, 1000000)
      expect(queue).toHaveLength(1)
      expect(queue[0]).toEqual({ amount: 1000n, originalTimestamp: 1000000 })
    })

    it('should add multiple entries to queue', () => {
      const queue: AcquiredBalanceQueue = []
      addToQueue(queue, 100n, 1000000)
      addToQueue(queue, 200n, 1000100)
      expect(queue).toHaveLength(2)
    })

    it('should not add zero or negative amounts', () => {
      const queue: AcquiredBalanceQueue = []
      addToQueue(queue, 0n, 1000000)
      addToQueue(queue, -100n, 1000000)
      expect(queue).toHaveLength(0)
    })
  })

  describe('consumeFromQueue', () => {
    it('should consume from oldest entry first', () => {
      const queue: AcquiredBalanceQueue = [
        { amount: 100n, originalTimestamp: 1000000 },
        { amount: 200n, originalTimestamp: 1000100 },
      ]
      const currentTime = 1000000 + WINDOW_DURATION / 2

      const result = consumeFromQueue(queue, 50n, currentTime, WINDOW_DURATION)

      expect(result.consumed).toHaveLength(1)
      expect(result.consumed[0].amount).toBe(50n)
      expect(result.remaining).toBe(0n)
      expect(queue[0].amount).toBe(50n) // 100 - 50 = 50 remaining
    })

    it('should consume entire entry when exact match', () => {
      const queue: AcquiredBalanceQueue = [{ amount: 100n, originalTimestamp: 1000000 }]
      const currentTime = 1000000 + WINDOW_DURATION / 2

      const result = consumeFromQueue(queue, 100n, currentTime, WINDOW_DURATION)

      expect(result.consumed).toHaveLength(1)
      expect(result.consumed[0].amount).toBe(100n)
      expect(result.remaining).toBe(0n)
      expect(queue).toHaveLength(0) // Entry removed
    })

    it('should consume across multiple entries', () => {
      const queue: AcquiredBalanceQueue = [
        { amount: 100n, originalTimestamp: 1000000 },
        { amount: 200n, originalTimestamp: 1000100 },
      ]
      const currentTime = 1000000 + WINDOW_DURATION / 2

      const result = consumeFromQueue(queue, 150n, currentTime, WINDOW_DURATION)

      expect(result.consumed).toHaveLength(2)
      expect(result.remaining).toBe(0n)
      expect(queue).toHaveLength(1) // First entry removed
      expect(queue[0].amount).toBe(150n) // 200 - 50 = 150
    })

    it('should skip expired entries', () => {
      const queue: AcquiredBalanceQueue = [
        { amount: 100n, originalTimestamp: 1000 }, // Very old, expired
        { amount: 200n, originalTimestamp: 2000000 }, // Fresh
      ]
      const currentTime = 2000000 + WINDOW_DURATION / 2

      const result = consumeFromQueue(queue, 50n, currentTime, WINDOW_DURATION)

      expect(result.consumed).toHaveLength(1)
      expect(result.consumed[0].originalTimestamp).toBe(2000000) // Consumed from fresh entry
      expect(queue[0].amount).toBe(100n) // Expired entry untouched
    })

    it('should return remaining when not enough balance', () => {
      const queue: AcquiredBalanceQueue = [{ amount: 100n, originalTimestamp: 1000000 }]
      const currentTime = 1000000 + WINDOW_DURATION / 2

      const result = consumeFromQueue(queue, 150n, currentTime, WINDOW_DURATION)

      expect(result.consumed).toHaveLength(1)
      expect(result.consumed[0].amount).toBe(100n)
      expect(result.remaining).toBe(50n)
    })
  })

  describe('getOldestActiveTimestamp', () => {
    it('should return timestamp of oldest active entry', () => {
      const queue: AcquiredBalanceQueue = [
        { amount: 100n, originalTimestamp: 1000000 },
        { amount: 200n, originalTimestamp: 1000100 },
      ]
      const currentTime = 1000000 + WINDOW_DURATION / 2

      const result = getOldestActiveTimestamp(queue, currentTime, WINDOW_DURATION)

      expect(result).toBe(1000000)
    })

    it('should skip expired entries', () => {
      const queue: AcquiredBalanceQueue = [
        { amount: 100n, originalTimestamp: 1000 }, // Expired
        { amount: 200n, originalTimestamp: 2000000 }, // Fresh
      ]
      const currentTime = 2000000 + WINDOW_DURATION / 2

      const result = getOldestActiveTimestamp(queue, currentTime, WINDOW_DURATION)

      expect(result).toBe(2000000)
    })

    it('should return null for empty or fully expired queue', () => {
      const queue: AcquiredBalanceQueue = [{ amount: 100n, originalTimestamp: 1000 }]
      const currentTime = 2000000 + WINDOW_DURATION

      const result = getOldestActiveTimestamp(queue, currentTime, WINDOW_DURATION)

      expect(result).toBeNull()
    })

    it('should skip entries with zero amount', () => {
      const queue: AcquiredBalanceQueue = [
        { amount: 0n, originalTimestamp: 1000000 },
        { amount: 200n, originalTimestamp: 1000100 },
      ]
      const currentTime = 1000000 + WINDOW_DURATION / 2

      const result = getOldestActiveTimestamp(queue, currentTime, WINDOW_DURATION)

      expect(result).toBe(1000100)
    })
  })

  describe('calculateTotalBalance', () => {
    it('should sum all active balances', () => {
      const queue: AcquiredBalanceQueue = [
        { amount: 100n, originalTimestamp: 1000000 },
        { amount: 200n, originalTimestamp: 1000100 },
        { amount: 300n, originalTimestamp: 1000200 },
      ]
      const currentTime = 1000000 + WINDOW_DURATION / 2

      const result = calculateTotalBalance(queue, currentTime, WINDOW_DURATION)

      expect(result).toBe(600n)
    })

    it('should exclude expired entries', () => {
      const queue: AcquiredBalanceQueue = [
        { amount: 100n, originalTimestamp: 1000 }, // Expired
        { amount: 200n, originalTimestamp: 2000000 }, // Fresh
      ]
      const currentTime = 2000000 + WINDOW_DURATION / 2

      const result = calculateTotalBalance(queue, currentTime, WINDOW_DURATION)

      expect(result).toBe(200n)
    })

    it('should return zero for empty queue', () => {
      const queue: AcquiredBalanceQueue = []
      const currentTime = 1000000

      const result = calculateTotalBalance(queue, currentTime, WINDOW_DURATION)

      expect(result).toBe(0n)
    })

    it('should return zero for fully expired queue', () => {
      const queue: AcquiredBalanceQueue = [
        { amount: 100n, originalTimestamp: 1000 },
        { amount: 200n, originalTimestamp: 2000 },
      ]
      const currentTime = 2000000 + WINDOW_DURATION * 2

      const result = calculateTotalBalance(queue, currentTime, WINDOW_DURATION)

      expect(result).toBe(0n)
    })
  })
})
