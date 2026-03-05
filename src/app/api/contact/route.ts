import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Route publique (pas d'auth requise) pour le formulaire de contact de la landing page
export async function POST(req: NextRequest) {
  const { name, email, subject, message, honeypot } = await req.json()

  // Anti-spam basique : honeypot field
  if (honeypot) {
    return NextResponse.json({ success: true })
  }

  // Validation des champs
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
  }

  if (message.trim().length < 10) {
    return NextResponse.json({ error: 'Votre message est trop court.' }, { status: 400 })
  }

  const contactEmail = process.env.CONTACT_EMAIL || 'bonjour@factures-tpe.fr'
  const resend = new Resend(process.env.RESEND_API_KEY)

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
      <div style="background: #0f172a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 18px;">✉️ Nouveau message de contact</h2>
        <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Factures TPE — Formulaire de contact</p>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px 32px; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 700; color: #475569; width: 30%;">Nom</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #111827;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Email</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #111827;">
              <a href="mailto:${email}" style="color: #4f46e5;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Objet</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #111827;">${subject}</td>
          </tr>
        </table>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
          <p style="font-weight: 700; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">Message</p>
          <p style="color: #374151; white-space: pre-wrap; margin: 0; line-height: 1.6; font-size: 14px;">${message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          Message reçu via le formulaire de contact de <strong>factures-tpe.fr</strong>
        </p>
      </div>
    </div>
  `

  const { error } = await resend.emails.send({
    from: 'Factures TPE <noreply@factures-tpe.fr>',
    to: [contactEmail],
    replyTo: email,
    subject: `[Contact] ${subject} — ${name}`,
    html: htmlBody,
    text: `Nouveau message de contact\n\nNom : ${name}\nEmail : ${email}\nObjet : ${subject}\n\nMessage :\n${message}`,
  })

  if (error) {
    console.error('[contact] Erreur Resend:', error)
    return NextResponse.json({ error: "Erreur lors de l'envoi. Veuillez réessayer." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
