import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="group flex items-center gap-2 pt-1 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              'border-2 rounded-md w-5 h-5 transition-all duration-200',
              'border-default bg-transparent',
              'peer-checked:bg-accent-primary peer-checked:border-accent-primary',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-accent-primary/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-base',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              'group-hover:border-strong',
              className
            )}
          />
          <Check
            className={cn(
              'top-1/2 left-1/2 absolute -translate-x-1/2 -translate-y-1/2',
              'w-3.5 h-3.5 text-black stroke-[3]',
              'opacity-0 scale-50 transition-all duration-200',
              'peer-checked:opacity-100 peer-checked:scale-100'
            )}
          />
        </div>
        {label && (
          <span className="font-medium text-primary group-hover:text-primary text-sm transition-colors">
            {label}
          </span>
        )}
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
