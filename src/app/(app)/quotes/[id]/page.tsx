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
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
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
      user_id: user.id,
      client_id: quote.client_id,
      number: `${prefix}${new Date().getFullYear()}${String(counter).padStart(4, '0')}`,
      status: 'draft',
      issue_date: today,
      due_date: due.toISOString().split('T')[0],
      subject: quote.subject,
      subtotal: quote.subtotal,
      tax_amount: quote.tax_amount,
      total: quote.total,
      notes: quote.notes,
      payment_terms: quote.payment_terms,
    }).select().single()

    if (invoice && quote.items) {
      await supabase.from('invoice_items').insert(
        (quote.items as any[]).map((item: any) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit: item.unit,
          vat_rate: item.vat_rate,
          discount_percent: item.discount_percent,
          total: item.total,
          sort_order: item.sort_order,
        }))
      )
      await supabase.from('quotes').update({ status: 'invoiced', converted_invoice_id: invoice.id }).eq('id', quote.id)
      await supabase.from('profiles').update({ invoice_counter: counter + 1 }).eq('id', user.id)
      router.push(`/invoices/${invoice.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!quote) {
    return <div className="p-6 text-center text-gray-500">Devis introuvable</div>
  }

  const items = (quote as any).items || []
  const taxByRate = items.reduce((acc: any, item: any) => {
    acc[item.vat_rate] = (acc[item.vat_rate] || 0) + item.total * item.vat_rate / 100
    return acc
  }, {} as Record<number, number>)

  const companyInitial = (profile?.company_name || 'M').charAt(0).toUpperCase()

  const emailBody = [
    `Bonjour${quote.client ? ` ${getClientName(quote.client)}` : ''},`,
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
    profile?.phone || '',
    profile?.email || '',
  ].filter(l => l !== undefined).join('\n').trim()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Toolbar (hidden on print) */}
      <div className="no-print">
        <Header
          title={`Devis ${quote.number}`}
          subtitle={getClientName(quote.client)}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setShowEmail(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
                <EnvelopeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
              <button onClick={() => window.print()}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50" title="Imprimer / PDF">
                <PrinterIcon className="w-4 h-4" />
              </button>
              {quote.status === 'sent' && (
                <>
                  <button onClick={() => updateStatus('accepted')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Accepté</span>
                  </button>
                  <button onClick={() => updateStatus('refused')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                    <XCircleIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Refusé</span>
                  </button>
                </>
              )}
              {quote.status === 'accepted' && !(quote as any).converted_invoice_id && (
                <button onClick={convertToInvoice}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Convertir en facture</span>
                </button>
              )}
            </div>
          }
        />
      </div>

      <main className="flex-1 p-4 sm:p-6 bg-[#F8F9FC]">
        {/* Quote document */}
        <div id="quote-doc" className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-4xl mx-auto overflow-hidden">

          {/* Gradient header band - indigo/violet for quotes */}
          <div className="bg-gradient-to-r from-violet-700 to-indigo-500 px-8 py-6 flex items-start justify-between gap-4">
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
                {profile?.address && <p className="text-violet-200 text-sm mt-0.5">{profile.address}</p>}
                {(profile?.postal_code || profile?.city) && (
                  <p className="text-violet-200 text-sm">{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</p>
                )}
                {profile?.siret && <p className="text-violet-200 text-xs mt-1">SIRET : {profile.siret}</p>}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-violet-200 text-xs uppercase tracking-widest font-medium">Devis</p>
              <p className="text-white font-bold text-2xl mt-0.5">{quote.number}</p>
              <div className="mt-2">
                <QuoteStatusBadge status={quote.status} />
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-8 py-5 border-b border-gray-100 bg-gray-50/50">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Date d'émission</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDate(quote.issue_date)}</p>
            </div>
            {quote.valid_until && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Valide jusqu'au</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDate(quote.valid_until)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Montant TTC</p>
              <p className="text-sm font-bold text-indigo-700 mt-0.5">{formatCurrency(quote.total)}</p>
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
            {quote.client && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Destinataire</p>
                <p className="font-semibold text-gray-900">{getClientName(quote.client)}</p>
                {(quote.client as any).address && <p className="text-sm text-gray-600 mt-0.5">{(quote.client as any).address}</p>}
                {(quote.client as any).city && (
                  <p className="text-sm text-gray-600">{[(quote.client as any).postal_code, (quote.client as any).city].filter(Boolean).join(' ')}</p>
                )}
                {(quote.client as any).email && <p className="text-sm text-gray-600 mt-1">{(quote.client as any).email}</p>}
                {(quote.client as any).phone && <p className="text-sm text-gray-600">{(quote.client as any).phone}</p>}
              </div>
            )}
          </div>

          {/* Subject */}
          {quote.subject && (
            <div className="px-8 pb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg">
                <span className="text-xs font-semibold text-violet-500 uppercase tracking-wide">Objet</span>
                <span className="text-sm text-violet-900 font-medium">{quote.subject}</span>
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
                <span className="font-medium text-gray-900">{formatCurrency(quote.subtotal)}</span>
              </div>
              {Object.entries(taxByRate).filter(([, v]) => (v as number) > 0).map(([rate, amount]) => (
                <div key={rate} className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA {rate}%</span>
                  <span className="text-gray-900">{formatCurrency(amount as number)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t-2 border-gray-900 pt-3 mt-3">
                <span className="text-base font-bold text-gray-900">TOTAL TTC</span>
                <span className="text-xl font-bold text-indigo-700">{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(quote.notes || quote.payment_terms) && (
            <div className="border-t border-gray-200 px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/60">
              {quote.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{quote.notes}</p>
                </div>
              )}
              {quote.payment_terms && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Conditions</p>
                  <p className="text-sm text-gray-600 italic">{quote.payment_terms}</p>
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
                <CheckCircleIcon className="w-4 h-4" />
                Marquer accepté
              </button>
              <button onClick={() => updateStatus('refused')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                <XCircleIcon className="w-4 h-4" />
                Marquer refusé
              </button>
            </>
          )}
          {quote.status === 'accepted' && !(quote as any).converted_invoice_id && (
            <button onClick={convertToInvoice}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
              <DocumentArrowDownIcon className="w-4 h-4" />
              Convertir en facture
            </button>
          )}
        </div>
      </main>

      {/* Email modal */}
      <EmailModal
        isOpen={showEmail}
        onClose={() => setShowEmail(false)}
        defaultTo={(quote.client as any)?.email || ''}
        subject={`Devis ${quote.number} - ${profile?.company_name || 'Mon Entreprise'}`}
        body={emailBody}
        docType="devis"
        docNumber={quote.number}
      />
    </div>
  )
}
