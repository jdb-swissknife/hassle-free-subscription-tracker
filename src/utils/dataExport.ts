import { Subscription } from '@/lib/types'

export interface ExportData {
  subscriptions: Subscription[]
  exportDate: string
  totalSubscriptions: number
  totalMonthlyCost: number
  totalYearlyCost: number
}

export function exportToJSON(data: ExportData): void {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `subscriptions-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function exportToCSV(subscriptions: Subscription[]): void {
  const headers = [
    'Name',
    'Provider',
    'Price',
    'Cycle',
    'Category',
    'Start Date',
    'End Date',
    'Trial End Date',
    'Active',
    'Website URL',
    'Description'
  ]

  const csvContent = [
    headers.join(','),
    ...subscriptions.map(sub => [
      `"${sub.name}"`,
      `"${sub.provider}"`,
      sub.price,
      sub.cycle,
      `"${sub.category || ''}"`,
      sub.startDate,
      sub.endDate || '',
      sub.trialEndDate || '',
      sub.active,
      `""`,
      `"${sub.description || ''}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function calculateTotalCosts(subscriptions: Subscription[]): { monthly: number; yearly: number } {
  return subscriptions.reduce(
    (totals, sub) => {
      if (!sub.active) return totals

      const price = Number(sub.price) || 0
      
      switch (sub.cycle) {
        case 'monthly':
          totals.monthly += price
          totals.yearly += price * 12
          break
        case 'yearly':
          totals.monthly += price / 12
          totals.yearly += price
          break
        case 'weekly':
          totals.monthly += (price * 52) / 12
          totals.yearly += price * 52
          break
        case 'custom':
          // Custom cycles are treated as one-time unless specified otherwise
          break
        default:
          // One-time payments don't contribute to recurring totals
          break
      }
      
      return totals
    },
    { monthly: 0, yearly: 0 }
  )
}