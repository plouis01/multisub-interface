import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PreviewRadialSchema } from './PreviewRadialSchema'
import { SummaryBar } from './SummaryBar'
import type { TransactionPreviewModalProps } from '@/types/transactionPreview'

const PREVIEW_TITLES: Record<string, string> = {
  'add-subaccount': 'Adding Sub-Account',
  'update-roles': 'Updating Roles',
  'update-limits': 'Updating Spending Limits',
  'update-protocols': 'Updating Protocol Permissions',
}

const PREVIEW_DESCRIPTIONS: Record<string, string> = {
  'add-subaccount': 'Review the new sub-account configuration before submitting',
  'update-roles': 'Review role changes before submitting to your Safe',
  'update-limits': 'Review spending limit changes before submitting',
  'update-protocols': 'Review protocol permission changes before submitting',
}

export function TransactionPreviewModal({
  isOpen,
  onConfirm,
  onCancel,
  previewData,
  isPending = false,
}: TransactionPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && !isPending && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogClose onClose={onCancel} />

        <DialogHeader>
          <DialogTitle>{PREVIEW_TITLES[previewData.type] || 'Transaction Preview'}</DialogTitle>
          <DialogDescription>
            {PREVIEW_DESCRIPTIONS[previewData.type] || 'Review changes before submitting'}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="py-4 overflow-visible">
          <PreviewRadialSchema data={previewData} />
        </DialogBody>

        <SummaryBar data={previewData} />

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Submitting...' : 'Confirm Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
