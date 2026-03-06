import { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts } from '@/data/blog'
import { DocumentCurrencyEuroIcon, ClockIcon } from '@heroicons/react/24/outline'
import { ArrowRightIcon } from '@heroicons/react/24/solid'

export const metadata: Metadata = {
  title: 'Blog — Conseils facturation pour artisans | Factures TPE',
  description: 'Conseils pratiques sur la facturation, la TVA, les mentions légales et la gestion pour artisans et TPE françaises. Guides gratuits.',
  alternates: { canonical: 'https://factures-tpe.fr/blog' },
}

const categoryColors: Record<string, string> = {
  Juridique: 'bg-blue-100 text-blue-700',
  Fiscalité: 'bg-green-100 text-green-700',
  Gestion: 'bg-amber-100 text-amber-700',
  Commercial: 'bg-purple-100 text-purple-700',
  'Auto-entrepreneur': 'bg-indigo-100 text-indigo-700',
}

export default function BlogPage() {
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
      <section className="bg-indigo-50 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mb-5">
            📚 Ressources gratuites
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Le blog des artisans et TPE
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conseils pratiques sur la facturation, la TVA, les mentions légales et la gestion pour développer votre activité.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {blogPosts.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 text-center text-4xl">
                  {post.emoji}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <ClockIcon className="w-3 h-3" />
                      {post.readTime} min
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 flex-1 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-1 mt-4 text-sm font-semibold text-indigo-600">
                    Lire l&apos;article <ArrowRightIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-indigo-600">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Prêt à simplifier votre facturation ?
          </h2>
          <p className="text-indigo-200 mb-8">Factures TPE gère tout automatiquement pour vous</p>
          <Link href="/auth" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-base">
            Commencer gratuitement <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <Link href="/" className="font-semibold text-gray-700">Factures TPE</Link>
          <div className="flex gap-6">
            <Link href="/facturation/plombier" className="hover:text-gray-700">Plombiers</Link>
            <Link href="/facturation/electricien" className="hover:text-gray-700">Électriciens</Link>
            <Link href="/#pricing" className="hover:text-gray-700">Tarifs</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
