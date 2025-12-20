import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation style */
  animate?: boolean
}

/**
 * Base skeleton component with shimmer animation
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animate = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-md bg-elevated-2",
          animate && "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent before:animate-shimmer",
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

/**
 * Skeleton text line - mimics a line of text
 */
interface SkeletonTextProps extends SkeletonProps {
  /** Width variant */
  width?: "full" | "3/4" | "2/3" | "1/2" | "1/3" | "1/4"
  /** Text size variant */
  size?: "sm" | "md" | "lg"
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ className, width = "full", size = "md", ...props }, ref) => {
    const widthClass = {
      full: "w-full",
      "3/4": "w-3/4",
      "2/3": "w-2/3",
      "1/2": "w-1/2",
      "1/3": "w-1/3",
      "1/4": "w-1/4",
    }[width]

    const sizeClass = {
      sm: "h-3",
      md: "h-4",
      lg: "h-5",
    }[size]

    return (
      <Skeleton
        ref={ref}
        className={cn(widthClass, sizeClass, "rounded", className)}
        {...props}
      />
    )
  }
)
SkeletonText.displayName = "SkeletonText"

/**
 * Skeleton avatar - circular placeholder
 */
interface SkeletonAvatarProps extends SkeletonProps {
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl"
}

const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClass = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    }[size]

    return (
      <Skeleton
        ref={ref}
        className={cn(sizeClass, "rounded-full", className)}
        {...props}
      />
    )
  }
)
SkeletonAvatar.displayName = "SkeletonAvatar"

/**
 * Skeleton badge - pill-shaped placeholder
 */
interface SkeletonBadgeProps extends SkeletonProps {
  /** Size variant */
  size?: "sm" | "md"
}

const SkeletonBadge = React.forwardRef<HTMLDivElement, SkeletonBadgeProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClass = {
      sm: "h-5 w-12",
      md: "h-6 w-16",
    }[size]

    return (
      <Skeleton
        ref={ref}
        className={cn(sizeClass, "rounded-full", className)}
        {...props}
      />
    )
  }
)
SkeletonBadge.displayName = "SkeletonBadge"

/**
 * Skeleton button - button placeholder
 */
interface SkeletonButtonProps extends SkeletonProps {
  /** Size variant */
  size?: "sm" | "md" | "lg" | "icon"
}

const SkeletonButton = React.forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClass = {
      sm: "h-9 w-20",
      md: "h-11 w-28",
      lg: "h-12 w-32",
      icon: "h-10 w-10",
    }[size]

    return (
      <Skeleton
        ref={ref}
        className={cn(sizeClass, "rounded-xl", className)}
        {...props}
      />
    )
  }
)
SkeletonButton.displayName = "SkeletonButton"

/**
 * Skeleton card - full card placeholder with header and content
 */
interface SkeletonCardProps extends SkeletonProps {
  /** Show header section */
  showHeader?: boolean
  /** Number of content lines */
  lines?: number
  /** Show footer/action area */
  showFooter?: boolean
}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, showHeader = true, lines = 3, showFooter = false, animate = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-subtle bg-elevated p-6 space-y-4",
          className
        )}
        {...props}
      >
        {showHeader && (
          <div className="space-y-2">
            <Skeleton animate={animate} className="h-5 w-1/3 rounded" />
            <Skeleton animate={animate} className="h-3 w-1/2 rounded" />
          </div>
        )}

        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              animate={animate}
              className={cn(
                "h-4 rounded",
                i === lines - 1 ? "w-2/3" : "w-full"
              )}
            />
          ))}
        </div>

        {showFooter && (
          <div className="flex gap-2 pt-2">
            <SkeletonButton animate={animate} size="sm" />
            <SkeletonButton animate={animate} size="sm" className="w-16" />
          </div>
        )}
      </div>
    )
  }
)
SkeletonCard.displayName = "SkeletonCard"

/**
 * Skeleton table row - mimics a data row
 */
interface SkeletonTableRowProps extends SkeletonProps {
  /** Number of columns */
  columns?: number
}

const SkeletonTableRow = React.forwardRef<HTMLDivElement, SkeletonTableRowProps>(
  ({ className, columns = 4, animate = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 py-3 px-4 border-b border-subtle",
          className
        )}
        {...props}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            animate={animate}
            className={cn(
              "h-4 rounded",
              i === 0 ? "w-12" : "flex-1"
            )}
          />
        ))}
      </div>
    )
  }
)
SkeletonTableRow.displayName = "SkeletonTableRow"

/**
 * Skeleton list item - mimics a list item with avatar and text
 */
interface SkeletonListItemProps extends SkeletonProps {
  /** Show avatar */
  showAvatar?: boolean
  /** Show secondary action */
  showAction?: boolean
}

const SkeletonListItem = React.forwardRef<HTMLDivElement, SkeletonListItemProps>(
  ({ className, showAvatar = true, showAction = false, animate = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 py-3",
          className
        )}
        {...props}
      >
        {showAvatar && <SkeletonAvatar animate={animate} size="md" />}

        <div className="flex-1 space-y-2">
          <Skeleton animate={animate} className="h-4 w-1/2 rounded" />
          <Skeleton animate={animate} className="h-3 w-3/4 rounded" />
        </div>

        {showAction && <SkeletonButton animate={animate} size="icon" />}
      </div>
    )
  }
)
SkeletonListItem.displayName = "SkeletonListItem"

/**
 * Skeleton stats - mimics a stat/metric display
 */
interface SkeletonStatsProps extends SkeletonProps {
  /** Show label */
  showLabel?: boolean
}

const SkeletonStats = React.forwardRef<HTMLDivElement, SkeletonStatsProps>(
  ({ className, showLabel = true, animate = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-1", className)}
        {...props}
      >
        {showLabel && <Skeleton animate={animate} className="h-3 w-16 rounded" />}
        <Skeleton animate={animate} className="h-7 w-24 rounded" />
      </div>
    )
  }
)
SkeletonStats.displayName = "SkeletonStats"

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonButton,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonListItem,
  SkeletonStats,
}
