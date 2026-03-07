import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/invoices',
          '/quotes',
          '/clients',
          '/products',
          '/settings',
          '/abonnement',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://factures-tpe.fr/sitemap.xml',
    host: 'https://factures-tpe.fr',
  }
}
