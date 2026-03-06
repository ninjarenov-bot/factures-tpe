export interface Metier {
  slug: string
  name: string
  namePlural: string
  emoji: string
  metaTitle: string
  metaDescription: string
  hero: string
  subtitle: string
  services: string[]
  benefits: string[]
  faq: { q: string; a: string }[]
  color: string
  bgColor: string
  borderColor: string
}

export const metiers: Metier[] = [
  {
    slug: 'plombier',
    name: 'Plombier',
    namePlural: 'Plombiers',
    emoji: '🔧',
    metaTitle: 'Logiciel de facturation pour plombiers — Gratuit | Factures TPE',
    metaDescription: 'Créez vos factures et devis de plomberie en 2 minutes. Conformes TVA, mentions légales incluses. Gratuit pour démarrer, sans carte bancaire.',
    hero: 'Facturation simple pour plombiers',
    subtitle: 'Créez des factures professionnelles pour vos interventions plomberie en 2 minutes. Depuis votre téléphone sur le chantier.',
    services: ['Installation sanitaire', 'Réparation de fuite', 'Remplacement chauffe-eau', 'Débouchage canalisation', 'Installation VMC', 'Raccordement gaz'],
    benefits: [
      'Facturez depuis le chantier sur mobile',
      'Devis converti en facture en 1 clic',
      'Suivi des impayés automatique',
      'Conformité TVA 10% et 20% garantie',
      'Numérotation automatique des factures',
    ],
    faq: [
      { q: 'Quelle TVA appliquer sur une facture de plomberie ?', a: 'La TVA pour les travaux de plomberie est généralement de 10% pour les travaux de rénovation dans les logements de plus de 2 ans, et de 20% pour les constructions neuves ou les locaux professionnels.' },
      { q: 'Quelles mentions légales sur une facture de plombier ?', a: 'Votre facture doit mentionner : numéro SIRET, numéro de facture, date, description des travaux, TVA applicable, montant HT et TTC, conditions de paiement et délai de règlement.' },
      { q: 'Comment relancer un client qui ne paie pas ?', a: 'Factures TPE vous permet d\'envoyer des relances automatiques par email. En cas de non-paiement, vous pouvez envoyer une mise en demeure et facturer des pénalités de retard.' },
    ],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    slug: 'electricien',
    name: 'Électricien',
    namePlural: 'Électriciens',
    emoji: '⚡',
    metaTitle: 'Logiciel de facturation pour électriciens — Gratuit | Factures TPE',
    metaDescription: 'Facturez vos interventions électriques en 2 minutes. Devis, factures conformes Qualifelec, suivi TVA. Essai gratuit sans CB.',
    hero: 'Facturation rapide pour électriciens',
    subtitle: 'Gérez devis et factures pour toutes vos interventions électriques. Conformité garantie, depuis votre smartphone.',
    services: ['Installation électrique', 'Mise aux normes NF C 15-100', 'Tableau électrique', 'Éclairage LED', 'Borne de recharge VE', 'Domotique'],
    benefits: [
      'Créez un devis en moins de 3 minutes',
      'Factures conformes aux normes RGE',
      'Gestion des acomptes et soldes',
      'TVA à taux réduit automatique',
      'Export comptable en un clic',
    ],
    faq: [
      { q: 'Puis-je facturer la TVA à 5,5% pour des travaux d\'économie d\'énergie ?', a: 'Oui, les travaux d\'installation de bornes de recharge, isolation thermique et certains équipements éligibles CEE peuvent bénéficier du taux réduit à 5,5%.' },
      { q: 'Comment indiquer ma certification RGE sur la facture ?', a: 'Vous pouvez ajouter votre numéro de certification RGE et Qualifelec dans vos informations entreprise dans Factures TPE. Elles apparaîtront automatiquement sur toutes vos factures.' },
      { q: 'Puis-je faire des factures d\'acompte ?', a: 'Oui, Factures TPE vous permet de créer des factures d\'acompte et des factures de solde automatiquement liées à votre devis initial.' },
    ],
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    slug: 'peintre',
    name: 'Peintre',
    namePlural: 'Peintres',
    emoji: '🎨',
    metaTitle: 'Logiciel de facturation pour peintres en bâtiment — Gratuit | Factures TPE',
    metaDescription: 'Créez vos devis et factures peinture en 2 minutes. TVA 10%, mentions légales, envoi par email. Gratuit pour les artisans peintres.',
    hero: 'Facturation professionnelle pour peintres',
    subtitle: 'Créez des devis et factures pour vos chantiers peinture, revêtements et décoration. Simple, rapide, conforme.',
    services: ['Peinture intérieure', 'Ravalement de façade', 'Pose de papier peint', 'Revêtements sol', 'Enduits et plâtrerie', 'Décoration intérieure'],
    benefits: [
      'Devis illustrés avec photos depuis le mobile',
      'Factures TVA 10% pré-configurée',
      'Envoi par email directement au client',
      'Suivi de tous vos chantiers en cours',
      'Relances impayés automatiques',
    ],
    faq: [
      { q: 'Quelle TVA pour des travaux de peinture ?', a: 'Le taux de TVA pour les travaux de peinture dans des logements de plus de 2 ans est de 10%. Pour les locaux professionnels ou constructions neuves, le taux est de 20%.' },
      { q: 'Comment présenter un devis peinture professionnel ?', a: 'Un bon devis peinture doit détailler : la surface à traiter (en m²), le type de peinture (marque, référence, nombre de couches), la préparation des supports, et le prix HT et TTC.' },
      { q: 'Puis-je joindre des photos à mes devis ?', a: 'Factures TPE vous permet d\'ajouter des notes et références dans vos devis. Vous pouvez envoyer vos photos par email avec le devis en pièce jointe.' },
    ],
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  {
    slug: 'macon',
    name: 'Maçon',
    namePlural: 'Maçons',
    emoji: '🧱',
    metaTitle: 'Logiciel de facturation pour maçons — Gratuit | Factures TPE',
    metaDescription: 'Facturez vos chantiers maçonnerie facilement. Devis, situations de travaux, factures de solde. Conforme TVA. Essai gratuit.',
    hero: 'Facturation adaptée aux maçons',
    subtitle: 'Gérez vos devis et factures de maçonnerie depuis le chantier. Situations de travaux, acomptes et soldes en quelques clics.',
    services: ['Gros œuvre', 'Extension maison', 'Rénovation façade', 'Dallage et terrassement', 'Construction mur', 'Réparation fissures'],
    benefits: [
      'Situations de travaux mensuelles',
      'Gestion des acomptes et retenues de garantie',
      'Factures conformes marchés publics et privés',
      'Suivi du CA chantier par chantier',
      'Compatible avec vos sous-traitants',
    ],
    faq: [
      { q: 'Comment facturer des travaux de maçonnerie en plusieurs fois ?', a: 'Factures TPE vous permet de créer des situations de travaux (factures intermédiaires) basées sur l\'avancement, puis une facture de solde finale.' },
      { q: 'Quelle TVA pour les travaux de maçonnerie ?', a: 'TVA à 10% pour les travaux de rénovation dans les logements de plus de 2 ans. TVA à 20% pour la construction neuve. TVA à 5,5% pour les travaux d\'amélioration énergétique éligibles.' },
      { q: 'Comment gérer la retenue de garantie sur mes factures ?', a: 'Vous pouvez indiquer la retenue de garantie (généralement 5%) dans le champ notes de votre facture et créer une facture de libération de retenue à la fin du chantier.' },
    ],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    slug: 'chauffagiste',
    name: 'Chauffagiste',
    namePlural: 'Chauffagistes',
    emoji: '🔥',
    metaTitle: 'Logiciel de facturation pour chauffagistes — Gratuit | Factures TPE',
    metaDescription: 'Créez vos devis et factures chauffage en 2 minutes. Pompes à chaleur, chaudières, climatisation. TVA conforme. Gratuit.',
    hero: 'Facturation simple pour chauffagistes',
    subtitle: 'Facturez vos installations et maintenances chauffage facilement. Contrats d\'entretien, dépannages, PAC, chaudières.',
    services: ['Installation PAC air/eau', 'Remplacement chaudière', 'Entretien chaudière', 'Climatisation réversible', 'Plancher chauffant', 'Radiateurs'],
    benefits: [
      'TVA 5,5% pour équipements éligibles CEE',
      'Contrats d\'entretien récurrents',
      'Factures de dépannage en urgence',
      'Certification RGE sur les factures',
      'Suivi des aides MaPrimeRénov\'',
    ],
    faq: [
      { q: 'Comment facturer une installation de pompe à chaleur ?', a: 'La TVA applicable est de 5,5% pour les PAC éligibles CEE dans des logements de plus de 2 ans. Indiquez votre numéro RGE, la référence de l\'équipement et les aides déduites (MaPrimeRénov\').' },
      { q: 'Puis-je créer des contrats d\'entretien récurrents ?', a: 'Oui, vous pouvez créer des devis de contrat d\'entretien annuel et générer les factures associées chaque année facilement depuis Factures TPE.' },
      { q: 'Comment intégrer MaPrimeRénov\' dans mes factures ?', a: 'Vous pouvez afficher le montant de l\'aide déduit sur la facture client dans la section notes ou dans une ligne dédiée, avec le montant total avant et après aide.' },
    ],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    slug: 'menuisier',
    name: 'Menuisier',
    namePlural: 'Menuisiers',
    emoji: '🪵',
    metaTitle: 'Logiciel de facturation pour menuisiers — Gratuit | Factures TPE',
    metaDescription: 'Devis et factures menuiserie en 2 minutes. Portes, fenêtres, cuisines, agencement. Conforme TVA. Essai gratuit sans CB.',
    hero: 'Facturation sur-mesure pour menuisiers',
    subtitle: 'Gérez vos devis et factures de menuiserie facilement. Fenêtres, portes, cuisines, escaliers et agencement intérieur.',
    services: ['Pose de fenêtres', 'Menuiserie sur-mesure', 'Agencement cuisine', 'Escalier bois', 'Parquet et plancher', 'Dressing et rangements'],
    benefits: [
      'Devis détaillés avec dimensions et essences',
      'Gestion des fournitures et main d\'œuvre',
      'TVA 10% automatique pour rénovation',
      'Bon de commande fournisseur intégré',
      'Suivi des livraisons et poses',
    ],
    faq: [
      { q: 'Comment détailler fournitures et main d\'œuvre sur ma facture ?', a: 'Dans Factures TPE, vous pouvez créer des lignes séparées pour les fournitures (bois, quincaillerie) et la main d\'œuvre, avec des prix unitaires différents.' },
      { q: 'Quelle TVA pour la pose de fenêtres ?', a: 'TVA à 5,5% pour les fenêtres avec isolation thermique dans des logements de plus de 2 ans (critères CEE). TVA à 10% pour la pose sans critère énergétique. TVA à 20% pour le neuf.' },
      { q: 'Puis-je gérer plusieurs chantiers en même temps ?', a: 'Oui, Factures TPE vous permet de gérer un nombre illimité de clients et de chantiers en parallèle, avec un suivi du statut pour chaque devis et facture.' },
    ],
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    slug: 'carreleur',
    name: 'Carreleur',
    namePlural: 'Carreleurs',
    emoji: '🏠',
    metaTitle: 'Logiciel de facturation pour carreleurs — Gratuit | Factures TPE',
    metaDescription: 'Factures et devis carrelage en 2 minutes. Prix au m², TVA, mentions légales. Logiciel gratuit pour artisans carreleurs.',
    hero: 'Facturation au m² pour carreleurs',
    subtitle: 'Créez des devis et factures de carrelage avec prix au m². Salle de bain, cuisine, terrasse, sol et mur.',
    services: ['Pose carrelage sol', 'Faïence salle de bain', 'Terrasse et extérieur', 'Ragréage et préparation', 'Devis en m² automatique', 'Joints et finitions'],
    benefits: [
      'Calcul automatique au m²',
      'Devis avec références carrelage',
      'TVA rénovation pré-configurée',
      'Photos de références incluses',
      'Facturation fournitures + pose séparées',
    ],
    faq: [
      { q: 'Comment facturer au m² pour du carrelage ?', a: 'Dans Factures TPE, créez une ligne avec la quantité en m² et votre prix unitaire au m². Le total se calcule automatiquement. Vous pouvez créer des lignes séparées pour la pose, les fournitures et les finitions.' },
      { q: 'Quelle TVA pour la pose de carrelage ?', a: 'TVA à 10% pour les travaux de carrelage dans des logements achevés depuis plus de 2 ans. TVA à 20% pour les logements neufs ou locaux commerciaux.' },
      { q: 'Comment gérer les travaux préparatoires (ragréage) dans ma facture ?', a: 'Créez une ligne dédiée pour chaque prestation : dépose ancien carrelage, ragréage, fourniture du carrelage, pose et joints. Factures TPE vous permet d\'avoir autant de lignes que nécessaire.' },
    ],
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    slug: 'jardinier',
    name: 'Jardinier paysagiste',
    namePlural: 'Jardiniers paysagistes',
    emoji: '🌿',
    metaTitle: 'Logiciel de facturation pour jardiniers paysagistes — Gratuit | Factures TPE',
    metaDescription: 'Devis et factures jardinage en 2 minutes. Entretien, création, taille, tonte. Conformes TVA. Gratuit pour paysagistes.',
    hero: 'Facturation simple pour jardiniers',
    subtitle: 'Gérez vos devis et factures d\'entretien et création de jardins. Contrats d\'entretien récurrents, devis d\'aménagement.',
    services: ['Tonte et entretien pelouse', 'Taille haies et arbres', 'Création jardin', 'Terrasse et allées', 'Arrosage automatique', 'Élagage et abattage'],
    benefits: [
      'Contrats d\'entretien mensuels/annuels',
      'Devis paysager avec plans',
      'Facturation horaire ou forfaitaire',
      'TVA réduite services à la personne',
      'Suivi de vos clients récurrents',
    ],
    faq: [
      { q: 'Puis-je bénéficier du taux réduit de TVA pour les services à la personne ?', a: 'Oui, si vous êtes agréé services à la personne (SAP), vos prestations d\'entretien de jardins pour les particuliers bénéficient d\'une TVA à 10%. Les créations et aménagements restent à 20%.' },
      { q: 'Comment créer des contrats d\'entretien récurrents ?', a: 'Factures TPE vous permet de créer un devis de contrat annuel et de générer des factures mensuelles ou trimestrielles associées. Idéal pour fidéliser vos clients.' },
      { q: 'Comment facturer un chantier de création paysagère ?', a: 'Pour un grand chantier, créez un devis détaillé avec toutes les prestations (terrassement, végétaux, fournitures, main d\'œuvre) puis facturez en plusieurs fois si nécessaire.' },
    ],
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
]

export function getMetier(slug: string): Metier | undefined {
  return metiers.find(m => m.slug === slug)
}
