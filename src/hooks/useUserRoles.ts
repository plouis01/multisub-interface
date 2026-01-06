import { useAccount } from 'wagmi'
import { useIsSafeOwner, useHasRole } from '@/hooks/useSafe'
import { ALL_ROLES } from '@/lib/contracts'
import { IS_CLAIM_ONLY_MODE } from '@/lib/config'

export type ViewMode = 'owner' | 'subaccount'

/**
 * Hook to detect all roles of the connected user
 * Determines if user is owner, sub-account, or both (dual role)
 */
export function useUserRoles() {
  const { address } = useAccount()
  const { isSafeOwner, isLoading: ownerLoading } = useIsSafeOwner()

  const { data: hasExecuteRole, isLoading: executeLoading } = useHasRole(
    address,
    ALL_ROLES.DEFI_EXECUTE_ROLE
  )
  const { data: hasTransferRole, isLoading: transferLoading } = useHasRole(
    address,
    ALL_ROLES.DEFI_TRANSFER_ROLE
  )

  // In claim-only mode, hasClaimRole is same as hasExecuteRole (same ID)
  const hasClaimRole = hasExecuteRole

  const isSubAccount = IS_CLAIM_ONLY_MODE
    ? Boolean(hasClaimRole)
    : Boolean(hasExecuteRole || hasTransferRole)
  const isDualRole = isSafeOwner && isSubAccount
  const isLoading = ownerLoading || executeLoading || transferLoading

  return {
    isSafeOwner,
    isSubAccount,
    isDualRole,
    hasExecuteRole: Boolean(hasExecuteRole),
    hasTransferRole: Boolean(hasTransferRole),
    hasClaimRole: Boolean(hasClaimRole),
    isLoading,
  }
}
