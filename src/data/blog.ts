export interface BlogPost {
  slug: string
  title: string
  metaDescription: string
  date: string
  readTime: number
  category: string
  emoji: string
  excerpt: string
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'mentions-legales-obligatoires-facture-2025',
    title: 'Mentions légales obligatoires sur une facture en 2025',
    metaDescription: 'Quelles sont les mentions obligatoires sur une facture en 2025 ? SIRET, TVA, conditions de paiement... Tout ce que doit contenir votre facture pour être conforme.',
    date: '2025-10-15',
    readTime: 6,
    category: 'Juridique',
    emoji: '📋',
    excerpt: 'Découvrez toutes les mentions obligatoires que doit contenir votre facture en 2025 pour être conforme à la réglementation française.',
    content: `
## Pourquoi les mentions légales sont-elles obligatoires ?

En France, la facture est un document juridique encadré par le Code de commerce et le Code général des impôts. Une facture incomplète peut entraîner des sanctions fiscales, des litiges avec vos clients et des difficultés à vous faire payer.

Depuis 2024, la réglementation s'est renforcée avec la réforme de la facturation électronique. Il est donc essentiel de vérifier que vos factures contiennent toutes les mentions requises.

## Les mentions obligatoires pour tous les professionnels

### 1. Informations sur le vendeur (vous)
- **Dénomination sociale** : le nom de votre entreprise ou votre nom si vous êtes en nom propre
- **Forme juridique** : Auto-entrepreneur, EURL, SARL, SAS...
- **Adresse du siège social**
- **Numéro SIRET** : 14 chiffres obligatoires
- **Numéro de TVA intracommunautaire** : si vous êtes assujetti à la TVA (commence par FR)
- **Capital social** : obligatoire pour les sociétés (SARL, SAS...)

### 2. Informations sur l'acheteur (votre client)
- **Nom ou raison sociale** du client
- **Adresse de facturation**
- **Numéro SIRET** du client (si professionnel)

### 3. Informations sur la facture elle-même
- **Numéro de facture** : unique et séquentiel (ex: FAC2025-001)
- **Date d'émission** de la facture
- **Date de la prestation ou livraison**

### 4. Détail des prestations
- **Description précise** de chaque prestation ou bien vendu
- **Quantité** pour chaque ligne
- **Prix unitaire HT** (hors taxes)
- **Taux de TVA applicable** par ligne (0%, 5,5%, 10% ou 20%)
- **Total HT**, **montant de TVA** et **total TTC**

### 5. Conditions de paiement
- **Date d'échéance** du paiement
- **Conditions d'escompte** en cas de paiement anticipé (ou mention "Pas d'escompte")
- **Taux des pénalités de retard** (légalement : taux BCE + 10 points minimum)
- **Indemnité forfaitaire** pour frais de recouvrement : 40€ obligatoire

## Mentions spécifiques selon votre situation

### Si vous êtes auto-entrepreneur (micro-entrepreneur)
Ajoutez la mention : **"TVA non applicable, article 293 B du CGI"**

### Si vous bénéficiez d'une exonération de TVA
Indiquez la base légale de l'exonération.

### Pour les travaux de rénovation énergétique
Si vous êtes certifié RGE, indiquez votre **numéro de certification** et la **date de validité**.

### Pour les professions réglementées
- Plombiers, électriciens : numéro d'assurance décennale
- Artisans du bâtiment : mention "Artisan" ou "Maître artisan"

## Le cas particulier de la facture d'acompte

Une facture d'acompte doit mentionner :
- La référence au devis initial
- Le pourcentage ou montant de l'acompte
- La mention "Acompte sur facture n°..."

## Les sanctions en cas de facture non conforme

L'administration fiscale peut infliger une **amende de 15€ par mention manquante**, avec un minimum de 75€ et un maximum de 25% du montant de la facture.

## Comment s'assurer que vos factures sont conformes ?

Avec **Factures TPE**, toutes ces mentions sont automatiquement incluses dans vos factures. Il vous suffit de renseigner vos informations d'entreprise une seule fois dans les paramètres, et chaque facture générée sera automatiquement conforme.

Les champs obligatoires comme le numéro de SIRET, les conditions de paiement et les pénalités de retard sont pré-remplis selon la réglementation française en vigueur.
    `.trim(),
  },
  {
    slug: 'tva-artisan-auto-entrepreneur-guide-complet',
    title: 'TVA pour artisans et auto-entrepreneurs : le guide complet 2025',
    metaDescription: 'Guide complet sur la TVA pour artisans en 2025. Taux applicables (5,5%, 10%, 20%), seuils de franchise, déclaration TVA. Tout ce qu\'il faut savoir.',
    date: '2025-11-02',
    readTime: 8,
    category: 'Fiscalité',
    emoji: '💶',
    excerpt: 'Tout comprendre sur la TVA en tant qu\'artisan ou auto-entrepreneur : taux, seuils, déclarations et obligations en 2025.',
    content: `
## La TVA, comment ça marche pour un artisan ?

La TVA (Taxe sur la Valeur Ajoutée) est une taxe que vous collectez pour le compte de l'État sur vos ventes. En tant qu'artisan, vous facturez la TVA à vos clients, vous déduisez la TVA que vous avez payée sur vos achats, et vous reversez la différence au fisc.

## Les seuils de franchise en base de TVA (2025)

### Auto-entrepreneur : exonération de TVA
Si votre chiffre d'affaires ne dépasse pas ces seuils, vous n'êtes **pas assujetti à la TVA** :
- **Prestations de services** : 37 500 € HT/an
- **Ventes de marchandises** : 85 000 € HT/an

Dès que vous dépassez ces seuils, vous devenez assujetti à la TVA dès le 1er jour du mois de dépassement.

**Mention obligatoire** sur vos factures si vous êtes en franchise : *"TVA non applicable, art. 293 B du CGI"*

## Les taux de TVA pour les artisans du bâtiment

### TVA à 5,5% — Travaux d'amélioration énergétique
S'applique aux travaux éligibles au crédit d'impôt ou aux aides CEE :
- Isolation thermique (murs, toiture, plancher)
- Chaudières à haute performance énergétique
- Pompes à chaleur (certains modèles)
- Fenêtres et volets isolants
- Systèmes de régulation de chauffage

### TVA à 10% — Travaux de rénovation
S'applique aux travaux de rénovation, d'amélioration et d'entretien dans les **logements achevés depuis plus de 2 ans** :
- Travaux de plomberie, électricité, maçonnerie
- Peinture et revêtements
- Installation de cuisine équipée
- Carrelage et parquet
- Tous travaux d'entretien

⚠️ **Condition importante** : le logement doit être à usage d'habitation et achevé depuis plus de 2 ans.

### TVA à 20% — Taux normal
S'applique à :
- Construction neuve
- Locaux professionnels et commerciaux
- Ventes de matériaux seuls (sans pose)
- Logements de moins de 2 ans

## Comment appliquer le bon taux ?

### Règle pratique pour les artisans du bâtiment

1. **Le chantier est-il dans un logement ?** → Oui → Étape 2
2. **Le logement a-t-il plus de 2 ans ?** → Oui → Étape 3
3. **Les travaux sont-ils de rénovation/entretien ?** → Oui → **TVA 10%**
4. **Les travaux améliorent-ils la performance énergétique ?** → Oui → **TVA 5,5%**

### Attestation client obligatoire
Pour appliquer les taux réduits (5,5% ou 10%), votre client doit vous fournir une **attestation de taux réduit** confirmant que le logement a plus de 2 ans et qu'il s'agit de son habitation principale. Conservez ce document en cas de contrôle fiscal.

## Facturer avec plusieurs taux de TVA

Il est possible (et courant) d'avoir plusieurs taux de TVA sur une même facture. Par exemple :
- Main d'œuvre de plomberie → 10%
- Isolation des tuyaux → 5,5%
- Équipements professionnels → 20%

Dans ce cas, chaque ligne doit clairement indiquer le taux applicable.

## La déclaration de TVA

### Régime réel simplifié
- Déclaration annuelle (formulaire CA12)
- 2 acomptes provisionnels en juillet et décembre
- Adapté aux petites structures (CA < 840 000 €)

### Régime réel normal
- Déclaration mensuelle ou trimestrielle
- Paiement plus régulier mais moins de risque de décalage
- Obligatoire au-delà de 840 000 € de CA

## Les erreurs à éviter

1. **Appliquer 20% sur des travaux à 10%** : vous surfacturez votre client et lui causez un préjudice
2. **Appliquer 10% sans attestation** : en cas de contrôle, vous devrez reverser la différence
3. **Oublier de déclarer** : des pénalités de retard s'appliquent (0,2% par mois + 5% du montant)
4. **Confondre TVA collectée et TVA déductible** : tenez une comptabilité rigoureuse

## Factures TPE et la TVA

Factures TPE gère automatiquement les différents taux de TVA. Pour chaque ligne de votre devis ou facture, sélectionnez simplement le taux applicable (0%, 5,5%, 10% ou 20%). Le calcul du HT, de la TVA et du TTC se fait automatiquement.
    `.trim(),
  },
  {
    slug: 'relancer-client-facture-impayee',
    title: 'Comment relancer un client pour une facture impayée (modèles inclus)',
    metaDescription: 'Guide pratique pour relancer vos clients en cas de facture impayée. Modèles de lettres de relance, mise en demeure, recours. Protégez votre trésorerie.',
    date: '2025-11-20',
    readTime: 7,
    category: 'Gestion',
    emoji: '📬',
    excerpt: 'Facture impayée ? Découvrez comment relancer efficacement vos clients, de la relance amiable à la mise en demeure, avec des modèles prêts à utiliser.',
    content: `
## Pourquoi agir vite face aux impayés ?

Un impayé qui traîne devient de plus en plus difficile à recouvrer. Les statistiques montrent que :
- **60%** des créances sont récupérées en moins de 30 jours
- Après **90 jours**, le taux de recouvrement chute à moins de 40%
- Après **6 mois**, vous avez très peu de chances de récupérer votre argent

En tant qu'artisan ou TPE, un seul impayé important peut mettre en péril votre trésorerie. Il est donc crucial d'agir rapidement et méthodiquement.

## Les étapes de la relance

### Étape 1 : Vérification (J+1 après l'échéance)

Avant de relancer, vérifiez :
- Avez-vous bien envoyé la facture ? Avez-vous un accusé de réception ?
- La facture est-elle conforme (toutes les mentions légales) ?
- Le client a-t-il peut-être réglé et le virement est en cours ?

### Étape 2 : Première relance amiable (J+3 à J+7)

La première relance doit être légère et non agressive. Il s'agit peut-être d'un simple oubli.

**Par téléphone** (le plus efficace) :
*"Bonjour M./Mme [Nom], je me permets de vous contacter au sujet de notre facture n°[XXX] du [date] d'un montant de [X]€ qui était échue le [date]. Avez-vous pu procéder au règlement ?"*

**Par email** :
> Objet : Rappel facture n°[XXX] — [Votre entreprise]
>
> Bonjour [Prénom],
>
> Sauf erreur de ma part, notre facture n°[XXX] du [date] d'un montant de [X]€ TTC, échue le [date], ne semble pas encore avoir été réglée.
>
> Pourriez-vous me confirmer la date de règlement prévue ?
>
> Cordialement,
> [Votre nom]

### Étape 3 : Deuxième relance (J+15 à J+21)

Si la première relance est restée sans réponse, il est temps d'être plus formel.

> Objet : Deuxième rappel — Facture n°[XXX] en attente de règlement
>
> Bonjour [Prénom],
>
> Malgré notre précédent message, notre facture n°[XXX] de [X]€ TTC reste impayée à ce jour.
>
> Je vous rappelle que conformément à nos conditions générales de vente, des pénalités de retard au taux de [X]% sont applicables à compter du [date d'échéance].
>
> Je vous invite à régulariser cette situation dans les plus brefs délais. En cas de difficulté, n'hésitez pas à me contacter pour trouver une solution amiable.
>
> Cordialement,
> [Votre nom]

### Étape 4 : Mise en demeure (J+30 à J+45)

La mise en demeure est un courrier recommandé avec accusé de réception qui constitue une preuve juridique et marque le début des intérêts de retard officiels.

> **MISE EN DEMEURE DE PAYER**
>
> [Votre nom et adresse]
> [Nom et adresse du client]
>
> Lettre recommandée avec AR — Le [date]
>
> Objet : Mise en demeure de payer la somme de [X]€
>
> Monsieur/Madame,
>
> Par la présente, je vous mets en demeure de me régler, dans un délai de 8 jours à compter de la réception de ce courrier, la somme de **[X]€ TTC** correspondant à ma facture n°[XXX] du [date], dont l'échéance était fixée au [date].
>
> À défaut de règlement dans ce délai, je me verrai contraint d'engager une procédure de recouvrement judiciaire, dont les frais vous seront imputés conformément à la loi n°2012-387 du 22 mars 2012.
>
> Je vous rappelle que cette somme génère des pénalités de retard au taux de [X]% par an, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40€.
>
> Veuillez agréer, Monsieur/Madame, l'expression de mes salutations distinguées.
>
> [Signature]

## Les recours juridiques

### L'injonction de payer
Si la mise en demeure reste sans effet, vous pouvez demander une **injonction de payer** au tribunal. La procédure est simple et peu coûteuse :
- Formulaire CERFA n°12948 à déposer au greffe du tribunal
- Gratuit jusqu'à 4 000€ (tribunal d'instance), 35€ au-delà
- Décision rapide (2 à 4 semaines)

### Le référé-provision
Pour les créances certaines et non contestées, le référé-provision permet d'obtenir rapidement une ordonnance de payer.

### Les sociétés de recouvrement
Pour les créances importantes (>1 000€), vous pouvez faire appel à une société de recouvrement. Elle se rémunère sur un pourcentage de la somme récupérée (15-30%).

## Comment se protéger à l'avenir ?

1. **Exigez un acompte** de 30 à 50% à la commande
2. **Vérifiez la solvabilité** des nouveaux clients (Infogreffe pour les sociétés)
3. **Raccourcissez vos délais** de paiement (comptant ou 30 jours maximum)
4. **Faites signer vos devis** avec des CGV claires
5. **Utilisez la clause de réserve de propriété** pour les fournitures

## Factures TPE et le suivi des impayés

Avec Factures TPE, vous pouvez suivre en temps réel le statut de chaque facture. Le tableau de bord affiche automatiquement les factures en retard et vous permet d'envoyer des relances directement par email depuis l'application.
    `.trim(),
  },
  {
    slug: 'devis-professionnel-artisan-guide',
    title: 'Comment faire un devis professionnel qui convainc vos clients',
    metaDescription: 'Guide complet pour créer un devis professionnel en tant qu\'artisan. Mentions obligatoires, présentation, astuces pour avoir plus de devis signés.',
    date: '2025-12-05',
    readTime: 6,
    category: 'Commercial',
    emoji: '📝',
    excerpt: 'Apprenez à créer des devis professionnels qui inspirent confiance et maximisent vos chances de signer. Mentions légales, présentation et astuces commerciales.',
    content: `
## Un bon devis, ça fait la différence

Avant même de commencer les travaux, votre devis est la première image professionnelle que vous donnez à votre client. Un devis bien présenté, clair et complet inspire confiance et peut faire pencher la balance en votre faveur, même si vous n'êtes pas le moins cher.

## Les mentions obligatoires sur un devis

Un devis n'est pas obligatoire en France (sauf pour certains secteurs), mais quand vous en faites un, il doit comporter certaines mentions :

### Mentions sur votre entreprise
- Nom et prénom ou raison sociale
- Adresse complète
- Numéro SIRET
- Numéro de TVA intracommunautaire (si assujetti)
- Numéro d'assurance décennale (pour le bâtiment)
- Qualification professionnelle (RGE, Qualibat...)

### Mentions sur le client
- Nom et adresse du client
- Adresse du chantier (si différente)

### Mentions sur le devis
- La mention "DEVIS" en en-tête
- Numéro de devis (pour le suivi)
- Date d'émission
- Durée de validité (généralement 1 à 3 mois)
- Date de début et durée estimée des travaux

### Détail des prestations
- Description précise de chaque prestation
- Quantités et unités (m², heures, forfait...)
- Prix unitaire HT
- Taux de TVA par ligne
- Total HT, TVA et TTC

### Conditions
- Modalités de paiement (acompte, solde)
- Pénalités de retard
- Conditions d'annulation
- Signature et mention "Bon pour accord"

## 5 astuces pour des devis qui signent plus

### 1. Répondez rapidement
Le client qui demande plusieurs devis signe souvent avec le premier artisan qui répond. Visez **moins de 48h** pour envoyer votre devis.

### 2. Soyez précis et transparent
Un devis vague inquiète le client. Détaillez chaque poste : il comprend ce pour quoi il paie et vous vous protégez en cas de litige.

### 3. Affichez votre sérieux
Ajoutez sur votre devis :
- Votre photo professionnelle ou logo
- Vos certifications (RGE, Qualibat, QUALIPAC...)
- Votre numéro d'assurance décennale
- Des références de chantiers similaires

### 4. Proposez des options
Présentez 2 à 3 options avec des niveaux de qualité différents. Le client choisit son budget, et vous maximisez vos chances d'avoir quelque chose.

### 5. Relancez à J+7
Si vous n'avez pas de nouvelles après une semaine, relancez poliment par téléphone. Cette simple action peut doubler votre taux de signature.

## La durée de validité du devis

Indiquez toujours une durée de validité sur votre devis, généralement entre 1 et 3 mois. Cela vous protège contre la hausse des matériaux et crée une urgence pour le client.

Passé ce délai, vous êtes libre de modifier vos prix sans être lié par le devis initial.

## Devis accepté = contrat

Quand votre client signe votre devis avec la mention "Bon pour accord", ce document a valeur de contrat. C'est pourquoi il est important que :
- Les conditions de paiement soient clairement indiquées
- Le délai de réalisation soit précisé
- Les éventuelles plus-values soient encadrées

## Convertir un devis en facture avec Factures TPE

Avec Factures TPE, convertir un devis signé en facture se fait en **un seul clic**. Toutes les lignes, les montants et les informations client sont automatiquement repris. Vous n'avez qu'à ajouter la date et le numéro de facture.
    `.trim(),
  },
  {
    slug: 'auto-entrepreneur-facturation-guide-2025',
    title: 'Guide de facturation pour auto-entrepreneurs en 2025',
    metaDescription: 'Tout savoir sur la facturation en tant qu\'auto-entrepreneur en 2025 : obligations, TVA, mentions légales, seuils. Guide complet et pratique.',
    date: '2026-01-10',
    readTime: 9,
    category: 'Auto-entrepreneur',
    emoji: '🚀',
    excerpt: 'Guide complet de la facturation pour auto-entrepreneurs en 2025 : ce qui est obligatoire, les erreurs à éviter et comment simplifier votre gestion.',
    content: `
## Auto-entrepreneur : vos obligations de facturation

Le régime de l'auto-entrepreneur (ou micro-entrepreneur) est le plus simple pour se lancer. Mais même avec ce régime, vous avez des obligations de facturation à respecter. Voici tout ce qu'il faut savoir.

## Quand êtes-vous obligé de faire une facture ?

### Toujours obligatoire avec un professionnel
Dès lors que votre client est un professionnel (artisan, commerçant, société...), la facture est **obligatoire**, quel que soit le montant.

### Entre particuliers : au-delà de 25€
Vous devez émettre une facture pour tout achat de plus de 25€ TTC, et dès que votre client la demande, même en dessous de ce seuil.

### Cas particulier des prestations en ligne
Si vous vendez des services en ligne (formations, consulting...), une facture électronique est recommandée pour tous les montants.

## TVA et auto-entrepreneur : la franchise en base

C'est l'un des grands avantages du régime : **vous n'êtes pas assujetti à la TVA** tant que vous ne dépassez pas les seuils.

### Seuils 2025
- **37 500 €** de CA pour les prestations de services
- **85 000 €** pour les ventes de marchandises

### Mention obligatoire sur vos factures
Quand vous êtes en franchise de TVA, vous **devez** écrire sur chaque facture :
> *"TVA non applicable, article 293 B du CGI"*

Si vous oubliez cette mention, l'administration fiscale peut considérer que vous avez collecté de la TVA et vous demander de la reverser.

### Que se passe-t-il si vous dépassez les seuils ?

Si vous dépassez le seuil en cours d'année, vous devenez assujetti à la TVA **dès le 1er jour du mois suivant le dépassement**. Vous devez alors :
1. Vous immatriculer à la TVA
2. Facturer la TVA sur toutes vos prestations
3. Déclarer et reverser la TVA à l'administration

## Les mentions obligatoires sur votre facture d'auto-entrepreneur

### Ce que vous devez absolument indiquer

1. **Votre identité** : prénom, nom, et optionnellement le nom de votre auto-entreprise
2. **Votre adresse** (ou adresse de domiciliation)
3. **Votre numéro SIRET** : 14 chiffres
4. **La mention de votre régime** : "Entrepreneur individuel" ou "Micro-entrepreneur"
5. **La date de la facture**
6. **Un numéro de facture** unique et séquentiel
7. **La description précise** des services ou produits
8. **Le prix unitaire HT** et la quantité
9. **Le montant total**
10. **La mention TVA** : "TVA non applicable, article 293 B du CGI"
11. **Les conditions de paiement** : date d'échéance
12. **Les pénalités de retard** : taux applicable

### Pour certaines activités, mentions supplémentaires

- **Artisans du bâtiment** : numéro d'assurance décennale
- **Professions réglementées** : numéro d'ordre, certification...
- **Métiers nécessitant une qualification** : référence à la qualification

## La numérotation des factures

Vos factures doivent être numérotées de façon **chronologique et continue**. Vous ne pouvez pas sauter de numéro ni avoir deux factures avec le même numéro.

Formats recommandés :
- FAC-2025-001, FAC-2025-002...
- 2025001, 2025002...
- F25-001, F25-002...

L'important est que la numérotation soit unique et continue sur l'année (ou sur toute la durée de votre activité).

## Conservation des factures : combien de temps ?

Vous devez conserver vos factures pendant **10 ans** (délai de prescription fiscale). Cette obligation s'applique aussi bien aux factures que vous émettez qu'à celles de vos fournisseurs.

## Les erreurs les plus courantes des auto-entrepreneurs

### ❌ Oublier la mention TVA
Sans la mention "TVA non applicable, art. 293 B", votre facture peut être considérée comme incluant de la TVA à reverser.

### ❌ Facturer en dessous du vrai prix
Certains auto-entrepreneurs, pour rester sous les seuils, sous-facturent ou ne facturent pas certaines prestations. C'est illégal et risqué.

### ❌ Numérotation discontinue
Sauter des numéros (ex: de FAC-001 à FAC-005) peut attirer l'attention en cas de contrôle fiscal.

### ❌ Facture trop vague
"Prestations de service - 500€" n'est pas suffisant. Décrivez précisément ce que vous avez fait, quand, et pour qui.

### ❌ Pas de conditions de paiement
Sans délai de paiement précisé, votre client n'est pas en faute s'il paie... quand il veut.

## Simplifiez votre facturation avec Factures TPE

Factures TPE est conçu pour les auto-entrepreneurs et artisans français. Le logiciel :
- Génère automatiquement la mention "TVA non applicable" pour les profils en franchise
- Numéroté automatiquement vos factures de façon séquentielle
- Inclut toutes les mentions légales obligatoires
- Calcule vos délais de paiement et vous alerte en cas d'impayé
- Vous permet de créer votre première facture en moins de 2 minutes

Commencez gratuitement dès aujourd'hui, sans carte bancaire.
    `.trim(),
  },

  // ── Articles ciblés SEO haute priorité ──────────────────────────────────────
  {
    slug: 'logiciel-facturation-artisan-gratuit',
    title: 'Meilleur logiciel de facturation gratuit pour artisans en 2026',
    metaDescription: 'Quel logiciel de facturation gratuit choisir quand on est artisan ? Comparatif complet, fonctionnalités indispensables et notre recommandation pour 2026.',
    date: '2026-01-20',
    readTime: 10,
    category: 'Comparatif',
    emoji: '🏆',
    excerpt: 'Comparatif complet des meilleurs logiciels de facturation gratuits pour artisans en 2026. Fonctionnalités, limites, conformité française — on vous dit tout.',
    content: `
## Pourquoi un logiciel de facturation gratuit peut suffire à un artisan ?

En tant qu'artisan — plombier, électricien, peintre, maçon — votre cœur de métier est sur le chantier, pas derrière un écran. Pourtant, la facturation est une obligation légale qui peut vite devenir un casse-tête si elle est mal gérée.

La bonne nouvelle : il existe aujourd'hui des **logiciels de facturation gratuits** parfaitement adaptés aux artisans français, qui gèrent automatiquement la TVA, les mentions légales et la numérotation des factures.

La mauvaise nouvelle : tous ne se valent pas. Certains sont gratuits mais inutilisables depuis un smartphone. D'autres manquent de conformité avec la réglementation française. Voici comment choisir.

## Les critères indispensables pour un artisan

### 1. Conformité à la réglementation française

Votre logiciel de facturation doit absolument gérer :
- Les différents taux de TVA (5,5%, 10%, 20%)
- Toutes les **mentions légales obligatoires** (SIRET, TVA intracommunautaire, pénalités de retard, indemnité forfaitaire de 40€)
- La **numérotation séquentielle** des factures (obligation fiscale)
- La **date d'échéance** et les conditions de paiement

Un logiciel non conforme peut vous exposer à des amendes fiscales de 15€ par mention manquante.

### 2. Utilisation sur mobile

Vous êtes sur le chantier. Vous devez pouvoir créer un devis ou une facture depuis votre téléphone en 2 minutes, sans formation préalable. C'est non négociable.

### 3. La gestion des devis

Pour les artisans, le devis précède souvent la facture. Votre logiciel doit permettre de **convertir un devis en facture en un seul clic**. Sans ressaisie.

### 4. Le suivi des impayés

Un tableau de bord clair montrant qui a payé, qui doit encore payer, et qui est en retard. Avec la possibilité d'envoyer des relances directement depuis l'application.

## Comparatif des logiciels gratuits pour artisans en 2026

### Factures TPE — Le meilleur rapport fonctionnalités/simplicité

**Plan gratuit :** 5 factures/mois, 3 devis/mois, 10 clients

Spécialement conçu pour les artisans et TPE françaises, Factures TPE est le seul logiciel 100% gratuit qui combine :
- Interface ultra-simple, utilisable depuis un téléphone
- Conformité totale avec la réglementation française 2026
- Conversion devis → facture en 1 clic
- Tableau de bord avec suivi des impayés
- Génération de PDF professionnels instantanée
- Support en français

**Pour qui ?** Idéal pour démarrer ou pour les artisans qui font moins de 5 factures par mois.

### Les alternatives et leurs limites

**Logiciels comptables généralistes :**
- Souvent complexes, conçus pour les comptables
- Interface peu adaptée au mobile
- Prix élevé (20-50€/mois) dès qu'on veut les fonctionnalités clés

**Tableurs Excel/Google Sheets :**
- Gratuit mais aucune automatisation
- Numérotation manuelle = risque d'erreur fiscale
- Pas de suivi des paiements
- Pas de PDF professionnel automatique

**Applications génériques :**
- Pas toujours conformes aux règles françaises (TVA, mentions légales)
- Support souvent en anglais

## Les fonctionnalités à tester absolument

Avant de vous engager avec un logiciel, testez ces 5 fonctionnalités clés :

### Test 1 : Créer une facture en moins de 3 minutes
Chronométrez-vous. Si ça prend plus de 3 minutes pour votre première facture, le logiciel est trop compliqué.

### Test 2 : Créer un devis et le convertir en facture
Cette action doit être faisable en 2 clics sans ressaisir les informations.

### Test 3 : Vérifier les mentions légales
Téléchargez un PDF et vérifiez que SIRET, TVA, pénalités de retard et indemnité forfaitaire sont présents.

### Test 4 : Utiliser depuis le téléphone
Testez l'application depuis votre smartphone. Est-ce lisible ? Utilisable facilement ?

### Test 5 : Suivi des impayés
Y a-t-il un tableau de bord qui montre clairement les factures en attente de paiement ?

## Quand passer à un plan payant ?

Le plan gratuit est idéal pour démarrer ou pour les artisans avec peu de facturation. Vous devriez envisager un plan payant (à partir de 9€/mois) quand :

- Vous créez plus de **5 factures par mois**
- Vous avez besoin d'**envoyer les factures par email** directement depuis l'application
- Vous souhaitez votre **logo sur vos factures**
- Vous avez besoin de **relances automatiques** pour les impayés

Le plan Pro de Factures TPE (9€/mois HT) inclut toutes ces fonctionnalités, avec des factures et devis illimités.

## Conclusion : quel logiciel de facturation gratuit choisir ?

Pour un artisan français en 2026, le meilleur logiciel de facturation gratuit est celui qui est :
1. **Simple à utiliser** sur mobile
2. **Conforme** à la réglementation française
3. **Complet** : devis + factures + suivi impayés

Factures TPE remplit ces trois critères et propose un plan 100% gratuit pour commencer sans risque.

Créez votre premier compte gratuit dès maintenant et faites votre première facture en moins de 2 minutes.
    `.trim(),
  },
  {
    slug: 'creer-facture-plombier-gratuit',
    title: 'Comment créer une facture de plombier professionnelle (gratuit, en ligne)',
    metaDescription: 'Comment créer une facture de plombier conforme en ligne ? Mentions obligatoires, TVA, modèle PDF gratuit. Créez votre facture de plomberie en 2 minutes.',
    date: '2026-01-28',
    readTime: 7,
    category: 'Plomberie',
    emoji: '🔧',
    excerpt: 'Guide étape par étape pour créer une facture de plombier professionnelle et conforme. Modèle gratuit, TVA applicable, mentions légales incluses.',
    content: `
## Ce que doit contenir une facture de plombier en 2026

Que vous soyez plombier indépendant, auto-entrepreneur ou à la tête d'une petite entreprise, votre facture doit respecter des règles précises. Une facture incomplète peut vous exposer à des sanctions fiscales et compliquer le recouvrement en cas d'impayé.

Voici exactement ce que doit contenir votre facture de plomberie.

## Les mentions obligatoires sur une facture de plombier

### Vos informations (vendeur)
- **Votre nom ou raison sociale** : ex. "Dupont Plomberie" ou "Jean Dupont"
- **Votre adresse complète**
- **Numéro SIRET** : 14 chiffres, obligatoire
- **Numéro de TVA intracommunautaire** : si vous êtes assujetti à la TVA (commence par FR)
- **Numéro d'assurance décennale** : obligatoire pour les travaux de plomberie
- **Qualification professionnelle** : si vous êtes qualibat, qualipac, RGE...

### Informations sur votre client
- Nom et prénom (particulier) ou raison sociale (entreprise)
- Adresse de facturation
- Adresse du chantier si différente

### Informations de la facture
- La mention **"FACTURE"** en haut du document
- **Numéro de facture** unique et séquentiel (ex: FAC-2026-001)
- **Date d'émission**
- **Date de réalisation** des travaux

### Détail des prestations de plomberie
Chaque intervention doit être détaillée :
- Main d'œuvre : nombre d'heures × taux horaire HT
- Fournitures : référence, quantité, prix unitaire HT
- Déplacement : forfait ou km × tarif
- **Taux de TVA** par ligne (5,5%, 10% ou 20%)
- **Total HT**, **TVA** et **Total TTC**

### Conditions de paiement (obligatoires)
- **Date d'échéance** : "Payable à 30 jours" ou date précise
- **Taux des pénalités de retard** : minimum taux BCE + 10 points (soit ~13% en 2026)
- **Indemnité forfaitaire pour frais de recouvrement : 40€** (obligatoire depuis 2013)
- Modes de paiement acceptés

## La TVA sur les factures de plomberie : quel taux ?

C'est la question que se posent le plus souvent les plombiers. La réponse dépend du type de travaux et du logement.

### TVA à 5,5% — Travaux d'économie d'énergie
Pour les installations éligibles CEE dans des logements de plus de 2 ans :
- Pompes à chaleur haute performance
- Chauffe-eau thermodynamiques
- Isolation des tuyauteries (si couplée à des travaux éligibles)

### TVA à 10% — Travaux de rénovation
Pour tous les travaux de plomberie de rénovation/entretien dans les logements achevés depuis plus de 2 ans :
- Réparation de fuite
- Remplacement de robinetterie
- Installation de chauffe-eau classique
- Débouchage canalisation
- Installation sanitaire dans logement existant

⚠️ **Attention** : votre client doit vous fournir une attestation confirmant que le logement a plus de 2 ans. Conservez-la précieusement.

### TVA à 20% — Taux normal
- Construction neuve
- Locaux professionnels et commerciaux
- Vente de matériel seul, sans pose

## Modèle de facture de plombier

Voici un exemple de structuration d'une facture de plomberie :

---

**FACTURE N° FAC-2026-042**
Date : 15/03/2026 — Échéance : 14/04/2026

**Dupont Plomberie**
15 rue des Artisans, 69001 Lyon
SIRET : 123 456 789 00012
TVA : FR12 123456789
Assurance décennale : Police n° XXX — MMA

**Facturer à :**
M. Martin Sophie — 45 avenue des Fleurs, 69003 Lyon
Chantier : même adresse

| Désignation | Qté | PU HT | Total HT | TVA |
|-------------|-----|-------|----------|-----|
| Main d'œuvre plombier (2h) | 2h | 60,00 € | 120,00 € | 10% |
| Remplacement robinet mitigeur | 1 | 89,00 € | 89,00 € | 10% |
| Fournitures (joints, raccords) | 1 | 15,00 € | 15,00 € | 10% |
| Déplacement | 1 | 25,00 € | 25,00 € | 20% |

Total HT : 249,00 €
TVA 10% : 22,40 €
TVA 20% : 5,00 €
**Total TTC : 276,40 €**

Pénalités de retard : 13% l'an — Indemnité forfaitaire : 40€

---

## Comment créer cette facture gratuitement en ligne

Avec **Factures TPE**, vous pouvez créer une facture de plombier professionnelle en moins de 2 minutes :

1. **Créez votre compte gratuit** (sans carte bancaire)
2. **Renseignez vos informations** une seule fois (SIRET, assurance décennale, TVA...)
3. **Créez votre client** en quelques secondes
4. **Ajoutez vos lignes** : main d'œuvre, fournitures, déplacement
5. **Sélectionnez le taux de TVA** adapté pour chaque ligne
6. **Téléchargez le PDF** ou envoyez-le directement par email

Toutes les mentions obligatoires sont automatiquement incluses. Votre facture est immédiatement conforme à la réglementation française.

## Les erreurs fréquentes sur les factures de plombier

### ❌ Oublier le numéro d'assurance décennale
C'est une obligation légale pour tous les travaux de plomberie. En cas de sinistre, l'absence de cette mention peut vous exposer à des litiges.

### ❌ Appliquer 20% de TVA au lieu de 10%
C'est l'erreur la plus courante. Si votre client est un particulier avec un logement de plus de 2 ans, la TVA est de 10% sur la main d'œuvre et les fournitures posées. Vous surfacturez votre client inutilement.

### ❌ Omettre les pénalités de retard et l'indemnité de 40€
Même si vous ne comptez pas les appliquer, ces mentions sont **obligatoires** sur toute facture entre professionnels.

### ❌ Numérotation discontinue
Ne sautez jamais de numéro de facture. En cas de contrôle fiscal, les trous dans la numérotation peuvent déclencher un redressement.
    `.trim(),
  },
  {
    slug: 'logiciel-devis-electricien-gratuit',
    title: 'Logiciel de devis pour électriciens : comparatif et guide 2026',
    metaDescription: 'Quel logiciel utiliser pour faire des devis d\'électricien professionnels ? Comparatif gratuit 2026 : fonctionnalités, conformité, facilité d\'utilisation.',
    date: '2026-02-05',
    readTime: 8,
    category: 'Électricité',
    emoji: '⚡',
    excerpt: 'Guide complet pour choisir votre logiciel de devis électricien en 2026. Fonctionnalités clés, conformité Qualifelec/RGE, modèles gratuits.',
    content: `
## Pourquoi un bon logiciel de devis est crucial pour un électricien

En tant qu'électricien, votre devis est souvent le premier contact professionnel avec votre futur client. Un devis bien présenté, détaillé et professionnel peut faire la différence entre décrocher ou perdre un chantier — même si vous n'êtes pas le moins cher.

De plus, un devis électricien mal rédigé vous expose à des litiges en cours de chantier (travaux supplémentaires non prévus, désaccord sur les prix) et à des difficultés à vous faire payer.

## Ce que doit contenir un devis d'électricien en 2026

### Mentions obligatoires

- **Vos coordonnées complètes** : nom, adresse, SIRET
- **Votre certification** : numéro Qualifelec, RGE, CONSUEL...
- **Numéro d'assurance décennale** (obligatoire)
- **Coordonnées du client** et adresse du chantier
- **Date d'émission et durée de validité** (précisez "valable 1 mois" ou "valable 3 mois")
- **Description détaillée** de chaque prestation
- **Prix unitaire HT** et quantités
- **Taux de TVA** applicable par ligne
- **Total HT, TVA, Total TTC**
- **Délai et conditions d'exécution**
- **Conditions de paiement** (acompte demandé, solde à réception)
- **Signature et bon pour accord** du client

### Les certifications à faire apparaître sur vos devis

Pour les électriciens, certaines certifications ouvrent droit à des aides pour vos clients. Affichez-les clairement :

- **Qualifelec** : certification de référence pour les électriciens
- **RGE (Reconnu Garant de l'Environnement)** : obligatoire pour faire bénéficier vos clients des aides CEE et MaPrimeRénov'
- **IRVE** : pour l'installation de bornes de recharge véhicules électriques
- **QUALIPV** : pour les installations photovoltaïques

## La TVA sur les devis et factures d'électricien

### TVA à 5,5%
Pour les travaux d'amélioration de la performance énergétique dans des logements de plus de 2 ans :
- Isolation thermique couplée à une installation électrique
- Pompes à chaleur air/air (certains modèles)
- Chauffe-eau thermodynamiques
- Systèmes de gestion de l'énergie (domotique énergie)
- Bornes de recharge IRVE dans certains cas

### TVA à 10%
Pour les travaux d'installation, rénovation et entretien électrique dans des logements de plus de 2 ans :
- Mise aux normes NF C 15-100
- Remplacement du tableau électrique
- Installation d'éclairage LED
- Câblage et prises supplémentaires
- Installation de détecteurs (fumée, présence)
- Interphonie et visiophonie

### TVA à 20%
- Construction neuve
- Locaux commerciaux et professionnels
- Vente de matériel seul sans pose
- Logements de moins de 2 ans

## Comment structurer un devis électricien qui convainc

### La structure gagnante

**En-tête professionnel**
Logo, coordonnées complètes, certifications bien visibles.

**Description du projet**
Résumez en 2-3 lignes ce que vous allez faire : "Mise aux normes du tableau électrique et remplacement du câblage du rez-de-chaussée du logement situé au..."

**Détail des prestations par zone**
Organisez par zone ou par type de travaux :
- Section 1 : Tableau électrique (dépose, fourniture tableau Schneider REF XXX, pose, repérage)
- Section 2 : Circuits prise de courant (fourniture câble, boîtes d'encastrement, prises, pose)
- Section 3 : Circuits éclairage
- Section 4 : Vérifications et tests

**Options (si pertinent)**
Proposez des variantes : "Option A : éclairage standard — Option B : éclairage LED dimmable avec variateurs"

**Récapitulatif financier**
- Total HT par section
- TVA applicable
- Total TTC
- Acompte demandé (généralement 30%)

### Les informations qui rassurent le client

1. **Délai d'exécution** : "Travaux réalisés en 2 jours, début possible le..."
2. **Garantie** : "Travaux garantis 2 ans pièces et main d'œuvre"
3. **Respect des normes** : "Installation conforme NF C 15-100, attestation CONSUEL fournie"
4. **Assurance** : "Assuré responsabilité civile et décennale n°..."

## Comparatif des logiciels de devis pour électriciens

### Ce qu'on attend d'un bon logiciel de devis électricien

- **Base de données de prix** : idéalement avec des tarifs de référence matériel électrique
- **Multi-TVA** : gestion des taux 5,5%, 10% et 20% sur une même facture
- **Attestation client** : génération de l'attestation taux réduit pour les clients particuliers
- **Conversion devis → facture** : sans ressaisie
- **Certification sur les documents** : affichage automatique du numéro RGE, Qualifelec...
- **Envoi email intégré** : pour envoyer devis et factures directement au client

### Factures TPE — Simple et conforme pour les électriciens

Factures TPE permet aux électriciens de créer des devis professionnels en moins de 3 minutes. Le plan gratuit inclut 3 devis par mois, parfait pour tester sans risque.

Avec le plan Pro (9€/mois HT) :
- Devis illimités
- Conversion en facture en 1 clic
- Envoi par email directement depuis l'app
- Votre logo et certifications sur chaque document
- Suivi des devis (accepté, en cours, refusé)

## Astuces pour avoir plus de devis signés

### Répondez en moins de 24h
Les clients qui demandent plusieurs devis signent souvent avec le premier artisan qui répond. Utilisez votre logiciel de devis depuis votre téléphone pour répondre rapidement même sur le chantier.

### Soyez précis et transparent
Un électricien qui détaille chaque ligne (référence du câble, nombre de mètres, temps de pose) inspire confiance. Le client comprend ce pour quoi il paie et ne peut pas négocier "à l'aveugle".

### Affichez vos certifications
Mettez en avant votre certification RGE ou Qualifelec. Pour beaucoup de clients, c'est la condition pour obtenir les aides MaPrimeRénov' ou les CEE. Un électricien certifié = une valeur ajoutée réelle.

### Incluez une durée de validité
"Devis valable 30 jours" crée une urgence légitime et vous protège contre la hausse des matériaux.

### Proposez un accompagnement pour les aides
"Je m'occupe des démarches pour les aides CEE" — c'est un argument commercial très puissant pour les particuliers qui ne savent pas comment s'y prendre.
    `.trim(),
  },
  {
    slug: 'facturation-auto-entrepreneur-gratuit-2026',
    title: 'Facturation auto-entrepreneur gratuit : les meilleurs outils en 2026',
    metaDescription: 'Quels outils gratuits pour facturer en tant qu\'auto-entrepreneur en 2026 ? Logiciels, modèles PDF, obligations légales. Guide complet pour micro-entrepreneurs.',
    date: '2026-02-15',
    readTime: 9,
    category: 'Auto-entrepreneur',
    emoji: '💼',
    excerpt: 'Comparatif des meilleurs outils de facturation gratuits pour auto-entrepreneurs en 2026. Logiciels en ligne, mentions obligatoires, TVA et astuces pratiques.',
    content: `
## Auto-entrepreneur : avez-vous vraiment besoin d'un logiciel de facturation ?

Beaucoup d'auto-entrepreneurs commencent par des factures Word ou Excel. Ça fonctionne... jusqu'au jour où :

- Vous perdez un fichier ou faites une erreur de numérotation (= risque fiscal)
- Vous ne savez plus qui a payé et qui doit encore payer
- Votre client vous demande de reémettre une facture et vous perdez du temps
- Vous avez un contrôle URSSAF et vos factures ne sont pas conformes

Un **logiciel de facturation gratuit pour auto-entrepreneur** évite tous ces problèmes en 2 minutes par facture. Et ça ne coûte rien pour commencer.

## La règle d'or de la facturation auto-entrepreneur

En tant qu'auto-entrepreneur (micro-entrepreneur), votre obligation principale est simple :
**Toute vente à un professionnel = facture obligatoire. Toute vente de plus de 25€ à un particulier = facture obligatoire (ou sur demande en dessous).**

Et cette facture doit être **conforme** pour être valable juridiquement.

## Les mentions obligatoires sur une facture d'auto-entrepreneur

Beaucoup d'auto-entrepreneurs font des erreurs sur ce point. Voici la liste complète :

### Vos informations
- **Votre nom et prénom** (ou nom commercial si vous en avez un)
- **Votre adresse** (adresse personnelle si c'est votre siège)
- **Votre numéro SIRET** : 14 chiffres, indispensable
- La mention **"Entrepreneur individuel"** ou **"Micro-entrepreneur"**

### Informations client
- Nom du client (ou raison sociale)
- Adresse de facturation

### Informations de la facture
- La mention **"FACTURE"** en haut
- **Numéro de facture** unique et chronologique
- **Date d'émission**
- Description précise de la prestation

### Montants
- **Prix HT** de la prestation (ou prix TTC si en franchise de TVA)
- Pour les auto-entrepreneurs en franchise : **prix TTC = prix HT** (pas de TVA)

### La mention TVA — INDISPENSABLE
Si vous êtes en franchise de TVA (sous les seuils), vous devez impérativement écrire :
> **"TVA non applicable, article 293 B du CGI"**

Sans cette mention, votre facture est non conforme. Et si vous oubliez de la mettre, le fisc peut considérer que vous avez collecté de la TVA et vous demander de la reverser !

### Conditions de paiement
- **Date d'échéance** ou délai de paiement
- **Taux de pénalités de retard** (obligatoire même entre particuliers dans certains cas)
- **Indemnité forfaitaire de 40€** (pour les factures entre professionnels)

## Les seuils TVA pour les auto-entrepreneurs en 2026

### Seuils de franchise en base
- **Prestations de services** : 37 500 € de CA annuel
- **Ventes de marchandises** : 85 000 € de CA annuel

Tant que vous restez sous ces seuils, vous n'êtes pas assujetti à la TVA. Vos prix = prix HT = prix TTC.

### Que se passe-t-il si vous dépassez les seuils ?

Dès le 1er jour du mois suivant le dépassement, vous devenez assujetti à la TVA. Vous devez :
1. Vous immatriculer à la TVA (numéro TVA intracommunautaire)
2. Facturer la TVA à vos clients (10%, 20%...)
3. Déclarer et reverser la TVA trimestriellement ou mensuellement

## Comparatif des outils de facturation gratuits pour auto-entrepreneurs

### Option 1 : Factures TPE (recommandé)

**Pour qui ?** Auto-entrepreneurs avec moins de 5 factures/mois

**Avantages :**
- 100% gratuit pour commencer
- Interface conçue pour les artisans et travailleurs indépendants français
- Mention TVA "art. 293 B" automatique pour les profils en franchise
- Numérotation automatique et séquentielle
- PDF professionnel avec toutes les mentions légales
- Accessible depuis mobile

**Limites du plan gratuit :** 5 factures/mois, 3 devis/mois, 10 clients

**Plan Pro : 9€/mois HT** pour illimité + envoi email + logo + relances

### Option 2 : Tableur Google Sheets ou Excel

**Pour qui ?** Auto-entrepreneurs très occasionnels (moins de 1 facture/mois)

**Avantages :**
- Totalement gratuit
- Personnalisable

**Inconvénients :**
- Numérotation manuelle (risque d'erreur = risque fiscal)
- Pas de suivi des paiements
- Pas de PDF professionnel automatique
- Aucun rappel des impayés
- Risque d'oublier des mentions légales

### Option 3 : Sites de génération de facture PDF

**Pour qui ?** Ponctuellement, pour une facture occasionnelle

**Avantages :**
- Gratuit et immédiat
- Pas de compte à créer

**Inconvénients :**
- Pas d'historique des factures
- Pas de numérotation séquentielle automatique
- Données non sauvegardées
- Mentions légales parfois incomplètes
- Aucun suivi des paiements

## Les erreurs de facturation qui coûtent cher aux auto-entrepreneurs

### ❌ Erreur n°1 : Oublier "TVA non applicable art. 293 B du CGI"

C'est l'erreur la plus fréquente et la plus coûteuse. Sans cette mention, votre facture est techniquement non conforme.

### ❌ Erreur n°2 : Des numéros de facture non séquentiels

"FAC-001, FAC-002, FAC-010, FAC-011..." — les trous dans la numérotation peuvent déclencher un contrôle fiscal. Votre logiciel doit gérer la numérotation automatiquement.

### ❌ Erreur n°3 : Description trop vague

"Prestation de service — 500€" n'est pas suffisant. Décrivez précisément ce que vous avez fait : "Création de site web vitrine 5 pages, période du 01/02/2026 au 28/02/2026".

### ❌ Erreur n°4 : Pas de date d'échéance

Sans date d'échéance, votre client n'est pas en faute légalement s'il paie tard. Indiquez toujours "Payable à réception" ou une date précise.

### ❌ Erreur n°5 : Ne pas conserver ses factures

Obligation légale : **10 ans** de conservation. Utilisez un logiciel qui stocke vos factures en cloud, comme Factures TPE.

## Comment choisir son logiciel de facturation gratuit en tant qu'auto-entrepreneur ?

Voici les 5 questions à se poser :

1. **Est-il conforme à la réglementation française ?** (mention TVA 293B, mentions légales complètes)
2. **Gère-t-il la numérotation automatique ?** (indispensable pour éviter les erreurs fiscales)
3. **Puis-je l'utiliser sur mon téléphone ?** (pour facturer partout)
4. **Y a-t-il un suivi des paiements ?** (pour savoir qui doit encore payer)
5. **Le plan gratuit suffit-il à mes besoins ?** (vérifiez les limites)

Factures TPE répond "oui" à ces 5 questions. Commencez gratuitement dès aujourd'hui.
    `.trim(),
  },
  {
    slug: 'facture-impayee-que-faire',
    title: 'Facture impayée : que faire et comment se protéger légalement',
    metaDescription: 'Que faire face à une facture impayée en 2026 ? Relance, mise en demeure, injonction de payer... Guide complet avec modèles pour artisans et TPE.',
    date: '2026-02-22',
    readTime: 8,
    category: 'Gestion',
    emoji: '⚠️',
    excerpt: 'Face à une facture impayée, chaque jour compte. Découvrez les étapes légales pour récupérer votre argent, de la relance amiable aux recours juridiques.',
    content: `
## La réalité des impayés pour les artisans

Selon les chiffres de la Banque de France, les retards de paiement touchent **plus de 30% des artisans et TPE** chaque année. Et pour beaucoup, un seul gros impayé peut suffire à menacer la survie de l'entreprise.

Pourtant, peu d'artisans savent exactement quoi faire face à un client qui ne paie pas. La plupart relancent une fois par téléphone puis... abandonnent. C'est une erreur qui coûte cher.

Voici le protocole exact à suivre pour maximiser vos chances de récupérer votre argent.

## Avant tout : vérifiez que votre facture est en ordre

Avant de relancer, vérifiez ces 3 points :

1. **Votre facture est-elle conforme ?** (toutes les mentions légales, TVA correcte)
2. **Avez-vous une preuve d'envoi ?** (email avec accusé de lecture, lettre recommandée, signature du bon de livraison)
3. **La date d'échéance est-elle bien dépassée ?** (vérifiez la date sur la facture)

Un client de mauvaise foi peut contester une facture non conforme pour retarder le paiement. Votre facture doit être irréprochable.

## Le calendrier de relance idéal

### J+1 après l'échéance : vérification interne

Confirmez que le paiement n'est pas arrivé (vérifiez votre compte bancaire, Paypal si applicable). Parfois, un virement est en cours.

### J+3 à J+5 : première relance amiable (par téléphone)

C'est souvent un simple oubli. Un coup de fil suffit dans 60% des cas.

**Script téléphonique :**
*"Bonjour [Prénom], c'est [Votre nom] de [Votre entreprise]. Je vous appelle au sujet de notre facture n°[XXX] d'un montant de [X]€ échue le [date]. Je voulais vérifier que tout était en ordre de votre côté pour le règlement ?"*

Restez neutre et professionnel. Pas d'accusation. Prenez note de ce que le client vous dit.

### J+7 : première relance écrite (email)

Si pas de réponse ou si le client a promis de payer mais ne l'a pas fait :

> **Objet : Rappel de paiement — Facture n°[XXX]**
>
> Bonjour [Prénom],
>
> Sauf erreur de ma part, notre facture n°[XXX] du [date] d'un montant de [X]€ TTC, dont l'échéance était fixée au [date], ne semble pas encore réglée.
>
> Pourriez-vous me confirmer la date à laquelle vous comptez procéder au règlement ?
>
> Dans l'attente, je reste disponible pour toute question.
>
> Cordialement, [Votre signature]

### J+15 à J+21 : deuxième relance (ton plus ferme)

> **Objet : Deuxième rappel urgent — Facture n°[XXX] impayée**
>
> Bonjour [Prénom],
>
> Malgré mes précédentes relances, notre facture n°[XXX] de [X]€ TTC reste impayée à ce jour.
>
> Je vous rappelle que des pénalités de retard au taux de [X]% par an sont applicables depuis le [date d'échéance], ainsi qu'une indemnité forfaitaire pour frais de recouvrement de **40€**.
>
> Je vous invite à régulariser cette situation avant le [date + 8 jours] pour éviter toute procédure supplémentaire.
>
> Cordialement, [Votre signature]

### J+30 à J+45 : mise en demeure (lettre recommandée)

La mise en demeure est une étape juridiquement importante. Elle :
- Constitue une preuve de votre démarche amiable
- Fait courir officiellement les intérêts de retard
- Est indispensable avant toute action en justice

**Elle doit être envoyée en lettre recommandée avec accusé de réception.**

Conservez le récépissé et l'accusé de réception : ils seront vos preuves en cas de procédure judiciaire.

## Les recours juridiques

### L'injonction de payer (la plus efficace pour les artisans)

C'est la procédure la plus adaptée aux artisans pour les créances de moins de 75 000€.

**Comment ça marche :**
1. Téléchargez le formulaire CERFA n°12948 sur service-public.fr
2. Joignez vos preuves (facture, bons de commande, échanges emails, accusé de réception de la mise en demeure)
3. Déposez au greffe du tribunal judiciaire dont dépend votre client
4. Frais : 35,21€ + 14,67€ de droit de timbre

**Délai :** 2 à 6 semaines pour obtenir l'ordonnance d'injonction de payer.

Si le juge fait droit à votre demande, votre client a 1 mois pour contester ou payer. Sans réaction, vous pouvez faire apposer la formule exécutoire et faire saisir ses biens par un huissier.

### Le référé-provision

Pour les créances urgentes et indiscutables, le référé-provision permet d'obtenir une décision rapide (audience sous 2 à 4 semaines).

### Faire appel à une société de recouvrement

Pour les créances importantes (> 500€) sur lesquelles vous ne voulez pas perdre de temps, les sociétés de recouvrement peuvent prendre en charge tout le processus. Elles se rémunèrent généralement entre 15% et 30% du montant récupéré.

## Comment éviter les impayés à l'avenir

### 1. Demandez toujours un acompte

Pour tout devis supérieur à 500€, exigez un acompte de 30 à 50% avant de commencer les travaux. Un client qui paie l'acompte est un client engagé.

### 2. Faites signer vos devis

Un devis signé avec la mention "Bon pour accord" a valeur de contrat. En cas de litige, c'est votre protection.

### 3. Vérifiez la solvabilité des nouveaux clients professionnels

Pour les entreprises, vérifiez sur Infogreffe ou Societe.com. Un client en difficulté financière est un risque à anticiper.

### 4. Raccourcissez vos délais de paiement

30 jours maximum pour les particuliers, 60 jours pour les professionnels (légalement). Plus vous raccourcissez, moins vous prenez de risques.

### 5. Utilisez un logiciel avec alertes impayés

Factures TPE vous envoie des alertes automatiques pour les factures en retard et vous permet d'envoyer des relances en un clic directement depuis l'application.
    `.trim(),
  },
  {
    slug: 'devis-facture-difference-artisan',
    title: 'Devis ou facture : quelle différence pour un artisan ?',
    metaDescription: 'Quelle est la différence entre un devis et une facture pour un artisan ? Obligations, valeur juridique, conversion. Guide pratique pour artisans et TPE.',
    date: '2026-03-01',
    readTime: 5,
    category: 'Juridique',
    emoji: '📄',
    excerpt: 'Devis et facture : deux documents essentiels mais différents. Découvrez leurs obligations, leur valeur juridique et comment les gérer efficacement.',
    content: `
## La différence fondamentale entre devis et facture

Beaucoup d'artisans utilisent ces deux termes de manière interchangeable. C'est une erreur. Voici la distinction essentielle :

**Le devis** est un document qui **précède** la réalisation des travaux. C'est une offre commerciale chiffrée que vous faites à votre client. Il engage les deux parties uniquement s'il est **signé**.

**La facture** est un document qui **suit** la réalisation des travaux (ou d'une partie des travaux). C'est le document de paiement officiel. Elle est obligatoire dans la plupart des cas.

## Le devis : ce qu'il faut savoir

### Est-il obligatoire ?

Le devis n'est pas toujours obligatoire en France. Il le devient dans ces cas précis :
- **Travaux supérieurs à 150€ TTC** dans les secteurs du bâtiment, de l'entretien et de la réparation de véhicules, du déménagement...
- Toujours recommandé (même si non obligatoire) pour protéger les deux parties

### Sa valeur juridique

Un devis signé par le client est un **contrat**. Il vous engage à réaliser les travaux décrits au prix indiqué. Le client s'engage à payer ce prix.

Conséquence : si votre client refuse de payer après avoir signé le devis et que vous avez réalisé les travaux, vous avez toutes les preuves nécessaires pour engager une procédure.

### La durée de validité

Toujours indiquer une durée de validité sur votre devis. Sans elle, votre offre est engageante indéfiniment (ce qui peut vous poser problème si les prix des matériaux augmentent).

Recommandation : **1 mois** pour les petits travaux, **3 mois** pour les projets importants.

### Modification après signature

Si des travaux supplémentaires s'avèrent nécessaires en cours de chantier, vous devez obligatoirement établir un **avenant au devis** signé par le client avant de réaliser ces travaux. Sinon, vous risquez de ne pas être payé pour ces suppléments.

## La facture : ce qu'il faut savoir

### Quand est-elle obligatoire ?

La facture est obligatoire :
- **Toujours** entre deux professionnels (BtoB), quel que soit le montant
- Pour tout particulier au-delà de **25€ TTC**
- Dès que le particulier le demande, même sous 25€

### Son contenu obligatoire

Contrairement au devis (qui a des règles moins strictes), la facture a des **mentions légales obligatoires précises** dont l'absence peut entraîner des amendes :

- Numéro de SIRET
- Numéro de TVA intracommunautaire (si assujetti)
- Numéro de facture (unique et séquentiel)
- Date d'émission
- Description précise des prestations
- Prix unitaire HT, taux de TVA, total TTC
- **Date d'échéance**
- **Taux des pénalités de retard** (minimum BCE + 10 points)
- **Indemnité forfaitaire de 40€** pour les factures professionnelles

### Ne jamais modifier une facture émise

Contrairement au devis, une facture émise ne doit **jamais être modifiée**. Si vous faites une erreur, vous devez émettre un **avoir** (facture d'annulation) et réémettre une nouvelle facture.

Modifier une facture après émission est une fraude fiscale.

## Le cycle complet : de la demande au paiement

Voici le cycle idéal pour un artisan :

**1. Demande client** → Visite chantier → **2. Devis** envoyé au client

**3. Signature du devis** par le client → Éventuellement encaissement de l'acompte (facture d'acompte)

**4. Réalisation des travaux** → Eventuellement des situations de travaux (factures intermédiaires)

**5. Réception des travaux** → **6. Facture de solde** envoyée au client

**7. Paiement** reçu → Clôture du dossier

## La conversion devis → facture avec Factures TPE

Avec Factures TPE, convertir un devis signé en facture se fait en **un seul clic**. Toutes les lignes, quantités, prix et informations client sont automatiquement reprises dans la facture. Vous n'avez qu'à vérifier et télécharger.

Plus besoin de ressaisir les informations à la main, ce qui élimine les risques d'erreur et vous fait gagner un temps précieux.

## Récapitulatif : devis vs facture

| Critère | Devis | Facture |
|---------|-------|---------|
| Moment d'émission | Avant les travaux | Après les travaux |
| Obligatoire ? | Parfois | Presque toujours |
| Valeur juridique | Contrat si signé | Document de paiement |
| Modifiable ? | Oui (avant signature) | Non (émettre un avoir) |
| Numérotation séquentielle | Recommandée | Obligatoire |
| Mentions légales | Moins strictes | Très strictes |
    `.trim(),
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug)
}
