/**
 * Export utilities for converting data to CSV format
 */

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // If columns not specified, use all keys from first object
  const columnsToExport = columns || Object.keys(data[0]).map(key => ({
    key: key as keyof T,
    label: key,
  }))

  // Create CSV header
  const headers = columnsToExport.map(col => escapeCSV(col.label)).join(',')

  // Create CSV rows
  const rows = data.map(item =>
    columnsToExport
      .map(col => {
        const value = item[col.key]
        return escapeCSV(formatValue(value))
      })
      .join(',')
  )

  // Combine header and rows
  const csv = [headers, ...rows].join('\n')

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCSV(value: string): string {
  if (value === null || value === undefined) return ''

  const stringValue = String(value)

  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// Export specific entity types with proper column mapping

export function exportContacts(contacts: any[]) {
  exportToCSV(contacts, 'contacts', [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'position', label: 'Position' },
    { key: 'leadScore', label: 'Lead Score' },
    { key: 'leadGrade', label: 'Lead Grade' },
    { key: 'tags', label: 'Tags' },
    { key: 'createdAt', label: 'Created At' },
  ])
}

export function exportCompanies(companies: any[]) {
  exportToCSV(companies, 'companies', [
    { key: 'name', label: 'Name' },
    { key: 'domain', label: 'Domain' },
    { key: 'industry', label: 'Industry' },
    { key: 'size', label: 'Size' },
    { key: 'website', label: 'Website' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'createdAt', label: 'Created At' },
  ])
}

export function exportDeals(deals: any[]) {
  exportToCSV(deals, 'deals', [
    { key: 'title', label: 'Title' },
    { key: 'value', label: 'Value' },
    { key: 'stage', label: 'Stage' },
    { key: 'probability', label: 'Probability' },
    { key: 'expectedCloseDate', label: 'Expected Close Date' },
    { key: 'company', label: 'Company' },
    { key: 'contact', label: 'Contact' },
    { key: 'createdAt', label: 'Created At' },
  ])
}

export function exportActivities(activities: any[]) {
  exportToCSV(activities, 'activities', [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'completed', label: 'Completed' },
    { key: 'createdAt', label: 'Created At' },
  ])
}
