export interface AcquiredBalanceEntry {
  amount: bigint
  originalTimestamp: number // Unix timestamp in seconds
}

export type AcquiredBalanceQueue = AcquiredBalanceEntry[]

/**
 * Add an entry to the FIFO queue
 */
export function addToQueue(
  queue: AcquiredBalanceQueue,
  amount: bigint,
  timestamp: number
): void {
  if (amount <= 0n) return
  queue.push({ amount, originalTimestamp: timestamp })
}

/**
 * Consume tokens from the FIFO queue (oldest first)
 * Skips expired entries (timestamp < windowStart)
 */
export function consumeFromQueue(
  queue: AcquiredBalanceQueue,
  amountToConsume: bigint,
  currentTimestamp: number,
  windowDuration: number // 24 hours = 86400 seconds
): {
  consumed: AcquiredBalanceEntry[]
  remaining: bigint
} {
  const consumed: AcquiredBalanceEntry[] = []
  let remaining = amountToConsume
  const windowStart = currentTimestamp - windowDuration

  // Consume oldest first, skip expired
  let i = 0
  while (remaining > 0n && i < queue.length) {
    const entry = queue[i]

    // Skip expired entries (outside window)
    if (entry.originalTimestamp < windowStart) {
      i++
      continue
    }

    if (entry.amount <= remaining) {
      // Consume entire entry
      consumed.push({ ...entry })
      remaining -= entry.amount
      queue.splice(i, 1) // Remove from queue
    } else {
      // Partial consumption
      consumed.push({
        amount: remaining,
        originalTimestamp: entry.originalTimestamp,
      })
      entry.amount -= remaining
      remaining = 0n
    }
  }

  return { consumed, remaining }
}

/**
 * Calculate the timestamp of the oldest active batch
 */
export function getOldestActiveTimestamp(
  queue: AcquiredBalanceQueue,
  currentTimestamp: number,
  windowDuration: number
): number | null {
  const windowStart = currentTimestamp - windowDuration

  for (const entry of queue) {
    if (entry.originalTimestamp >= windowStart && entry.amount > 0n) {
      return entry.originalTimestamp
    }
  }

  return null // No active batches
}

/**
 * Calculate total balance in the queue (ignore expired)
 */
export function calculateTotalBalance(
  queue: AcquiredBalanceQueue,
  currentTimestamp: number,
  windowDuration: number
): bigint {
  const windowStart = currentTimestamp - windowDuration
  let total = 0n

  for (const entry of queue) {
    if (entry.originalTimestamp >= windowStart) {
      total += entry.amount
    }
  }

  return total
}
