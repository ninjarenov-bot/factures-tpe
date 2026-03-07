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
  const [pdfBase64, setPdfBase64] = useState<string | undefined>()
  const [generatingPdf, setGeneratingPdf] = useState(false)

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

  // Convertit une URL externe en data URL (évite tous les problèmes CORS avec html2canvas)
  async function urlToDataUrl(url: string): Promise<string | null> {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return null
      const blob = await res.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  async function handleSendEmail() {
    setGeneratingPdf(true)
    let generatedPdf: string | undefined
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const element = document.getElementById('invoice-doc')
      if (!element) throw new Error('Élément invoice-doc introuvable')

      // ► Étape 1 : Convertir toutes les images externes en data URL
      //   → html2canvas n'a plus besoin de CORS, aucun risque de canvas taché
      const imgs = Array.from(element.querySelectorAll('img')) as HTMLImageElement[]
      const restored: Array<{ img: HTMLImageElement; src: string }> = []

      await Promise.allSettled(imgs.map(async (img) => {
        const src = img.getAttribute('src') || ''
        if (!src || src.startsWith('data:') || src.startsWith('blob:')) return
        const dataUrl = await urlToDataUrl(src)
        if (dataUrl) {
          restored.push({ img, src })
          img.src = dataUrl
        }
      }))

      // Laisser le DOM se mettre à jour
      await new Promise(r => setTimeout(r, 150))

      // ► Étape 2 : Capture du DOM → canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: false,    // inutile : toutes les images sont en data URL
        allowTaint: true,  // sans danger car plus d'URL externe
        logging: false,
        backgroundColor: '#ffffff',
      })

      // ► Étape 3 : Restaurer les src d'origine
      restored.forEach(({ img, src }) => { img.src = src })

      // ► Étape 4 : Générer le PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.85)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * pageW) / canvas.width

      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, imgH)
      let heightLeft = imgH - pageH
      while (heightLeft > 0) {
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, -(imgH - heightLeft), pageW, imgH)
        heightLeft -= pageH
      }
      const dataUri = pdf.output('datauristring')
      generatedPdf = dataUri.split(',')[1]
      setPdfBase64(generatedPdf)

    } catch (e) {
      console.error('PDF generation error:', e)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    }
    setGeneratingPdf(false)
    setShowEmail(true)
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
              <button onClick={handleSendEmail} disabled={generatingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium disabled:opacity-60">
                {generatingPdf ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><span className="hidden sm:inline">Préparation...</span></>
                ) : (
                  <><EnvelopeIcon className="w-4 h-4" /><span className="hidden sm:inline">Envoyer</span></>
                )}
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

      <main className="flex-1 p-4 sm:p-10 bg-gray-100">
        <div id="invoice-doc" className="bg-white max-w-[210mm] mx-auto shadow-xl relative overflow-hidden"
          style={{ fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: '13px', lineHeight: '1.5', border: '1px solid #e5e7eb' }}>

          {/* WATERMARK */}
          {isPaid && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none"
              style={{ opacity: 0.04 }}>
              <span style={{ fontSize: '140px', fontWeight: 900, color: '#16a34a', transform: 'rotate(-30deg)', letterSpacing: '0.1em' }}>PAYÉE</span>
            </div>
          )}

          {/* ══ BARRE INDIGO TOP ══ */}
          <div style={{ height: '5px', background: '#4f46e5' }} />

          {/* ══════════ HEADER CLAIR ══════════ */}
          <div style={{ padding: '28px 40px 24px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '32px' }}>

              {/* Logo + Société */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Logo"
                    style={{ width: '52px', height: '52px', objectFit: 'contain', border: '1px solid #e5e7eb' }} />
                ) : (
                  <div style={{ width: '52px', height: '52px', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '4px' }}>
                    <span style={{ color: 'white', fontWeight: 900, fontSize: '22px' }}>
                      {(profile?.company_name || 'M').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{profile?.company_name || 'Mon Entreprise'}</div>
                  {profile?.address && <div style={{ color: '#111827', fontSize: '11px' }}>{profile.address}</div>}
                  {(profile?.postal_code || profile?.city) && (
                    <div style={{ color: '#111827', fontSize: '11px' }}>{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</div>
                  )}
                  {profile?.phone && <div style={{ color: '#111827', fontSize: '11px', marginTop: '2px' }}>{profile.phone}</div>}
                  {profile?.email && <div style={{ color: '#111827', fontSize: '11px' }}>{profile.email}</div>}
                  {profile?.siret && <div style={{ color: '#111827', fontSize: '10px', marginTop: '4px' }}>SIRET : {profile.siret}</div>}
                  {profile?.vat_number && <div style={{ color: '#111827', fontSize: '10px' }}>N° TVA : {profile.vat_number}</div>}
                </div>
              </div>

              {/* Numéro + Dates */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: '#4f46e5', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>FACTURE</div>
                <div style={{ color: '#111827', fontWeight: 900, fontSize: '32px', lineHeight: 1.1, marginTop: '4px', letterSpacing: '-1px' }}>{invoice.number}</div>
                <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
                  {[
                    { label: 'Date de facture', value: formatDate(invoice.issue_date) },
                    invoice.due_date ? { label: 'Date de paiement', value: formatDate(invoice.due_date), warn: invoice.status === 'overdue' } : null,
                    (invoice as any).paid_at ? { label: 'Payée le', value: formatDate((invoice as any).paid_at) } : null,
                  ].filter(Boolean).map((row: any, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '3px' }}>
                      <span style={{ color: '#111827', fontSize: '11px' }}>{row.label}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: row.warn ? '#dc2626' : '#111827', minWidth: '80px', textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ ADRESSES ══════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #e5e7eb' }}>
            {/* Vendeur */}
            <div style={{ padding: '18px 24px 18px 40px', borderRight: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#111827', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Vendeur :</div>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: '13px' }}>{profile?.company_name || 'Mon Entreprise'}</div>
              {profile?.address && <div style={{ color: '#111827', fontSize: '12px', marginTop: '2px' }}>{profile.address}</div>}
              {(profile?.postal_code || profile?.city) && <div style={{ color: '#111827', fontSize: '12px' }}>{[profile?.postal_code, profile?.city].filter(Boolean).join(' ')}</div>}
              {profile?.email && <div style={{ color: '#111827', fontSize: '12px', marginTop: '3px' }}>{profile.email}</div>}
              {profile?.phone && <div style={{ color: '#111827', fontSize: '12px' }}>{profile.phone}</div>}
            </div>
            {/* Client */}
            <div style={{ padding: '18px 40px 18px 24px', borderLeft: '3px solid #4f46e5' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#4f46e5', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Client :</div>
              {client ? (
                <>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '13px' }}>{getClientName(client)}</div>
                  {client.address && <div style={{ color: '#111827', fontSize: '12px', marginTop: '2px' }}>{client.address}</div>}
                  {(client.postal_code || client.city) && <div style={{ color: '#111827', fontSize: '12px' }}>{[client.postal_code, client.city].filter(Boolean).join(' ')}</div>}
                  {client.email && <div style={{ color: '#111827', fontSize: '12px', marginTop: '3px' }}>{client.email}</div>}
                  {client.phone && <div style={{ color: '#111827', fontSize: '12px' }}>{client.phone}</div>}
                  {client.siret && <div style={{ color: '#111827', fontSize: '11px', marginTop: '3px' }}>SIRET : {client.siret}</div>}
                </>
              ) : (
                <div style={{ color: '#6b7280', fontSize: '12px', fontStyle: 'italic' }}>Aucun client sélectionné</div>
              )}
            </div>
          </div>

          {/* Objet */}
          {invoice.subject && (
            <div style={{ padding: '9px 40px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Objet : </span>
              <span style={{ fontSize: '13px', color: '#111827' }}>{invoice.subject}</span>
            </div>
          )}

          {/* ══════════ TABLEAU ARTICLES ══════════ */}
          <div style={{ padding: '20px 40px 0' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#111827', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Détail facture :
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ textAlign: 'left', padding: '9px 12px', color: '#111827', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '2px solid #d1d5db' }}>
                    Désignation
                  </th>
                  <th style={{ textAlign: 'center', padding: '9px 10px', color: '#111827', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '60px' }}>
                    Qté
                  </th>
                  <th style={{ textAlign: 'right', padding: '9px 10px', color: '#111827', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '90px' }}>
                    P.U. HT
                  </th>
                  {hasDiscount && (
                    <th style={{ textAlign: 'center', padding: '9px 8px', color: '#111827', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '60px' }}>
                      Remise
                    </th>
                  )}
                  <th style={{ textAlign: 'center', padding: '9px 8px', color: '#111827', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '55px' }}>
                    TVA
                  </th>
                  <th style={{ textAlign: 'right', padding: '9px 10px', color: '#111827', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '90px' }}>
                    Total HT
                  </th>
                  <th style={{ textAlign: 'right', padding: '9px 12px', color: '#111827', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #d1d5db', width: '100px' }}>
                    Total TTC
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => {
                  const totalTTC = item.total * (1 + item.vat_rate / 100)
                  return (
                    <tr key={idx} style={{ background: 'white' }}>
                      <td style={{ padding: '9px 12px', borderBottom: '1px solid #e5e7eb', color: '#111827', fontWeight: 600, verticalAlign: 'top' }}>
                        {item.description}
                      </td>
                      <td style={{ padding: '9px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', color: '#111827' }}>
                        {item.quantity}{item.unit && <span style={{ color: '#111827', fontSize: '10px' }}> {item.unit}</span>}
                      </td>
                      <td style={{ padding: '9px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827' }}>
                        {formatCurrency(item.unit_price)}
                      </td>
                      {hasDiscount && (
                        <td style={{ padding: '9px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', color: '#111827' }}>
                          {item.discount_percent > 0 ? `${item.discount_percent}%` : '—'}
                        </td>
                      )}
                      <td style={{ padding: '9px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <span style={{ color: '#4f46e5', fontWeight: 700, fontSize: '11px' }}>{item.vat_rate}%</span>
                      </td>
                      <td style={{ padding: '9px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827', fontWeight: 600 }}>
                        {formatCurrency(item.total)}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827', fontWeight: 700 }}>
                        {formatCurrency(totalTTC)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ══════════ DETAIL TVA + TOTAUX ══════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '18px 40px 22px', alignItems: 'start' }}>

            {/* Tableau TVA */}
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#111827', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Détail TVA :
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '7px 10px', borderBottom: '2px solid #d1d5db', textAlign: 'center', fontWeight: 700, color: '#111827', fontSize: '10px' }}>Taux</th>
                    <th style={{ padding: '7px 10px', borderBottom: '2px solid #d1d5db', textAlign: 'right', fontWeight: 700, color: '#111827', fontSize: '10px' }}>HT</th>
                    <th style={{ padding: '7px 10px', borderBottom: '2px solid #d1d5db', textAlign: 'right', fontWeight: 700, color: '#111827', fontSize: '10px' }}>TVA</th>
                    <th style={{ padding: '7px 10px', borderBottom: '2px solid #d1d5db', textAlign: 'right', fontWeight: 700, color: '#111827', fontSize: '10px' }}>TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(taxByRate).map(([rate, vals]) => (
                    <tr key={rate}>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', color: '#4f46e5', fontWeight: 700 }}>{rate} %</td>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827' }}>{formatCurrency(vals.ht)}</td>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827' }}>{formatCurrency(vals.tva)}</td>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827', fontWeight: 700 }}>{formatCurrency(vals.ttc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#111827', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Montant de la facture :
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '7px 12px', borderBottom: '1px solid #e5e7eb', color: '#111827' }}>Total montant HT</td>
                    <td style={{ padding: '7px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                  {invoice.discount_amount > 0 && (
                    <tr>
                      <td style={{ padding: '7px 12px', borderBottom: '1px solid #e5e7eb', color: '#111827' }}>
                        Remise{(invoice as any).discount_percent > 0 ? ` (${(invoice as any).discount_percent}%)` : ''}
                      </td>
                      <td style={{ padding: '7px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>− {formatCurrency(invoice.discount_amount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '7px 12px', borderBottom: '1px solid #e5e7eb', color: '#111827' }}>Total montant TVA</td>
                    <td style={{ padding: '7px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{formatCurrency(invoice.tax_amount)}</td>
                  </tr>
                  <tr style={{ background: isPaid ? '#f0fdf4' : '#f3f4f6' }}>
                    <td style={{ padding: '11px 12px', borderTop: '2px solid #d1d5db', color: '#111827', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isPaid ? '✓ Facture payée' : 'Total TTC'}
                    </td>
                    <td style={{ padding: '11px 12px', borderTop: '2px solid #d1d5db', textAlign: 'right', color: '#111827', fontWeight: 900, fontSize: '18px' }}>
                      {formatCurrency(invoice.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ══════════ PAIEMENT & NOTES ══════════ */}
          {(profile?.bank_iban || invoice.payment_terms || invoice.notes) && (
            <div style={{ display: 'grid', gridTemplateColumns: profile?.bank_iban || invoice.payment_terms ? '1fr 1fr' : '1fr', gap: '12px', borderTop: '1px solid #e5e7eb', margin: '0 40px 20px', paddingTop: '16px' }}>
              {(profile?.bank_iban || invoice.payment_terms) && (
                <div style={{ padding: '14px', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#111827', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Règlement :</div>
                  {invoice.payment_terms && <div style={{ fontSize: '11px', color: '#111827', marginBottom: '5px', fontStyle: 'italic' }}>{invoice.payment_terms}</div>}
                  {profile?.bank_name && <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{profile.bank_name}</div>}
                  {profile?.bank_iban && <div style={{ fontSize: '11px', color: '#111827', fontFamily: 'monospace', marginTop: '3px' }}>IBAN : {profile.bank_iban}</div>}
                  {profile?.bank_bic && <div style={{ fontSize: '11px', color: '#111827', fontFamily: 'monospace' }}>BIC : {profile.bank_bic}</div>}
                </div>
              )}
              {invoice.notes && (
                <div style={{ padding: '14px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#111827', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Notes :</div>
                  <div style={{ fontSize: '11px', color: '#111827', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{invoice.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Mentions légales */}
          <div style={{ padding: '0 40px 18px' }}>
            <div style={{ fontSize: '9px', color: '#111827', lineHeight: '1.6', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
              Paiement comptant, pas d&apos;escompte pour règlement anticipé. En cas de retard de paiement, des pénalités de retard au taux légal majoré de 5 points seront appliquées de plein droit, ainsi qu&apos;une indemnité forfaitaire de 40 € pour frais de recouvrement (art. L441-10 du Code de commerce).
            </div>
          </div>

          {/* ══════════ FOOTER ══════════ */}
          <div style={{ background: '#f3f4f6', borderTop: '1px solid #e5e7eb', padding: '12px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ color: '#111827', fontSize: '11px', fontWeight: 700 }}>{profile?.company_name || 'Mon Entreprise'}</span>
              {profile?.footer_text && (
                <span style={{ color: '#111827', fontSize: '10px', flex: 1, textAlign: 'center' }}>{profile.footer_text}</span>
              )}
              <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#111827' }}>
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
        invoiceId={invoice.id}
        pdfBase64={pdfBase64}
        pdfFilename={`Facture-${invoice.number}.pdf`}
      />
    </div>
  )
}
