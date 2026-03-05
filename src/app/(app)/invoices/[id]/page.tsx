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

  // TVA détail par taux
  const taxByRate: Record<number, { ht: number; tva: number; ttc: number }> = {}
  items.forEach((item: any) => {
    const ht = item.total
    const tva = ht * item.vat_rate / 100
    const ttc = ht + tva
    if (!taxByRate[item.vat_rate]) taxByRate[item.vat_rate] = { ht: 0, tva: 0, ttc: 0 }
    taxByRate[item.vat_rate].ht += ht
    taxByRate[item.vat_rate].tva += tva
    taxByRate[item.vat_rate].ttc += ttc
  })

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

      {/* ── TOOLBAR ── */}
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

      <main className="flex-1 p-4 sm:p-8 bg-gray-100">
        <div id="invoice-doc" className="bg-white max-w-4xl mx-auto shadow-xl relative" style={{ fontFamily: 'Arial, sans-serif' }}>

          {/* WATERMARK */}
          {isPaid && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.05] select-none">
              <span className="text-green-600 font-black text-[130px] rotate-[-28deg] tracking-widest">PAYÉE</span>
            </div>
          )}

          {/* ══ HEADER ══ */}
          <div className="bg-slate-900 px-8 pt-8 pb-7">
            <div className="flex items-start justify-between gap-8">

              {/* Gauche — Vendeur */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Logo"
                    className="w-14 h-14 object-contain flex-shrink-0 ring-1 ring-white/10" />
                ) : (
                  <div className="w-14 h-14 bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-2xl">
                      {(profile?.company_name || 'M').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-1">Vendeur</p>
                  <p className="text-white font-bold text-base leading-tight">{profile?.company_name || 'Mon Entreprise'}</p>
                  <div className="mt-1.5 space-y-0.5">
                    {profile?.address && <p className="text-slate-400 text-xs">{profile.address}</p>}
                    {(profile?.postal_code || profile?.city) && (
                      <p className="text-slate-400 text-xs">{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</p>
                    )}
                    {profile?.phone && <p className="text-slate-400 text-xs">{profile.phone}</p>}
                    {profile?.email && <p className="text-slate-400 text-xs">{profile.email}</p>}
                    {profile?.siret && <p className="text-slate-500 text-xs mt-1">SIRET : {profile.siret}</p>}
                    {profile?.vat_number && <p className="text-slate-500 text-xs">N° TVA : {profile.vat_number}</p>}
                  </div>
                </div>
              </div>

              {/* Droite — Identité facture */}
              <div className="text-right flex-shrink-0">
                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.35em] mb-1">Facture</p>
                <p className="text-white font-black text-4xl leading-none">{invoice.number}</p>
                <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-end gap-6">
                    <span className="text-slate-500 text-xs">Date de facture</span>
                    <span className="text-slate-200 text-xs font-semibold w-24 text-right">{formatDate(invoice.issue_date)}</span>
                  </div>
                  {invoice.due_date && (
                    <div className="flex items-center justify-end gap-6">
                      <span className="text-slate-500 text-xs">Date de paiement</span>
                      <span className={`text-xs font-semibold w-24 text-right ${invoice.status === 'overdue' ? 'text-red-400' : 'text-slate-200'}`}>
                        {formatDate(invoice.due_date)}
                      </span>
                    </div>
                  )}
                  {(invoice as any).paid_at && (
                    <div className="flex items-center justify-end gap-6">
                      <span className="text-slate-500 text-xs">Payée le</span>
                      <span className="text-green-400 text-xs font-semibold w-24 text-right">{formatDate((invoice as any).paid_at)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Ligne accent */}
          <div className="h-1 bg-indigo-600" />

          {/* ══ ADRESSES ══ */}
          <div className="px-8 py-6 grid grid-cols-2 gap-8 border-b border-gray-200">
            {/* Vendeur */}
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Vendeur :</p>
              <p className="font-bold text-gray-900 text-sm">{profile?.company_name || 'Mon Entreprise'}</p>
              {profile?.address && <p className="text-sm text-gray-600 mt-0.5">{profile.address}</p>}
              {(profile?.postal_code || profile?.city) && (
                <p className="text-sm text-gray-600">{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</p>
              )}
              {profile?.email && <p className="text-sm text-gray-600 mt-1">{profile.email}</p>}
              {profile?.phone && <p className="text-sm text-gray-600">{profile.phone}</p>}
              {profile?.siret && <p className="text-xs text-gray-400 mt-1">SIRET : {profile.siret}</p>}
              {profile?.vat_number && <p className="text-xs text-gray-400">N° TVA : {profile.vat_number}</p>}
            </div>

            {/* Client */}
            {client && (
              <div className="pl-6 border-l-2 border-indigo-600">
                <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.25em] mb-2">Client :</p>
                <p className="font-bold text-gray-900 text-sm">{getClientName(client)}</p>
                {client.address && <p className="text-sm text-gray-600 mt-0.5">{client.address}</p>}
                {(client.postal_code || client.city) && (
                  <p className="text-sm text-gray-600">{[client.postal_code, client.city].filter(Boolean).join(' ')}</p>
                )}
                {client.email && <p className="text-sm text-gray-600 mt-1">{client.email}</p>}
                {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                {client.siret && <p className="text-xs text-gray-400 mt-1">SIRET : {client.siret}</p>}
              </div>
            )}
          </div>

          {/* Objet */}
          {invoice.subject && (
            <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Objet : </span>
              <span className="text-sm text-gray-800">{invoice.subject}</span>
            </div>
          )}

          {/* ══ TABLEAU ARTICLES ══ */}
          <div className="px-8 py-6">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-3">Détail de la facture :</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-300">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Désignation</th>
                  <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider w-16">Qté</th>
                  <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider w-24">P.U. HT</th>
                  {items.some((i: any) => i.discount_percent > 0) && (
                    <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider w-16">Remise</th>
                  )}
                  <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider w-16">TVA</th>
                  <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider w-24">Total HT</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider w-28">Total TTC</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => {
                  const totalTTC = item.total * (1 + item.vat_rate / 100)
                  const hasDiscount = items.some((i: any) => i.discount_percent > 0)
                  return (
                    <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{item.description}</p>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-700">
                        {item.quantity}{item.unit ? <span className="text-gray-400 text-xs ml-1">{item.unit}</span> : ''}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                      {hasDiscount && (
                        <td className="px-3 py-3 text-center text-gray-500 text-xs">
                          {item.discount_percent > 0 ? `${item.discount_percent}%` : '—'}
                        </td>
                      )}
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs font-semibold text-indigo-700">{item.vat_rate}%</span>
                      </td>
                      <td className="px-3 py-3 text-right text-gray-700 font-medium">{formatCurrency(item.total)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(totalTTC)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ══ TVA + TOTAUX ══ */}
          <div className="px-8 pb-8 grid grid-cols-2 gap-8 items-start">

            {/* Gauche — Détail TVA */}
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-3">Détail TVA :</p>
              <table className="w-full text-xs border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="text-center px-3 py-2 font-bold text-gray-600">Taux TVA</th>
                    <th className="text-right px-3 py-2 font-bold text-gray-600">Montant HT</th>
                    <th className="text-right px-3 py-2 font-bold text-gray-600">Montant TVA</th>
                    <th className="text-right px-3 py-2 font-bold text-gray-600">Montant TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(taxByRate).map(([rate, vals]) => (
                    <tr key={rate} className="border-b border-gray-100">
                      <td className="text-center px-3 py-2 text-indigo-700 font-bold">{rate}%</td>
                      <td className="text-right px-3 py-2 text-gray-700">{formatCurrency(vals.ht)}</td>
                      <td className="text-right px-3 py-2 text-gray-700">{formatCurrency(vals.tva)}</td>
                      <td className="text-right px-3 py-2 text-gray-900 font-semibold">{formatCurrency(vals.ttc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Droite — Résumé totaux */}
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-3">Montant de la facture :</p>
              <div className="border border-gray-200">
                <div className="flex justify-between px-4 py-2.5 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total montant HT</span>
                  <span className="text-sm font-semibold text-gray-800">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between px-4 py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Remise{(invoice as any).discount_percent > 0 ? ` (${(invoice as any).discount_percent}%)` : ''}
                    </span>
                    <span className="text-sm font-semibold text-red-500">− {formatCurrency(invoice.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-2.5 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total montant TVA</span>
                  <span className="text-sm font-semibold text-gray-800">{formatCurrency(invoice.tax_amount)}</span>
                </div>
                <div className={`flex justify-between px-4 py-3 ${isPaid ? 'bg-green-600' : 'bg-slate-900'}`}>
                  <span className="text-sm font-black text-white uppercase tracking-wide">Total TTC</span>
                  <span className="text-lg font-black text-white">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
              {isPaid && (
                <p className="text-xs text-green-600 font-semibold mt-2 text-right">✓ Facture payée</p>
              )}
            </div>
          </div>

          {/* ══ PAIEMENT & NOTES ══ */}
          {(invoice.notes || invoice.payment_terms || profile?.bank_iban) && (
            <div className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-6">
              {(profile?.bank_iban || invoice.payment_terms) && (
                <div className="border border-gray-200 p-4">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Détail paiement :</p>
                  {invoice.payment_terms && (
                    <p className="text-xs text-gray-600 mb-2">{invoice.payment_terms}</p>
                  )}
                  {profile?.bank_name && <p className="text-sm font-semibold text-gray-800">{profile.bank_name}</p>}
                  {profile?.bank_iban && <p className="text-xs text-gray-600 font-mono mt-1">IBAN : {profile.bank_iban}</p>}
                  {profile?.bank_bic && <p className="text-xs text-gray-600 font-mono">BIC : {profile.bank_bic}</p>}
                </div>
              )}
              {invoice.notes && (
                <div className="border border-gray-200 p-4">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Notes :</p>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Mention légale paiement */}
          <div className="px-8 pb-5 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 leading-relaxed mt-4">
              Paiement comptant, pas d'escompte pour règlement anticipé. En cas de retard de paiement, des pénalités de retard au taux légal en vigueur seront appliquées, ainsi qu'une indemnité forfaitaire de recouvrement de 40€.
            </p>
          </div>

          {/* ══ FOOTER ══ */}
          <div className="bg-slate-900 px-8 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-slate-400 text-xs font-semibold">{profile?.company_name || 'Mon Entreprise'}</p>
              {profile?.footer_text && (
                <p className="text-slate-500 text-xs text-center flex-1">{profile.footer_text}</p>
              )}
              <div className="text-right text-[10px] text-slate-600 space-x-3">
                {profile?.siret && <span>SIRET : {profile.siret}</span>}
                {profile?.vat_number && <span>TVA : {profile.vat_number}</span>}
              </div>
            </div>
          </div>

        </div>

        {/* ── ACTIONS BAS ── */}
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
