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
    <!-- Invoice box -->
    <tr>
      <td style="padding:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">

          <!-- Purple header -->
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

          <!-- Client info -->
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

          <!-- Subject -->
          ${inv.subject ? `
          <tr>
            <td style="background:white;padding:10px 24px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">
              <strong>Objet :</strong> ${inv.subject}
            </td>
          </tr>` : ''}

          <!-- Items table -->
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

          <!-- Totals -->
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

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { to, cc, subject, message, invoiceId, pdfBase64, pdfFilename } = await req.json()
  if (!to || !subject || !message) {
    return NextResponse.json({ error: 'Champs manquants (to, subject, message)' }, { status: 400 })
  }

  // Fetch invoice + profile if invoiceId provided
  let invoiceHtml = ''
  if (invoiceId) {
    const [invoiceRes, profileRes] = await Promise.all([
      supabase.from('invoices').select('*, client:clients(*), items:invoice_items(*)').eq('id', invoiceId).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])
    if (invoiceRes.data && profileRes.data) {
      const items = (invoiceRes.data.items || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      invoiceHtml = buildInvoiceHtml(invoiceRes.data, profileRes.data, items)
    }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  // Convert message text to HTML paragraphs
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
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- Top accent bar -->
        <tr><td style="height:5px;background:#4f46e5;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Logo/Brand header -->
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
                <td align="right" style="font-size:12px;color:#9ca3af;">
                  Document envoy&eacute; automatiquement
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Message text -->
        <tr>
          <td style="padding:28px 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${messageHtml}
            </table>
          </td>
        </tr>

        ${invoiceHtml ? `
        <!-- Separator -->
        <tr>
          <td style="padding:0 32px 24px;">
            <div style="border-top:1px solid #e5e7eb;"></div>
          </td>
        </tr>

        <!-- Invoice rendering -->
        <tr>
          <td style="padding:0 32px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${invoiceHtml}
            </table>
          </td>
        </tr>
        ` : ''}

        <!-- Footer -->
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
    attachments: pdfBase64 ? [
      {
        filename: pdfFilename || 'facture.pdf',
        content: pdfBase64,
      }
    ] : [],
  })

  if (error) {
    console.error('[send-email] Erreur Resend:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data?.id })
}
