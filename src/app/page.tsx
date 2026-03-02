'use client'

import Link from 'next/link'
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
    text: 'Je passais 2h par semaine sur ma facturation. Avec FacturePro, c\'est 15 minutes. Et mes clients reçoivent des factures professionnelles.',
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <DocumentCurrencyEuroIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">FacturePro</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Tarifs</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Avis</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:block">
              Connexion
            </Link>
            <Link href="/auth" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
              Commencer <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10 -translate-x-1/3 translate-y-1/3" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 rounded-full text-indigo-700 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Conforme à la réglementation française 2025
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Fini la paperasse,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              place aux chantiers
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            FacturePro est la solution de facturation la plus simple pour les artisans et TPE. Créez des devis et factures professionnels en moins de 2 minutes — depuis votre téléphone ou votre ordinateur.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 text-base">
              Essayer gratuitement
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <a href="#features" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 border border-gray-200 transition-all text-base">
              Voir les fonctionnalités
            </a>
          </div>

          <p className="text-sm text-gray-400 mt-5">Gratuit pour commencer · Sans carte bancaire · Résiliable à tout moment</p>

          {/* Fake stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { val: '2 min', label: 'pour créer une facture' },
              { val: '+1 200', label: 'artisans utilisateurs' },
              { val: '100%', label: 'conforme loi française' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700">{s.val}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Conçu pour les artisans et petits entrepreneurs qui veulent gagner du temps sans se prendre la tête.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-lg hover:shadow-gray-100 transition-all group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Comment ça marche ?</h2>
            <p className="text-lg text-gray-500">Simple comme bonjour.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Créez votre compte', desc: 'Inscription en 30 secondes. Renseignez vos informations d\'entreprise une seule fois.' },
              { num: '2', title: 'Ajoutez vos clients', desc: 'Importez ou créez vos clients facilement. Retrouvez-les ensuite en un clic.' },
              { num: '3', title: 'Facturez en 2 min', desc: 'Créez votre facture, envoyez-la par email, et suivez le paiement depuis votre tableau de bord.' },
            ].map(step => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-extrabold text-white mb-4 shadow-lg shadow-indigo-200">
                  {step.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-gray-500">Des artisans comme vous, satisfaits au quotidien.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-amber-400 fill-amber-400" style={{ fill: '#FBBF24' }} />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
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
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Des tarifs transparents</h2>
            <p className="text-lg text-gray-500">Commencez gratuitement, passez Pro quand vous êtes prêt.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">
            {plans.map(plan => (
              <div key={plan.name} className={`relative bg-white rounded-2xl border-2 ${plan.color} p-6 flex flex-col ${plan.primary ? 'shadow-xl shadow-indigo-100' : ''}`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">{plan.badge}</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
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

      {/* CTA FINAL */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-indigo-200">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Prêt à gagner du temps ?
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez plus de 1 200 artisans qui gèrent leur facturation sans stress. Inscription gratuite, sans carte bancaire.
          </p>
          <Link href="/auth" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-colors text-base shadow-lg">
            Créer mon compte gratuit
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <DocumentCurrencyEuroIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">FacturePro</span>
          </div>
          <p className="text-sm text-gray-400">© 2025 FacturePro — Solution de facturation pour artisans et TPE</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/auth" className="hover:text-gray-900">Connexion</Link>
            <span>·</span>
            <Link href="/auth" className="hover:text-gray-900">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
