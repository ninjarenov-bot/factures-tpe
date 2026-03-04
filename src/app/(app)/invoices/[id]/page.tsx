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

      {/* ── TOOLBAR (no print) ── */}
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

      <main className="flex-1 p-4 sm:p-8 bg-[#ECEEF4]">
        <div id="invoice-doc" className="bg-white max-w-4xl mx-auto shadow-2xl rounded-2xl overflow-hidden relative">

          {/* ── WATERMARK ── */}
          {isPaid && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.04] select-none">
              <span className="text-green-600 font-black text-[130px] rotate-[-28deg] tracking-widest">PAYÉE</span>
            </div>
          )}

          {/* ══════════════════════════════════════
              DARK HEADER
          ══════════════════════════════════════ */}
          <div className="bg-slate-900 px-10 pt-10 pb-9 flex items-start justify-between gap-8">

            {/* Left — Company */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {profile?.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt="Logo"
                  className="w-[52px] h-[52px] object-contain rounded-xl flex-shrink-0 ring-1 ring-white/10"
                />
              ) : (
                <div className="w-[52px] h-[52px] rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/40">
                  <span className="text-white font-black text-xl">
                    {(profile?.company_name || 'M').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white font-bold text-lg leading-tight truncate">
                  {profile?.company_name || 'Mon Entreprise'}
                </p>
                <div className="mt-2 space-y-0.5">
                  {profile?.address && <p className="text-slate-400 text-xs">{profile.address}</p>}
                  {(profile?.postal_code || profile?.city) && (
                    <p className="text-slate-400 text-xs">{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</p>
                  )}
                  {profile?.phone && <p className="text-slate-400 text-xs mt-1">{profile.phone}</p>}
                  {profile?.email && <p className="text-slate-400 text-xs">{profile.email}</p>}
                  {profile?.siret && <p className="text-slate-600 text-xs mt-1.5">SIRET : {profile.siret}</p>}
                  {profile?.vat_number && <p className="text-slate-600 text-xs">N° TVA : {profile.vat_number}</p>}
                </div>
              </div>
            </div>

            {/* Right — Invoice ID */}
            <div className="text-right flex-shrink-0">
              <span className="inline-block bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full">
                Facture
              </span>
              <p className="text-white font-black text-5xl mt-2 leading-none tracking-tight">
                {invoice.number}
              </p>
              <div className="mt-5 space-y-2 pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-500 text-xs">Émis le</span>
                  <span className="text-slate-300 text-xs font-semibold">{formatDate(invoice.issue_date)}</span>
                </div>
                {invoice.due_date && (
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-slate-500 text-xs">Échéance</span>
                    <span className={`text-xs font-semibold ${invoice.status === 'overdue' ? 'text-red-400' : 'text-slate-300'}`}>
                      {formatDate(invoice.due_date)}
                    </span>
                  </div>
                )}
                {(invoice as any).paid_at && (
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-slate-500 text-xs">Payée le</span>
                    <span className="text-green-400 text-xs font-semibold">{formatDate((invoice as any).paid_at)}</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          {/* Accent line */}
          <div className="h-[3px] bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-400" />

          {/* ══════════════════════════════════════
              ADDRESSES
          ══════════════════════════════════════ */}
          <div className="px-10 py-9 grid grid-cols-2 gap-10">
            {/* Emitter */}
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">De</p>
              <p className="font-bold text-gray-900 text-sm">{profile?.company_name || 'Mon Entreprise'}</p>
              {profile?.address && <p className="text-sm text-gray-500 mt-1">{profile.address}</p>}
              {(profile?.postal_code || profile?.city) && (
                <p className="text-sm text-gray-500">{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</p>
              )}
              {profile?.email && <p className="text-sm text-gray-500 mt-1">{profile.email}</p>}
              {profile?.phone && <p className="text-sm text-gray-500">{profile.phone}</p>}
            </div>

            {/* Client */}
            {client && (
              <div className="pl-8 border-l-2 border-indigo-200">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-3">Facturé à</p>
                <p className="font-bold text-gray-900 text-sm">{getClientName(client)}</p>
                {client.address && <p className="text-sm text-gray-500 mt-1">{client.address}</p>}
                {(client.postal_code || client.city) && (
                  <p className="text-sm text-gray-500">{[client.postal_code, client.city].filter(Boolean).join(' ')}</p>
                )}
                {client.email && <p className="text-sm text-gray-500 mt-1">{client.email}</p>}
                {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
                {client.siret && <p className="text-xs text-gray-400 mt-1">SIRET : {client.siret}</p>}
              </div>
            )}
          </div>

          {/* ── SUBJECT ── */}
          {invoice.subject && (
            <div className="px-10 pb-7">
              <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Objet :</span>
                {invoice.subject}
              </span>
            </div>
          )}

          {/* ══════════════════════════════════════
              ITEMS TABLE
          ══════════════════════════════════════ */}
          <div className="px-10 pb-8">
            <table className="w-full rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-900">
                  <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="text-center px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-16">Qté</th>
                  <th className="text-right px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-28">P.U. HT</th>
                  <th className="text-center px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-16">TVA</th>
                  <th className="text-right px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-28">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{item.description}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-700">{item.quantity}</span>
                      {item.unit && <span className="text-xs text-gray-400 ml-1">{item.unit}</span>}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-600">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                        {item.vat_rate}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-gray-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ══════════════════════════════════════
              TOTALS
          ══════════════════════════════════════ */}
          <div className="px-10 pb-10 flex justify-end">
            <div className="w-80">
              <div className="space-y-3 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Sous-total HT</span>
                  <span className="text-sm font-semibold text-gray-800">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Remise{(invoice as any).discount_percent > 0 ? ` (${(invoice as any).discount_percent}%)` : ''}
                    </span>
                    <span className="text-sm font-semibold text-red-500">− {formatCurrency(invoice.discount_amount)}</span>
                  </div>
                )}
                {Object.entries(taxByRate).map(([rate, amount]) => (
                  <div key={rate} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">TVA {rate}%</span>
                    <span className="text-sm font-semibold text-gray-800">{formatCurrency(amount as number)}</span>
                  </div>
                ))}
              </div>

              {/* TOTAL BOX */}
              <div className={`mt-4 flex justify-between items-center rounded-xl px-6 py-5 ${isPaid ? 'bg-green-600' : 'bg-slate-900'}`}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Total TTC</p>
                  {isPaid && <p className="text-xs text-green-300 font-semibold mt-0.5">✓ Payée</p>}
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{formatCurrency(invoice.total)}</p>
              </div>
            </div>
          </div>

          {/* ── NOTES & BANKING ── */}
          {(invoice.notes || invoice.payment_terms || profile?.bank_iban) && (
            <div className="mx-10 mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {invoice.notes && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">Notes</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {(profile?.bank_iban || invoice.payment_terms) && (
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-5">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-2">Coordonnées bancaires</p>
                  {profile?.bank_name && <p className="text-sm font-semibold text-gray-800">{profile.bank_name}</p>}
                  {profile?.bank_iban && <p className="text-xs text-gray-600 font-mono mt-1">IBAN : {profile.bank_iban}</p>}
                  {profile?.bank_bic && <p className="text-xs text-gray-600 font-mono">BIC : {profile.bank_bic}</p>}
                  {invoice.payment_terms && <p className="text-xs text-gray-500 mt-2 italic">{invoice.payment_terms}</p>}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              DARK FOOTER
          ══════════════════════════════════════ */}
          <div className="bg-slate-900 px-10 py-5 flex items-center justify-between gap-4">
            <p className="text-slate-500 text-xs font-medium">{profile?.company_name || 'Mon Entreprise'}</p>
            {profile?.footer_text && (
              <p className="text-slate-500 text-xs text-center flex-1">{profile.footer_text}</p>
            )}
            {profile?.siret && (
              <p className="text-slate-600 text-xs whitespace-nowrap">SIRET : {profile.siret}</p>
            )}
          </div>

        </div>

        {/* ── BOTTOM ACTIONS (no print) ── */}
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
