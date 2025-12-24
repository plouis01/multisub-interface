import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SpendingLimitChange } from '@/types/transactionPreview'
import { Tooltip } from '@/components/ui/tooltip'

interface SpendingNodeProps {
  limits: SpendingLimitChange
  delay?: number
}

function formatPercent(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`
}

export const SpendingNode = forwardRef<HTMLDivElement, SpendingNodeProps>(function SpendingNode(
  { limits, delay = 0 },
  ref
) {
  const isNew = !limits.before
  const percentChanged = limits.before?.maxSpendingBps !== limits.after.maxSpendingBps
  const isIncrease = limits.before && limits.after.maxSpendingBps > limits.before.maxSpendingBps
  const hasChanges =
    isNew || percentChanged || limits.before?.windowDuration !== limits.after.windowDuration

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: hasChanges ? 1 : 0.7, y: 0 }}
      transition={{ delay, duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center gap-1.5"
    >
      {/* Node circle */}
      <motion.div
        ref={ref}
        animate={
          hasChanges
            ? {
                boxShadow: [
                  '0 0 12px rgba(18, 255, 128, 0.3)',
                  '0 0 20px rgba(18, 255, 128, 0.5)',
                  '0 0 12px rgba(18, 255, 128, 0.3)',
                ],
              }
            : undefined
        }
        transition={hasChanges ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
        className={cn(
          'z-20 relative flex justify-center items-center border-2 rounded-full w-11 h-11',
          hasChanges ? 'border-success/50 bg-elevated-2' : 'border-subtle/60 bg-elevated-2'
        )}
      >
        <TrendingUp className={cn('w-5 h-5', hasChanges ? 'text-success' : 'text-tertiary')} />
      </motion.div>

      {/* Values */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.1, duration: 0.15 }}
        className="flex flex-col items-center"
      >
        <div className="flex items-center gap-1">
          <span className="font-medium text-caption text-secondary whitespace-nowrap">Limit</span>
          <Tooltip content="Maximum spending limit allowed over a 24h period. Execute & Transfer are concerned.">
            <button className="flex justify-center items-center bg-elevated-3 hover:bg-elevated-2 rounded-full w-3.5 h-3.5 transition-colors">
              <Info className="w-2.5 h-2.5 text-tertiary" />
            </button>
          </Tooltip>
        </div>

        <div className="flex items-center gap-1">
          {!limits.before ? (
            // Nouveau: afficher seulement la nouvelle valeur en vert
            <span className="font-medium text-caption text-success">
              {formatPercent(limits.after.maxSpendingBps)}
            </span>
          ) : percentChanged ? (
            // Modifié: afficher ancien → nouveau avec couleur selon direction
            <>
              <span className="text-caption text-tertiary">
                {formatPercent(limits.before.maxSpendingBps)}
              </span>
              <ArrowRight className="w-3 h-3 text-tertiary" />
              <span
                className={cn(
                  'font-medium text-caption',
                  isIncrease ? 'text-success' : 'text-error'
                )}
              >
                {formatPercent(limits.after.maxSpendingBps)}
              </span>
            </>
          ) : (
            // Inchangé: afficher seulement la valeur actuelle
            <span className="font-medium text-caption text-secondary">
              {formatPercent(limits.after.maxSpendingBps)}
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
})
