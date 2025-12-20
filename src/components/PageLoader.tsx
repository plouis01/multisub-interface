import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageLoaderProps {
  className?: string
  message?: string
}

export function PageLoader({ className, message = 'Loading...' }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] w-full',
        className
      )}
    >
      <Loader2 className="w-8 h-8 text-accent-primary animate-spin mb-4" />
      <p className="text-sm text-secondary animate-pulse">{message}</p>
    </div>
  )
}
