import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts, getBlogPost } from '@/data/blog'
import { DocumentCurrencyEuroIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ArrowRightIcon } from '@heroicons/react/24/solid'

export async function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return {
    title: post.title + ' | Factures TPE',
    description: post.metaDescription,
    alternates: { canonical: `https://factures-tpe.fr/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://factures-tpe.fr/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

const categoryColors: Record<string, string> = {
  Juridique: 'bg-blue-100 text-blue-700',
  Fiscalité: 'bg-green-100 text-green-700',
  Gestion: 'bg-amber-100 text-amber-700',
  Commercial: 'bg-purple-100 text-purple-700',
  'Auto-entrepreneur': 'bg-indigo-100 text-indigo-700',
}

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">
          {line.replace('## ', '')}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-lg font-bold text-gray-800 mt-6 mb-3">
          {line.replace('### ', '')}
        </h3>
      )
    } else if (line.startsWith('> ')) {
      // Blockquote — collect consecutive lines
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].replace('> ', ''))
        i++
      }
      elements.push(
        <blockquote key={`q-${i}`} className="border-l-4 border-indigo-400 bg-indigo-50 pl-4 py-3 pr-3 my-4 rounded-r-lg text-sm text-gray-700 italic space-y-1">
          {quoteLines.map((l, j) => <p key={j}>{l}</p>)}
        </blockquote>
      )
      continue
    } else if (line.startsWith('- ')) {
      // Collect list items
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].replace('- ', ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-4 ml-2">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </li>
          ))}
        </ul>
      )
      continue
    } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
      // Numbered list
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-4 ml-2 list-decimal list-inside">
          {items.map((item, j) => (
            <li key={j} className="text-sm text-gray-700">
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </li>
          ))}
        </ol>
      )
      continue
    } else if (line.trim() !== '') {
      elements.push(
        <p key={i} className="text-gray-700 leading-relaxed my-3 text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }}
        />
      )
    }
    i++
  }

  return elements
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const relatedPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 3)

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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-8">
          <ArrowLeftIcon className="w-4 h-4" />
          Retour au blog
        </Link>

        {/* Article header */}
        <div className="text-5xl mb-6 text-center">{post.emoji}</div>
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <ClockIcon className="w-3.5 h-3.5" />
            {post.readTime} min de lecture
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        <p className="text-base text-gray-600 border-l-4 border-indigo-400 pl-4 py-2 bg-indigo-50 rounded-r-lg mb-8">
          {post.excerpt}
        </p>

        <hr className="border-gray-100 mb-8" />

        {/* Article content */}
        <article className="prose-custom">
          {renderContent(post.content)}
        </article>

        <hr className="border-gray-100 mt-12 mb-8" />

        {/* CTA inline */}
        <div className="bg-indigo-600 rounded-2xl p-6 sm:p-8 text-center my-8">
          <p className="text-white font-bold text-lg mb-2">Simplifiez votre facturation dès aujourd&apos;hui</p>
          <p className="text-indigo-200 text-sm mb-5">Factures conformes, devis professionnels, suivi des paiements — gratuit pour commencer</p>
          <Link href="/auth" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm">
            Créer mon compte gratuit <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Articles liés */}
        {relatedPosts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Articles similaires</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                  <div className="text-2xl mb-2">{p.emoji}</div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 leading-snug">{p.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-gray-50 mt-10">
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
