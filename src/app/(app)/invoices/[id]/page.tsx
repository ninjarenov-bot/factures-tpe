'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate, getClientName } from '@/lib/utils'
import { Invoice } from '@/types/database'
import Header from '@/components/Header'
import { InvoiceStatusBadge } from '@/components/StatusBadge'
import EmailModal from '@/components/EmailModal'
import {
  PencilIcon, CheckCircleIcon, TrashIcon, PrinterIcon, EnvelopeIcon,
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

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!invoice) return <div className="p-6 text-center text-gray-500">Facture introuvable</div>

  const items = (invoice as any).items || []
  const taxByRate: Record<number, number> = items.reduce((acc: any, item: any) => {
    if (item.vat_rate > 0) acc[item.vat_rate] = (acc[item.vat_rate] || 0) + item.total * item.vat_rate / 100
    return acc
  }, {})
  const client = invoice.client as any
  const isPaid = invoice.status === 'paid'

  const emailBody = [
    `Bonjour${client ? ` ${getClientName(client)}` : ''},`,
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
  ].filter(l => l !== undefined).join('\n').trim()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Toolbar */}
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
                <EnvelopeIcon className="w-4 h-4" /><span className="hidden sm:inline">Envoyer</span>
              </button>
              <button onClick={() => window.print()}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50" title="Imprimer / PDF">
                <PrinterIcon className="w-4 h-4" />
              </button>
              {!isPaid && invoice.status !== 'cancelled' && (
                <button onClick={() => updateStatus('paid')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                  <CheckCircleIcon className="w-4 h-4" /><span className="hidden sm:inline">Marquer payée</span>
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

      <main className="flex-1 p-4 sm:p-8 bg-[#F0F2F8]">
        <div id="invoice-doc" className="bg-white max-w-4xl mx-auto shadow-lg rounded-2xl overflow-hidden relative">

          {/* Watermark PAYÉE */}
          {isPaid && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.06]">
              <span className="text-green-700 font-black text-[120px] rotate-[-30deg] select-none tracking-widest">PAYÉE</span>
            </div>
          )}

          {/* ── ACCENT BAR ── */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-400" />

          {/* ── HEADER ── */}
          <div className="px-10 pt-8 pb-6 flex items-start justify-between gap-6">
            {/* Left: Logo + société */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="w-20 h-20 object-contain rounded-xl flex-shrink-0 border border-gray-100" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white font-black text-3xl">{(profile?.company_name || 'M').charAt(0)}</span>
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{profile?.company_name || 'Mon Entreprise'}</h1>
                {profile?.address && <p className="text-sm text-gray-500 mt-1">{profile.address}</p>}
                {(profile?.postal_code || profile?.city) && (
                  <p className="text-sm text-gray-500">{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</p>
                )}
                {profile?.phone && <p className="text-sm text-gray-500 mt-1">{profile.phone}</p>}
                {profile?.email && <p className="text-sm text-gray-500">{profile.email}</p>}
                {profile?.siret && <p className="text-xs text-gray-400 mt-1">SIRET : {profile.siret}</p>}
                {profile?.vat_number && <p className="text-xs text-gray-400">N° TVA : {profile.vat_number}</p>}
              </div>
            </div>

            {/* Right: FACTURE title + numéro + dates */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.25em] mb-1">Facture</p>
              <p className="text-4xl font-black text-indigo-600 leading-none">{invoice.number}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-gray-400">Émis le</span>
                  <span className="text-sm font-semibold text-gray-800">{formatDate(invoice.issue_date)}</span>
                </div>
                {invoice.due_date && (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-gray-400">Échéance</span>
                    <span className={`text-sm font-semibold ${invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-800'}`}>
                      {formatDate(invoice.due_date)}
                    </span>
                  </div>
                )}
                {(invoice as any).paid_at && (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-gray-400">Payée le</span>
                    <span className="text-sm font-semibold text-green-600">{formatDate((invoice as any).paid_at)}</span>
                  </div>
                )}
                <div className="mt-2"><InvoiceStatusBadge status={invoice.status} /></div>
              </div>
            </div>
          </div>

          {/* ── ADDRESSES ── */}
          <div className="px-10 pb-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-5">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-2">Émetteur</p>
              <p className="font-bold text-gray-900">{profile?.company_name || 'Mon Entreprise'}</p>
              {profile?.address && <p className="text-sm text-gray-600 mt-1">{profile.address}</p>}
              {(profile?.postal_code || profile?.city) && (
                <p className="text-sm text-gray-600">{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</p>
              )}
              {profile?.email && <p className="text-sm text-gray-600 mt-1">{profile.email}</p>}
              {profile?.phone && <p className="text-sm text-gray-600">{profile.phone}</p>}
            </div>
            {client ? (
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-2">Facturé à</p>
                <p className="font-bold text-gray-900">{getClientName(client)}</p>
                {client.address && <p className="text-sm text-gray-600 mt-1">{client.address}</p>}
                {(client.postal_code || client.city) && (
                  <p className="text-sm text-gray-600">{[client.postal_code, client.city].filter(Boolean).join(' ')}</p>
                )}
                {client.email && <p className="text-sm text-gray-600 mt-1">{client.email}</p>}
                {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                {client.siret && <p className="text-xs text-gray-500 mt-1">SIRET : {client.siret}</p>}
              </div>
            ) : <div />}
          </div>

          {/* ── SUBJECT ── */}
          {invoice.subject && (
            <div className="px-10 pb-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg">
                <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Objet</span>
                <span className="text-sm text-white font-semibold">{invoice.subject}</span>
              </div>
            </div>
          )}

          {/* ── ITEMS TABLE ── */}
          <div className="mx-10 mb-6 rounded-xl overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider">Description</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider hidden sm:table-cell w-16">Qté</th>
                  <th className="text-right px-4 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider hidden sm:table-cell w-28">P.U. HT</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider hidden md:table-cell w-16">TVA</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider w-28">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900 leading-snug">{item.description}</p>
                      <p className="text-xs text-gray-400 sm:hidden mt-0.5">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                    </td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      <span className="text-sm text-gray-700">{item.quantity}</span>
                      {item.unit && <span className="text-xs text-gray-400 ml-1">{item.unit}</span>}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-700 hidden sm:table-cell">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-4 text-center hidden md:table-cell">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.vat_rate}%</span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-gray-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── TOTALS ── */}
          <div className="px-10 pb-8 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between items-center py-1.5">
                <span className="text-sm text-gray-500">Sous-total HT</span>
                <span className="text-sm font-semibold text-gray-800">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-500">Remise</span>
                  <span className="text-sm font-semibold text-red-600">- {formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              {Object.entries(taxByRate).map(([rate, amount]) => (
                <div key={rate} className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-500">TVA {rate}%</span>
                  <span className="text-sm font-semibold text-gray-800">{formatCurrency(amount as number)}</span>
                </div>
              ))}
              <div className="pt-2">
                <div className={`flex justify-between items-center px-5 py-4 rounded-xl ${isPaid ? 'bg-green-600' : 'bg-indigo-600'}`}>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isPaid ? 'text-green-200' : 'text-indigo-200'}`}>Total TTC</p>
                    {isPaid && <p className="text-xs text-green-200 font-medium mt-0.5">✓ Payée</p>}
                  </div>
                  <span className="text-2xl font-black text-white">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── NOTES & BANQUE ── */}
          {(invoice.notes || invoice.payment_terms || profile?.bank_iban) && (
            <div className="mx-10 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {invoice.notes && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Notes</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {(profile?.bank_iban || invoice.payment_terms) && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-2">Coordonnées bancaires</p>
                  {profile?.bank_name && <p className="text-sm font-semibold text-gray-800">{profile.bank_name}</p>}
                  {profile?.bank_iban && <p className="text-sm text-gray-700 font-mono mt-1 text-xs">IBAN : {profile.bank_iban}</p>}
                  {profile?.bank_bic && <p className="text-sm text-gray-700 font-mono text-xs">BIC : {profile.bank_bic}</p>}
                  {invoice.payment_terms && <p className="text-xs text-gray-500 mt-2 italic">{invoice.payment_terms}</p>}
                </div>
              )}
            </div>
          )}

          {/* ── FOOTER ── */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-400" />
          {profile?.footer_text && (
            <div className="px-10 py-3 bg-indigo-600 text-center">
              <p className="text-xs text-indigo-200">{profile.footer_text}</p>
            </div>
          )}
        </div>

        {/* Actions (no print) */}
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
              <CheckCircleIcon className="w-4 h-4" /> Marquer comme payée
            </button>
          )}
        </div>
      </main>

      <EmailModal
        isOpen={showEmail}
        onClose={() => setShowEmail(false)}
        defaultTo={client?.email || ''}
        defaultCc={profile?.email || ''}
        subject={`Facture ${invoice.number} — ${profile?.company_name || 'Mon Entreprise'}`}
        body={emailBody}
        docType="facture"
        docNumber={invoice.number}
      />
    </div>
  )
}
