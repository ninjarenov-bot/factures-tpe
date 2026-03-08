import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const fmtCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount ?? 0)

const fmtDate = (dateStr: string | null) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const clientName = (client: any) => {
  if (!client) return ''
  if (client.company_name) return client.company_name
  return `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email || ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Génération PDF côté serveur avec jsPDF (Node.js)
// Fiable : pas de CORS, pas de html2canvas, pas de dépendance navigateur
// ─────────────────────────────────────────────────────────────────────────────
async function generatePdfBase64(
  type: 'facture' | 'devis',
  data: any,
  prof: any,
  items: any[]
): Promise<string | null> {
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const W = 210
    const margin = 20
    const tableW = W - 2 * margin
    let y = 0

    const accent: [number, number, number] = type === 'devis' ? [124, 58, 237] : [79, 70, 229]
    const gray900: [number, number, number] = [17, 24, 39]
    const gray500: [number, number, number] = [107, 114, 128]
    const gray200: [number, number, number] = [229, 231, 235]
    const gray100: [number, number, number] = [243, 244, 246]

    const newPageIfNeeded = (needed: number) => {
      if (y + needed > 272) { doc.addPage(); y = margin }
    }

    // ── BARRE TOP ───────────────────────────────────────────
    doc.setFillColor(...accent)
    doc.rect(0, 0, W, 5, 'F')
    y = 18

    // ── SOCIÉTÉ (gauche) ─────────────────────────────────────
    const headerStartY = y
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...gray900)
    doc.text(prof?.company_name || 'Mon Entreprise', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...gray500)
    const companyLines = [
      prof?.address,
      [prof?.postal_code, prof?.city].filter(Boolean).join(' ') || null,
      prof?.phone,
      prof?.email,
      prof?.siret ? `SIRET : ${prof.siret}` : null,
      prof?.vat_number ? `N° TVA : ${prof.vat_number}` : null,
    ].filter(Boolean) as string[]
    for (const line of companyLines) { doc.text(line, margin, y); y += 4 }

    // ── DOCUMENT INFO (droite) ────────────────────────────────
    let ry = headerStartY
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...accent)
    doc.text(type === 'facture' ? 'FACTURE' : 'DEVIS', W - margin, ry, { align: 'right' })
    ry += 7
    doc.setFontSize(22)
    doc.setTextColor(...gray900)
    doc.text(data.number, W - margin, ry, { align: 'right' })
    ry += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...gray500)
    doc.text(`Date : ${fmtDate(data.issue_date)}`, W - margin, ry, { align: 'right' }); ry += 5
    if (data.due_date) { doc.text(`Échéance : ${fmtDate(data.due_date)}`, W - margin, ry, { align: 'right' }); ry += 5 }
    if (data.valid_until) { doc.text(`Valable jusqu'au : ${fmtDate(data.valid_until)}`, W - margin, ry, { align: 'right' }); ry += 5 }

    y = Math.max(y, ry) + 6

    // ── SÉPARATEUR ────────────────────────────────────────────
    doc.setDrawColor(...gray200); doc.setLineWidth(0.3)
    doc.line(margin, y, W - margin, y); y += 8

    // ── CLIENT ────────────────────────────────────────────────
    const client = data.client
    if (client) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...accent)
      doc.text('CLIENT :', margin, y); y += 5
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...gray900)
      doc.text(clientName(client), margin, y); y += 5
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...gray500)
      const cl = [
        client.address,
        [client.postal_code, client.city].filter(Boolean).join(' ') || null,
        client.email,
        client.siret ? `SIRET : ${client.siret}` : null,
      ].filter(Boolean) as string[]
      for (const l of cl) { doc.text(l, margin, y); y += 4 }
    }
    y += 4

    // ── OBJET ─────────────────────────────────────────────────
    if (data.subject) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...gray900)
      doc.text(`Objet : ${data.subject}`, margin, y); y += 8
    }

    newPageIfNeeded(25)

    // ── TABLEAU ARTICLES ──────────────────────────────────────
    const colDesc = tableW - 90, colQty = 18, colPU = 28, colTVA = 14, colTTC = 30

    // En-tête tableau
    doc.setFillColor(...gray100)
    doc.rect(margin, y, tableW, 7, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...gray900)
    let cx = margin + 3
    doc.text('Désignation', cx, y + 5); cx += colDesc
    doc.text('Qté', cx + colQty / 2, y + 5, { align: 'center' }); cx += colQty
    doc.text('P.U. HT', cx + colPU - 3, y + 5, { align: 'right' }); cx += colPU
    doc.text('TVA', cx + colTVA / 2, y + 5, { align: 'center' }); cx += colTVA
    doc.text('Total TTC', cx + colTTC - 3, y + 5, { align: 'right' })
    y += 7
    doc.setDrawColor(209, 213, 219); doc.setLineWidth(0.4)
    doc.line(margin, y, margin + tableW, y)

    // Lignes articles
    for (const item of items) {
      const totalTTC = item.total * (1 + item.vat_rate / 100)
      const descLines = doc.splitTextToSize(item.description || '', colDesc - 4) as string[]
      const rowH = Math.max(7, descLines.length * 5)
      newPageIfNeeded(rowH + 4)

      y += 2
      cx = margin + 3
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...gray900)
      doc.text(descLines, cx, y + rowH / 2); cx += colDesc

      doc.setFont('helvetica', 'normal'); doc.setTextColor(...gray500)
      doc.text(`${item.quantity}${item.unit ? ' ' + item.unit : ''}`, cx + colQty / 2, y + rowH / 2, { align: 'center' }); cx += colQty
      doc.text(fmtCurrency(item.unit_price), cx + colPU - 3, y + rowH / 2, { align: 'right' }); cx += colPU
      doc.setTextColor(...accent); doc.setFont('helvetica', 'bold')
      doc.text(`${item.vat_rate}%`, cx + colTVA / 2, y + rowH / 2, { align: 'center' }); cx += colTVA
      doc.setTextColor(...gray900)
      doc.text(fmtCurrency(totalTTC), cx + colTTC - 3, y + rowH / 2, { align: 'right' })

      y += rowH + 2
      doc.setDrawColor(...gray200); doc.setLineWidth(0.2)
      doc.line(margin, y, margin + tableW, y)
    }
    y += 8

    // ── TOTAUX ────────────────────────────────────────────────
    newPageIfNeeded(35)
    const totW = 65, totX = W - margin - totW

    const drawTotalRow = (label: string, value: string, highlight = false, red = false) => {
      if (highlight) {
        doc.setFillColor(...accent)
        doc.rect(totX - 5, y - 4, totW + 8, 10, 'F')
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(255, 255, 255)
        doc.text(label, totX, y + 3)
        doc.text(value, totX + totW, y + 3, { align: 'right' })
        y += 12
      } else {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
        doc.setTextColor(red ? 220 : 107, red ? 38 : 114, red ? 38 : 128)
        doc.text(label, totX, y)
        doc.setTextColor(red ? 220 : 17, red ? 38 : 24, red ? 38 : 39)
        doc.text(value, totX + totW, y, { align: 'right' })
        y += 6
      }
    }

    drawTotalRow('Total HT :', fmtCurrency(data.subtotal))
    drawTotalRow('TVA :', fmtCurrency(data.tax_amount))
    if (data.discount_amount > 0) drawTotalRow('Remise :', `− ${fmtCurrency(data.discount_amount)}`, false, true)
    y += 2
    drawTotalRow(type === 'facture' ? 'TOTAL À PAYER :' : 'TOTAL TTC :', fmtCurrency(data.total), true)
    y += 8

    // ── COORDONNÉES BANCAIRES ──────────────────────────────────
    if (prof?.bank_iban) {
      const bankLines = [
        prof.bank_name || null,
        `IBAN : ${prof.bank_iban}`,
        prof.bank_bic ? `BIC : ${prof.bank_bic}` : null,
      ].filter(Boolean) as string[]
      const bankH = 10 + bankLines.length * 5
      newPageIfNeeded(bankH + 4)
      doc.setFillColor(239, 246, 255)
      doc.rect(margin, y, tableW, bankH, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(29, 78, 216)
      doc.text('COORDONNÉES BANCAIRES', margin + 5, y + 6)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 64, 175)
      let ly = y + 12
      for (const l of bankLines) { doc.text(l, margin + 5, ly); ly += 5 }
      y += bankH + 6
    }

    // ── NOTES ─────────────────────────────────────────────────
    if (data.notes) {
      newPageIfNeeded(20)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...gray500)
      doc.text('Notes :', margin, y); y += 5
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...gray900)
      const noteLines = doc.splitTextToSize(data.notes, tableW) as string[]
      doc.text(noteLines, margin, y)
    }

    // ── FOOTER ────────────────────────────────────────────────
    const footerY = 287
    doc.setDrawColor(...gray200); doc.setLineWidth(0.3)
    doc.line(margin, footerY - 4, W - margin, footerY - 4)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...gray500)
    doc.text(prof?.company_name || '', margin, footerY)
    const fr = [prof?.siret ? `SIRET : ${prof.siret}` : null, prof?.vat_number ? `TVA : ${prof.vat_number}` : null].filter(Boolean).join(' — ')
    if (fr) doc.text(fr, W - margin, footerY, { align: 'right' })

    return doc.output('datauristring').split(',')[1]

  } catch (err) {
    console.error('[generatePdf] Erreur :', err)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML de la facture (pour le corps de l'email)
// ─────────────────────────────────────────────────────────────────────────────
function buildInvoiceHtml(inv: any, prof: any, items: any[]): string {
  const client = inv.client
  const isPaid = inv.status === 'paid'

  const itemsRows = items.map((item: any) => {
    const totalTTC = item.total * (1 + item.vat_rate / 100)
    return `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;font-weight:600;">${item.description}</td>
        <td align="center" style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">${item.quantity}${item.unit ? ` ${item.unit}` : ''}</td>
        <td align="right" style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">${fmtCurrency(item.unit_price)}</td>
        <td align="center" style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#4f46e5;font-weight:700;">${item.vat_rate}%</td>
        <td align="right" style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#111827;">${fmtCurrency(totalTTC)}</td>
      </tr>`
  }).join('')

  const bankHtml = prof?.bank_iban ? `
    <tr>
      <td style="padding:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
          <tr><td style="padding:16px;">
            <div style="font-size:10px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">&#x1F4B3; Coordonn&eacute;es bancaires pour le r&egrave;glement</div>
            ${prof.bank_name ? `<div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:6px;">${prof.bank_name}</div>` : ''}
            <div style="font-size:12px;color:#1e40af;font-family:monospace;letter-spacing:0.05em;">IBAN&nbsp;: ${prof.bank_iban}</div>
            ${prof.bank_bic ? `<div style="font-size:12px;color:#1e40af;font-family:monospace;">BIC&nbsp;: ${prof.bank_bic}</div>` : ''}
          </td></tr>
        </table>
      </td>
    </tr>` : ''

  const paymentTermsHtml = inv.payment_terms ? `
    <tr>
      <td style="padding-bottom:16px;font-size:12px;color:#6b7280;font-style:italic;">
        &#x1F4C5; Conditions de paiement : ${inv.payment_terms}
      </td>
    </tr>` : ''

  return `
    <tr>
      <td style="padding:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background:#4f46e5;padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:16px;font-weight:800;color:white;">${prof?.company_name || 'Mon Entreprise'}</div>
                    ${prof?.address ? `<div style="font-size:11px;color:#c7d2fe;margin-top:2px;">${prof.address}${prof.city ? `, ${prof.postal_code || ''} ${prof.city}`.trim() : ''}</div>` : ''}
                    ${prof?.siret ? `<div style="font-size:10px;color:#a5b4fc;margin-top:2px;">SIRET : ${prof.siret}</div>` : ''}
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <div style="font-size:9px;color:#c7d2fe;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;">FACTURE</div>
                    <div style="font-size:26px;font-weight:900;color:white;line-height:1.1;margin-top:2px;">${inv.number}</div>
                    <div style="font-size:11px;color:#c7d2fe;margin-top:6px;">&#x1F4C5; &Eacute;mise le ${fmtDate(inv.issue_date)}</div>
                    ${inv.due_date ? `<div style="font-size:11px;color:#fde68a;font-weight:600;margin-top:2px;">&#x26A0; &Agrave; payer avant le ${fmtDate(inv.due_date)}</div>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${client ? `
          <tr>
            <td style="background:#f9fafb;padding:14px 24px;border-bottom:1px solid #e5e7eb;">
              <div style="font-size:9px;color:#4f46e5;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">Factur&eacute; &agrave;</div>
              <div style="font-size:14px;font-weight:700;color:#111827;">${clientName(client)}</div>
              ${client.email ? `<div style="font-size:12px;color:#6b7280;margin-top:2px;">${client.email}</div>` : ''}
              ${client.address ? `<div style="font-size:12px;color:#6b7280;">${client.address}${client.city ? `, ${client.city}` : ''}</div>` : ''}
              ${client.siret ? `<div style="font-size:11px;color:#9ca3af;margin-top:2px;">SIRET : ${client.siret}</div>` : ''}
            </td>
          </tr>` : ''}
          ${inv.subject ? `
          <tr>
            <td style="background:white;padding:10px 24px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">
              <strong>Objet :</strong> ${inv.subject}
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr style="background:#f3f4f6;">
                  <th align="left" style="padding:10px 16px;font-size:10px;font-weight:700;color:#374151;border-bottom:2px solid #d1d5db;text-transform:uppercase;letter-spacing:0.05em;">D&eacute;signation</th>
                  <th align="center" style="padding:10px 8px;font-size:10px;font-weight:700;color:#374151;border-bottom:2px solid #d1d5db;width:55px;text-transform:uppercase;">Qt&eacute;</th>
                  <th align="right" style="padding:10px 8px;font-size:10px;font-weight:700;color:#374151;border-bottom:2px solid #d1d5db;width:80px;text-transform:uppercase;">P.U. HT</th>
                  <th align="center" style="padding:10px 8px;font-size:10px;font-weight:700;color:#374151;border-bottom:2px solid #d1d5db;width:45px;text-transform:uppercase;">TVA</th>
                  <th align="right" style="padding:10px 16px;font-size:10px;font-weight:700;color:#374151;border-bottom:2px solid #d1d5db;width:85px;text-transform:uppercase;">Total TTC</th>
                </tr>
                ${itemsRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:8px 24px 4px;font-size:13px;color:#374151;">Total HT</td>
                  <td align="right" style="padding:8px 24px 4px;font-size:13px;font-weight:600;color:#111827;">${fmtCurrency(inv.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 24px;font-size:13px;color:#374151;">TVA</td>
                  <td align="right" style="padding:4px 24px;font-size:13px;font-weight:600;color:#111827;">${fmtCurrency(inv.tax_amount)}</td>
                </tr>
                ${inv.discount_amount > 0 ? `
                <tr>
                  <td style="padding:4px 24px;font-size:13px;color:#dc2626;">Remise</td>
                  <td align="right" style="padding:4px 24px;font-size:13px;font-weight:600;color:#dc2626;">&minus; ${fmtCurrency(inv.discount_amount)}</td>
                </tr>` : ''}
                <tr style="background:${isPaid ? '#f0fdf4' : '#4f46e5'};">
                  <td style="padding:14px 24px;font-size:15px;font-weight:800;color:${isPaid ? '#16a34a' : 'white'};">${isPaid ? '&#x2713; Facture r&eacute;gl&eacute;e' : 'TOTAL &Agrave; PAYER'}</td>
                  <td align="right" style="padding:14px 24px;font-size:20px;font-weight:900;color:${isPaid ? '#16a34a' : 'white'};">${fmtCurrency(inv.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${paymentTermsHtml}
    ${bankHtml}
  `
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/send-email
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { to, cc, subject, message, invoiceId, quoteId } = await req.json()
  if (!to || !subject || !message) {
    return NextResponse.json({ error: 'Champs manquants (to, subject, message)' }, { status: 400 })
  }

  // Fetch profile (always needed)
  const profileRes = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const prof = profileRes.data

  // ── Facture : HTML email + PDF pièce jointe ─────────────────
  let invoiceHtml = ''
  let attachmentBase64: string | null = null
  let attachmentFilename = 'document.pdf'

  if (invoiceId) {
    const invoiceRes = await supabase
      .from('invoices')
      .select('*, client:clients(*), items:invoice_items(*)')
      .eq('id', invoiceId)
      .single()

    if (invoiceRes.data && prof) {
      const inv = invoiceRes.data as any
      const items = (inv.items || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      invoiceHtml = buildInvoiceHtml(inv, prof, items)
      attachmentFilename = `Facture-${inv.number}.pdf`
      attachmentBase64 = await generatePdfBase64('facture', inv, prof, items)
    }
  }

  // ── Devis : PDF pièce jointe ────────────────────────────────
  if (quoteId) {
    const quoteRes = await supabase
      .from('quotes')
      .select('*, client:clients(*), items:quote_items(*)')
      .eq('id', quoteId)
      .single()

    if (quoteRes.data && prof) {
      const q = quoteRes.data as any
      const items = (q.items || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      attachmentFilename = `Devis-${q.number}.pdf`
      attachmentBase64 = await generatePdfBase64('devis', q, prof, items)
    }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  // Corps HTML de l'email
  const messageHtml = message.split('\n').map((line: string) =>
    line.trim() === ''
      ? '<tr><td style="height:8px;"></td></tr>'
      : `<tr><td style="font-size:14px;color:#374151;line-height:1.6;padding-bottom:6px;">${line}</td></tr>`
  ).join('')

  const htmlBody = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
        <tr><td style="height:5px;background:#4f46e5;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr>
          <td style="padding:24px 32px 20px;border-bottom:1px solid #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#4f46e5;width:32px;height:32px;border-radius:8px;text-align:center;vertical-align:middle;">
                        <span style="color:white;font-size:18px;font-weight:900;font-family:Arial;">F</span>
                      </td>
                      <td style="padding-left:8px;font-size:15px;font-weight:700;color:#111827;">Factures TPE</td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="font-size:12px;color:#9ca3af;">Document envoy&eacute; automatiquement</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">${messageHtml}</table>
          </td>
        </tr>
        ${invoiceId ? `
        <tr>
          <td style="padding:0 32px 24px;text-align:center;">
            <a href="https://factures-tpe.fr/invoices/${invoiceId}"
               style="display:inline-block;background:#4f46e5;color:white;padding:13px 36px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;">
              🔗 Voir la facture en ligne &rarr;
            </a>
          </td>
        </tr>` : ''}
        ${invoiceHtml ? `
        <tr><td style="padding:0 32px 24px;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>
        <tr>
          <td style="padding:0 32px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">${invoiceHtml}</table>
          </td>
        </tr>` : ''}
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              Cet email a &eacute;t&eacute; envoy&eacute; via
              <a href="https://factures-tpe.fr" style="color:#4f46e5;font-weight:700;text-decoration:none;">Factures TPE</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const { data, error } = await resend.emails.send({
    from: 'Factures TPE <noreply@factures-tpe.fr>',
    to: [to],
    cc: cc ? [cc] : [],
    subject,
    html: htmlBody,
    text: message,
    attachments: attachmentBase64 ? [
      {
        filename: attachmentFilename,
        content: Buffer.from(attachmentBase64, 'base64'),
      }
    ] : [],
  })

  if (error) {
    console.error('[send-email] Erreur Resend:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data?.id })
}
