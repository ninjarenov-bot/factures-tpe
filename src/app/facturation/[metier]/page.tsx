import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { metiers, getMetier } from '@/data/metiers'
import {
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid'
import { DocumentCurrencyEuroIcon } from '@heroicons/react/24/outline'

export async function generateStaticParams() {
  return metiers.map(m => ({ metier: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ metier: string }> }): Promise<Metadata> {
  const { metier: slug } = await params
  const metier = getMetier(slug)
  if (!metier) return {}
  return {
    title: metier.metaTitle,
    description: metier.metaDescription,
    alternates: { canonical: `https://factures-tpe.fr/facturation/${slug}` },
    openGraph: {
      title: metier.metaTitle,
      description: metier.metaDescription,
      url: `https://factures-tpe.fr/facturation/${slug}`,
    },
  }
}

export default async function MetierPage({ params }: { params: Promise<{ metier: string }> }) {
  const { metier: slug } = await params
  const metier = getMetier(slug)
  if (!metier) notFound()

  const otherMetiers = metiers.filter(m => m.slug !== slug).slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <DocumentCurrencyEuroIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Factures TPE</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">Connexion</Link>
            <Link href="/auth" className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`${metier.bgColor} py-16 sm:py-24`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-5xl mb-4">{metier.emoji}</div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 ${metier.bgColor} ${metier.color} border ${metier.borderColor}`}>
            Pour les {metier.namePlural}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {metier.hero}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {metier.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md text-sm">
              Créer mon compte gratuit <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link href="#fonctionnalites" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
              Voir les fonctionnalités
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">Gratuit pour commencer · Sans carte bancaire</p>
        </div>
      </section>

      {/* Services couverts */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Facturez toutes vos prestations {metier.name.toLowerCase()}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {metier.services.map((service, i) => (
              <div key={i} className={`flex items-center gap-2 p-3 rounded-xl border ${metier.borderColor} ${metier.bgColor}`}>
                <CheckIcon className={`w-4 h-4 flex-shrink-0 ${metier.color}`} />
                <span className="text-sm font-medium text-gray-800">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section id="fonctionnalites" className="py-14 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
            Tout ce dont un {metier.name.toLowerCase()} a besoin
          </h2>
          <p className="text-gray-500 text-center mb-10">Simple, rapide, conforme à la réglementation française</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {metier.benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${metier.bgColor}`}>
                  <CheckIcon className={`w-4 h-4 ${metier.color}`} />
                </div>
                <p className="text-sm font-medium text-gray-800 pt-1">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avis */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center gap-1 mb-3">
            {[1,2,3,4,5].map(i => <StarIcon key={i} className="w-5 h-5 text-yellow-400" />)}
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">4,9 / 5</p>
          <p className="text-sm text-gray-500 mb-8">Basé sur les avis de +8 000 artisans et TPE</p>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              { name: `${metier.name} indépendant`, text: `Avant je passais des heures sur mes factures. Avec Factures TPE, c'est réglé en 2 minutes depuis mon téléphone sur le chantier.`, stars: 5 },
              { name: `${metier.name}, 2 salariés`, text: `La conversion devis → facture en un clic est une révolution. Je n'oublie plus aucun chantier à facturer.`, stars: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(j => <StarIcon key={j} className="w-3.5 h-3.5 text-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-700 mb-3 italic">&quot;{t.text}&quot;</p>
                <p className="text-xs font-semibold text-gray-900">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Questions fréquentes — {metier.name}
          </h2>
          <div className="space-y-4">
            {metier.faq.map((item, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-200 p-5 group">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-gray-900 text-sm">
                  {item.q}
                  <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0 ml-3 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-16 ${metier.bgColor}`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-4xl mb-4">{metier.emoji}</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Prêt à simplifier votre facturation ?
          </h2>
          <p className="text-gray-600 mb-8">Rejoignez +8 000 artisans qui font confiance à Factures TPE</p>
          <Link href="/auth" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md text-base">
            Commencer gratuitement <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <p className="text-xs text-gray-400 mt-4">Sans carte bancaire · Annulable à tout moment</p>
        </div>
      </section>

      {/* Autres métiers */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">
            Factures TPE pour d&apos;autres métiers
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherMetiers.map(m => (
              <Link
                key={m.slug}
                href={`/facturation/${m.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center"
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs font-semibold text-gray-700">{m.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <Link href="/" className="font-semibold text-gray-700">Factures TPE</Link>
          <div className="flex gap-6">
            <Link href="/blog" className="hover:text-gray-700">Blog</Link>
            <Link href="/#pricing" className="hover:text-gray-700">Tarifs</Link>
            <Link href="/contact" className="hover:text-gray-700">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
