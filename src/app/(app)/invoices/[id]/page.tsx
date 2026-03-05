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

      {/* TOOLBAR */}
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

      <main className="flex-1 p-4 sm:p-10 bg-gray-200">
        <div id="invoice-doc" className="bg-white max-w-[210mm] mx-auto shadow-2xl relative overflow-hidden"
          style={{ fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: '13px', lineHeight: '1.5' }}>

          {/* WATERMARK */}
          {isPaid && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none"
              style={{ opacity: 0.04 }}>
              <span style={{ fontSize: '140px', fontWeight: 900, color: '#16a34a', transform: 'rotate(-30deg)', letterSpacing: '0.1em' }}>PAYÉE</span>
            </div>
          )}

          {/* ══════════ HEADER SOMBRE ══════════ */}
          <div style={{ background: '#0f172a', padding: '32px 40px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '32px' }}>

              {/* Logo + Société */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1 }}>
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Logo"
                    style={{ width: '56px', height: '56px', objectFit: 'contain', border: '1px solid rgba(255,255,255,0.1)' }} />
                ) : (
                  <div style={{ width: '56px', height: '56px', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'white', fontWeight: 900, fontSize: '22px' }}>
                      {(profile?.company_name || 'M').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Vendeur</div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{profile?.company_name || 'Mon Entreprise'}</div>
                  {profile?.address && <div style={{ color: '#94a3b8', fontSize: '11px' }}>{profile.address}</div>}
                  {(profile?.postal_code || profile?.city) && (
                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</div>
                  )}
                  {profile?.phone && <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>{profile.phone}</div>}
                  {profile?.email && <div style={{ color: '#94a3b8', fontSize: '11px' }}>{profile.email}</div>}
                  {profile?.siret && <div style={{ color: '#64748b', fontSize: '10px', marginTop: '6px' }}>SIRET : {profile.siret}</div>}
                  {profile?.vat_number && <div style={{ color: '#64748b', fontSize: '10px' }}>N° TVA : {profile.vat_number}</div>}
                </div>
              </div>

              {/* Numéro + Dates */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: '#818cf8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>FACTURE</div>
                <div style={{ color: 'white', fontWeight: 900, fontSize: '36px', lineHeight: 1, marginTop: '4px', letterSpacing: '-1px' }}>{invoice.number}</div>
                <div style={{ marginTop: '16px', borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
                  {[
                    { label: 'Date de facture', value: formatDate(invoice.issue_date) },
                    invoice.due_date ? { label: 'Date de paiement', value: formatDate(invoice.due_date), red: invoice.status === 'overdue' } : null,
                    (invoice as any).paid_at ? { label: 'Payée le', value: formatDate((invoice as any).paid_at), green: true } : null,
                  ].filter(Boolean).map((row: any, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', gap: '24px', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{row.label}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: row.green ? '#4ade80' : row.red ? '#f87171' : '#cbd5e1', minWidth: '80px', textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Barre accent indigo */}
          <div style={{ height: '4px', background: 'linear-gradient(to right, #4f46e5, #6366f1, #818cf8)' }} />

          {/* ══════════ ADRESSES ══════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: '1px solid #e2e8f0' }}>
            {/* Vendeur */}
            <div style={{ padding: '20px 24px 20px 40px', borderRight: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Vendeur :</div>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: '13px' }}>{profile?.company_name || 'Mon Entreprise'}</div>
              {profile?.address && <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{profile.address}</div>}
              {(profile?.postal_code || profile?.city) && <div style={{ color: '#6b7280', fontSize: '12px' }}>{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</div>}
              {profile?.email && <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{profile.email}</div>}
              {profile?.phone && <div style={{ color: '#6b7280', fontSize: '12px' }}>{profile.phone}</div>}
            </div>
            {/* Client */}
            <div style={{ padding: '20px 40px 20px 24px', borderLeft: '3px solid #4f46e5' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#4f46e5', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Client :</div>
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
          {invoice.subject && (
            <div style={{ padding: '10px 40px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Objet : </span>
              <span style={{ fontSize: '13px', color: '#1e293b' }}>{invoice.subject}</span>
            </div>
          )}

          {/* ══════════ TABLEAU ARTICLES ══════════ */}
          <div style={{ padding: '24px 40px 0' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Détail facture :
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#0f172a' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#94a3b8', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid #1e293b' }}>
                    Désignation
                  </th>
                  <th style={{ textAlign: 'center', padding: '10px 10px', color: '#94a3b8', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid #1e293b', width: '60px' }}>
                    Qté
                  </th>
                  <th style={{ textAlign: 'right', padding: '10px 10px', color: '#94a3b8', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid #1e293b', width: '90px' }}>
                    P.U. HT
                  </th>
                  {hasDiscount && (
                    <th style={{ textAlign: 'center', padding: '10px 8px', color: '#94a3b8', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid #1e293b', width: '60px' }}>
                      Remise
                    </th>
                  )}
                  <th style={{ textAlign: 'center', padding: '10px 8px', color: '#94a3b8', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid #1e293b', width: '55px' }}>
                    TVA
                  </th>
                  <th style={{ textAlign: 'right', padding: '10px 10px', color: '#94a3b8', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid #1e293b', width: '90px' }}>
                    Total HT
                  </th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: '#94a3b8', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid #1e293b', width: '100px' }}>
                    Total TTC
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => {
                  const totalTTC = item.total * (1 + item.vat_rate / 100)
                  const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                  return (
                    <tr key={idx} style={{ background: rowBg }}>
                      <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', color: '#111827', fontWeight: 600, verticalAlign: 'top' }}>
                        {item.description}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#374151' }}>
                        {item.quantity}{item.unit && <span style={{ color: '#9ca3af', fontSize: '10px' }}> {item.unit}</span>}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'right', color: '#374151' }}>
                        {formatCurrency(item.unit_price)}
                      </td>
                      {hasDiscount && (
                        <td style={{ padding: '10px 8px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#6b7280' }}>
                          {item.discount_percent > 0 ? `${item.discount_percent}%` : '—'}
                        </td>
                      )}
                      <td style={{ padding: '10px 8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <span style={{ color: '#4338ca', fontWeight: 700, fontSize: '11px' }}>{item.vat_rate}%</span>
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'right', color: '#374151', fontWeight: 600 }}>
                        {formatCurrency(item.total)}
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', textAlign: 'right', color: '#111827', fontWeight: 700 }}>
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
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Détail TVA :
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: '7px 10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700, color: '#475569', fontSize: '10px' }}>Taux TVA</th>
                    <th style={{ padding: '7px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '10px' }}>Montant HT</th>
                    <th style={{ padding: '7px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '10px' }}>Montant TVA</th>
                    <th style={{ padding: '7px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '10px' }}>Montant TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(taxByRate).map(([rate, vals]) => (
                    <tr key={rate} style={{ background: 'white' }}>
                      <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#4338ca', fontWeight: 700 }}>{rate} %</td>
                      <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'right', color: '#374151' }}>{formatCurrency(vals.ht)}</td>
                      <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'right', color: '#374151' }}>{formatCurrency(vals.tva)}</td>
                      <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'right', color: '#111827', fontWeight: 700 }}>{formatCurrency(vals.ttc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Montant de la facture :
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#6b7280' }}>Total montant HT</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                  {invoice.discount_amount > 0 && (
                    <tr>
                      <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#6b7280' }}>
                        Remise{(invoice as any).discount_percent > 0 ? ` (${(invoice as any).discount_percent}%)` : ''}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>− {formatCurrency(invoice.discount_amount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#6b7280' }}>Total montant TVA</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{formatCurrency(invoice.tax_amount)}</td>
                  </tr>
                  <tr style={{ background: isPaid ? '#16a34a' : '#0f172a' }}>
                    <td style={{ padding: '12px 12px', border: '1px solid #0f172a', color: 'white', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isPaid ? '✓ Facture payée' : 'Total TTC'}
                    </td>
                    <td style={{ padding: '12px 12px', border: '1px solid #0f172a', textAlign: 'right', color: 'white', fontWeight: 900, fontSize: '20px' }}>
                      {formatCurrency(invoice.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ══════════ PAIEMENT & NOTES ══════════ */}
          {(profile?.bank_iban || invoice.payment_terms || invoice.notes) && (
            <div style={{ display: 'grid', gridTemplateColumns: profile?.bank_iban || invoice.payment_terms ? '1fr 1fr' : '1fr', gap: '0', borderTop: '1px solid #e2e8f0', margin: '0 40px 24px' }}>
              {(profile?.bank_iban || invoice.payment_terms) && (
                <div style={{ padding: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', marginRight: invoice.notes ? '12px' : 0 }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Détail paiement :</div>
                  {invoice.payment_terms && <div style={{ fontSize: '11px', color: '#374151', marginBottom: '6px', fontStyle: 'italic' }}>{invoice.payment_terms}</div>}
                  {profile?.bank_name && <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{profile.bank_name}</div>}
                  {profile?.bank_iban && <div style={{ fontSize: '11px', color: '#374151', fontFamily: 'monospace', marginTop: '4px' }}>IBAN : {profile.bank_iban}</div>}
                  {profile?.bank_bic && <div style={{ fontSize: '11px', color: '#374151', fontFamily: 'monospace' }}>BIC : {profile.bank_bic}</div>}
                </div>
              )}
              {invoice.notes && (
                <div style={{ padding: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Notes :</div>
                  <div style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{invoice.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Mentions légales */}
          <div style={{ padding: '0 40px 20px' }}>
            <div style={{ fontSize: '9px', color: '#9ca3af', lineHeight: '1.6', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              Paiement comptant, pas d'escompte pour règlement anticipé. En cas de retard de paiement, des pénalités de retard au taux légal majoré de 5 points seront appliquées de plein droit, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement (art. L441-10 du Code de commerce).
            </div>
          </div>

          {/* ══════════ FOOTER ══════════ */}
          <div style={{ background: '#0f172a', padding: '14px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>{profile?.company_name || 'Mon Entreprise'}</span>
              {profile?.footer_text && (
                <span style={{ color: '#475569', fontSize: '10px', flex: 1, textAlign: 'center' }}>{profile.footer_text}</span>
              )}
              <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#334155' }}>
                {profile?.siret && <span>SIRET : {profile.siret}</span>}
                {profile?.vat_number && <span>TVA : {profile.vat_number}</span>}
              </div>
            </div>
          </div>

        </div>

        {/* ACTIONS BAS */}
        <div className="no-print max-w-[210mm] mx-auto mt-4 flex flex-wrap gap-3">
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
