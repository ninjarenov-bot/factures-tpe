import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getStripe } from '@/lib/stripe-server'

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const cookieStore = await cookies()

    // Authentification via Supabase SSR
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { priceId } = await req.json()
    if (!priceId || priceId.startsWith('price_REMPLACE')) {
      return NextResponse.json({ error: 'Stripe non configuré. Ajoutez les IDs de prix dans .env.local' }, { status: 400 })
    }

    // Récupérer le profil pour le stripe_customer_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, company_name')
      .eq('id', user.id)
      .single()

    // Créer ou réutiliser le customer Stripe
    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email || '',
        name: profile?.company_name || undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    // Créer la session Checkout Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/abonnement?success=true`,
      cancel_url: `${appUrl}/abonnement?cancelled=true`,
      locale: 'fr',
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[Stripe checkout error]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
