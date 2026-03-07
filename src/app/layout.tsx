import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "https://www.factures-tpe.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Factures TPE — Logiciel de facturation gratuit pour artisans et TPE",
    template: "%s | Factures TPE",
  },
  description:
    "Créez vos factures et devis professionnels en 2 minutes. Logiciel de facturation gratuit, conforme TVA, pour artisans, plombiers, électriciens, peintres, auto-entrepreneurs et TPE. Sans carte bancaire.",
  keywords: [
    "logiciel facturation artisan",
    "application facture TPE",
    "devis artisan gratuit",
    "facture plombier",
    "facture electricien",
    "facture peintre",
    "facturation auto-entrepreneur",
    "logiciel devis artisan",
    "créer facture en ligne",
    "facture conforme TVA",
    "application facturation gratuite",
    "facture TPE PME",
    "gestion facturation artisan",
    "logiciel devis facture gratuit",
    "facture artisanat",
    "logiciel facturation micro-entreprise",
    "factures TPE gratuit",
    "devis en ligne gratuit",
    "facturation bâtiment",
    "logiciel gestion artisan",
  ],
  authors: [{ name: "Factures TPE", url: siteUrl }],
  creator: "Factures TPE",
  publisher: "Factures TPE",
  category: "Business Software",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "fr-FR": siteUrl,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Factures TPE",
    title: "Factures TPE — Logiciel de facturation gratuit pour artisans",
    description:
      "Créez vos factures et devis en 2 minutes. Gratuit, conforme TVA, pour artisans et petits entrepreneurs. Sans carte bancaire.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Factures TPE - Logiciel de facturation pour artisans et TPE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Factures TPE — Logiciel de facturation gratuit pour artisans",
    description:
      "Créez vos factures et devis en 2 minutes. Gratuit, conforme TVA, pour artisans et petits entrepreneurs.",
    images: [`${siteUrl}/og-image.png`],
  },
  verification: {
    google: "wdxzst5M5i5-Xm4BwWumLJr2J-P9R9tcl5Z03RHA72A",
  },
  other: {
    "application-name": "Factures TPE",
    "msapplication-TileColor": "#4f46e5",
    "theme-color": "#4f46e5",
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
