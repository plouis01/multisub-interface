import { GraphQLClient } from 'graphql-request'
import { gql } from 'graphql-request'

// Client configuration
export const createSubgraphClient = () => {
  const url = 'https://api.studio.thegraph.com/query/36309/multisub-sepolia/version/latest'
  const token = import.meta.env.VITE_SUBGRAPH_AUTH_TOKEN

  return new GraphQLClient(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
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
