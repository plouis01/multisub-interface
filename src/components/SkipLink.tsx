import { cn } from '@/lib/utils'

interface SkipLinkProps {
  href?: string
  children?: React.ReactNode
  className?: string
}

/**
 * Accessibility skip link that allows keyboard users to skip navigation
 * and jump directly to the main content.
 *
 * The link is visually hidden until focused.
 */
export function SkipLink({
  href = '#main-content',
  children = 'Skip to main content',
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Visually hidden by default
        'sr-only',
        // Visible when focused
        'focus:not-sr-only',
        'focus:fixed focus:top-4 focus:left-4 focus:z-[9999]',
        'focus:px-4 focus:py-2',
        'focus:bg-accent-primary focus:text-primary-inverse',
        'focus:rounded-lg focus:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2',
        'font-medium text-sm',
        'transition-all',
        className
      )}
    >
      {children}
    </a>
  )
}

/**
 * Target anchor for skip link.
 * Place this at the beginning of your main content area.
 */
export function SkipLinkTarget({ id = 'main-content' }: { id?: string }) {
  return (
    <span
      id={id}
      tabIndex={-1}
      className="outline-none"
      aria-hidden="true"
    />
  )
}
