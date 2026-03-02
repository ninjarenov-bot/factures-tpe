import { cn } from '@/lib/utils'
import { invoiceStatusConfig, quoteStatusConfig } from '@/lib/utils'
import { InvoiceStatus, QuoteStatus } from '@/types/database'

interface InvoiceBadgeProps {
  status: InvoiceStatus
  small?: boolean
}

interface QuoteBadgeProps {
  status: QuoteStatus
  small?: boolean
}

export function InvoiceStatusBadge({ status, small }: InvoiceBadgeProps) {
  const cfg = invoiceStatusConfig[status]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      cfg.bg, cfg.color,
      small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

export function QuoteStatusBadge({ status, small }: QuoteBadgeProps) {
  const cfg = quoteStatusConfig[status]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      cfg.bg, cfg.color,
      small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
