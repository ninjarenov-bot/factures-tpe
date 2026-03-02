import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe, getSupabaseAdmin, getPlanFromPriceId } from '@/lib/stripe-server'

// Important : désactiver le body parsing automatique de Next.js
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_REMPLACE')) {
    console.warn('[Webhook] STRIPE_WEBHOOK_SECRET non configuré')
    return NextResponse.json({ error: 'Webhook non configuré' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('[Webhook signature error]', err.message)
    return NextResponse.json({ error: `Signature invalide: ${err.message}` }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  try {
    switch (event.type) {

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const priceId = sub.items.data[0]?.price.id
        const plan = getPlanFromPriceId(priceId)

        // Convertir la date d'expiration (Unix timestamp ou Date selon la version API)
        const periodEnd = typeof sub.current_period_end === 'number'
          ? new Date(sub.current_period_end * 1000).toISOString()
          : new Date((sub as any).current_period_end).toISOString()

        const { error } = await supabase
          .from('profiles')
          .update({
            stripe_subscription_id: sub.id,
            subscription_status: sub.status,
            subscription_plan: plan,
            subscription_current_period_end: periodEnd,
          })
          .eq('stripe_customer_id', sub.customer as string)

        if (error) console.error('[Webhook] Erreur mise à jour profil:', error)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const { error } = await supabase
          .from('profiles')
          .update({
            stripe_subscription_id: null,
            subscription_status: 'free',
            subscription_plan: 'free',
            subscription_current_period_end: null,
          })
          .eq('stripe_customer_id', sub.customer as string)

        if (error) console.error('[Webhook] Erreur reset abonnement:', error)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await supabase
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('stripe_customer_id', invoice.customer as string)
        break
      }

      default:
        // Event non géré, on l'ignore
        break
    }
  } catch (err) {
    console.error('[Webhook handler error]', err)
  }

  return NextResponse.json({ received: true })
}
