import { useAccount } from 'wagmi'
import { useIsSafeOwner, useHasRole } from '@/hooks/useSafe'
import { ROLES } from '@/lib/contracts'

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
    ROLES.DEFI_EXECUTE_ROLE
  )
  const { data: hasTransferRole, isLoading: transferLoading } = useHasRole(
    address,
    ROLES.DEFI_TRANSFER_ROLE
  )

  const isSubAccount = Boolean(hasExecuteRole || hasTransferRole)
  const isDualRole = isSafeOwner && isSubAccount
  const isLoading = ownerLoading || executeLoading || transferLoading

  return {
    isSafeOwner,
    isSubAccount,
    isDualRole,
    hasExecuteRole: Boolean(hasExecuteRole),
    hasTransferRole: Boolean(hasTransferRole),
    isLoading,
  }
}
