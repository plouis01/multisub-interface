import { Badge } from '@/components/ui/badge'
import { useUserRoles } from '@/hooks/useUserRoles'
import { useViewMode } from '@/contexts/ViewModeContext'
import { cn } from '@/lib/utils'

export function ViewSwitcher() {
  const { isSafeOwner, isDualRole, isLoading, hasExecuteRole, hasTransferRole } = useUserRoles()
  const { viewMode, setViewMode } = useViewMode()

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 bg-elevated px-4 py-2.5 border border-subtle rounded-xl min-w-[140px]">
        <div className="bg-tertiary rounded-full w-2 h-2 animate-pulse" />
        <div className="flex flex-col">
          <span className="text-caption text-tertiary uppercase tracking-wider">Role</span>
          <span className="font-medium text-small text-tertiary">Loading...</span>
        </div>
      </div>
    )
  }

  const hasAnyRole = hasExecuteRole || hasTransferRole

  // Single role: display simple stat item
  if (!isDualRole) {
    const statusColor = isSafeOwner ? 'bg-info' : 'bg-tertiary'
    return (
      <div className="flex items-center gap-3 bg-elevated px-4 py-2.5 border border-subtle rounded-xl min-w-[140px]">
        <div className={cn('rounded-full w-2 h-2', statusColor)} />
        <div className="flex flex-col">
          <span className="text-caption text-tertiary uppercase tracking-wider">Role</span>
          <span className="font-medium text-primary text-small">
            {isSafeOwner ? 'Safe Owner' : hasAnyRole ? 'Sub-Account' : 'No Roles'}
          </span>
        </div>
      </div>
    )
  }

  // Dual role: display toggle
  return (
    <div className="flex items-center gap-3 bg-elevated px-4 py-2.5 border border-subtle rounded-xl">
      <div className="flex flex-col">
        <span className="text-caption text-tertiary uppercase tracking-wider">Role</span>
        <div className="flex items-center gap-1.5">
          <Badge
            variant="info"
            className="px-1.5 py-0 text-[10px]"
          >
            Owner
          </Badge>
          <span className="text-tertiary text-xs">+</span>
          <Badge
            variant="outline"
            className="px-1.5 py-0 text-[10px]"
          >
            Sub
          </Badge>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="flex gap-0.5 bg-elevated-2 ml-2 p-0.5 border border-subtle rounded-lg">
        <button
          onClick={() => setViewMode('owner')}
          className={cn(
            'px-2.5 py-1 rounded-md font-medium text-xs transition-all',
            viewMode === 'owner'
              ? 'bg-info text-white shadow-sm'
              : 'text-tertiary hover:text-primary'
          )}
        >
          Owner
        </button>
        <button
          onClick={() => setViewMode('subaccount')}
          className={cn(
            'px-2.5 py-1 rounded-md font-medium text-xs transition-all',
            viewMode === 'subaccount'
              ? 'bg-accent-primary text-black shadow-sm'
              : 'text-tertiary hover:text-primary'
          )}
        >
          Sub
        </button>
      </div>
    </div>
  )
}
