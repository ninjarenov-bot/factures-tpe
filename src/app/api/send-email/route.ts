import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  // Vérifier que l'utilisateur est connecté
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Récupérer les données de l'email
  const { to, cc, subject, message } = await req.json()
  if (!to || !subject || !message) {
    return NextResponse.json({ error: 'Champs manquants (to, subject, message)' }, { status: 400 })
  }

  // Initialiser Resend
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Construire le corps HTML
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
      ${message.split('\n').map((line: string) =>
        line.trim() === ''
          ? '<br/>'
          : `<p style="margin: 0 0 8px 0;">${line}</p>`
      ).join('')}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">
        Cet email a été envoyé via <strong>Factures TPE</strong>
      </p>
    </div>
  `

  const { data, error } = await resend.emails.send({
    from: 'Factures TPE <noreply@factures-tpe.fr>',
    to: [to],
    cc: cc ? [cc] : [],
    subject,
    html: htmlBody,
    text: message,
  })

  if (error) {
    console.error('[send-email] Erreur Resend:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data?.id })
}
