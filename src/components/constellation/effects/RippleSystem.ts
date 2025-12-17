import type { Point } from '../constellation.types'
import { COLORS } from '../constellation.types'

export interface Ripple {
  id: number
  x: number
  y: number
  radius: number
  maxRadius: number
  startTime: number
  duration: number
  color: 'lime' | 'cyan'
  strength: number        // Initial push force
  ringCount: number       // Number of concentric rings
}

export interface RippleSystemConfig {
  defaultDuration: number
  defaultMaxRadius: number
  defaultStrength: number
  defaultRingCount: number
  maxRipples: number
  fadeEasing: 'linear' | 'ease-out' | 'ease-in-out'
}

export const DEFAULT_RIPPLE_CONFIG: RippleSystemConfig = {
  defaultDuration: 1500,
  defaultMaxRadius: 300,
  defaultStrength: 3,
  defaultRingCount: 3,
  maxRipples: 5,
  fadeEasing: 'ease-out',
}

export class RippleSystem {
  private ripples: Ripple[] = []
  private config: RippleSystemConfig
  private nextId: number = 0
  private bounds: { width: number; height: number } = { width: 0, height: 0 }

  constructor(config: Partial<RippleSystemConfig> = {}) {
    this.config = { ...DEFAULT_RIPPLE_CONFIG, ...config }
  }

  initialize(width: number, height: number): void {
    this.bounds = { width, height }
    this.ripples = []
  }

  // Create a new ripple at position
  spawn(position: Point, options: Partial<Omit<Ripple, 'id' | 'startTime' | 'radius'>> = {}): void {
    if (this.ripples.length >= this.config.maxRipples) {
      // Remove oldest ripple
      this.ripples.shift()
    }

    const maxRadius = options.maxRadius ?? Math.max(this.bounds.width, this.bounds.height) * 0.6

    this.ripples.push({
      id: this.nextId++,
      x: position.x,
      y: position.y,
      radius: 0,
      maxRadius,
      startTime: performance.now(),
      duration: options.duration ?? this.config.defaultDuration,
      color: options.color ?? (Math.random() > 0.5 ? 'lime' : 'cyan'),
      strength: options.strength ?? this.config.defaultStrength,
      ringCount: options.ringCount ?? this.config.defaultRingCount,
    })
  }

  // Spawn ripple from click event
  spawnFromClick(event: MouseEvent, containerRect: DOMRect): void {
    const x = event.clientX - containerRect.left
    const y = event.clientY - containerRect.top
    this.spawn({ x, y })
  }

  private getEasedProgress(progress: number): number {
    switch (this.config.fadeEasing) {
      case 'ease-out':
        return 1 - Math.pow(1 - progress, 3)
      case 'ease-in-out':
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2
      case 'linear':
      default:
        return progress
    }
  }

  // Update all ripples
  update(currentTime: number): void {
    this.ripples = this.ripples.filter(ripple => {
      const age = currentTime - ripple.startTime
      const progress = age / ripple.duration

      if (progress >= 1) return false

      const easedProgress = this.getEasedProgress(progress)
      ripple.radius = easedProgress * ripple.maxRadius

      return true
    })
  }

  // Render all ripples
  render(ctx: CanvasRenderingContext2D, currentTime: number): void {
    this.ripples.forEach(ripple => {
      const age = currentTime - ripple.startTime
      const progress = age / ripple.duration

      if (progress >= 1) return

      const easedProgress = this.getEasedProgress(progress)
      const opacity = 0.5 * (1 - easedProgress)
      const color = ripple.color === 'lime' ? COLORS.limeRgb : COLORS.cyanRgb

      // Draw multiple concentric rings
      for (let i = 0; i < ripple.ringCount; i++) {
        const ringOffset = i * 15
        const ringRadius = ripple.radius - ringOffset

        if (ringRadius <= 0) continue

        const ringOpacity = opacity * (1 - i / ripple.ringCount)
        const ringWidth = 2 + (1 - easedProgress) * 2 - i * 0.5

        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ringRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${color}, ${ringOpacity})`
        ctx.lineWidth = Math.max(0.5, ringWidth)
        ctx.stroke()
      }

      // Add glow effect on main ring
      if (ripple.radius > 0) {
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${color}, ${opacity * 0.3})`
        ctx.lineWidth = 8
        ctx.stroke()
      }
    })
  }

  // Get force at a specific position from all active ripples
  getForceAt(x: number, y: number, currentTime: number): Point {
    let totalForceX = 0
    let totalForceY = 0

    this.ripples.forEach(ripple => {
      const age = currentTime - ripple.startTime
      const progress = age / ripple.duration

      if (progress >= 1) return

      const dx = x - ripple.x
      const dy = y - ripple.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Only affect particles near the ripple edge
      const rippleEdge = ripple.radius
      const edgeWidth = 30 // Thickness of the "push zone"

      if (dist > rippleEdge - edgeWidth && dist < rippleEdge + edgeWidth && dist > 0) {
        // Calculate how close to the edge
        const edgeDistance = Math.abs(dist - rippleEdge)
        const edgeFactor = 1 - edgeDistance / edgeWidth

        // Force strength decreases as ripple expands
        const strengthFactor = (1 - progress) * ripple.strength * edgeFactor

        // Push outward from center
        totalForceX += (dx / dist) * strengthFactor
        totalForceY += (dy / dist) * strengthFactor
      }
    })

    return { x: totalForceX, y: totalForceY }
  }

  // Apply ripple forces to a particle system
  applyToParticle(
    particle: { x: number; y: number; vx: number; vy: number },
    currentTime: number,
    multiplier: number = 1
  ): void {
    const force = this.getForceAt(particle.x, particle.y, currentTime)
    particle.vx += force.x * multiplier
    particle.vy += force.y * multiplier
  }

  // Get all active ripples (readonly)
  getRipples(): readonly Ripple[] {
    return this.ripples
  }

  // Check if there are active ripples
  hasActiveRipples(): boolean {
    return this.ripples.length > 0
  }

  // Clear all ripples
  clear(): void {
    this.ripples = []
  }
}

export function createRippleSystem(
  width: number,
  height: number,
  config?: Partial<RippleSystemConfig>
): RippleSystem {
  const system = new RippleSystem(config)
  system.initialize(width, height)
  return system
}
