import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUserRoles, type ViewMode } from '@/hooks/useUserRoles'

interface ViewModeContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)

const STORAGE_KEY = 'msw-view-mode'

interface ViewModeProviderProps {
  children: ReactNode
}

export function ViewModeProvider({ children }: ViewModeProviderProps) {
  const [viewMode, setViewModeState] = useState<ViewMode>('owner')
  const { isSafeOwner, isSubAccount, isLoading } = useUserRoles()

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ViewMode | null
    if (saved && (saved === 'owner' || saved === 'subaccount')) {
      setViewModeState(saved)
    }
  }, [])

  // Sync viewMode with actual roles when address changes
  useEffect(() => {
    if (isLoading) return

    // If on owner view but no longer an owner, switch to subaccount
    if (viewMode === 'owner' && !isSafeOwner && isSubAccount) {
      setViewModeState('subaccount')
    }
    // If on subaccount view but no longer a sub-account, switch to owner
    if (viewMode === 'subaccount' && !isSubAccount && isSafeOwner) {
      setViewModeState('owner')
    }
  }, [isSafeOwner, isSubAccount, isLoading, viewMode])

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider')
  }
  return context
}
