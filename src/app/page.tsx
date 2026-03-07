'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { metiers } from '@/data/metiers'
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  DocumentCurrencyEuroIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: DocumentTextIcon,
    title: 'Factures conformes',
    desc: 'Générez des factures 100% conformes à la réglementation française (TVA, mentions légales, numérotation automatique).',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: ClipboardDocumentListIcon,
    title: 'Devis professionnels',
    desc: 'Créez des devis percutants en quelques secondes. Convertissez-les en factures d\'un seul clic.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ChartBarIcon,
    title: 'Tableau de bord',
    desc: 'Suivez votre chiffre d\'affaires, vos impayés et vos devis en cours en temps réel.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: BoltIcon,
    title: 'Rapide & simple',
    desc: 'Interface pensée pour les artisans, pas pour les comptables. Votre facture prête en moins de 2 minutes.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Données sécurisées',
    desc: 'Vos données sont hébergées en Europe et chiffrées. Seul vous y avez accès.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: DevicePhoneMobileIcon,
    title: '100% Mobile',
    desc: 'Créez une facture depuis votre chantier, sur smartphone. L\'appli s\'adapte à tous les écrans.',
    color: 'bg-rose-50 text-rose-600',
  },
]

const plans = [
  {
    name: 'Gratuit',
    price: '0€',
    period: 'pour toujours',
    desc: 'Parfait pour démarrer',
    color: 'border-gray-200',
    badge: null,
    features: ['5 factures / mois', '3 devis / mois', '10 clients', 'PDF téléchargeable', 'Support email'],
    cta: 'Commencer gratuitement',
    href: '/auth',
    primary: false,
  },
  {
    name: 'Pro',
    price: '9€',
    period: '/ mois HT',
    desc: 'Pour les artisans actifs',
    color: 'border-indigo-500',
    badge: 'Populaire',
    features: ['Factures illimitées', 'Devis illimités', 'Clients illimités', 'Envoi par email', 'Logo personnalisé', 'Relances automatiques', 'Support prioritaire'],
    cta: 'Essayer 14 jours gratuit',
    href: '/auth',
    primary: true,
  },
  {
    name: 'Équipe',
    price: '19€',
    period: '/ mois HT',
    desc: 'Plusieurs utilisateurs',
    color: 'border-gray-200',
    badge: null,
    features: ['Tout du plan Pro', 'Jusqu\'à 5 utilisateurs', 'Statistiques avancées', 'Export comptable', 'API disponible'],
    cta: 'Contacter les ventes',
    href: '/auth',
    primary: false,
  },
]

const testimonials = [
  {
    name: 'Marc Dupont',
    role: 'Plombier indépendant',
    text: 'Je passais 2h par semaine sur ma facturation. Avec Factures TPE, c\'est 15 minutes. Et mes clients reçoivent des factures professionnelles.',
    stars: 5,
  },
  {
    name: 'Sophie Martin',
    role: 'Électricienne, 3 salariés',
    text: 'La conversion devis → facture en un clic est une révolution. Je n\'oublie plus aucun chantier à facturer.',
    stars: 5,
  },
  {
    name: 'Ahmed Benali',
    role: 'Peintre décorateur',
    text: 'Interface simple, factures conformes à la loi, et je peux tout faire depuis mon téléphone. Exactement ce dont j\'avais besoin.',
    stars: 5,
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://factures-tpe.fr/#organization',
      name: 'Factures TPE',
      url: 'https://factures-tpe.fr',
      logo: {
        '@type': 'ImageObject',
        url: 'https://factures-tpe.fr/og-image.png',
      },
      description: 'Solution de facturation en ligne pour artisans et TPE françaises',
      foundingDate: '2024',
      areaServed: 'FR',
      knowsLanguage: 'fr',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://factures-tpe.fr/#website',
      url: 'https://factures-tpe.fr',
      name: 'Factures TPE',
      description: 'Logiciel de facturation gratuit pour artisans et TPE',
      publisher: {
        '@id': 'https://factures-tpe.fr/#organization',
      },
      inLanguage: 'fr-FR',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://factures-tpe.fr/#software',
      name: 'Factures TPE',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Accounting',
      operatingSystem: 'Web, iOS, Android',
      url: 'https://factures-tpe.fr',
      description: 'Logiciel de facturation et devis pour artisans, plombiers, électriciens, peintres et TPE. Conforme TVA, 100% en ligne.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Plan Gratuit',
          price: '0',
          priceCurrency: 'EUR',
          description: '5 factures et 3 devis par mois',
        },
        {
          '@type': 'Offer',
          name: 'Plan Pro',
          price: '9',
          priceCurrency: 'EUR',
          description: 'Factures et devis illimités, envoi email, logo personnalisé',
          billingDuration: 'P1M',
        },
        {
          '@type': 'Offer',
          name: "Plan Équipe",
          price: '19',
          priceCurrency: 'EUR',
          description: "Jusqu'à 5 utilisateurs, statistiques avancées, export comptable",
          billingDuration: 'P1M',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        reviewCount: '3',
        bestRating: '5',
        worstRating: '1',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://factures-tpe.fr/#website',
      url: 'https://factures-tpe.fr',
      name: 'Factures TPE',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://factures-tpe.fr/blog?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Factures TPE est-il gratuit ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Oui, Factures TPE propose un plan gratuit permettant de créer jusqu\'à 5 factures et 3 devis par mois, sans carte bancaire. Le plan Pro à 9€/mois offre des créations illimitées.',
          },
        },
        {
          '@type': 'Question',
          name: 'Les factures sont-elles conformes à la réglementation française ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Oui, toutes les factures générées par Factures TPE sont conformes à la réglementation française : mentions légales obligatoires, TVA, numérotation automatique, conformité 2025.',
          },
        },
        {
          '@type': 'Question',
          name: 'Puis-je utiliser Factures TPE sur mon smartphone ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Oui, Factures TPE est 100% responsive et fonctionne parfaitement sur smartphone (iPhone, Android), tablette et ordinateur. Créez une facture depuis votre chantier en 2 minutes.',
          },
        },
        {
          '@type': 'Question',
          name: 'Factures TPE est-il adapté aux artisans du bâtiment ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolument. Factures TPE est spécialement conçu pour les artisans : plombiers, électriciens, peintres, maçons, menuisiers, carreleurs, couvreurs et tous les corps de métier du bâtiment et de l\'artisanat.',
          },
        },
      ],
    },
  ],
}

const PROMO_CODE = 'PRINTEMPS30'
const PROMO_KEY = 'promo-printemps-2026-dismissed'

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [contactError, setContactError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    // getSession() est instantané (lit le cookie local) — évite le flash "Connexion"
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user)
      setAuthLoading(false)
    })
    // Écoute les changements d'état (connexion Google OAuth, déconnexion...)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
      setAuthLoading(false)
    })
    if (!localStorage.getItem(PROMO_KEY)) setShowBanner(true)
    return () => subscription.unsubscribe()
  }, [])

  function dismissBanner() {
    localStorage.setItem(PROMO_KEY, '1')
    setShowBanner(false)
  }

  function copyCode() {
    navigator.clipboard.writeText(PROMO_CODE).catch(() => {})
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2500)
  }

  async function submitContact(e: React.FormEvent) {
    e.preventDefault()
    setContactStatus('sending')
    setContactError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, honeypot: '' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setContactError(data.error || "Une erreur s'est produite.")
        setContactStatus('error')
      } else {
        setContactStatus('success')
        setContactForm({ name: '', email: '', subject: '', message: '' })
      }
    } catch {
      setContactError('Erreur réseau, veuillez réessayer.')
      setContactStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* PROMO BANNER */}
      {showBanner && (
        <div className="fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-2 sm:gap-3 px-10 sm:px-16 py-2.5"
          style={{ background: 'linear-gradient(90deg, #16a34a 0%, #059669 50%, #0d9488 100%)' }}>
          {/* Fleurs décoratives */}
          <span className="hidden sm:inline text-base select-none">🌸</span>
          <p className="text-white text-xs sm:text-sm font-medium text-center leading-tight">
            <span className="font-bold">Offre Printemps ·</span>{' '}
            <span className="hidden sm:inline">30 % de réduction sur le plan Pro avec le code </span>
            <span className="sm:hidden">−30 % avec </span>
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/35 active:bg-white/40 border border-white/30 px-2 py-0.5 rounded-md font-bold text-white text-xs sm:text-sm transition-all mx-0.5"
              title="Cliquer pour copier"
            >
              {PROMO_CODE}
              {codeCopied
                ? <CheckIcon className="w-3 h-3 text-white flex-shrink-0" />
                : <DocumentDuplicateIcon className="w-3 h-3 text-white/80 flex-shrink-0" />
              }
            </button>
            {codeCopied && <span className="text-green-200 text-xs ml-1 font-normal">Copié !</span>}
          </p>
          <span className="hidden sm:inline text-base select-none">🌿</span>
          <button
            onClick={dismissBanner}
            aria-label="Fermer la promotion"
            className="absolute right-3 sm:right-4 text-white/70 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* NAV */}
      <nav className={`fixed inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300 ${showBanner ? 'top-10' : 'top-0'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <DocumentCurrencyEuroIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900 whitespace-nowrap">Factures TPE</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalités</a>
            <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Tarifs</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Avis</a>
            <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {authLoading ? (
              <div className="w-24 h-9 bg-gray-100 rounded-xl animate-pulse" />
            ) : isLoggedIn ? (
              <Link href="/dashboard" className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 whitespace-nowrap">
                Mon espace <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:block">
                  Connexion
                </Link>
                <Link href="/auth" className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 whitespace-nowrap">
                  Commencer <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className={`${showBanner ? 'pt-28 sm:pt-32' : 'pt-16 sm:pt-20'} pb-12 sm:pb-16 px-4 sm:px-6 bg-white transition-all duration-300`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Colonne gauche ── */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Conforme réglementation française 2025
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
                Fini la paperasse,{' '}
                <span className="text-indigo-600">place aux chantiers</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
                Créez vos factures et devis en 2 minutes, envoyez-les par email et suivez vos paiements — depuis votre téléphone ou votre bureau.
              </p>

              {/* Étapes */}
              <ol className="space-y-4 mb-8">
                {[
                  { n: '1', t: 'Créez votre facture ou devis', d: 'En quelques clics, sans formation requise' },
                  { n: '2', t: 'Envoyez à votre client', d: 'Par email directement depuis l\'application' },
                  { n: '3', t: 'Suivez vos paiements', d: 'Tableau de bord clair, relances automatiques' },
                ].map(step => (
                  <li key={step.n} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                      {step.n}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{step.t}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                {isLoggedIn ? (
                  <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 text-sm">
                    Accéder à mon espace <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link href="/auth" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 text-sm">
                      Commencer gratuitement <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                    <a href="#pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                      Voir les tarifs
                    </a>
                  </>
                )}
              </div>
              {!isLoggedIn && (
                <p className="text-xs text-gray-400 mt-3">Gratuit pour commencer · Sans carte bancaire</p>
              )}
            </div>

            {/* ── Colonne droite : aperçu facture ── */}
            <div className="hidden lg:flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[420px]">
                {/* Ombre derrière */}
                <div className="absolute inset-0 translate-x-4 translate-y-4 bg-indigo-100 rounded-2xl" />
                {/* Document */}
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden text-[11px]">
                  {/* Barre top indigo */}
                  <div className="h-1.5 bg-indigo-600" />
                  {/* En-tête */}
                  <div className="px-6 pt-5 pb-4 flex justify-between items-start border-b border-gray-100">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center mb-2">
                        <span className="text-white font-bold text-sm">P</span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">Plomberie Martineau</p>
                      <p className="text-gray-400 text-[10px]">12 rue de la République · Lyon</p>
                      <p className="text-gray-400 text-[10px]">SIRET : 123 456 789 00012</p>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-600 text-[9px] font-bold uppercase tracking-widest">FACTURE</p>
                      <p className="font-black text-gray-900 text-xl leading-tight">FAC2026001</p>
                      <p className="text-gray-400 text-[10px] mt-1">Émise le 05/03/2026</p>
                      <p className="text-gray-400 text-[10px]">Échéance le 04/04/2026</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full">En attente</span>
                    </div>
                  </div>
                  {/* Client */}
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Facturer à</p>
                    <p className="font-semibold text-gray-900">Sophie Bernard</p>
                    <p className="text-gray-400 text-[10px]">45 avenue des Fleurs · 69003 Lyon</p>
                  </div>
                  {/* Tableau */}
                  <div className="px-6 pt-3 pb-2">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-700 rounded-l">Désignation</th>
                          <th className="text-center py-1.5 px-1 text-[9px] font-bold text-gray-700 w-8">Qté</th>
                          <th className="text-right py-1.5 px-2 text-[9px] font-bold text-gray-700 rounded-r w-20">Total HT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { d: 'Main d\'œuvre plombier', q: '3h', p: '180,00 €' },
                          { d: 'Remplacement robinet mitigeur', q: '1', p: '89,00 €' },
                          { d: 'Déplacement', q: '1', p: '25,00 €' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-1.5 px-2 text-gray-700">{row.d}</td>
                            <td className="py-1.5 px-1 text-center text-gray-500">{row.q}</td>
                            <td className="py-1.5 px-2 text-right font-medium text-gray-900">{row.p}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Totaux */}
                  <div className="px-6 pb-5">
                    <div className="flex justify-between py-1 text-gray-500">
                      <span>Total HT</span><span className="font-medium text-gray-900">294,00 €</span>
                    </div>
                    <div className="flex justify-between py-1 text-gray-500">
                      <span>TVA 20 %</span><span className="font-medium text-gray-900">58,80 €</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-indigo-600 rounded-lg mt-2">
                      <span className="font-bold text-white text-sm">Total TTC</span>
                      <span className="font-black text-white text-sm">352,80 €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
            {[
              { val: '2 min', label: 'pour créer une facture' },
              { val: '+1 200', label: 'artisans utilisateurs' },
              { val: '100%', label: 'conforme loi française' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xl sm:text-2xl font-extrabold text-indigo-600">{s.val}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
              Conçu pour les artisans et petits entrepreneurs qui veulent gagner du temps sans se prendre la tête.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map(f => (
              <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 hover:shadow-lg hover:shadow-gray-100 transition-all">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${f.color}`}>
                  <f.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 sm:mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4">Comment ça marche ?</h2>
            <p className="text-base sm:text-lg text-gray-500">Simple comme bonjour.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {[
              { num: '1', title: 'Créez votre compte', desc: 'Inscription en 30 secondes. Renseignez vos informations d\'entreprise une seule fois.' },
              { num: '2', title: 'Ajoutez vos clients', desc: 'Importez ou créez vos clients facilement. Retrouvez-les ensuite en un clic.' },
              { num: '3', title: 'Facturez en 2 min', desc: 'Créez votre facture, envoyez-la par email, et suivez le paiement depuis votre tableau de bord.' },
            ].map(step => (
              <div key={step.num} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-4 sm:gap-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white flex-shrink-0 sm:mb-4 shadow-lg shadow-indigo-200">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-base sm:text-lg text-gray-500">Des artisans comme vous, satisfaits au quotidien.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-100">
                <div className="flex gap-0.5 mb-3 sm:mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-amber-400" style={{ fill: '#FBBF24' }} />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-3 sm:mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4">Des tarifs transparents</h2>
            <p className="text-base sm:text-lg text-gray-500">Commencez gratuitement, passez Pro quand vous êtes prêt.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {plans.map(plan => (
              <div key={plan.name} className={`relative bg-white rounded-2xl border-2 ${plan.color} p-5 sm:p-6 flex flex-col ${plan.primary ? 'shadow-xl shadow-indigo-100' : ''}`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">{plan.badge}</span>
                  </div>
                )}
                <div className="mb-5 sm:mb-6">
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 sm:space-y-2.5 flex-1 mb-5 sm:mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 sm:gap-2.5 text-sm text-gray-700">
                      <CheckIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                    plan.primary
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — for SEO */}
      <section id="faq" className="py-12 sm:py-16 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 sm:mb-8 text-center">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Factures TPE est-il gratuit ?',
                a: 'Oui ! Le plan Gratuit vous permet de créer jusqu\'à 5 factures et 3 devis par mois, sans carte bancaire. Le plan Pro à 9€/mois offre des créations illimitées.',
              },
              {
                q: 'Les factures sont-elles conformes à la loi française ?',
                a: 'Absolument. Toutes nos factures respectent les obligations légales françaises : mentions obligatoires, numérotation, TVA, conformité 2025.',
              },
              {
                q: 'Puis-je utiliser l\'application sur mon téléphone ?',
                a: 'Oui, Factures TPE est 100% responsive. Créez vos factures depuis votre chantier sur iPhone ou Android, ou depuis votre ordinateur au bureau.',
              },
              {
                q: 'Pour quels métiers est-ce adapté ?',
                a: 'Plombiers, électriciens, peintres, maçons, menuisiers, carreleurs, couvreurs, jardiniers, artisans du bâtiment, auto-entrepreneurs, TPE... Tout professionnel qui facture.',
              },
            ].map(faq => (
              <details key={faq.q} className="group border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-4 sm:px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm sm:text-base select-none list-none hover:bg-gray-50 transition-colors">
                  {faq.q}
                  <span className="ml-3 text-indigo-600 group-open:rotate-45 transition-transform duration-200 flex-shrink-0 text-lg leading-none">+</span>
                </summary>
                <div className="px-4 sm:px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
              Une question ? Contactez-nous
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
              Notre équipe vous répond généralement dans les 24 heures.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">

            {/* Infos contact */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <EnvelopeIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Email</p>
                    <p className="text-sm text-gray-500 mt-0.5">bonjour@factures-tpe.fr</p>
                    <p className="text-xs text-gray-400 mt-1">Réponse sous 24h ouvrées</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Questions fréquentes</p>
                    <p className="text-sm text-gray-500 mt-0.5">Consultez notre FAQ pour les questions courantes.</p>
                    <a href="#faq" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">Voir la FAQ →</a>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <p className="font-bold text-base mb-2">Essayez gratuitement</p>
                <p className="text-indigo-100 text-sm mb-4">Créez votre compte et générez votre première facture en moins de 2 minutes. Sans carte bancaire.</p>
                <Link href="/auth" className="inline-flex items-center gap-1.5 bg-white text-indigo-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-indigo-50 transition-colors">
                  Commencer gratuitement <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-3">
              <form onSubmit={submitContact} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">

                {/* Honeypot anti-spam (invisible) */}
                <input type="text" name="website" tabIndex={-1} aria-hidden="true" className="hidden" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jean Dupont"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jean@exemple.fr"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Objet *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Question sur la facturation, problème technique..."
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Décrivez votre question ou votre besoin..."
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Feedback */}
                {contactStatus === 'success' && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                    <CheckIcon className="w-4 h-4 flex-shrink-0" />
                    Message envoyé ! Nous vous répondrons dans les 24h.
                  </div>
                )}
                {contactStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {contactError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={contactStatus === 'sending'}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {contactStatus === 'sending' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="w-4 h-4" />
                      Envoyer le message
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Vos données sont utilisées uniquement pour répondre à votre demande.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* MÉTIERS — maillage interne SEO */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
              Factures TPE pour tous les artisans
            </h2>
            <p className="text-sm text-gray-500">
              Logiciel de facturation adapté à chaque métier du bâtiment et de l&apos;artisanat
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metiers.map(m => (
              <Link
                key={m.slug}
                href={`/facturation/${m.slug}`}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50 transition-all group"
              >
                <span className="text-2xl">{m.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors leading-tight">{m.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Facturation →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-8 sm:p-10 lg:p-14 shadow-2xl shadow-indigo-200">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 sm:mb-4">
            Prêt à gagner du temps ?
          </h2>
          <p className="text-indigo-100 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Rejoignez plus de 1 200 artisans qui gèrent leur facturation sans stress. Inscription gratuite, sans carte bancaire.
          </p>
          <Link href="/auth" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-colors text-sm sm:text-base shadow-lg">
            Créer mon compte gratuit
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10 sm:py-12 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Liens SEO — métiers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10 pb-8 border-b border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Facturation par métier</p>
              <ul className="space-y-1.5">
                {metiers.slice(0, 4).map(m => (
                  <li key={m.slug}>
                    <Link href={`/facturation/${m.slug}`} className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                      {m.emoji} {m.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Autres métiers</p>
              <ul className="space-y-1.5">
                {metiers.slice(4).map(m => (
                  <li key={m.slug}>
                    <Link href={`/facturation/${m.slug}`} className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                      {m.emoji} {m.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ressources</p>
              <ul className="space-y-1.5">
                <li><Link href="/blog" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Blog & guides</Link></li>
                <li><a href="#faq" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">FAQ</a></li>
                <li><a href="#contact" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Application</p>
              <ul className="space-y-1.5">
                <li><Link href="/auth" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Connexion</Link></li>
                <li><Link href="/auth" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Inscription gratuite</Link></li>
                <li><a href="#pricing" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Tarifs</a></li>
              </ul>
            </div>
          </div>

          {/* Bas du footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <DocumentCurrencyEuroIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">Factures TPE</span>
            </div>
            <p className="text-xs text-gray-400 text-center">© 2026 Factures TPE — Solution de facturation pour artisans et TPE</p>
            <p className="text-xs text-gray-400">Données hébergées en Europe 🇪🇺</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
