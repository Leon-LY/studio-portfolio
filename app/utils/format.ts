// Centralized formatting utilities — use these instead of inline formatting

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    draft: 'bg-stone-100 text-stone-500',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-amber-100 text-amber-700',
  }
  return colors[status] || 'bg-stone-100 text-stone-500'
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待收款',
    paid: '已收款',
    overdue: '已逾期',
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
  }
  return labels[status] || status
}

export function getFileIcon(extension: string): string {
  const icons: Record<string, string> = {
    '.pdf': 'lucide:file-text',
    '.doc': 'lucide:file-text', '.docx': 'lucide:file-text',
    '.xls': 'lucide:file-spreadsheet', '.xlsx': 'lucide:file-spreadsheet',
    '.ppt': 'lucide:presentation', '.pptx': 'lucide:presentation',
    '.dwg': 'lucide:ruler', '.dxf': 'lucide:ruler',
    '.skp': 'lucide:box',
    '.rvt': 'lucide:building', '.rfa': 'lucide:building',
    '.zip': 'lucide:archive', '.rar': 'lucide:archive', '.7z': 'lucide:archive',
    '.jpg': 'lucide:image', '.jpeg': 'lucide:image', '.png': 'lucide:image',
    '.webp': 'lucide:image', '.gif': 'lucide:image',
    '.txt': 'lucide:file-text', '.csv': 'lucide:file-spreadsheet',
  }
  return icons[extension.toLowerCase()] || 'lucide:file'
}
