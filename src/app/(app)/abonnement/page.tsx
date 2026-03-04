'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import {
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/utils'

// ── Plans ──────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    emoji: '🎁',
    price: 0,
    period: '',
    tagline: 'Pour démarrer',
    color: 'gray',
    priceId: null,
    features: [
      '5 factures / mois',
      '3 devis / mois',
      '10 clients max',
      'PDF standard',
      'Support par email',
    ],
    missing: [
      'Logo sur les PDF',
      'Envoi par email',
      'Catalogue produits',
      'Factures illimitées',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    emoji: '⚡',
    price: 9,
    period: '/ mois HT',
    tagline: 'Pour les artisans actifs',
    color: 'indigo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    popular: true,
    features: [
      'Factures illimitées',
      'Devis illimités',
      'Clients illimités',
      'Logo sur les PDF',
      'Envoi par email',
      'Catalogue produits',
      'Support prioritaire',
    ],
    missing: [],
  },
  {
    id: 'team',
    name: 'Équipe',
    emoji: '🏢',
    price: 19,
    period: '/ mois HT',
    tagline: 'Pour les équipes',
    color: 'violet',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM,
    features: [
      'Tout ce qui est dans Pro',
      "Jusqu'à 5 utilisateurs",
      'Rapports avancés',
      'Export comptable',
      'Accès API',
      'Support dédié',
    ],
    missing: [],
  },
]

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit',
  pro: 'Pro',
  team: 'Équipe',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  free: { label: 'Gratuit', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Actif', color: 'bg-green-100 text-green-700' },
  past_due: { label: 'Paiement en retard', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Annulé', color: 'bg-gray-100 text-gray-500' },
  trialing: { label: 'Période d\'essai', color: 'bg-blue-100 text-blue-700' },
}

// ── Component principal ────────────────────────────────────────────────────────
function AbonnementContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [error, setError] = useState('')
  const [banner, setBanner] = useState<'success' | 'cancelled' | null>(null)

  useEffect(() => {
    if (searchParams.get('success') === 'true') setBanner('success')
    else if (searchParams.get('cancelled') === 'true') setBanner('cancelled')
  }, [searchParams])

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }
    const { data } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, subscription_current_period_end, stripe_customer_id, company_name')
      .eq('id', user.id)
      .single()
    setProfile(data || { subscription_plan: 'free', subscription_status: 'free' })
    setLoading(false)
  }

  async function subscribe(priceId: string, planId: string) {
    setError('')
    setCheckingOut(planId)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const { url, error: apiErr } = await res.json()
      if (apiErr) throw new Error(apiErr)
      window.location.href = url
    } catch (err: any) {
      setError(err.message)
      setCheckingOut(null)
    }
  }

  async function openPortal() {
    setError('')
    setOpeningPortal(true)
    try {
      const res = await fetch('/api/stripe/create-portal', { method: 'POST' })
      const { url, error: apiErr } = await res.json()
      if (apiErr) throw new Error(apiErr)
      window.location.href = url
    } catch (err: any) {
      setError(err.message)
      setOpeningPortal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentPlan = profile?.subscription_plan || 'free'
  const currentStatus = profile?.subscription_status || 'free'
  const periodEnd = profile?.subscription_current_period_end
  const isStripeNotConfigured = !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === 'pk_test_REMPLACE_MOI'

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Abonnement" subtitle="Gérez votre plan et votre facturation" />

      <main className="flex-1 p-4 sm:p-6 bg-[#F8F9FC]">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Banner Stripe non configuré ── */}
          {isStripeNotConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Stripe n'est pas encore configuré</p>
                <p className="text-amber-700 text-xs mt-1">
                  Ajoutez vos clés Stripe dans <code className="bg-amber-100 px-1 rounded">.env.local</code> pour activer les paiements.
                  Consultez le guide de configuration ci-dessous.
                </p>
              </div>
            </div>
          )}

          {/* ── Banner succès ── */}
          {banner === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-800">Abonnement activé avec succès ! 🎉</p>
                <p className="text-green-700 text-sm mt-0.5">
                  Bienvenue dans le plan <strong>{PLAN_LABELS[currentPlan]}</strong>. Toutes vos fonctionnalités sont maintenant disponibles.
                </p>
              </div>
              <button onClick={() => setBanner(null)} className="text-green-500 hover:text-green-700">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ── Banner annulé ── */}
          {banner === 'cancelled' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-700">Paiement annulé</p>
                <p className="text-gray-500 text-sm mt-0.5">Votre abonnement n'a pas été modifié.</p>
              </div>
              <button onClick={() => setBanner(null)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ── Erreur ── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* ── Statut abonnement actuel ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">
                  {PLANS.find(p => p.id === currentPlan)?.emoji || '🎁'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-lg">Plan {PLAN_LABELS[currentPlan] || 'Gratuit'}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[currentStatus]?.color || STATUS_CONFIG.free.color}`}>
                      {STATUS_CONFIG[currentStatus]?.label || 'Gratuit'}
                    </span>
                  </div>
                  {periodEnd && currentPlan !== 'free' && (
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>Renouvellement le <strong className="text-gray-700">{formatDate(periodEnd)}</strong></span>
                    </div>
                  )}
                  {currentStatus === 'past_due' && (
                    <p className="text-sm text-red-600 mt-1 font-medium">⚠️ Paiement en attente — mettez à jour votre moyen de paiement</p>
                  )}
                </div>
              </div>

              {/* Bouton gérer si abonné */}
              {currentPlan !== 'free' && profile?.stripe_customer_id && (
                <button
                  onClick={openPortal}
                  disabled={openingPortal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  {openingPortal ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Ouverture...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="w-4 h-4" />
                      Gérer l'abonnement
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Plans ── */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Choisir un plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = currentPlan === plan.id
                const isUpgrade = plan.price > (PLANS.find(p => p.id === currentPlan)?.price ?? 0)
                const isDowngrade = plan.price < (PLANS.find(p => p.id === currentPlan)?.price ?? 0)

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl border-2 flex flex-col transition-all ${
                      isCurrent
                        ? 'border-indigo-500 shadow-lg shadow-indigo-100'
                        : plan.popular && !isCurrent
                        ? 'border-indigo-200 hover:border-indigo-400'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Badge populaire */}
                    {plan.popular && !isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <SparklesIcon className="w-3 h-3" />
                          Populaire
                        </span>
                      </div>
                    )}

                    {/* Badge plan actuel */}
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ✓ Plan actuel
                        </span>
                      </div>
                    )}

                    <div className="p-6 flex-1">
                      {/* En-tête */}
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{plan.emoji}</span>
                          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{plan.tagline}</p>
                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-gray-900">
                            {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                          </span>
                          {plan.period && (
                            <span className="text-sm text-gray-500">{plan.period}</span>
                          )}
                        </div>
                      </div>

                      {/* Features incluses */}
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-sm">
                            <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feat}</span>
                          </li>
                        ))}
                        {plan.missing.map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-sm">
                            <XMarkIcon className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-400 line-through">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="px-6 pb-6">
                      {isCurrent ? (
                        <div className="w-full py-2.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-xl text-center">
                          ✓ Plan actuel
                        </div>
                      ) : plan.priceId && !plan.priceId.startsWith('price_REMPLACE') ? (
                        <button
                          onClick={() => subscribe(plan.priceId!, plan.id)}
                          disabled={!!checkingOut}
                          className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-60 ${
                            isUpgrade
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {checkingOut === plan.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              Redirection...
                            </span>
                          ) : isUpgrade ? (
                            `Passer à ${plan.name} →`
                          ) : (
                            `Rétrograder vers ${plan.name}`
                          )}
                        </button>
                      ) : (
                        <div className="w-full py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-xl text-center cursor-not-allowed">
                          {plan.price === 0 ? 'Plan de base' : 'Non disponible'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Guide configuration Stripe ── */}
          {isStripeNotConfigured && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-indigo-600" />
                Guide de configuration Stripe
              </h3>
              <ol className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="font-semibold text-gray-800">Créer un compte Stripe</p>
                    <p className="text-gray-500">Rendez-vous sur <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">stripe.com</a> et créez votre compte.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="font-semibold text-gray-800">Créer vos produits</p>
                    <p className="text-gray-500">Dans le dashboard Stripe → <strong>Produits</strong> → créez "Factures TPE Pro" (9€/mois) et "Factures TPE Équipe" (19€/mois). Notez les <strong>ID de prix</strong> (format <code className="bg-gray-100 px-1 rounded">price_...</code>).</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="font-semibold text-gray-800">Récupérer vos clés API</p>
                    <p className="text-gray-500">Stripe Dashboard → <strong>Développeurs</strong> → <strong>Clés API</strong>. Copiez la clé publiable et la clé secrète.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <div>
                    <p className="font-semibold text-gray-800">Configurer <code className="bg-gray-100 px-1 rounded">.env.local</code></p>
                    <div className="mt-2 bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 whitespace-pre">
{`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_TEAM=price_...
SUPABASE_SERVICE_ROLE_KEY=...`}
                    </div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                  <div>
                    <p className="font-semibold text-gray-800">Configurer le webhook</p>
                    <p className="text-gray-500">Stripe Dashboard → Développeurs → Webhooks → Ajouter un endpoint : <code className="bg-gray-100 px-1 rounded">https://votre-domaine.com/api/stripe/webhook</code>. Événements à écouter : <code className="bg-gray-100 px-1 rounded">customer.subscription.*</code>, <code className="bg-gray-100 px-1 rounded">invoice.payment_*</code></p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">6</span>
                  <div>
                    <p className="font-semibold text-gray-800">Redémarrer le serveur</p>
                    <p className="text-gray-500">Après avoir modifié <code className="bg-gray-100 px-1 rounded">.env.local</code>, relancez <code className="bg-gray-100 px-1 rounded">npm run dev</code> pour prendre en compte les nouvelles variables.</p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* ── FAQ ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Questions fréquentes</h3>
            <div className="space-y-4 text-sm">
              {[
                {
                  q: 'Puis-je annuler à tout moment ?',
                  a: 'Oui, sans engagement. Votre accès reste actif jusqu\'à la fin de la période payée.',
                },
                {
                  q: 'Les prix sont-ils HT ou TTC ?',
                  a: 'Les prix affichés sont HT. La TVA applicable sera ajoutée lors du checkout.',
                },
                {
                  q: 'Comment changer de plan ?',
                  a: 'Cliquez sur "Gérer l\'abonnement" pour accéder au portail Stripe et changer de plan en quelques clics.',
                },
                {
                  q: 'Mes données sont-elles conservées si j\'annule ?',
                  a: 'Oui, toutes vos factures et devis restent accessibles, mais certaines fonctionnalités seront limitées.',
                },
              ].map((item, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <p className="font-semibold text-gray-800 mb-1">{item.q}</p>
                  <p className="text-gray-500">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

// ── Export avec Suspense pour useSearchParams ─────────────────────────────────
export default function AbonnementPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AbonnementContent />
    </Suspense>
  )
}
