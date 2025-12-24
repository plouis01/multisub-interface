import { createContext, useContext, type ReactNode } from 'react'
import { useTransactionPreview } from '@/hooks/useTransactionPreview'
import { TransactionPreviewModal } from '@/components/preview/TransactionPreviewModal'
import type { TransactionPreviewData } from '@/types/transactionPreview'

interface TransactionPreviewContextValue {
  showPreview: (data: TransactionPreviewData, onConfirm: () => Promise<void>) => void
}

const TransactionPreviewContext = createContext<TransactionPreviewContextValue | null>(null)

interface TransactionPreviewProviderProps {
  children: ReactNode
}

export function TransactionPreviewProvider({ children }: TransactionPreviewProviderProps) {
  const { isPreviewOpen, previewData, isPending, showPreview, handleConfirm, handleCancel } =
    useTransactionPreview()

  return (
    <TransactionPreviewContext.Provider value={{ showPreview }}>
      {children}
      {previewData && (
        <TransactionPreviewModal
          isOpen={isPreviewOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          previewData={previewData}
          isPending={isPending}
        />
      )}
    </TransactionPreviewContext.Provider>
  )
}

export function useTransactionPreviewContext(): TransactionPreviewContextValue {
  const context = useContext(TransactionPreviewContext)
  if (!context) {
    throw new Error('useTransactionPreviewContext must be used within a TransactionPreviewProvider')
  }
  return context
}
