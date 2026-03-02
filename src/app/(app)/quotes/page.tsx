'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate, getClientName } from '@/lib/utils'
import { Quote, QuoteStatus } from '@/types/database'
import Header from '@/components/Header'
import { QuoteStatusBadge } from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import EmailModal from '@/components/EmailModal'
import { ClipboardDocumentListIcon, PlusIcon, MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const statusFilters: { label: string; value: QuoteStatus | 'all' }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Brouillons', value: 'draft' },
  { label: 'Envoyés', value: 'sent' },
  { label: 'Acceptés', value: 'accepted' },
  { label: 'Refusés', value: 'refused' },
]

export default function QuotesPage() {
  const supabase = createClient()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [profile, setProfile] = useState<{ email?: string; company_name?: string } | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => { loadQuotes() }, [])

  async function loadQuotes() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }

    const [{ data: quotesData }, { data: profileData }] = await Promise.all([
      supabase
        .from('quotes')
        .select('*, client:clients(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('email, company_name')
        .eq('id', user.id)
        .single(),
    ])

    setQuotes((quotesData || []) as Quote[])
    setProfile(profileData)
    setLoading(false)
  }

  function openEmailModal(quote: Quote, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setSelectedQuote(quote)
    setShowEmail(true)
  }

  function buildEmailBody(quote: Quote): string {
    const clientName = getClientName(quote.client)
    const company = profile?.company_name || 'Notre entreprise'
    const amount = formatCurrency(quote.total)
    const validUntil = quote.valid_until ? formatDate(quote.valid_until) : ''
    return [
      `Bonjour${clientName ? ` ${clientName}` : ''},`,
      '',
      `Veuillez trouver ci-joint le devis ${quote.number} que nous vous avons préparé.`,
      '',
      `Montant TTC : ${amount}`,
      validUntil ? `Validité de l'offre : jusqu'au ${validUntil}` : '',
      '',
      'N\'hésitez pas à nous contacter pour toute question ou pour valider ce devis.',
      '',
      `Cordialement,`,
      company,
    ].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n')
  }

  const filtered = quotes.filter(q => {
    const matchStatus = statusFilter === 'all' || q.status === statusFilter
    const s = search.toLowerCase()
    const matchSearch = !s || q.number.toLowerCase().includes(s) || getClientName(q.client).toLowerCase().includes(s)
    return matchStatus && matchSearch
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Devis"
        subtitle={`${quotes.length} devis`}
        actions={
          <Link href="/quotes/new" className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau devis</span>
          </Link>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            quotes.length === 0 ? (
              <EmptyState
                title="Aucun devis"
                description="Créez votre premier devis pour un client."
                icon={ClipboardDocumentListIcon}
                action={{ label: 'Nouveau devis', href: '/quotes/new' }}
              />
            ) : (
              <div className="py-12 text-center text-gray-500">Aucun résultat</div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° Devis</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Client</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Valide jusqu'au</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant TTC</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/quotes/${quote.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                          {quote.number}
                        </Link>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-700">{getClientName(quote.client)}</span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-500">{formatDate(quote.issue_date)}</span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-500">{formatDate(quote.valid_until)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(quote.total)}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <QuoteStatusBadge status={quote.status} small />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={(e) => openEmailModal(quote, e)}
                          title="Envoyer par e-mail"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 hover:border-violet-300 transition-colors"
                        >
                          <EnvelopeIcon className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Envoyer</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Email Modal */}
      {selectedQuote && (
        <EmailModal
          isOpen={showEmail}
          onClose={() => { setShowEmail(false); setSelectedQuote(null) }}
          defaultTo={(selectedQuote.client as any)?.email || ''}
          defaultCc={profile?.email || ''}
          subject={`Devis ${selectedQuote.number}${profile?.company_name ? ` — ${profile.company_name}` : ''}`}
          body={buildEmailBody(selectedQuote)}
          docType="devis"
          docNumber={selectedQuote.number}
        />
      )}
    </div>
  )
}
