import { useQuery } from '@tanstack/react-query'
import { createSubgraphClient, ACQUIRED_BALANCES_QUERY, AcquiredBalanceUpdated, AcquiredTokenWithTimestamp } from '@/lib/subgraph'

export function useAcquiredBalancesFromSubgraph(
  subAccountAddress?: `0x${string}`,
  options?: {
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: ['acquiredBalancesSubgraph', subAccountAddress],
    queryFn: async (): Promise<Map<string, AcquiredTokenWithTimestamp>> => {
      if (!subAccountAddress) return new Map()

      const client = createSubgraphClient()
      const data = await client.request<{ acquiredBalanceUpdateds: AcquiredBalanceUpdated[] }>(
        ACQUIRED_BALANCES_QUERY,
        { subAccount: subAccountAddress.toLowerCase() }
      )

      // Group by token: keep FIRST timestamp + LAST balance
      const tokenMap = new Map<string, AcquiredTokenWithTimestamp>()

      // Data is sorted by timestamp asc (oldest first)
      // First event = acquisition timestamp
      // Last event = current balance
      for (const event of data.acquiredBalanceUpdateds) {
        const tokenKey = event.token.toLowerCase()
        const existingToken = tokenMap.get(tokenKey)

        if (!existingToken) {
          // First event for this token = save both timestamp and balance
          tokenMap.set(tokenKey, {
            token: event.token,
            balance: BigInt(event.newBalance),
            timestamp: parseInt(event.blockTimestamp), // First acquisition timestamp
          })
        } else {
          // Subsequent events = update ONLY the balance, keep original timestamp
          tokenMap.set(tokenKey, {
            ...existingToken,
            balance: BigInt(event.newBalance), // Update to latest balance
            // timestamp stays the same (first acquisition)
          })
        }
      }

      return tokenMap
    },
    enabled: Boolean(subAccountAddress) && (options?.enabled !== false),
    refetchInterval: 30000, // 30s
    staleTime: 10000, // 10s
  })
}
