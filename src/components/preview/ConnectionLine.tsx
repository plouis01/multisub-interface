import { motion } from 'framer-motion'
import type { ChangeAction } from '@/types/transactionPreview'

interface Point {
  x: number
  y: number
}

export interface ConnectionLineProps {
  from: Point
  to: Point
  action: ChangeAction
  direction: 'top' | 'left' | 'right'
  delay?: number
}

// Calculate cubic Bezier control points based on direction
const getCurveControlPoints = (from: Point, to: Point, direction: 'top' | 'left' | 'right') => {
  const dx = to.x - from.x
  const dy = to.y - from.y

  switch (direction) {
    case 'top':
      // Curve bows upward with elegant S-curve feel
      return {
        cp1: { x: from.x, y: from.y + dy * 0.4 },
        cp2: { x: to.x, y: to.y - dy * 0.1 },
      }
    case 'left':
      // Curve bows outward then comes in horizontally
      return {
        cp1: { x: from.x + dx * 0.15, y: from.y - Math.abs(dy) * 0.2 },
        cp2: { x: from.x + dx * 0.6, y: to.y },
      }
    case 'right': {
      // Minimum vertical offset to ensure curve even when dy is small
      const minOffset = 30
      const verticalOffset = Math.max(Math.abs(dy) * 0.3, minOffset)
      return {
        cp1: { x: from.x + dx * 0.4, y: from.y - verticalOffset },
        cp2: { x: to.x - dx * 0.2, y: to.y - verticalOffset * 0.3 },
      }
    }
  }
}

// Get stroke gradient based on action
const getStrokeGradient = (action: ChangeAction) => {
  switch (action) {
    case 'add':
      return 'url(#connection-gradient-add)'
    case 'remove':
      return 'url(#connection-gradient-remove)'
    default:
      return 'url(#connection-gradient-unchanged)'
  }
}

// Get glow color based on action
const getGlowColor = (action: ChangeAction) => {
  switch (action) {
    case 'add':
      return 'rgba(18, 255, 128, 0.4)'
    case 'remove':
      return 'rgba(255, 71, 87, 0.4)'
    default:
      return 'transparent'
  }
}

export function ConnectionLine({ from, to, action, direction, delay = 0 }: ConnectionLineProps) {
  const { cp1, cp2 } = getCurveControlPoints(from, to, direction)

  // Cubic Bezier path
  const pathD = `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`

  const isActive = action !== 'unchanged'
  const flowSpeed = action === 'remove' ? 3 : 4
  const dashPattern = isActive ? '10 14' : '6 10'

  return (
    <g>
      {/* Glow layer for active lines */}
      {isActive && (
        <motion.path
          d={pathD}
          fill="none"
          stroke={getGlowColor(action)}
          strokeWidth={8}
          strokeLinecap="round"
          filter="url(#connection-glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{
            pathLength: { duration: 0.6, delay, ease: 'easeOut' },
            opacity: { duration: 0.4, delay },
          }}
        />
      )}

      {/* Main line with flow animation */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={getStrokeGradient(action)}
        strokeWidth={isActive ? 2.5 : 1.5}
        strokeLinecap="round"
        strokeDasharray={dashPattern}
        initial={{ pathLength: 0, opacity: 0, strokeDashoffset: 0 }}
        animate={{
          pathLength: 1,
          opacity: action === 'unchanged' ? 0.5 : 1,
          strokeDashoffset: action === 'remove' ? [0, 48] : [0, -48],
        }}
        transition={{
          pathLength: { duration: 0.5, delay, ease: 'easeOut' },
          opacity: { duration: 0.3, delay },
          strokeDashoffset: {
            duration: flowSpeed,
            repeat: Infinity,
            ease: 'linear',
            delay: delay + 0.5,
          },
        }}
        style={{
          willChange: 'stroke-dashoffset',
        }}
      />

      {/* Bright pulse traveling along path for active lines */}
      {isActive && (
        <motion.circle
          r={3}
          fill={action === 'add' ? '#12FF80' : '#FF4757'}
          filter="url(#connection-glow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: flowSpeed,
            repeat: Infinity,
            ease: 'linear',
            delay: delay + 0.6,
            times: [0, 0.1, 0.9, 1],
          }}
        >
          <animateMotion
            dur={`${flowSpeed}s`}
            repeatCount="indefinite"
            begin={`${delay + 0.6}s`}
            path={pathD}
          />
        </motion.circle>
      )}
    </g>
  )
}

// SVG Defs to be included in the parent SVG
export function ConnectionDefs() {
  return (
    <defs>
      {/* Gradients */}
      <linearGradient
        id="connection-gradient-add"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
      >
        <stop
          offset="0%"
          stopColor="#12FF80"
          stopOpacity="0.9"
        />
        <stop
          offset="100%"
          stopColor="#00D4FF"
          stopOpacity="0.6"
        />
      </linearGradient>

      <linearGradient
        id="connection-gradient-remove"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
      >
        <stop
          offset="0%"
          stopColor="#FF4757"
          stopOpacity="0.9"
        />
        <stop
          offset="100%"
          stopColor="#FF6B7A"
          stopOpacity="0.6"
        />
      </linearGradient>

      <linearGradient
        id="connection-gradient-unchanged"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
      >
        <stop
          offset="0%"
          stopColor="rgba(255, 255, 255, 0.3)"
        />
        <stop
          offset="100%"
          stopColor="rgba(255, 255, 255, 0.1)"
        />
      </linearGradient>

      {/* Glow filter */}
      <filter
        id="connection-glow"
        x="-100%"
        y="-100%"
        width="300%"
        height="300%"
      >
        <feGaussianBlur
          stdDeviation="4"
          result="blur"
        />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}
