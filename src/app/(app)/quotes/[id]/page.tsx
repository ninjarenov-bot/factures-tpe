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
  const hasDiscount = items.some((i: any) => i.discount_percent > 0)

  // TVA détail par taux
  const taxByRate: Record<number, { ht: number; tva: number; ttc: number }> = {}
  items.forEach((item: any) => {
    const ht = item.total
    const tva = parseFloat((ht * item.vat_rate / 100).toFixed(2))
    const ttc = ht + tva
    if (!taxByRate[item.vat_rate]) taxByRate[item.vat_rate] = { ht: 0, tva: 0, ttc: 0 }
    taxByRate[item.vat_rate].ht += ht
    taxByRate[item.vat_rate].tva += tva
    taxByRate[item.vat_rate].ttc += ttc
  })

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

      {/* TOOLBAR */}
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

      <main className="flex-1 p-4 sm:p-10 bg-gray-200">
        <div id="quote-doc" className="bg-white max-w-[210mm] mx-auto shadow-2xl relative overflow-hidden"
          style={{ fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: '13px', lineHeight: '1.5' }}>

          {/* WATERMARKS */}
          {isAccepted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none"
              style={{ opacity: 0.04 }}>
              <span style={{ fontSize: '140px', fontWeight: 900, color: '#16a34a', transform: 'rotate(-30deg)', letterSpacing: '0.1em' }}>ACCEPTÉ</span>
            </div>
          )}
          {isRefused && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none"
              style={{ opacity: 0.04 }}>
              <span style={{ fontSize: '140px', fontWeight: 900, color: '#dc2626', transform: 'rotate(-30deg)', letterSpacing: '0.1em' }}>REFUSÉ</span>
            </div>
          )}

          {/* ══════════ HEADER ══════════ */}
          {/* Barre accent violet */}
          <div style={{ height: '5px', background: 'linear-gradient(to right, #7c3aed, #8b5cf6, #a78bfa)' }} />
          <div style={{ background: 'white', padding: '32px 40px 28px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '32px' }}>

              {/* Logo + Société */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1 }}>
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Logo"
                    style={{ width: '56px', height: '56px', objectFit: 'contain', border: '1px solid #e5e7eb' }} />
                ) : (
                  <div style={{ width: '56px', height: '56px', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'white', fontWeight: 900, fontSize: '22px' }}>
                      {(profile?.company_name || 'M').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div style={{ color: '#6b7280', fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Vendeur</div>
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{profile?.company_name || 'Mon Entreprise'}</div>
                  {profile?.address && <div style={{ color: '#374151', fontSize: '11px' }}>{profile.address}</div>}
                  {(profile?.postal_code || profile?.city) && (
                    <div style={{ color: '#374151', fontSize: '11px' }}>{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</div>
                  )}
                  {profile?.phone && <div style={{ color: '#374151', fontSize: '11px', marginTop: '4px' }}>{profile.phone}</div>}
                  {profile?.email && <div style={{ color: '#374151', fontSize: '11px' }}>{profile.email}</div>}
                  {profile?.siret && <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '6px' }}>SIRET : {profile.siret}</div>}
                  {profile?.vat_number && <div style={{ color: '#6b7280', fontSize: '10px' }}>N° TVA : {profile.vat_number}</div>}
                </div>
              </div>

              {/* Numéro + Dates */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: '#7c3aed', fontSize: '10px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>DEVIS</div>
                <div style={{ color: '#111827', fontWeight: 900, fontSize: '36px', lineHeight: 1, marginTop: '4px', letterSpacing: '-1px' }}>{quote.number}</div>
                <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                  {[
                    { label: 'Date du devis', value: formatDate(quote.issue_date) },
                    quote.valid_until ? { label: "Valable jusqu'au", value: formatDate(quote.valid_until) } : null,
                    (quote as any).accepted_at ? { label: 'Accepté le', value: formatDate((quote as any).accepted_at), green: true } : null,
                    (quote as any).refused_at ? { label: 'Refusé le', value: formatDate((quote as any).refused_at), red: true } : null,
                  ].filter(Boolean).map((row: any, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', gap: '24px', marginBottom: '4px' }}>
                      <span style={{ color: '#6b7280', fontSize: '11px' }}>{row.label}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: row.green ? '#16a34a' : row.red ? '#dc2626' : '#111827', minWidth: '80px', textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <QuoteStatusBadge status={quote.status} />
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ ADRESSES ══════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: '1px solid #e2e8f0' }}>
            {/* Vendeur */}
            <div style={{ padding: '20px 24px 20px 40px', borderRight: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Vendeur :</div>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: '13px' }}>{profile?.company_name || 'Mon Entreprise'}</div>
              {profile?.address && <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{profile.address}</div>}
              {(profile?.postal_code || profile?.city) && <div style={{ color: '#6b7280', fontSize: '12px' }}>{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</div>}
              {profile?.email && <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{profile.email}</div>}
              {profile?.phone && <div style={{ color: '#6b7280', fontSize: '12px' }}>{profile.phone}</div>}
            </div>
            {/* Client */}
            <div style={{ padding: '20px 40px 20px 24px', borderLeft: '3px solid #7c3aed' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#6d28d9', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Client :</div>
              {client ? (
                <>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '13px' }}>{getClientName(client)}</div>
                  {client.address && <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{client.address}</div>}
                  {(client.postal_code || client.city) && <div style={{ color: '#6b7280', fontSize: '12px' }}>{[client.postal_code, client.city].filter(Boolean).join(' ')}</div>}
                  {client.email && <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{client.email}</div>}
                  {client.phone && <div style={{ color: '#6b7280', fontSize: '12px' }}>{client.phone}</div>}
                  {client.siret && <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px' }}>SIRET : {client.siret}</div>}
                </>
              ) : (
                <div style={{ color: '#9ca3af', fontSize: '12px', fontStyle: 'italic' }}>Aucun client sélectionné</div>
              )}
            </div>
          </div>

          {/* Objet */}
          {quote.subject && (
            <div style={{ padding: '10px 40px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Objet : </span>
              <span style={{ fontSize: '13px', color: '#111827' }}>{quote.subject}</span>
            </div>
          )}

          {/* ══════════ TABLEAU ARTICLES ══════════ */}
          <div style={{ padding: '24px 40px 0' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Détail du devis :
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ textAlign: 'left', padding: '9px 12px', color: '#111827', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '2px solid #d1d5db' }}>
                    Désignation
                  </th>
                  <th style={{ textAlign: 'center', padding: '9px 10px', color: '#111827', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '60px' }}>
                    Qté
                  </th>
                  <th style={{ textAlign: 'right', padding: '9px 10px', color: '#111827', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '90px' }}>
                    P.U. HT
                  </th>
                  {hasDiscount && (
                    <th style={{ textAlign: 'center', padding: '9px 8px', color: '#111827', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '60px' }}>
                      Remise
                    </th>
                  )}
                  <th style={{ textAlign: 'center', padding: '9px 8px', color: '#111827', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '55px' }}>
                    TVA
                  </th>
                  <th style={{ textAlign: 'right', padding: '9px 10px', color: '#111827', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '90px' }}>
                    Total HT
                  </th>
                  <th style={{ textAlign: 'right', padding: '9px 12px', color: '#111827', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '100px' }}>
                    Total TTC
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => {
                  const totalTTC = item.total * (1 + item.vat_rate / 100)
                  return (
                    <tr key={idx} style={{ background: 'white' }}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', color: '#111827', fontWeight: 600, verticalAlign: 'top' }}>
                        {item.description}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', color: '#111827' }}>
                        {item.quantity}{item.unit && <span style={{ color: '#6b7280', fontSize: '10px' }}> {item.unit}</span>}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827' }}>
                        {formatCurrency(item.unit_price)}
                      </td>
                      {hasDiscount && (
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', color: '#111827' }}>
                          {item.discount_percent > 0 ? `${item.discount_percent}%` : '—'}
                        </td>
                      )}
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <span style={{ color: '#6d28d9', fontWeight: 700, fontSize: '11px' }}>{item.vat_rate}%</span>
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827', fontWeight: 600 }}>
                        {formatCurrency(item.total)}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827', fontWeight: 700 }}>
                        {formatCurrency(totalTTC)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ══════════ DETAIL TVA + TOTAUX ══════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '20px 40px 24px', alignItems: 'start' }}>

            {/* Tableau TVA */}
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Détail TVA :
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '7px 10px', borderBottom: '2px solid #d1d5db', textAlign: 'center', fontWeight: 700, color: '#111827', fontSize: '10px' }}>Taux TVA</th>
                    <th style={{ padding: '7px 10px', borderBottom: '2px solid #d1d5db', textAlign: 'right', fontWeight: 700, color: '#111827', fontSize: '10px' }}>Montant HT</th>
                    <th style={{ padding: '7px 10px', borderBottom: '2px solid #d1d5db', textAlign: 'right', fontWeight: 700, color: '#111827', fontSize: '10px' }}>Montant TVA</th>
                    <th style={{ padding: '7px 10px', borderBottom: '2px solid #d1d5db', textAlign: 'right', fontWeight: 700, color: '#111827', fontSize: '10px' }}>Montant TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(taxByRate).map(([rate, vals]) => (
                    <tr key={rate} style={{ background: 'white' }}>
                      <td style={{ padding: '7px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', color: '#6d28d9', fontWeight: 700 }}>{rate} %</td>
                      <td style={{ padding: '7px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827' }}>{formatCurrency(vals.ht)}</td>
                      <td style={{ padding: '7px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827' }}>{formatCurrency(vals.tva)}</td>
                      <td style={{ padding: '7px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827', fontWeight: 700 }}>{formatCurrency(vals.ttc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Montant du devis :
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>Total montant HT</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{formatCurrency(quote.subtotal)}</td>
                  </tr>
                  {quote.discount_amount > 0 && (
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                        Remise{(quote as any).discount_percent > 0 ? ` (${(quote as any).discount_percent}%)` : ''}
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>− {formatCurrency(quote.discount_amount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>Total montant TVA</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{formatCurrency(quote.tax_amount)}</td>
                  </tr>
                  <tr style={{ background: '#f3f4f6' }}>
                    <td style={{ padding: '12px 12px', borderTop: '2px solid #d1d5db', color: '#111827', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isAccepted ? '✓ Devis accepté' : isRefused ? '✗ Devis refusé' : 'Total TTC'}
                    </td>
                    <td style={{ padding: '12px 12px', borderTop: '2px solid #d1d5db', textAlign: 'right', color: isAccepted ? '#16a34a' : isRefused ? '#dc2626' : '#111827', fontWeight: 900, fontSize: '20px' }}>
                      {formatCurrency(quote.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ══════════ CONDITIONS & NOTES ══════════ */}
          {(quote.payment_terms || quote.notes) && (
            <div style={{ display: 'grid', gridTemplateColumns: quote.payment_terms && quote.notes ? '1fr 1fr' : '1fr', gap: '0', borderTop: '1px solid #e5e7eb', margin: '0 40px 24px' }}>
              {quote.payment_terms && (
                <div style={{ padding: '16px', border: '1px solid #e5e7eb', background: '#f8fafc', marginRight: quote.notes ? '12px' : 0 }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Conditions :</div>
                  <div style={{ fontSize: '11px', color: '#111827', fontStyle: 'italic', lineHeight: '1.6' }}>{quote.payment_terms}</div>
                </div>
              )}
              {quote.notes && (
                <div style={{ padding: '16px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Notes :</div>
                  <div style={{ fontSize: '11px', color: '#111827', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{quote.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Mentions légales */}
          <div style={{ padding: '0 40px 20px' }}>
            <div style={{ fontSize: '9px', color: '#6b7280', lineHeight: '1.6', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
              Ce devis est valable jusqu&apos;à la date indiquée ci-dessus. La signature du présent devis vaut acceptation des conditions générales de vente et engagement ferme du client. Passé ce délai, une nouvelle proposition pourra être établie sur demande.
            </div>
          </div>

          {/* ══════════ FOOTER ══════════ */}
          <div style={{ background: '#f3f4f6', padding: '14px 40px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ color: '#111827', fontSize: '11px', fontWeight: 700 }}>{profile?.company_name || 'Mon Entreprise'}</span>
              {profile?.footer_text && (
                <span style={{ color: '#374151', fontSize: '10px', flex: 1, textAlign: 'center' }}>{profile.footer_text}</span>
              )}
              <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#374151' }}>
                {profile?.siret && <span>SIRET : {profile.siret}</span>}
                {profile?.vat_number && <span>TVA : {profile.vat_number}</span>}
              </div>
            </div>
          </div>

        </div>

        {/* ACTIONS BAS */}
        <div className="no-print max-w-[210mm] mx-auto mt-4 flex flex-wrap gap-3">
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
        quoteId={quote.id}
      />
    </div>
  )
}
