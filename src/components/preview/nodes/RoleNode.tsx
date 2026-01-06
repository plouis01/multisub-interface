import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Zap, Send, Plus, Minus, Info, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoleChange, ChangeAction } from '@/types/transactionPreview'
import { Tooltip } from '@/components/ui/tooltip'
import { IS_CLAIM_ONLY_MODE } from '@/lib/config'

interface RoleNodeProps {
  role: RoleChange
  delay?: number
}

const getRoleIcon = (roleId: number) => {
  switch (roleId) {
    case 1: // DEFI_EXECUTE_ROLE or CLAIM_ROLE
      return IS_CLAIM_ONLY_MODE ? Coins : Zap
    case 2: // DEFI_TRANSFER_ROLE
      return Send
    default:
      return IS_CLAIM_ONLY_MODE ? Coins : Zap
  }
}

const getRoleTooltip = (roleId: number) => {
  switch (roleId) {
    case 1: // DEFI_EXECUTE_ROLE or CLAIM_ROLE
      return IS_CLAIM_ONLY_MODE
        ? 'Allows claiming rewards from approved protocols'
        : 'Allows execution of DeFi transactions (swaps, deposits, withdrawals) on approved protocols'
    case 2: // DEFI_TRANSFER_ROLE
      return 'Allows token transfers to external addresses'
    default:
      return ''
  }
}

const getActionStyles = (action: ChangeAction) => {
  switch (action) {
    case 'add':
      return {
        border: 'border-success/50',
        bg: 'bg-elevated-2',
        icon: 'text-success',
        badge: 'bg-success text-black',
        BadgeIcon: Plus,
        labelColor: 'text-success',
      }
    case 'remove':
      return {
        border: 'border-error/50',
        bg: 'bg-elevated-2',
        icon: 'text-error',
        badge: 'bg-error text-white',
        BadgeIcon: Minus,
        labelColor: 'text-error',
      }
    default: // unchanged
      return {
        border: 'border-subtle/60',
        bg: 'bg-elevated-2',
        icon: 'text-tertiary',
        badge: '',
        BadgeIcon: null,
        labelColor: 'text-tertiary',
      }
  }
}

export const RoleNode = forwardRef<HTMLDivElement, RoleNodeProps>(function RoleNode({ role, delay = 0 }, ref) {
  const Icon = getRoleIcon(role.roleId)
  const styles = getActionStyles(role.action)
  const tooltipText = getRoleTooltip(role.roleId)

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: role.action === 'unchanged' ? 0.7 : 1 }}
      transition={{ delay, duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center gap-1.5"
    >
      {/* Node circle */}
      <motion.div
        ref={ref}
        animate={
          role.action === 'add'
            ? {
                boxShadow: [
                  '0 0 12px rgba(18, 255, 128, 0.3)',
                  '0 0 20px rgba(18, 255, 128, 0.5)',
                  '0 0 12px rgba(18, 255, 128, 0.3)',
                ],
              }
            : role.action === 'remove'
              ? { x: [0, -1, 1, -1, 0] }
              : undefined
        }
        transition={
          role.action === 'add'
            ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            : role.action === 'remove'
              ? { duration: 0.4, repeat: Infinity, repeatDelay: 2 }
              : undefined
        }
        className={cn(
          'relative z-20 w-11 h-11 rounded-full border-2 flex items-center justify-center',
          styles.border,
          styles.bg
        )}
      >
        <Icon className={cn('w-5 h-5', styles.icon)} />

        {/* Action badge */}
        {styles.BadgeIcon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.15, duration: 0.15 }}
            className={cn(
              'absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm',
              styles.badge
            )}
          >
            <styles.BadgeIcon className="w-2.5 h-2.5" strokeWidth={3} />
          </motion.div>
        )}
      </motion.div>

      {/* Role name with tooltip */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.1, duration: 0.15 }}
        className="relative z-30 flex items-center gap-1 px-2 py-0.5 rounded-full bg-elevated-1/90 backdrop-blur-sm"
      >
        <span className={cn('text-caption font-medium whitespace-nowrap text-center', styles.labelColor)}>
          {role.roleName}
        </span>
        {tooltipText && (
          <Tooltip content={tooltipText}>
            <button className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-elevated-3 hover:bg-elevated-2 transition-colors">
              <Info className="w-2.5 h-2.5 text-tertiary" />
            </button>
          </Tooltip>
        )}
      </motion.div>
    </motion.div>
  )
})
