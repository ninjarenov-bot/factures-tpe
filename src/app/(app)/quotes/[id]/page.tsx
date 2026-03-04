'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDate, getClientName } from '@/lib/utils'
import { Quote } from '@/types/database'
import Header from '@/components/Header'
import { QuoteStatusBadge } from '@/components/StatusBadge'
import EmailModal from '@/components/EmailModal'
import {
  CheckCircleIcon, XCircleIcon, TrashIcon, PrinterIcon, DocumentArrowDownIcon, EnvelopeIcon, PencilIcon,
} from '@heroicons/react/24/outline'

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => { loadQuote() }, [id])

  async function loadQuote() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const [quoteRes, profileRes] = await Promise.all([
      supabase.from('quotes').select('*, client:clients(*), items:quote_items(*)').eq('id', id).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])
    if (quoteRes.data) {
      const q = quoteRes.data as any
      q.items = (q.items || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      setQuote(q)
    }
    setProfile(profileRes.data)
    setLoading(false)
  }

  async function updateStatus(status: string) {
    if (!quote) return
    const updates: any = { status }
    if (status === 'accepted') updates.accepted_at = new Date().toISOString()
    if (status === 'refused') updates.refused_at = new Date().toISOString()
    await supabase.from('quotes').update(updates).eq('id', quote.id)
    setQuote({ ...quote, status: status as any })
  }

  async function convertToInvoice() {
    if (!quote) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const profileRes = await supabase.from('profiles').select('invoice_prefix, invoice_counter').eq('id', user.id).single()
    const prefix = profileRes.data?.invoice_prefix || 'FAC'
    const counter = profileRes.data?.invoice_counter || 1
    const today = new Date().toISOString().split('T')[0]
    const due = new Date()
    due.setDate(due.getDate() + (profile?.default_payment_terms || 30))
    const { data: invoice } = await supabase.from('invoices').insert({
      user_id: user.id, client_id: quote.client_id,
      number: `${prefix}${new Date().getFullYear()}${String(counter).padStart(4, '0')}`,
      status: 'draft', issue_date: today, due_date: due.toISOString().split('T')[0],
      subject: quote.subject, subtotal: quote.subtotal, tax_amount: quote.tax_amount,
      total: quote.total, notes: quote.notes, payment_terms: quote.payment_terms,
      discount_percent: quote.discount_percent, discount_amount: quote.discount_amount,
    }).select().single()
    if (invoice && quote.items) {
      await supabase.from('invoice_items').insert(
        (quote.items as any[]).map((item: any) => ({
          invoice_id: invoice.id, description: item.description, quantity: item.quantity,
          unit_price: item.unit_price, unit: item.unit, vat_rate: item.vat_rate,
          discount_percent: item.discount_percent, total: item.total, sort_order: item.sort_order,
        }))
      )
      await supabase.from('quotes').update({ status: 'invoiced', converted_invoice_id: invoice.id }).eq('id', quote.id)
      await supabase.from('profiles').update({ invoice_counter: counter + 1 }).eq('id', user.id)
      router.push(`/invoices/${invoice.id}`)
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!quote) return <div className="p-6 text-center text-gray-500">Devis introuvable</div>

  const items = (quote as any).items || []
  const taxByRate: Record<number, number> = items.reduce((acc: any, item: any) => {
    if (item.vat_rate > 0) acc[item.vat_rate] = (acc[item.vat_rate] || 0) + item.total * item.vat_rate / 100
    return acc
  }, {})
  const client = quote.client as any
  const isAccepted = quote.status === 'accepted'
  const isRefused = quote.status === 'refused'

  const emailBody = [
    `Bonjour${client ? ` ${getClientName(client)}` : ''},`,
    '',
    `Veuillez trouver ci-joint le devis ${quote.number}${quote.subject ? ` concernant : ${quote.subject}` : ''}.`,
    '',
    `Montant total TTC : ${formatCurrency(quote.total)}`,
    quote.valid_until ? `Ce devis est valable jusqu'au ${formatDate(quote.valid_until)}.` : '',
    '',
    "N'hésitez pas à nous contacter pour toute question.",
    '',
    'Cordialement,',
    profile?.company_name || '',
  ].filter(l => l !== undefined).join('\n').trim()

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── TOOLBAR (no print) ── */}
      <div className="no-print">
        <Header
          title={`Devis ${quote.number}`}
          subtitle={getClientName(quote.client)}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => router.push(`/quotes/new?edit=${quote.id}`)}
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
              {quote.status === 'sent' && (
                <>
                  <button onClick={() => updateStatus('accepted')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                    <CheckCircleIcon className="w-4 h-4" /><span className="hidden sm:inline">Accepté</span>
                  </button>
                  <button onClick={() => updateStatus('refused')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                    <XCircleIcon className="w-4 h-4" /><span className="hidden sm:inline">Refusé</span>
                  </button>
                </>
              )}
              {isAccepted && !(quote as any).converted_invoice_id && (
                <button onClick={convertToInvoice}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                  <DocumentArrowDownIcon className="w-4 h-4" /><span className="hidden sm:inline">Convertir en facture</span>
                </button>
              )}
              <button onClick={async () => {
                if (!quote || !confirm('Supprimer ce devis ?')) return
                await supabase.from('quotes').delete().eq('id', quote.id)
                router.push('/quotes')
              }}
                className="p-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50" title="Supprimer">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          }
        />
      </div>

      <main className="flex-1 p-4 sm:p-8 bg-[#ECEEF4]">
        <div id="quote-doc" className="bg-white max-w-4xl mx-auto shadow-2xl rounded-2xl overflow-hidden relative">

          {/* ── WATERMARKS ── */}
          {isAccepted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.04] select-none">
              <span className="text-green-600 font-black text-[130px] rotate-[-28deg] tracking-widest">ACCEPTÉ</span>
            </div>
          )}
          {isRefused && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.04] select-none">
              <span className="text-red-600 font-black text-[130px] rotate-[-28deg] tracking-widest">REFUSÉ</span>
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
                <div className="w-[52px] h-[52px] rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-900/40">
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

            {/* Right — Quote ID */}
            <div className="text-right flex-shrink-0">
              <span className="inline-block bg-violet-600 text-white text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full">
                Devis
              </span>
              <p className="text-white font-black text-5xl mt-2 leading-none tracking-tight">
                {quote.number}
              </p>
              <div className="mt-5 space-y-2 pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-slate-500 text-xs">Émis le</span>
                  <span className="text-slate-300 text-xs font-semibold">{formatDate(quote.issue_date)}</span>
                </div>
                {quote.valid_until && (
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-slate-500 text-xs">Valide jusqu'au</span>
                    <span className="text-slate-300 text-xs font-semibold">{formatDate(quote.valid_until)}</span>
                  </div>
                )}
                {(quote as any).accepted_at && (
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-slate-500 text-xs">Accepté le</span>
                    <span className="text-green-400 text-xs font-semibold">{formatDate((quote as any).accepted_at)}</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <QuoteStatusBadge status={quote.status} />
              </div>
            </div>
          </div>

          {/* Accent line */}
          <div className="h-[3px] bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-400" />

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
              <div className="pl-8 border-l-2 border-violet-200">
                <p className="text-[9px] font-black text-violet-500 uppercase tracking-[0.3em] mb-3">Destinataire</p>
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
          {quote.subject && (
            <div className="px-10 pb-7">
              <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Objet :</span>
                {quote.subject}
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
                      <span className="text-xs font-semibold bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">
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
                  <span className="text-sm font-semibold text-gray-800">{formatCurrency(quote.subtotal)}</span>
                </div>
                {quote.discount_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Remise{(quote as any).discount_percent > 0 ? ` (${(quote as any).discount_percent}%)` : ''}
                    </span>
                    <span className="text-sm font-semibold text-red-500">− {formatCurrency(quote.discount_amount)}</span>
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
              <div className={`mt-4 flex justify-between items-center rounded-xl px-6 py-5 ${isAccepted ? 'bg-green-600' : isRefused ? 'bg-red-600' : 'bg-slate-900'}`}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Total TTC</p>
                  {isAccepted && <p className="text-xs text-green-300 font-semibold mt-0.5">✓ Accepté</p>}
                  {isRefused && <p className="text-xs text-red-300 font-semibold mt-0.5">✗ Refusé</p>}
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{formatCurrency(quote.total)}</p>
              </div>
            </div>
          </div>

          {/* ── NOTES ── */}
          {(quote.notes || quote.payment_terms) && (
            <div className="mx-10 mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quote.notes && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">Notes</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{quote.notes}</p>
                </div>
              )}
              {quote.payment_terms && (
                <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-5">
                  <p className="text-[9px] font-black text-violet-400 uppercase tracking-[0.25em] mb-2">Conditions</p>
                  <p className="text-sm text-gray-600 italic">{quote.payment_terms}</p>
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
          {quote.status === 'draft' && (
            <button onClick={() => updateStatus('sent')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              Marquer comme envoyé
            </button>
          )}
          {quote.status === 'sent' && (
            <>
              <button onClick={() => updateStatus('accepted')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                <CheckCircleIcon className="w-4 h-4" /> Marquer accepté
              </button>
              <button onClick={() => updateStatus('refused')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                <XCircleIcon className="w-4 h-4" /> Marquer refusé
              </button>
            </>
          )}
          {isAccepted && !(quote as any).converted_invoice_id && (
            <button onClick={convertToInvoice}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
              <DocumentArrowDownIcon className="w-4 h-4" /> Convertir en facture
            </button>
          )}
        </div>
      </main>

      <EmailModal
        isOpen={showEmail}
        onClose={() => setShowEmail(false)}
        defaultTo={client?.email || ''}
        defaultCc={profile?.email || ''}
        subject={`Devis ${quote.number} — ${profile?.company_name || 'Mon Entreprise'}`}
        body={emailBody}
        docType="devis"
        docNumber={quote.number}
      />
    </div>
  )
}
