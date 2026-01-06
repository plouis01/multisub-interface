import { useMemo } from 'react'
import { useHasRole, useSubAccountLimits, useAllowedAddresses } from './useSafe'
import { ALL_ROLES, ROLE_NAMES, ROLE_DESCRIPTIONS } from '@/lib/contracts'
import { IS_CLAIM_ONLY_MODE } from '@/lib/config'
import { PROTOCOLS, getContractAddresses } from '@/lib/protocols'
import type {
  RoleChange,
  SpendingLimitChange,
  ProtocolChange,
  ContractChange,
  SubAccountFullState,
} from '@/types/transactionPreview'

/**
 * Hook to fetch the complete state of a sub-account
 * Used to display full context in transaction previews
 */
export function useSubAccountFullState(subAccountAddress?: `0x${string}`) {
  // Fetch current roles - in claim-only mode, we use CLAIM_ROLE (same ID as DEFI_EXECUTE_ROLE)
  const { data: hasExecuteRole, isLoading: loadingExecute } = useHasRole(
    subAccountAddress,
    ALL_ROLES.DEFI_EXECUTE_ROLE
  )
  const { data: hasTransferRole, isLoading: loadingTransfer } = useHasRole(
    subAccountAddress,
    ALL_ROLES.DEFI_TRANSFER_ROLE
  )

  // In claim-only mode, hasClaimRole is the same as hasExecuteRole (same ID)
  const hasClaimRole = hasExecuteRole

  // Fetch spending limits (not used in claim-only mode but kept for consistency)
  const { data: limitsData, isLoading: loadingLimits } = useSubAccountLimits(subAccountAddress)

  // Collect all protocol addresses to check
  const allProtocolAddresses = useMemo(() => {
    const addresses: `0x${string}`[] = []
    PROTOCOLS.forEach(protocol => {
      protocol.contracts.forEach(contract => {
        getContractAddresses(contract).forEach(addr => addresses.push(addr))
      })
    })
    return addresses
  }, [])

  // Fetch allowed addresses
  const { data: allowedAddresses, isLoading: loadingAllowed } = useAllowedAddresses(
    subAccountAddress,
    allProtocolAddresses
  )

  // Build roles state - varies based on mode
  const roles = useMemo<RoleChange[]>(() => {
    if (IS_CLAIM_ONLY_MODE) {
      return [
        {
          roleId: ALL_ROLES.CLAIM_ROLE,
          roleName: ROLE_NAMES[ALL_ROLES.CLAIM_ROLE],
          description: ROLE_DESCRIPTIONS[ALL_ROLES.CLAIM_ROLE],
          action: 'unchanged',
          isActive: Boolean(hasClaimRole),
        },
      ]
    }
    return [
      {
        roleId: ALL_ROLES.DEFI_EXECUTE_ROLE,
        roleName: ROLE_NAMES[ALL_ROLES.DEFI_EXECUTE_ROLE],
        description: ROLE_DESCRIPTIONS[ALL_ROLES.DEFI_EXECUTE_ROLE],
        action: 'unchanged',
        isActive: Boolean(hasExecuteRole),
      },
      {
        roleId: ALL_ROLES.DEFI_TRANSFER_ROLE,
        roleName: ROLE_NAMES[ALL_ROLES.DEFI_TRANSFER_ROLE],
        description: ROLE_DESCRIPTIONS[ALL_ROLES.DEFI_TRANSFER_ROLE],
        action: 'unchanged',
        isActive: Boolean(hasTransferRole),
      },
    ]
  }, [hasExecuteRole, hasTransferRole, hasClaimRole])

  // Build spending limits state (not used in claim-only mode)
  const spendingLimits = useMemo<SpendingLimitChange | null>(() => {
    if (IS_CLAIM_ONLY_MODE) return null
    if (!limitsData) return null
    const [maxSpendingBps, windowDuration] = limitsData as [bigint, bigint]
    // Only return if limits are actually set (non-zero)
    if (maxSpendingBps === 0n && windowDuration === 0n) return null
    return {
      before: {
        maxSpendingBps: Number(maxSpendingBps),
        windowDuration: Number(windowDuration),
      },
      after: {
        maxSpendingBps: Number(maxSpendingBps),
        windowDuration: Number(windowDuration),
      },
    }
  }, [limitsData])

  // Build protocols state
  const protocols = useMemo<ProtocolChange[]>(() => {
    return PROTOCOLS.map(protocol => {
      const contracts: ContractChange[] = protocol.contracts.map(contract => {
        const contractAddresses = getContractAddresses(contract)
        const isContractActive = allowedAddresses
          ? contractAddresses.every(addr => allowedAddresses.has(addr))
          : false
        return {
          contractId: contract.id,
          contractName: contract.name,
          address: contract.address,
          description: contract.description,
          action: 'unchanged', // Current state - not a change
          isActive: isContractActive,
        }
      })

      return {
        protocolId: protocol.id,
        protocolName: protocol.name,
        contracts,
      }
    })
  }, [allowedAddresses])

  const isLoading = loadingExecute || loadingTransfer || loadingLimits || loadingAllowed

  const fullState = useMemo<SubAccountFullState>(() => {
    return {
      roles,
      spendingLimits,
      protocols,
    }
  }, [roles, spendingLimits, protocols])

  return {
    fullState,
    roles,
    spendingLimits,
    protocols,
    hasExecuteRole: Boolean(hasExecuteRole),
    hasTransferRole: Boolean(hasTransferRole),
    hasClaimRole: Boolean(hasClaimRole),
    allowedAddresses: allowedAddresses || new Set<`0x${string}`>(),
    isLoading,
  }
}

/**
 * Helper to merge current state with changes
 * Takes the full state and applies the changes to create a new state with proper actions
 */
export function mergeProtocolsWithChanges(
  currentProtocols: ProtocolChange[],
  changes: ProtocolChange[]
): ProtocolChange[] {
  // Create a map of changes for quick lookup (action and isActive)
  const changesMap = new Map<string, Map<string, { action: 'add' | 'remove' | 'unchanged'; isActive?: boolean }>>()
  changes.forEach(protocol => {
    const contractMap = new Map<string, { action: 'add' | 'remove' | 'unchanged'; isActive?: boolean }>()
    protocol.contracts.forEach(contract => {
      contractMap.set(contract.contractId, { action: contract.action, isActive: contract.isActive })
    })
    changesMap.set(protocol.protocolId, contractMap)
  })

  // Apply changes to current state
  return currentProtocols.map(protocol => {
    const protocolChanges = changesMap.get(protocol.protocolId)

    const contracts = protocol.contracts.map(contract => {
      const change = protocolChanges?.get(contract.contractId)
      return {
        ...contract,
        action: change?.action || 'unchanged',
        isActive: change?.isActive ?? contract.isActive,
      }
    })

    return {
      ...protocol,
      contracts,
    }
  })
}

/**
 * Helper to merge roles with changes
 */
export function mergeRolesWithChanges(
  currentRoles: RoleChange[],
  changes: RoleChange[]
): RoleChange[] {
  const changesMap = new Map<number, 'add' | 'remove' | 'unchanged'>()
  changes.forEach(role => {
    changesMap.set(role.roleId, role.action)
  })

  return currentRoles.map(role => ({
    ...role,
    action: changesMap.get(role.roleId) || 'unchanged',
  }))
}
