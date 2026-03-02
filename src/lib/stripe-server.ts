import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

/**
 * Client Stripe côté serveur (API routes uniquement)
 */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set. Configure it in .env.local')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
  })
}

/**
 * Client Supabase avec la clé service_role (bypass RLS)
 * Utilisé uniquement dans les webhooks et routes serveur sensibles
 */
export function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Configure it in .env.local')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Mappe un price_id Stripe au nom du plan
 */
export function getPlanFromPriceId(priceId: string): 'pro' | 'team' | 'free' {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM) return 'team'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) return 'pro'
  return 'free'
}
