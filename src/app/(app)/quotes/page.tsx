'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate, getClientName } from '@/lib/utils'
import { Quote, QuoteStatus } from '@/types/database'
import Header from '@/components/Header'
import { QuoteStatusBadge } from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import {
  ClipboardDocumentListIcon, PlusIcon, MagnifyingGlassIcon,
  EnvelopeIcon, PencilIcon, TrashIcon, CheckCircleIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

const statusFilters: { label: string; value: QuoteStatus | 'all' }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Brouillons', value: 'draft' },
  { label: 'Envoyés', value: 'sent' },
  { label: 'Acceptés', value: 'accepted' },
  { label: 'Refusés', value: 'refused' },
]

type Toast = { id: string; message: string; type: 'success' | 'error' }

export default function QuotesPage() {
  const supabase = createClient()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [profile, setProfile] = useState<{ email?: string; company_name?: string } | null>(null)
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set())
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [toasts, setToasts] = useState<Toast[]>([])

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

  function addToast(message: string, type: 'success' | 'error') {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
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
      "N'hésitez pas à nous contacter pour toute question ou pour valider ce devis.",
      '',
      'Cordialement,',
      company,
    ].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n')
  }

  async function sendEmailDirect(quote: Quote, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const clientEmail = (quote.client as any)?.email
    if (!clientEmail) {
      addToast("Ce client n'a pas d'adresse e-mail renseignée.", 'error')
      return
    }
    setSendingIds(s => new Set(s).add(quote.id))
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: clientEmail,
          cc: profile?.email || '',
          subject: `Devis ${quote.number}${profile?.company_name ? ` — ${profile.company_name}` : ''}`,
          message: buildEmailBody(quote),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        addToast(data.error || "Erreur lors de l'envoi.", 'error')
      } else {
        addToast(`✓ Devis ${quote.number} envoyé à ${clientEmail}`, 'success')
        setSentIds(s => new Set(s).add(quote.id))
        setTimeout(() => setSentIds(s => { const n = new Set(s); n.delete(quote.id); return n }), 3000)
      }
    } catch {
      addToast('Erreur réseau, veuillez réessayer.', 'error')
    } finally {
      setSendingIds(s => { const n = new Set(s); n.delete(quote.id); return n })
    }
  }

  async function deleteQuote(quote: Quote, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Supprimer le devis ${quote.number} ?\nCette action est irréversible.`)) return
    setDeletingIds(s => new Set(s).add(quote.id))
    const { error } = await supabase.from('quotes').delete().eq('id', quote.id)
    if (error) {
      addToast('Erreur lors de la suppression.', 'error')
    } else {
      setQuotes(prev => prev.filter(q => q.id !== quote.id))
      addToast(`Devis ${quote.number} supprimé.`, 'success')
    }
    setDeletingIds(s => { const n = new Set(s); n.delete(quote.id); return n })
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
                    <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <Link href={`/quotes/${quote.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 group-hover:underline">
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
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* Modifier */}
                          <Link
                            href={`/quotes/${quote.id}`}
                            onClick={e => e.stopPropagation()}
                            title="Modifier"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          {/* Envoyer */}
                          <button
                            onClick={(e) => sendEmailDirect(quote, e)}
                            title="Envoyer par e-mail"
                            disabled={sendingIds.has(quote.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              sentIds.has(quote.id)
                                ? 'text-green-600 bg-green-50'
                                : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'
                            }`}
                          >
                            {sendingIds.has(quote.id) ? (
                              <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                            ) : sentIds.has(quote.id) ? (
                              <CheckCircleIcon className="w-4 h-4" />
                            ) : (
                              <EnvelopeIcon className="w-4 h-4" />
                            )}
                          </button>
                          {/* Supprimer */}
                          <button
                            onClick={(e) => deleteQuote(quote, e)}
                            title="Supprimer"
                            disabled={deletingIds.has(quote.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            {deletingIds.has(quote.id) ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <TrashIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success'
              ? <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              : <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
            }
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}
