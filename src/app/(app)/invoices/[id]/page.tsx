'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate, getClientName, invoiceStatusConfig } from '@/lib/utils'
import { Invoice } from '@/types/database'
import Header from '@/components/Header'
import { InvoiceStatusBadge } from '@/components/StatusBadge'
import EmailModal from '@/components/EmailModal'
import {
  PencilIcon,
  CheckCircleIcon,
  TrashIcon,
  PrinterIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => { loadInvoice() }, [id])

  async function loadInvoice() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const [invoiceRes, profileRes] = await Promise.all([
      supabase.from('invoices').select('*, client:clients(*), items:invoice_items(*)').eq('id', id).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])

    if (invoiceRes.data) {
      const inv = invoiceRes.data as any
      inv.items = (inv.items || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      setInvoice(inv)
    }
    setProfile(profileRes.data)
    setLoading(false)
  }

  async function updateStatus(status: string) {
    if (!invoice) return
    const updates: any = { status }
    if (status === 'paid') updates.paid_at = new Date().toISOString()
    if (status === 'sent') updates.sent_at = new Date().toISOString()
    await supabase.from('invoices').update(updates).eq('id', invoice.id)
    setInvoice({ ...invoice, status: status as any })
  }

  async function handleDelete() {
    if (!invoice || !confirm('Supprimer cette facture ?')) return
    await supabase.from('invoices').delete().eq('id', invoice.id)
    router.push('/invoices')
  }

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!invoice) {
    return <div className="p-6 text-center text-gray-500">Facture introuvable</div>
  }

  const items = (invoice as any).items || []
  const taxByRate = items.reduce((acc: any, item: any) => {
    acc[item.vat_rate] = (acc[item.vat_rate] || 0) + item.total * item.vat_rate / 100
    return acc
  }, {} as Record<number, number>)

  const companyInitial = (profile?.company_name || 'M').charAt(0).toUpperCase()

  // Build email body
  const emailBody = [
    `Bonjour${invoice.client ? ` ${getClientName(invoice.client)}` : ''},`,
    '',
    `Veuillez trouver ci-joint la facture ${invoice.number}${invoice.subject ? ` relative à : ${invoice.subject}` : ''}.`,
    '',
    `Montant total TTC : ${formatCurrency(invoice.total)}`,
    invoice.due_date ? `Date d'échéance : ${formatDate(invoice.due_date)}` : '',
    '',
    profile?.bank_iban ? `Coordonnées bancaires :\nIBAN : ${profile.bank_iban}${profile.bank_bic ? `\nBIC : ${profile.bank_bic}` : ''}` : '',
    '',
    'Cordialement,',
    profile?.company_name || '',
    profile?.phone || '',
    profile?.email || '',
  ].filter(l => l !== undefined).join('\n').trim()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Toolbar (hidden on print) */}
      <div className="no-print">
        <Header
          title={`Facture ${invoice.number}`}
          subtitle={getClientName(invoice.client)}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => router.push(`/invoices/new?edit=${invoice.id}`)}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50" title="Modifier">
                <PencilIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setShowEmail(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
                <EnvelopeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
              <button onClick={handlePrint}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50" title="Imprimer / PDF">
                <PrinterIcon className="w-4 h-4" />
              </button>
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <button onClick={() => updateStatus('paid')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Marquer payée</span>
                </button>
              )}
              <button onClick={handleDelete}
                className="p-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50" title="Supprimer">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          }
        />
      </div>

      <main className="flex-1 p-4 sm:p-6 bg-[#F8F9FC]">
        {/* Invoice document */}
        <div id="invoice-doc" className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-4xl mx-auto overflow-hidden">

          {/* Gradient header band */}
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 px-8 py-6 flex items-start justify-between gap-4">
            {/* Logo or initial */}
            <div className="flex items-center gap-4">
              {profile?.logo_url ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.logo_url} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl">{companyInitial}</span>
                </div>
              )}
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">{profile?.company_name || 'Mon Entreprise'}</h2>
                {profile?.address && <p className="text-indigo-200 text-sm mt-0.5">{profile.address}</p>}
                {(profile?.postal_code || profile?.city) && (
                  <p className="text-indigo-200 text-sm">{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</p>
                )}
                {profile?.siret && <p className="text-indigo-200 text-xs mt-1">SIRET : {profile.siret}</p>}
              </div>
            </div>
            {/* Invoice title */}
            <div className="text-right flex-shrink-0">
              <p className="text-indigo-200 text-xs uppercase tracking-widest font-medium">Facture</p>
              <p className="text-white font-bold text-2xl mt-0.5">{invoice.number}</p>
              <div className="mt-2">
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-8 py-5 border-b border-gray-100 bg-gray-50/50">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Date d'émission</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDate(invoice.issue_date)}</p>
            </div>
            {invoice.due_date && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Échéance</p>
                <p className={`text-sm font-semibold mt-0.5 ${invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(invoice.due_date)}
                </p>
              </div>
            )}
            {(invoice as any).paid_at && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Payée le</p>
                <p className="text-sm font-semibold text-green-700 mt-0.5">{formatDate((invoice as any).paid_at)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Montant TTC</p>
              <p className="text-sm font-bold text-indigo-700 mt-0.5">{formatCurrency(invoice.total)}</p>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-8 py-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">De</p>
              <p className="font-semibold text-gray-900">{profile?.company_name || 'Mon Entreprise'}</p>
              {profile?.address && <p className="text-sm text-gray-600 mt-0.5">{profile.address}</p>}
              {(profile?.postal_code || profile?.city) && (
                <p className="text-sm text-gray-600">{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</p>
              )}
              {profile?.phone && <p className="text-sm text-gray-600 mt-1">{profile.phone}</p>}
              {profile?.email && <p className="text-sm text-gray-600">{profile.email}</p>}
              {profile?.vat_number && <p className="text-xs text-gray-500 mt-1">N° TVA : {profile.vat_number}</p>}
            </div>
            {invoice.client && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Facturé à</p>
                <p className="font-semibold text-gray-900">{getClientName(invoice.client)}</p>
                {(invoice.client as any).address && <p className="text-sm text-gray-600 mt-0.5">{(invoice.client as any).address}</p>}
                {(invoice.client as any).city && (
                  <p className="text-sm text-gray-600">{[(invoice.client as any).postal_code, (invoice.client as any).city].filter(Boolean).join(' ')}</p>
                )}
                {(invoice.client as any).email && <p className="text-sm text-gray-600 mt-1">{(invoice.client as any).email}</p>}
                {(invoice.client as any).phone && <p className="text-sm text-gray-600">{(invoice.client as any).phone}</p>}
                {(invoice.client as any).siret && <p className="text-xs text-gray-500 mt-1">SIRET : {(invoice.client as any).siret}</p>}
              </div>
            )}
          </div>

          {/* Subject */}
          {invoice.subject && (
            <div className="px-8 pb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
                <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Objet</span>
                <span className="text-sm text-indigo-900 font-medium">{invoice.subject}</span>
              </span>
            </div>
          )}

          {/* Items table */}
          <div className="border-t border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800">
                  <th className="text-left px-8 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden sm:table-cell">Qté</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden sm:table-cell">P.U. HT</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">TVA</th>
                  <th className="text-right px-8 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                    <td className="px-8 py-4">
                      <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{item.description}</p>
                      <p className="text-xs text-gray-400 sm:hidden mt-0.5">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-600 hidden sm:table-cell">
                      {item.quantity} <span className="text-xs text-gray-400">{item.unit}</span>
                    </td>
                    <td className="px-3 py-4 text-right text-sm text-gray-600 hidden sm:table-cell">{formatCurrency(item.unit_price)}</td>
                    <td className="px-3 py-4 text-center text-sm text-gray-600 hidden md:table-cell">{item.vat_rate}%</td>
                    <td className="px-8 py-4 text-right text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 px-8 py-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total HT</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {Object.entries(taxByRate).filter(([, v]) => (v as number) > 0).map(([rate, amount]) => (
                <div key={rate} className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA {rate}%</span>
                  <span className="text-gray-900">{formatCurrency(amount as number)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t-2 border-gray-900 pt-3 mt-3">
                <span className="text-base font-bold text-gray-900">TOTAL TTC</span>
                <span className="text-xl font-bold text-indigo-700">{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.status === 'paid' && (
                <div className="flex items-center justify-center gap-2 mt-2 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">PAYÉE</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes & Bank details */}
          {(invoice.notes || invoice.payment_terms || profile?.bank_iban) && (
            <div className="border-t border-gray-200 px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/60">
              {invoice.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
                </div>
              )}
              {(invoice.payment_terms || profile?.bank_iban) && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Coordonnées bancaires</p>
                  {profile?.bank_name && <p className="text-sm font-medium text-gray-900">{profile.bank_name}</p>}
                  {profile?.bank_iban && <p className="text-sm text-gray-700 font-mono mt-0.5">IBAN : {profile.bank_iban}</p>}
                  {profile?.bank_bic && <p className="text-sm text-gray-700 font-mono">BIC : {profile.bank_bic}</p>}
                  {invoice.payment_terms && <p className="text-sm text-gray-600 mt-2 italic">{invoice.payment_terms}</p>}
                </div>
              )}
            </div>
          )}

          {/* Footer band */}
          {profile?.footer_text && (
            <div className="bg-indigo-700 px-8 py-3 text-center">
              <p className="text-xs text-indigo-200">{profile.footer_text}</p>
            </div>
          )}
        </div>

        {/* Status actions (hidden on print) */}
        <div className="no-print max-w-4xl mx-auto mt-4 flex flex-wrap gap-3">
          {invoice.status === 'draft' && (
            <button onClick={() => updateStatus('sent')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              Marquer comme envoyée
            </button>
          )}
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <button onClick={() => updateStatus('paid')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
              <CheckCircleIcon className="w-4 h-4" />
              Marquer comme payée
            </button>
          )}
        </div>
      </main>

      {/* Email modal */}
      <EmailModal
        isOpen={showEmail}
        onClose={() => setShowEmail(false)}
        defaultTo={(invoice.client as any)?.email || ''}
        subject={`Facture ${invoice.number} - ${profile?.company_name || 'Mon Entreprise'}`}
        body={emailBody}
        docType="facture"
        docNumber={invoice.number}
      />
    </div>
  )
}
