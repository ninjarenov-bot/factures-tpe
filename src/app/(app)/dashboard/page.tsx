'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate, getClientName } from '@/lib/utils'
import { Invoice, Quote } from '@/types/database'
import Header from '@/components/Header'
import StatsCard from '@/components/StatsCard'
import { InvoiceStatusBadge } from '@/components/StatusBadge'
import {
  BanknotesIcon,
  ClockIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [clientCount, setClientCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ first_name?: string; company_name?: string } | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }

    const [invoicesRes, quotesRes, clientsRes, profileRes] = await Promise.all([
      supabase.from('invoices').select('*, client:clients(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('quotes').select('*, client:clients(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('profiles').select('first_name, company_name').eq('id', user.id).single(),
    ])

    setInvoices((invoicesRes.data || []) as Invoice[])
    setQuotes((quotesRes.data || []) as Quote[])
    setClientCount(clientsRes.count || 0)
    setProfile(profileRes.data)
    setLoading(false)
  }

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const totalPending = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0)
  const recentInvoices = invoices.slice(0, 5)

  const greeting = profile?.first_name ? `Bonjour, ${profile.first_name}` : profile?.company_name ? `Bonjour` : 'Tableau de bord'

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title={greeting}
        subtitle={profile?.company_name || undefined}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/invoices/new" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              <PlusIcon className="w-4 h-4" />
              Facture
            </Link>
            <Link href="/quotes/new" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <PlusIcon className="w-4 h-4" />
              Devis
            </Link>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Quick actions mobile */}
            <div className="flex gap-3 sm:hidden">
              <Link href="/invoices/new" className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl">
                <PlusIcon className="w-4 h-4" /> Nouvelle facture
              </Link>
              <Link href="/quotes/new" className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl">
                <PlusIcon className="w-4 h-4" /> Nouveau devis
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Chiffre d'affaires"
                value={formatCurrency(totalRevenue)}
                subtitle="Factures payées"
                icon={BanknotesIcon}
                iconBg="bg-green-50"
                iconColor="text-green-600"
              />
              <StatsCard
                title="En attente"
                value={formatCurrency(totalPending)}
                subtitle="Factures envoyées"
                icon={ClockIcon}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />
              <StatsCard
                title="En retard"
                value={formatCurrency(totalOverdue)}
                subtitle="À relancer"
                icon={ExclamationCircleIcon}
                iconBg="bg-red-50"
                iconColor="text-red-600"
              />
              <StatsCard
                title="Clients"
                value={String(clientCount)}
                subtitle={`${quotes.filter(q => q.status === 'sent').length} devis en cours`}
                icon={UserGroupIcon}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
              />
            </div>

            {/* Recent invoices */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                  <h2 className="font-semibold text-gray-900">Factures récentes</h2>
                </div>
                <Link href="/invoices" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                  Voir tout →
                </Link>
              </div>

              {recentInvoices.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-gray-500 text-sm">Aucune facture pour l'instant</p>
                  <Link href="/invoices/new" className="inline-block mt-3 text-sm text-indigo-600 font-medium hover:underline">
                    Créer votre première facture →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Numéro</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Client</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Échéance</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Montant</th>
                        <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <Link href={`/invoices/${invoice.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                              {invoice.number}
                            </Link>
                          </td>
                          <td className="px-5 py-3.5 hidden sm:table-cell">
                            <span className="text-sm text-gray-700">{getClientName(invoice.client)}</span>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <span className="text-sm text-gray-500">{formatDate(invoice.issue_date)}</span>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <span className="text-sm text-gray-500">{formatDate(invoice.due_date)}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.total)}</span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <InvoiceStatusBadge status={invoice.status} small />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent quotes */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
                  <h2 className="font-semibold text-gray-900">Devis récents</h2>
                </div>
                <Link href="/quotes" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                  Voir tout →
                </Link>
              </div>

              {quotes.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-gray-500 text-sm">Aucun devis pour l'instant</p>
                  <Link href="/quotes/new" className="inline-block mt-3 text-sm text-indigo-600 font-medium hover:underline">
                    Créer votre premier devis →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Numéro</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Client</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Montant</th>
                        <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {quotes.map((quote) => (
                        <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <Link href={`/quotes/${quote.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                              {quote.number}
                            </Link>
                          </td>
                          <td className="px-5 py-3.5 hidden sm:table-cell">
                            <span className="text-sm text-gray-700">{getClientName(quote.client)}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(quote.total)}</span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                              quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              quote.status === 'refused' ? 'bg-red-100 text-red-700' :
                              quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {quote.status === 'accepted' ? 'Accepté' : quote.status === 'refused' ? 'Refusé' : 'En cours'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
