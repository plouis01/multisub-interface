import { GraphQLClient } from 'graphql-request'
import { gql } from 'graphql-request'

// Client configuration
export const createSubgraphClient = () => {
  const url = import.meta.env.VITE_SUBGRAPH_URL
  const token = import.meta.env.VITE_SUBGRAPH_AUTH_TOKEN

  if (!url) throw new Error('VITE_SUBGRAPH_URL not configured')

  return new GraphQLClient(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
}

// Subgraph response types
export interface AcquiredBalanceUpdated {
  id: string
  subAccount: string
  token: string
  newBalance: string
  blockTimestamp: string
}

// Token data with timestamp for countdown
export interface AcquiredTokenWithTimestamp {
  token: string
  balance: bigint
  timestamp: number // Unix timestamp in seconds
}

// Query definition
export const ACQUIRED_BALANCES_QUERY = gql`
  query GetAcquiredBalances($subAccount: Bytes!) {
    acquiredBalanceUpdateds(
      where: { subAccount: $subAccount }
      orderBy: blockTimestamp
      orderDirection: asc
      first: 1000
    ) {
      id
      subAccount
      token
      newBalance
      blockTimestamp
    }
  }
`
