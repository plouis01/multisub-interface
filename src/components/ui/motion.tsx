import * as React from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

// Animation variants
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

// Stagger children animation
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

// Default transition
export const defaultTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
}

export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

// Motion components
interface MotionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  delay?: number
}

/**
 * Fade in animation wrapper
 */
export function FadeIn({ children, className, delay = 0, ...props }: MotionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
      transition={{ ...defaultTransition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade in and slide up animation wrapper
 */
export function FadeInUp({ children, className, delay = 0, ...props }: MotionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInUp}
      transition={{ ...defaultTransition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Scale in animation wrapper
 */
export function ScaleIn({ children, className, delay = 0, ...props }: MotionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={scaleIn}
      transition={{ ...defaultTransition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered list container
 */
interface StaggerListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function StaggerList({ children, className, ...props }: StaggerListProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered list item
 */
export function StaggerItem({ children, className, ...props }: MotionProps) {
  return (
    <motion.div
      variants={staggerItem}
      transition={defaultTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Page transition wrapper
 */
interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Card hover animation - adds subtle lift on hover
 */
interface MotionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  enableHover?: boolean
}

export function MotionCard({ children, className, enableHover = true, ...props }: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={enableHover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      whileTap={enableHover ? { scale: 0.995 } : undefined}
      transition={defaultTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Collapsible content with animation
 */
interface CollapsibleContentProps {
  children: React.ReactNode
  isOpen: boolean
  className?: string
}

export function CollapsibleContent({ children, isOpen, className }: CollapsibleContentProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cn('overflow-hidden', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Presence animation wrapper for conditional rendering
 */
interface PresenceProps {
  children: React.ReactNode
  show: boolean
  className?: string
}

export function Presence({ children, show, className }: PresenceProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeInUp}
          transition={defaultTransition}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Number counter animation
 */
interface CounterProps {
  value: number
  duration?: number
  className?: string
  formatFn?: (value: number) => string
}

export function Counter({ value, duration = 1, className, formatFn }: CounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    const start = displayValue
    const end = value
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * eased

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  const formatted = formatFn ? formatFn(displayValue) : Math.round(displayValue).toString()

  return <span className={className}>{formatted}</span>
}

// Re-export framer-motion essentials
export { motion, AnimatePresence }
export type { Variants }
