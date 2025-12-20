import { type Transaction, OP_TYPES } from '@/hooks/useTransactionHistory'
import { formatTokenAmount } from '@/lib/utils'
import dayjs from 'dayjs'

interface ExportableTransaction {
  id: string
  type: string
  timestamp: string
  date: string
  txHash: string
  subAccount: string
  // Protocol specific
  target?: string
  operation?: string
  tokensIn?: string
  amountsIn?: string
  tokensOut?: string
  amountsOut?: string
  // Transfer specific
  token?: string
  recipient?: string
  amount?: string
  // Common
  spendingCost: string
}

// Convert transaction to exportable format
function toExportable(tx: Transaction): ExportableTransaction {
  const base: ExportableTransaction = {
    id: tx.id,
    type: tx.type,
    timestamp: tx.timestamp.toString(),
    date: dayjs.unix(tx.timestamp).format('YYYY-MM-DD HH:mm:ss'),
    txHash: tx.txHash,
    subAccount: tx.subAccount,
    spendingCost: tx.spendingCost.toString(),
  }

  if (tx.type === 'protocol') {
    return {
      ...base,
      target: tx.target,
      operation: tx.opType !== undefined ? OP_TYPES[tx.opType] : 'Unknown',
      tokensIn: tx.tokensIn?.join(', '),
      amountsIn: tx.amountsIn?.map((a) => a.toString()).join(', '),
      tokensOut: tx.tokensOut?.join(', '),
      amountsOut: tx.amountsOut?.map((a) => a.toString()).join(', '),
    }
  }

  if (tx.type === 'transfer') {
    return {
      ...base,
      token: tx.token,
      recipient: tx.recipient,
      amount: tx.amount?.toString(),
    }
  }

  return base
}

// CSV headers
const CSV_HEADERS = [
  'ID',
  'Type',
  'Date',
  'Timestamp',
  'Transaction Hash',
  'Sub Account',
  'Target',
  'Operation',
  'Tokens In',
  'Amounts In',
  'Tokens Out',
  'Amounts Out',
  'Token',
  'Recipient',
  'Amount',
  'Spending Cost',
]

// Escape CSV value
function escapeCSV(value: string | undefined): string {
  if (value === undefined || value === null) return ''
  const str = String(value)
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// Convert transaction to CSV row
function toCSVRow(tx: ExportableTransaction): string {
  return [
    escapeCSV(tx.id),
    escapeCSV(tx.type),
    escapeCSV(tx.date),
    escapeCSV(tx.timestamp),
    escapeCSV(tx.txHash),
    escapeCSV(tx.subAccount),
    escapeCSV(tx.target),
    escapeCSV(tx.operation),
    escapeCSV(tx.tokensIn),
    escapeCSV(tx.amountsIn),
    escapeCSV(tx.tokensOut),
    escapeCSV(tx.amountsOut),
    escapeCSV(tx.token),
    escapeCSV(tx.recipient),
    escapeCSV(tx.amount),
    escapeCSV(tx.spendingCost),
  ].join(',')
}

/**
 * Export transactions to CSV file
 */
export function exportToCSV(transactions: Transaction[], filename?: string): void {
  const exportable = transactions.map(toExportable)

  const csvContent = [
    CSV_HEADERS.join(','),
    ...exportable.map(toCSVRow),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || `transactions_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Export transactions to JSON file
 */
export function exportToJSON(transactions: Transaction[], filename?: string): void {
  const exportable = transactions.map(toExportable)

  const jsonContent = JSON.stringify(exportable, null, 2)

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || `transactions_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Copy transactions to clipboard as JSON
 */
export async function copyToClipboard(transactions: Transaction[]): Promise<void> {
  const exportable = transactions.map(toExportable)
  const jsonContent = JSON.stringify(exportable, null, 2)
  await navigator.clipboard.writeText(jsonContent)
}
