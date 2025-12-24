import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'

interface CenterNodeProps {
  address: `0x${string}`
}

export const CenterNode = forwardRef<HTMLDivElement, CenterNodeProps>(function CenterNode({ address }, ref) {
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center"
    >
      {/* Main circle with outer ring */}
      <div className="relative">
        {/* Outer decorative ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="absolute -inset-2 rounded-full border border-accent/20"
        />

        {/* Main circle */}
        <motion.div
          ref={ref}
          animate={{
            boxShadow: [
              '0 0 24px rgba(18, 255, 128, 0.2), inset 0 0 16px rgba(18, 255, 128, 0.05)',
              '0 0 32px rgba(18, 255, 128, 0.35), inset 0 0 24px rgba(18, 255, 128, 0.1)',
              '0 0 24px rgba(18, 255, 128, 0.2), inset 0 0 16px rgba(18, 255, 128, 0.05)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-20 w-[88px] h-[88px] rounded-full bg-elevated-2 border-2 border-accent flex items-center justify-center"
        >
          <User className="w-9 h-9 text-success" />
        </motion.div>
      </div>

      {/* Address label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        className="mt-3 px-2.5 py-1 rounded-full bg-elevated border border-subtle"
      >
        <span className="text-caption font-mono text-secondary">{truncatedAddress}</span>
      </motion.div>
    </motion.div>
  )
})
