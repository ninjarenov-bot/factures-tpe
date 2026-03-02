import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import { InvoiceStatus, QuoteStatus } from '@/types/database'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return format(parseISO(date), 'dd/MM/yyyy', { locale: fr })
  } catch {
    return '—'
  }
}

export function formatDateLong(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return format(parseISO(date), 'd MMMM yyyy', { locale: fr })
  } catch {
    return '—'
  }
}

export const invoiceStatusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string; dot: string }> = {
  draft: { label: 'Brouillon', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
  sent: { label: 'Envoyée', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  paid: { label: 'Payée', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  overdue: { label: 'En retard', color: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
  cancelled: { label: 'Annulée', color: 'text-gray-500', bg: 'bg-gray-100', dot: 'bg-gray-400' },
}

export const quoteStatusConfig: Record<QuoteStatus, { label: string; color: string; bg: string; dot: string }> = {
  draft: { label: 'Brouillon', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
  sent: { label: 'Envoyé', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  accepted: { label: 'Accepté', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  refused: { label: 'Refusé', color: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
  expired: { label: 'Expiré', color: 'text-orange-700', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  invoiced: { label: 'Facturé', color: 'text-purple-700', bg: 'bg-purple-100', dot: 'bg-purple-500' },
}

export function getClientName(client: { type: string; company_name?: string | null; first_name?: string | null; last_name?: string | null } | null | undefined): string {
  if (!client) return 'Client inconnu'
  if (client.type === 'company') return client.company_name || 'Entreprise sans nom'
  return [client.first_name, client.last_name].filter(Boolean).join(' ') || 'Particulier'
}

export function generateNumber(prefix: string, counter: number): string {
  const year = new Date().getFullYear()
  const num = String(counter).padStart(4, '0')
  return `${prefix}${year}${num}`
}
