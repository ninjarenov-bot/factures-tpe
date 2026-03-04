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
  CheckCircleIcon, XCircleIcon, TrashIcon, PrinterIcon, DocumentArrowDownIcon, EnvelopeIcon,
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
    'N\'hésitez pas à nous contacter pour toute question.',
    '',
    'Cordialement,',
    profile?.company_name || '',
  ].filter(l => l !== undefined).join('\n').trim()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Toolbar */}
      <div className="no-print">
        <Header
          title={`Devis ${quote.number}`}
          subtitle={getClientName(quote.client)}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
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
            </div>
          }
        />
      </div>

      <main className="flex-1 p-4 sm:p-8 bg-[#F0F2F8]">
        <div id="quote-doc" className="bg-white max-w-4xl mx-auto shadow-lg rounded-2xl overflow-hidden relative">

          {/* Watermarks */}
          {isAccepted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.06]">
              <span className="text-green-700 font-black text-[120px] rotate-[-30deg] select-none tracking-widest">ACCEPTÉ</span>
            </div>
          )}
          {isRefused && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.06]">
              <span className="text-red-700 font-black text-[120px] rotate-[-30deg] select-none tracking-widest">REFUSÉ</span>
            </div>
          )}

          {/* ── ACCENT BAR ── */}
          <div className="h-1.5 bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-400" />

          {/* ── HEADER ── */}
          <div className="px-10 pt-8 pb-6 flex items-start justify-between gap-6">
            {/* Left: Logo + société */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="w-20 h-20 object-contain rounded-xl flex-shrink-0 border border-gray-100" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-md">
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

            {/* Right: DEVIS title + numéro + dates */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.25em] mb-1">Devis</p>
              <p className="text-4xl font-black text-violet-600 leading-none">{quote.number}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-gray-400">Émis le</span>
                  <span className="text-sm font-semibold text-gray-800">{formatDate(quote.issue_date)}</span>
                </div>
                {quote.valid_until && (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-gray-400">Valide jusqu'au</span>
                    <span className="text-sm font-semibold text-gray-800">{formatDate(quote.valid_until)}</span>
                  </div>
                )}
                <div className="mt-2"><QuoteStatusBadge status={quote.status} /></div>
              </div>
            </div>
          </div>

          {/* ── ADDRESSES ── */}
          <div className="px-10 pb-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-5">
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em] mb-2">Émetteur</p>
              <p className="font-bold text-gray-900">{profile?.company_name || 'Mon Entreprise'}</p>
              {profile?.address && <p className="text-sm text-gray-600 mt-1">{profile.address}</p>}
              {(profile?.postal_code || profile?.city) && (
                <p className="text-sm text-gray-600">{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</p>
              )}
              {profile?.email && <p className="text-sm text-gray-600 mt-1">{profile.email}</p>}
              {profile?.phone && <p className="text-sm text-gray-600">{profile.phone}</p>}
            </div>
            {client ? (
              <div className="rounded-xl bg-violet-50 border border-violet-100 p-5">
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em] mb-2">Destinataire</p>
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
          {quote.subject && (
            <div className="px-10 pb-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 rounded-lg">
                <span className="text-xs font-bold text-violet-200 uppercase tracking-wider">Objet</span>
                <span className="text-sm text-white font-semibold">{quote.subject}</span>
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
                <span className="text-sm font-semibold text-gray-800">{formatCurrency(quote.subtotal)}</span>
              </div>
              {quote.discount_amount > 0 && (
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-500">Remise</span>
                  <span className="text-sm font-semibold text-red-600">- {formatCurrency(quote.discount_amount)}</span>
                </div>
              )}
              {Object.entries(taxByRate).map(([rate, amount]) => (
                <div key={rate} className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-500">TVA {rate}%</span>
                  <span className="text-sm font-semibold text-gray-800">{formatCurrency(amount as number)}</span>
                </div>
              ))}
              <div className="pt-2">
                <div className={`flex justify-between items-center px-5 py-4 rounded-xl ${isAccepted ? 'bg-green-600' : isRefused ? 'bg-red-600' : 'bg-violet-600'}`}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white/70">Total TTC</p>
                    {isAccepted && <p className="text-xs text-green-200 font-medium mt-0.5">✓ Accepté</p>}
                    {isRefused && <p className="text-xs text-red-200 font-medium mt-0.5">✗ Refusé</p>}
                  </div>
                  <span className="text-2xl font-black text-white">{formatCurrency(quote.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── NOTES ── */}
          {(quote.notes || quote.payment_terms) && (
            <div className="mx-10 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quote.notes && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Notes</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{quote.notes}</p>
                </div>
              )}
              {quote.payment_terms && (
                <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-5">
                  <p className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em] mb-2">Conditions</p>
                  <p className="text-sm text-gray-600 italic">{quote.payment_terms}</p>
                </div>
              )}
            </div>
          )}

          {/* ── FOOTER ── */}
          <div className="h-1.5 bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-400" />
          {profile?.footer_text && (
            <div className="px-10 py-3 bg-violet-600 text-center">
              <p className="text-xs text-violet-200">{profile.footer_text}</p>
            </div>
          )}
        </div>

        {/* Actions (no print) */}
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
