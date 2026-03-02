'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate, getClientName } from '@/lib/utils'
import { Invoice, InvoiceStatus } from '@/types/database'
import Header from '@/components/Header'
import { InvoiceStatusBadge } from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import EmailModal from '@/components/EmailModal'
import { DocumentTextIcon, PlusIcon, MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const statusFilters: { label: string; value: InvoiceStatus | 'all' }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'Brouillons', value: 'draft' },
  { label: 'Envoyées', value: 'sent' },
  { label: 'Payées', value: 'paid' },
  { label: 'En retard', value: 'overdue' },
]

export default function InvoicesPage() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [profile, setProfile] = useState<{ email?: string; company_name?: string } | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => { loadInvoices() }, [])

  async function loadInvoices() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }

    const [{ data: invoicesData }, { data: profileData }] = await Promise.all([
      supabase
        .from('invoices')
        .select('*, client:clients(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('email, company_name')
        .eq('id', user.id)
        .single(),
    ])

    setInvoices((invoicesData || []) as Invoice[])
    setProfile(profileData)
    setLoading(false)
  }

  function openEmailModal(invoice: Invoice, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setSelectedInvoice(invoice)
    setShowEmail(true)
  }

  function buildEmailBody(invoice: Invoice): string {
    const clientName = getClientName(invoice.client)
    const company = profile?.company_name || 'Notre entreprise'
    const amount = formatCurrency(invoice.total)
    const dueDate = invoice.due_date ? formatDate(invoice.due_date) : ''
    return [
      `Bonjour${clientName ? ` ${clientName}` : ''},`,
      '',
      `Veuillez trouver ci-joint la facture ${invoice.number}${invoice.subject ? ` concernant : ${invoice.subject}` : ''}.`,
      '',
      `Montant TTC : ${amount}`,
      dueDate ? `Date d'échéance : ${dueDate}` : '',
      '',
      'N\'hésitez pas à nous contacter pour toute question.',
      '',
      `Cordialement,`,
      company,
    ].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n')
  }

  const filtered = invoices.filter(inv => {
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      inv.number.toLowerCase().includes(q) ||
      getClientName(inv.client).toLowerCase().includes(q) ||
      (inv.subject || '').toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const totalFiltered = filtered.reduce((s, i) => s + i.total, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Factures"
        subtitle={`${invoices.length} facture${invoices.length !== 1 ? 's' : ''}`}
        actions={
          <Link href="/invoices/new" className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle facture</span>
          </Link>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro, client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            invoices.length === 0 ? (
              <EmptyState
                title="Aucune facture"
                description="Créez votre première facture en cliquant sur le bouton ci-dessous."
                icon={DocumentTextIcon}
                action={{ label: 'Nouvelle facture', href: '/invoices/new' }}
              />
            ) : (
              <div className="py-12 text-center text-gray-500">
                <p>Aucun résultat pour cette recherche</p>
              </div>
            )
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° Facture</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Client</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Objet</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Échéance</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant TTC</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-5 py-4">
                          <Link href={`/invoices/${invoice.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 group-hover:underline">
                            {invoice.number}
                          </Link>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-700">{getClientName(invoice.client)}</span>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-500 line-clamp-1">{invoice.subject || '—'}</span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-sm text-gray-500">{formatDate(invoice.issue_date)}</span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className={`text-sm ${invoice.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {formatDate(invoice.due_date)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.total)}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <InvoiceStatusBadge status={invoice.status} small />
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={(e) => openEmailModal(invoice, e)}
                            title="Envoyer par e-mail"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
                          >
                            <EnvelopeIcon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Envoyer</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                      <td colSpan={5} className="px-5 py-3 text-sm font-semibold text-gray-700 hidden md:table-cell">
                        Total ({filtered.length} facture{filtered.length !== 1 ? 's' : ''})
                      </td>
                      <td colSpan={5} className="px-5 py-3 text-sm font-semibold text-gray-700 md:hidden">
                        Total
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(totalFiltered)}</td>
                      <td />
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Email Modal */}
      {selectedInvoice && (
        <EmailModal
          isOpen={showEmail}
          onClose={() => { setShowEmail(false); setSelectedInvoice(null) }}
          defaultTo={(selectedInvoice.client as any)?.email || ''}
          defaultCc={profile?.email || ''}
          subject={`Facture ${selectedInvoice.number}${profile?.company_name ? ` — ${profile.company_name}` : ''}`}
          body={buildEmailBody(selectedInvoice)}
          docType="facture"
          docNumber={selectedInvoice.number}
        />
      )}
    </div>
  )
}
