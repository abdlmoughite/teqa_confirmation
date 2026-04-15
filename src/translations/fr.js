export default {
  common: {
    back: "Retour",
    continue: "Continuer",
    submit: "Valider",
    loading: "Chargement...",
    field_required: "Ce champ est obligatoire",
    success: "Succès",
    save: "Enregistrer",
    next: "Suivant",
    previous: "Précédent",
    confirm: "Confirmer",
    yes: "Oui",
    no: "Non",
    error: "Une erreur est survenue",
    checking: "Vérification…",
    home: "Accueil",
    go_home: "Retour à l'accueil",
    // Countries
    morocco: "Maroc",
    france: "France",
    tunisia: "Tunisie",
    algeria: "Algérie",
    belgium: "Belgique",
    canada: "Canada",
    switzerland: "Suisse",

    select: "Sélectionner",
    country: "Pays",
  },

  auth: {
    account_info: "Informations du compte",
    email: "Email",
    email_placeholder: "exemple@mail.com",
    email_invalid: "Adresse email invalide",
    email_taken: "Email déjà utilisé",
    email_available: "Email disponible",
    required: "Ce champ est obligatoire",
    username: "Nom d'utilisateur",
    username_placeholder: "Votre nom d'utilisateur",
    username_taken: "Nom d’utilisateur déjà pris",

    password: "Mot de passe",
    password_min: "Minimum 8 caractères",
    password_uppercase: "Besoin d’une majuscule",
    password_lowercase: "Besoin d’une minuscule",
    password_number: "Besoin d’un chiffre",
    password_special: "Besoin d’un caractère spécial",

    country: "Pays",

    account_type: "Type de compte",
    select: "Sélectionner...",
    role_store: "Store",
    role_agency_owner: "Propriétaire d'agence",
    role_agency_agent: "Agent",
    pass_min: "Minimum 8 caractères",
    pass_upper: "Au moins une majuscule",
    pass_digit: "Au moins un chiffre",
    pass_special: "Au moins un caractère spécial",
    password: "Mot de passe",
    account_type: "Type de compte",
    checking: "Vérification...",
  },

  register: {
    success_title: "Inscription réussie!",
    success_message: "Votre compte a été créé avec succès.",
    redirecting: "Redirection dans",
    go_to_login: "Aller à la connexion maintenant",
    step: "Étape",
    of: "sur",
    have_account: "Vous avez déjà un compte?",
    login_here: "Connectez-vous ici",
    title: "Créer un compte",
    subtitle: "Rejoignez notre plateforme en quelques étapes",
    step1_title: "Informations du compte",
    step1_subtitle: "Saisissez vos informations pour continuer",
    step_progress: "Étape 1 sur 3",

    account_type: "Type de compte",
    select_role: "Veuillez choisir un type de compte",

    role_store: "Magasin",
    role_agency_owner: "Propriétaire d’agence",
    role_agency_agent: "Agent d’agence",
    fix_errors: "Veuillez corriger les champs invalides.",
    success: "Compte créé avec succès !",
    can_login_now: "Vous pouvez maintenant vous connecter.",
    success_description:
      "Votre compte a été créé avec succès. Toutes les informations ont été enregistrées.",
    can_login_now:
      "Vous pouvez maintenant vous connecter avec vos identifiants.",
    validation_failed:
      "L’inscription n’a pas pu être validée. Veuillez corriger les champs signalés ci-dessous.",
  },

  store: {
    title: "Informations du Store",
    name: "Nom du store",
    activity: "Secteur d'activité",
    address: "Adresse du store",
    available: "Nom disponible ✓",
    errors: {
      required: "Ce champ est requis",
      exists: "Ce nom est déjà pris",
      too_short: "Le nom doit contenir au moins 3 caractères",
      check_failed: "Échec de vérification",
    },
  },
  common: {
    checking: "Vérification...",
    back: "Retour",
    continue: "Continuer",
  },
  agency: {
    title: "Informations de l’agence",
    name: "Nom de l’agence",
    industry: "Secteur",
    verification_file: "Document de vérification",
    submit: "Créer mon agence",
    taken: "Nom déjà utilisé",
  },

  agent: {
    title: "Informations de l’agent",
    first_name: "Prénom",
    last_name: "Nom",
    bio: "Biographie",
    skills: "Compétences",
    submit: "Créer mon profil",
  },
  home: {
    title: "Bienvenue sur",
    subtitle: "Une plateforme moderne pour gérer facilement vos services.",
    login: "Se connecter",
    register: "Créer un compte",
  },
  auth_login: {
    login_title: "Connexion",
    email: "Email",
    password: "Mot de passe",
    login_btn: "Se connecter",
    forgot_password: "Mot de passe oublié ?",
    create_account: "Créer un compte",
    invalid_credentials: "Email ou mot de passe incorrect.",

    errors: {
      unauthorized: "Accès non autorisé.",
      forbidden: "Votre compte est désactivé.",
      not_found: "Aucun compte correspondant.",
      too_many_requests: "Trop de tentatives, réessayez plus tard.",
      server: "Erreur interne du serveur.",
      unknown: "Une erreur inconnue est survenue.",
    },
  },

  reset: {
    request_title: "Réinitialiser le mot de passe",
    send_link: "Envoyer le lien",
    email_sent: "Si l’email existe, un lien a été envoyé.",
    required: "Ce champ est obligatoire",
    confirm_title: "Réinitialisation du mot de passe",
    new_password: "Nouveau mot de passe",
    confirm_button: "Confirmer",
    success: "Mot de passe réinitialisé avec succès !",
    error_generic: "Erreur lors de la réinitialisation du mot de passe.",
    weak: "Faible",
    medium: "Moyenne",
    strong: "Forte",
    password_mismatch: "Les mots de passe ne correspondent pas.",
    password_required: "Le mot de passe est requis.",
    confirm_password: "Confirmer le mot de passe",
  },

    // accueil //
  faq: {
  title: "Questions fréquentes",
  subtitle: "Tout ce que vous devez savoir sur Teqa Connect",

  items: [
    {
      question: "Comment fonctionne le scoring par IA ?",
      answer:
        "Notre intelligence artificielle analyse l’historique des commandes, les schémas de livraison et le comportement de retour des clients afin de calculer un score de risque (0–100). Les clients sont classés en Risque Élevé, Risque Moyen ou Sûr.",
    },
    {
      question: "Quelles plateformes e-commerce sont prises en charge ?",
      answer:
        "Nous prenons en charge Shopify, WooCommerce et YouCan.",
    },
    {
      question: "Puis-je intégrer Teqa à mes systèmes existants ?",
      answer:
        "Oui. Teqa Connect s’intègre parfaitement aux CRM, ERP et systèmes personnalisés via des API et des webhooks.",
    },
    {
      question: "Quand verrai-je les premiers résultats ?",
      answer:
        "La plupart des marchands constatent des améliorations mesurables dès les premières semaines.",
    },
    {
      question: "Mes données clients sont-elles sécurisées ?",
      answer:
        "Absolument. Nous utilisons une sécurité de niveau entreprise, le chiffrement et des contrôles d’accès stricts.",
    },
    {
      question: "Quelle est votre politique de remboursement ?",
      answer:
        "Si vous annulez dans les 7 jours suivant votre premier paiement, les jours non utilisés seront remboursés au prorata.",
    },
    {
      question: "Proposez-vous un support client ?",
      answer:
        "Oui. Contactez Billing@teqa.app pour toute assistance technique ou liée à la facturation.",
    },
  ],
},

features: {
  title: "Fonctionnalités puissantes",
  subtitle:
    "Tout ce dont vous avez besoin pour réduire les retours et optimiser les opérations COD.",

  items: [
    {
      title: "Scoring de risque COD",
      description:
        "Un scoring alimenté par l’IA évalue chaque client de 0 à 100 et le classe en Risque Élevé, Risque Moyen ou Sûr.",
    },
    {
      title: "Système intelligent de confirmation des commandes",
      description:
        "Achemine automatiquement les commandes selon les règles de scoring et la priorité.",
    },
    {
      title: "Intégrations e-commerce fluides",
      description:
        "Plugins prêts à l’emploi et intégration API flexible.",
    },
    {
      title: "Détection de fraude et de spam",
      description:
        "Identifie automatiquement les commandes suspectes ou en double.",
    },
    {
      title: "Historique et profilage client",
      description:
        "Suit les livraisons passées, les retours et les notes d’interaction.",
    },
    {
      title: "Synchronisation du statut en temps réel",
      description:
        "Synchronisation instantanée avec votre boutique e-commerce.",
    },
    {
      title: "Intégrations réseaux sociaux",
      description:
        "API WhatsApp, Facebook Leads, formulaires TikTok et plus encore.",
    },
    {
      title: "Suivi des performances et surveillance des SLA",
      description:
        "Suivez les taux de confirmation et l’efficacité opérationnelle.",
    },
    {
      title: "Import et export de données en masse",
      description:
        "Importez des listes de clients et exportez facilement des analyses.",
    },
  ],
},

  howItWorks: {
  title: "Comment ça marche",
  subtitle: "Flux de travail de l’écosystème COD de bout en bout Teqa",

  steps: [
    {
      id: 1,
      title: "Création de compte et abonnement",
      description:
        "Les marchands créent leur compte Teqa et sélectionnent le plan qui correspond à leurs besoins. Les fonctionnalités sont activées instantanément selon l’abonnement choisi.",
    },
    {
      id: 2,
      title: "Intégration de la boutique",
      description:
        "Les marchands connectent leur boutique e-commerce (Shopify, WooCommerce, PrestaShop ou API personnalisée). Les commandes sont automatiquement synchronisées.",
    },
    {
      id: 3,
      title: "Connexion de la société de livraison",
      description:
        "Les marchands connectent leurs partenaires logistiques. Les règles d’expédition, zones et suivis sont configurés pour une gestion COD fluide.",
    },
    {
      id: 4,
      title: "Analyse et notation des clients",
      description:
        "Chaque commande est analysée par des algorithmes IA. Les clients reçoivent un score de risque de 0 à 100.",
    },
    {
      id: 5,
      title: "Confirmation intelligente des commandes",
      description:
        "Les commandes sont acheminées vers des centres d’appels ou équipes internes selon le score de risque et la priorité.",
    },
    {
      id: 6,
      title: "Expédition et suivi",
      description:
        "Les commandes confirmées sont envoyées automatiquement au transporteur connecté avec un suivi en temps réel.",
    },
    {
      id: 7,
      title: "Rapports et optimisation continue",
      description:
        "Les marchands accèdent à des rapports détaillés pour optimiser les opérations COD et réduire les retours.",
    },
  ],
},

  pricing: {
  title: "Tarification Simple et Transparente",
  subtitle: "Choisissez le plan adapté à votre volume COD et à vos besoins analytiques.",
  contactText: "Des questions sur la tarification ? Contactez",

  plans: [
    {
      name: "Gratuit",
      price: "0 $",
      period: "/mois",
      description: "Idéal pour découvrir Teqa",
      features: [
        "200 commandes / mois",
        "1 boutique",
        "1 membre d’équipe",
        "Analyses de base (limitées)",
        "Support email (48–72h)",
        "2 intégrations gratuites",
      ],
      cta: "Créer un compte",
      highlighted: false,
    },
    {
      name: "Starter",
      price: "55 $",
      period: "/mois",
      description: "Pour les boutiques en croissance",
      features: [
        "300 commandes / mois",
        "2 boutiques",
        "2 membres d’équipe",
        "Aperçu du succès COD & livraison",
        "Support email (24–48h)",
        "Intégrations illimitées",
      ],
      cta: "S’inscrire",
      highlighted: true,
    },
    {
      name: "Advanced",
      price: "245 $",
      period: "/mois",
      description: "Analyses avancées & performance",
      features: [
        "1 500 commandes / mois",
        "5 boutiques",
        "5 membres d’équipe",
        "Comparaison des transporteurs par ville",
        "Vitesse & fiabilité de livraison",
        "Support email + chat (12–24h)",
        "Gestionnaire de compte optionnel",
        "Intégrations illimitées",
      ],
      cta: "S’inscrire",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "680 $",
      period: "/mois",
      description: "Pour opérations COD à fort volume",
      features: [
        "5 000 commandes / mois",
        "10 boutiques",
        "15 membres d’équipe",
        "Analyses clients & paniers",
        "Fenêtres de livraison préférées",
        "Support prioritaire (4–8h)",
        "Gestionnaire de compte inclus",
        "Intégrations illimitées",
      ],
      cta: "S’inscrire",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Sur mesure",
      period: "",
      description: "Opérations à grande échelle",
      features: [
        "Commandes illimitées (Fair Use)",
        "20+ boutiques",
        "50 utilisateurs",
        "Tableaux de bord & modèles IA personnalisés",
        "Support prioritaire 24/7",
        "Gestionnaire de compte dédié",
        "Intégrations illimitées",
      ],
      cta: "Contacter les ventes",
      highlighted: false,
    },
  ],
},

  footer: {
  brand: {
    slogan:
      "Scorez. Connectez. Livrez — Votre écosystème COD de bout en bout pour des décisions d’expédition plus intelligentes.",
  },

  social: {
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    x: "X",
  },

  product: {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", path: "/Features" },
      { label: "Tarifs", path: "/Pricing" },
      { label: "Comment ça marche", path: "/How_It_Works" },
      { label: "Place de marché", path: "/Marketplace_page" },
    ],
  },

  company: {
    title: "Entreprise",
    links: [
      { label: "À propos", path: "/about" },
      { label: "Contact", path: "/Contact" },
      { label: "FAQ", path: "/faq" },
    ],
  },

  legal: {
    title: "Mentions légales & Support",
    links: [
      { label: "Politique de confidentialité", path: "/Privacy_Policy" },
      { label: "Conditions générales", path: "/Terms_And_Conditions" },
      { label: "Politique de remboursement", path: "/Refund_Policy" },
      { label: "Modes de paiement", path: "/Payment_Methods" },
      { label: "Politique de cookies", path: "/Cookie_Policy" },
    ],
  },

  contact: {
    title: "Nous contacter",
    email: "contact@teqa.app",
    sales: "sales@teqa.app",
    support: "support@teqa.app",
  },

  copyright:
    "© 2025 Teqa Connect · Av Allal Ben Abdullah · Rabat, Maroc",
},

 hero: {
  badge: "Plateforme d’Excellence COD",

  title: {
    line1: "Scorez. Connectez.",
    line2: "Livrez —",
    line3: "Vendez plus intelligemment,",
    line4: "Économisez plus.",
  },

  description:
    "Teqa Connect est un écosystème COD de bout en bout offrant des analyses de risque, une notation client et une place de marché marchand–centre d’appels.",

  cta: {
    primary: "Commencer gratuitement",
    secondary: "Demander une démo",
  },

  footerNote:
    "Aucune carte bancaire requise. Rejoignez des centaines de marchands.",
},

integrations: {
  title: "Intégrations de Plateforme",
  subtitle: "Plateformes prises en charge et intégrations à venir",

  items: [
    { name: "YouCan", colored: true },
    { name: "Shopify", colored: true },
    { name: "WooCommerce", colored: false },
    { name: "Dropify", colored: false },
    { name: "PrestaShop", colored: false },
    { name: "Zid", colored: false },
    { name: "Salla", colored: false },
  ],
},
marketplace: {
  title: "Tarification de la Marketplace Teqa",
  subtitle:
    "Payez uniquement pour les livraisons COD réussies — zéro risque pour les marchands.",

  slides: [
    {
      title: "Modèle Paiement au Succès",
      subtitle: "Aucun abonnement. Aucun frais d’installation.",
      highlight: "Payez uniquement lorsque les commandes sont livrées",
      points: [
        "Frais appliqués uniquement aux livraisons réussies",
        "Aucun coût pour les commandes annulées ou échouées",
        "Commission payée par les centres d’appels",
        "Encourage la qualité et la rapidité des confirmations",
      ],
      cta: "Commencer",
    },
    {
      title: "Plan Agent",
      subtitle: "Pour les agents freelance en centre d’appels",
      highlight: "8–10 MAD / commande livrée",
      points: [
        "Commission Teqa : 20 %",
        "1 000–3 000 commandes → 18 %",
        "3 000+ commandes → 15 %",
        "Paiement uniquement sur commandes livrées",
      ],
      cta: "Rejoindre comme agent",
    },
    {
      title: "Plan Entreprise",
      subtitle: "Pour les sociétés de centres d’appels",
      highlight: "8–10 MAD / commande livrée",
      points: [
        "Commission Teqa : 15 %",
        "5 000–15 000 commandes → 12 %",
        "15 000+ commandes → 10 %",
        "Volume élevé = meilleures marges",
      ],
      cta: "Postuler comme entreprise",
    },
  ],
},
marketplaceOverview: {
  badge: "Marketplace Teqa",

  title: "Le pont intelligent entre marchands et centres d’appels",
  subtitle:
    "Une seule marketplace. Des confirmations COD fiables. De meilleurs résultats de livraison.",

  intro: {
    title: "Qu’est-ce que la Marketplace Teqa ?",
    paragraphs: [
      "La Marketplace Teqa est une plateforme intégrée à l’écosystème Teqa qui connecte les marchands e-commerce à des centres d’appels vérifiés dans un environnement sécurisé et basé sur les données.",
      "Elle permet une collaboration transparente, une attribution des commandes basée sur la performance et une intelligence partagée pour réduire les risques COD et améliorer les taux de livraison.",
    ],
  },

  benefits: [
    "Centres d’appels vérifiés et notés selon leurs performances",
    "Distribution intelligente des commandes selon le risque, la localisation et la langue",
    "Confirmation et suivi en temps réel",
  ],

  steps: [
    {
      title: "Intégration et vérification des partenaires",
      description:
        "Les centres d’appels sont vérifiés selon leur historique de performance, leur capacité et la qualité de service.",
    },
    {
      title: "Distribution intelligente des commandes",
      description:
        "Les commandes sont attribuées selon le score de risque, la disponibilité et les performances passées.",
    },
    {
      title: "Confirmation en temps réel",
      description:
        "Les centres d’appels confirment les commandes pendant que les marchands suivent l’avancement instantanément.",
    },
    {
      title: "Notation des performances",
      description:
        "Les centres d’appels sont classés selon le taux de confirmation, la rapidité et la précision.",
    },
  ],

  cta: {
    merchant: "Créer un compte marchand",
    partner: "Postuler comme centre d’appels",
  },
},
navbar: {
  links: [
    { label: "Fonctionnalités", path: "/features" },
    { label: "Comment ça marche", path: "/How_It_Works" },
    { label: "Tarifs", path: "/pricing" },
    { label: "FAQ", path: "/faq" },
  ],

  auth: {
    login: "Connexion",
    signup: "S’inscrire",
    getStarted: "Commencer",
  },
},
testimonials: {
  title: "Ce que disent nos marchands",
  subtitle:
    "Rejoignez des centaines d’entreprises e-commerce qui économisent déjà avec Teqa Connect",

  items: [
    {
      quote:
        "Teqa Connect a réduit notre taux de retour de 40 % en seulement deux mois. Le scoring IA est incroyablement précis.",
      name: "Ahmed Hassan",
      role: "Responsable e-commerce chez Fashion Retail",
      location: "Maroc",
      avatar: "https://i.pravatar.cc/100?img=12",
    },
    {
      quote:
        "Nous avons intégré Teqa en moins d’une heure. Le système intelligent de confirmation a transformé notre flux COD.",
      name: "Fatima Bennani",
      role: "Directrice des opérations chez Electronics Hub",
      avatar: "https://i.pravatar.cc/100?img=32",
    },
    {
      quote:
        "Simple à utiliser, résultats puissants. Teqa Connect est devenu essentiel à nos opérations.",
      name: "Mohammed Karim",
      role: "Propriétaire de boutique chez Premium Shop",
      avatar: "https://i.pravatar.cc/100?img=48",
    },
  ],
},
whyChoose: {
  title: "Pourquoi choisir Teqa Connect",
  subtitle:
    "Protégez votre activité, prenez des décisions plus intelligentes et intégrez-vous facilement.",

  reasons: [
    {
      title: "Analyses de risque",
      description:
        "Comprenez les risques potentiels avant d’accepter des commandes COD et prenez des décisions basées sur les données.",
    },
    {
      title: "Notation client",
      description:
        "Évaluez la fiabilité des clients selon leur comportement d’achat et les résultats de livraison.",
    },
    {
      title: "Marketplace Marchand–Centre d’Appels",
      description:
        "Connectez-vous à des centres d’appels et partenaires de livraison vérifiés pour simplifier vos opérations COD.",
    },
  ],
},

// pages/accueil/Accueil/////
about: {
  header: {
    title: "À propos de Teqa Connect",
    subtitle:
      "Révolutionner le <strong>Paiement à la Livraison</strong> grâce à l’intelligence des données et aux outils décisionnels basés sur l’IA.",
  },

  intro:
    "Teqa Connect est conçu pour les marchands modernes opérant dans des environnements COD à haut risque. Nous combinons des analyses de risque avancées, une notation de fiabilité client et une marketplace marchand–centre d’appels de confiance afin de réduire les pertes, optimiser les opérations et renforcer la confiance des clients.",

  mission: {
    title: "Notre mission",
    text:
      "Nous allons au-delà des plateformes CRM traditionnelles. Teqa Connect fournit aux marchands des insights exploitables, un scoring prédictif et une automatisation intelligente pour prendre des décisions plus sûres, réduire les échecs COD et évoluer en toute confiance.",
    codeExample: {
      approve: "approuverCOD();",
      verify: "vérifierAvecCentreAppels();",
    },
  },

  offer: {
    title: "Ce que nous offrons",
    items: [
      {
        title: "Analyses de risque",
        text:
          "Détectez les fraudes et les commandes à haut risque avant confirmation grâce à des modèles de risque basés sur les données.",
      },
      {
        title: "Notation client",
        text:
          "Évaluez la fiabilité des clients selon leur historique de comportement et les résultats de livraison.",
      },
      {
        title: "Marketplace Marchand–Centre d’Appels",
        text:
          "Collaborez avec des centres d’appels et partenaires de livraison vérifiés au sein d’un écosystème unique.",
      },
    ],
  },

  whyChoose: {
    title: "Pourquoi choisir Teqa Connect",
    points: [
      "Protégez votre activité contre les transactions frauduleuses ou à haut risque",
      "Prenez des décisions plus intelligentes grâce aux analyses alimentées par l’IA",
      "Intégrez-vous facilement à tout CRM ou plateforme e-commerce",
      "Opérez avec conformité, transparence et confiance",
    ],
  },

  commitment: {
    title: "Notre engagement",
    text:
      "La sécurité, la transparence et l’utilisation éthique des données sont au cœur de Teqa Connect. Les données clients ne sont jamais vendues à des tiers et sont utilisées exclusivement pour améliorer les performances COD. Bien que nos algorithmes soient hautement fiables, des facteurs externes tels que la livraison ou des erreurs marchandes peuvent occasionnellement influencer les résultats.",
  },

  contact: {
    title: "Contactez-nous",
    subtitle: "Vous souhaitez en savoir plus sur Teqa Connect ?",
    email: "contact@teqa.app",
    website: "https://www.teqa.app",
  },
},
contactPage: {
  hero: {
    title: "Contacter Teqa",
    subtitle:
      "Vous avez des questions ou besoin d’assistance ? Nous sommes là pour vous aider à développer votre activité e-commerce.",
  },

  info: {
    title: "Informations de contact",
    emails: {
      general: "Demandes générales",
      sales: "Ventes",
      support: "Support",
      billing: "Facturation",
      privacy: "Confidentialité",
    },
    addressTitle: "Adresse",
    address: "Av. Allal Ben Abdullah\nRabat – Maroc",
    follow: "Suivez-nous",
  },

  form: {
    title: "Envoyez-nous un message",
    name: "Votre nom",
    email: "Votre email",
    message: "Votre message",
    submit: "Envoyer le message",
  },
},
cookiePolicy: {
  header: {
    title: "Politique de Cookies de Teqa Connect",
    updated: "Dernière mise à jour : 2 décembre 2025",
  },

  intro: {
    title: "Introduction",
    text:
      "Chez <strong>Teqa Connect</strong>, accessible à l’adresse https://www.teqa.app, nous utilisons des cookies et des technologies similaires afin d’améliorer l’expérience utilisateur, optimiser nos services et comprendre l’utilisation de la plateforme.",
  },

  whatAreCookies: {
    title: "1. Que sont les cookies",
    text:
      "Les cookies sont de petits fichiers texte stockés sur votre appareil par votre navigateur. Ils permettent de mémoriser vos préférences, analyser l’utilisation et offrir une expérience plus fluide et personnalisée. Les cookies peuvent être temporaires ou persistants.",
  },

  types: {
    title: "2. Types de cookies que nous utilisons",
    sections: {
      essential: {
        title: "Cookies essentiels",
        items: [
          "Permettent la connexion, la gestion des sessions et la sécurité",
          "Ne peuvent pas être désactivés sans affecter le fonctionnement de la plateforme",
        ],
      },
      analytics: {
        title: "Cookies de performance et d’analyse",
        items: [
          "Suivent les pages visitées, les habitudes d’utilisation et les erreurs",
          "Aident à améliorer les performances et l’expérience utilisateur",
        ],
      },
      functional: {
        title: "Cookies fonctionnels",
        items: [
          "Enregistrent les préférences telles que la langue et l’interface",
          "Permettent une expérience plus personnalisée",
        ],
      },
      thirdParty: {
        title: "Cookies tiers",
        items: [
          "Utilisés pour l’analyse, le marketing ou les intégrations",
          "Soumis aux politiques de confidentialité des tiers",
        ],
      },
    },
  },

  usage: {
    title: "3. Utilisation des cookies",
    items: [
      "Exploiter et améliorer les services Teqa Connect",
      "Analyser les performances et l’utilisation de la plateforme",
      "Personnaliser l’expérience utilisateur",
      "Détecter la fraude ou les accès non autorisés",
      "Mesurer l’efficacité marketing",
    ],
  },

  choices: {
    title: "4. Vos choix en matière de cookies",
    items: [
      "Gérer ou désactiver les cookies via les paramètres du navigateur",
      "Le blocage des cookies essentiels peut limiter certaines fonctionnalités",
      "La désactivation des cookies analytiques peut réduire la personnalisation",
    ],
    browsers: "Navigateurs : Google Chrome · Mozilla Firefox · Apple Safari",
  },

  consent: {
    title: "5. Consentement",
    text:
      "En utilisant Teqa Connect, vous consentez à l’utilisation des cookies conformément à cette politique. Vous pouvez retirer votre consentement à tout moment en modifiant les paramètres de votre navigateur.",
  },

  contact: {
    title: "6. Nous contacter",
    text:
      "Pour toute question concernant cette politique de cookies, contactez-nous à :",
    email: "support@teqa.app",
    website: "https://www.teqa.app",
  },
},
faqPage: {
  title: "Teqa Connect — FAQ",
  subtitle:
    "Réponses aux questions fréquentes sur les abonnements, les commandes, les analyses et la sécurité.",

  sections: [
    {
      title: "Abonnements & Forfaits",
      items: [
        {
          q: "Puis-je changer de forfait à tout moment ?",
          a: "Oui, vous pouvez changer de forfait à tout moment. Les modifications en cours de cycle sont calculées au prorata.",
        },
        {
          q: "Les réductions s’appliquent-elles aux frais de dépassement ?",
          a: "Non, les réductions s’appliquent uniquement à l’abonnement de base.",
        },
        {
          q: "Comment passer du forfait Gratuit à un forfait payant ?",
          a: "Connectez-vous, sélectionnez le forfait souhaité et procédez au paiement.",
        },
        {
          q: "Y a-t-il des frais d’installation ?",
          a: "Non, Teqa Connect ne facture aucun frais d’installation.",
        },
        {
          q: "Puis-je suspendre mon abonnement ?",
          a: "Les abonnements ne peuvent pas être suspendus mais peuvent être annulés à tout moment.",
        },
        {
          q: "Comment les commandes supplémentaires sont-elles facturées ?",
          a: "Les commandes supplémentaires sont facturées selon les tarifs de dépassement du forfait.",
        },
        {
          q: "Puis-je ajouter des membres d’équipe ?",
          a: "Oui, chaque forfait permet d’ajouter des utilisateurs supplémentaires.",
        },
        {
          q: "Le forfait Gratuit permet-il plusieurs boutiques ?",
          a: "Non, le forfait Gratuit prend en charge une seule boutique.",
        },
        {
          q: "Comment rétrograder mon forfait ?",
          a: "Vous pouvez rétrograder à tout moment ; les nouveaux plafonds s’appliquent au cycle suivant.",
        },
        {
          q: "Les forfaits annuels ou trimestriels sont-ils remboursables ?",
          a: "Les remboursements sont soumis aux conditions contractuelles.",
        },
      ],
    },

    {
      title: "Commandes & Paiement à la Livraison (COD)",
      items: [
        {
          q: "Qu’est-ce qu’une commande reçue ?",
          a: "Une commande est considérée comme reçue lorsque le paiement COD est collecté et confirmé par le transporteur.",
        },
        {
          q: "Que se passe-t-il si une livraison est annulée ?",
          a: "Les commandes annulées avant la livraison ne sont pas comptabilisées.",
        },
        {
          q: "Puis-je suivre les commandes en temps réel ?",
          a: "Oui, le suivi en temps réel est disponible dans le tableau de bord.",
        },
        {
          q: "Teqa gère-t-il les remboursements clients ?",
          a: "Non, les remboursements sont gérés directement par le marchand.",
        },
        {
          q: "Les commandes retournées sont-elles incluses dans les analyses ?",
          a: "Oui, les taux de retour sont inclus dans les analyses avancées.",
        },
      ],
    },

    {
      title: "Analyses & Scoring",
      items: [
        {
          q: "Quelles métriques sont incluses dans les analyses avancées ?",
          a: "Comportement client, fenêtres de livraison, performance des transporteurs et taux de retour.",
        },
        {
          q: "Le scoring client est-il fiable à 100 % ?",
          a: "Non, la précision dépend de la qualité des données fournies.",
        },
        {
          q: "Puis-je exporter les analyses ?",
          a: "Oui, les rapports peuvent être exportés en CSV ou PDF.",
        },
        {
          q: "Puis-je segmenter les analyses ?",
          a: "Oui, par boutique, ville ou quartier.",
        },
      ],
    },

    {
      title: "Intégrations & API",
      items: [
        {
          q: "Quelles plateformes sont prises en charge ?",
          a: "WooCommerce, Shopify, YouCan et boutiques personnalisées via API.",
        },
        {
          q: "La documentation API est-elle disponible ?",
          a: "Oui, après inscription.",
        },
        {
          q: "Puis-je tester l’API ?",
          a: "Oui, des environnements sandbox sont fournis.",
        },
        {
          q: "Les intégrations personnalisées sont-elles possibles ?",
          a: "Oui, pour les forfaits Enterprise.",
        },
      ],
    },

    {
      title: "Sécurité & Confidentialité",
      items: [
        {
          q: "Comment Teqa protège-t-il les données ?",
          a: "Toutes les données sont chiffrées et stockées de manière sécurisée.",
        },
        {
          q: "Teqa vend-il les données clients ?",
          a: "Non, les données clients ne sont jamais vendues.",
        },
        {
          q: "Teqa est-il conforme au RGPD ?",
          a: "Oui, Teqa respecte les normes internationales de protection des données.",
        },
      ],
    },
  ],
},
featuresPage: {
  hero: {
    title: "Fonctionnalités de Teqa Connect",
    subtitle:
      "Tout ce dont vous avez besoin pour réduire les risques COD, automatiser les confirmations et faire évoluer vos opérations en toute confiance.",
  },

  items: [
    {
      title: "Scoring de Risque COD",
      desc:
        "Un scoring alimenté par l’IA évalue chaque client de 0 à 100 et le classe comme Risque Élevé, Moyen ou Sûr. Les marchands peuvent demander un prépaiement, signaler les commandes risquées ou prioriser les commandes sûres.",
    },
    {
      title: "Tableau de Bord d’Analyses Avancées",
      desc:
        "Vue comportementale complète incluant transporteurs préférés, catégories fréquemment commandées, créneaux de livraison recommandés et retours d’autres marchands. Inclut une vérification WhatsApp instantanée.",
    },
    {
      title: "Système Intelligent de Confirmation",
      desc:
        "Acheminement automatique des commandes vers des centres d’appels ou équipes internes selon le scoring et la priorité, avec notifications, suivi et surveillance des SLA.",
    },
    {
      title: "Place de Marché Marchand–Centre d’Appels",
      desc:
        "Connexion avec des centres d’appels vérifiés via une place de marché transparente avec notations de performance, suivi SLA et gestion collaborative des risques.",
    },
    {
      title: "Intégrations E-commerce Fluides",
      desc:
        "Plugins prêts à l’emploi pour Shopify, WooCommerce, YouCan, Dropify, Prestashop, Zid et Salla, ainsi qu’une API flexible avec synchronisation complète des données.",
    },
    {
      title: "Détection de Fraude et Spam",
      desc:
        "Détection automatique des comportements suspects, commandes en double, faux comptes et schémas anormaux.",
    },
    {
      title: "Règles Automatisées & Webhooks",
      desc:
        "Configuration de règles intelligentes pour annuler automatiquement les commandes risquées, déclencher des appels ou vérifications WhatsApp.",
    },
    {
      title: "Tableaux de Bord Multi-Rôles",
      desc:
        "Tableaux dédiés pour Marchands, Centres d’Appels et Administrateurs pour gérer commandes, confirmations, analyses et performances.",
    },
    {
      title: "Historique & Profilage Client",
      desc:
        "Création de profils clients détaillés incluant livraisons passées, retours et interactions afin d’améliorer la prédiction des risques.",
    },
    {
      title: "Synchronisation en Temps Réel",
      desc:
        "Toutes les mises à jour de statut sont instantanément synchronisées avec la boutique e-commerce.",
    },
    {
      title: "Intégrations Réseaux Sociaux",
      desc:
        "Support natif de WhatsApp API, Facebook Leads, TikTok Forms et Google Sheets.",
    },
    {
      title: "Suivi de Performance & SLA",
      desc:
        "Suivi des temps de réponse, taux de confirmation et qualité de service des centres d’appels.",
    },
    {
      title: "Import & Export de Données",
      desc:
        "Importation de listes clients, exportation des analyses et synchronisation des données entre systèmes.",
    },
  ],

  cta: {
    title: "Prêt à sécuriser vos opérations COD ?",
    text:
      "Utilisez Teqa Connect pour réduire la fraude, améliorer les livraisons et prendre de meilleures décisions grâce à l’IA.",
    button: "Commencer",
  },
},
howItWorksPage: {
  hero: {
    title: "Comment fonctionne Teqa",
    subtitle:
      "Un écosystème Paiement à la Livraison de bout en bout conçu pour réduire les risques, automatiser les confirmations et optimiser les performances.",
  },

  steps: [
    {
      id: 1,
      title: "Création de compte & abonnement",
      description:
        "Les marchands créent leur compte Teqa et choisissent le forfait adapté à leurs besoins. Les fonctionnalités sont activées instantanément selon le plan choisi.",
    },
    {
      id: 2,
      title: "Intégration de la boutique",
      description:
        "Connexion de la boutique e-commerce (Shopify, WooCommerce, PrestaShop ou API personnalisée). Les commandes sont automatiquement synchronisées.",
    },
    {
      id: 3,
      title: "Connexion du transporteur",
      description:
        "Les marchands connectent leurs sociétés de transport. Les règles d’expédition, zones et suivis sont configurés pour une livraison COD fluide.",
    },
    {
      id: 4,
      title: "Analyse et scoring des clients",
      description:
        "Chaque commande est analysée par des algorithmes IA. Les clients reçoivent un score de risque de 0 à 100.",
    },
    {
      id: 5,
      title: "Confirmation intelligente des commandes",
      description:
        "Les commandes sont attribuées aux centres d’appels ou équipes internes selon le score et la priorité, avec suivi en temps réel.",
    },
    {
      id: 6,
      title: "Expédition et suivi",
      description:
        "Les commandes confirmées sont envoyées automatiquement au transporteur. Le statut de livraison est suivi en temps réel.",
    },
    {
      id: 7,
      title: "Rapports et optimisation continue",
      description:
        "Accès à des rapports détaillés sur les performances, la fiabilité client et l’efficacité des centres d’appels.",
    },
  ],

  contact: {
    title: "Informations de contact",
    general: "Général",
    sales: "Ventes",
    support: "Support",
    addressLabel: "Adresse",
    address: "Av. Allal Ben Abdullah\nRabat – Maroc",
    follow: "Suivez-nous & En savoir plus",
    blog: "Blog",
  },
},
marketplacePage: {
  hero: {
    title: "Une seule marketplace. Des confirmations COD fiables.",
    subtitle: "De meilleurs résultats de livraison.",
    description:
      "Teqa Marketplace connecte les marchands e-commerce avec des centres d’appels vérifiés pour confirmer les commandes Paiement à la Livraison et réduire les retours.",
    merchantCta: "Démarrer avec Teqa Marketplace",
    partnerCta: "Rejoindre en tant que centre d’appels",
  },

  finalCta: {
    title: "Commencez à réduire les risques COD dès aujourd’hui",
    description:
      "Rejoignez Teqa Marketplace et collaborez avec des partenaires de confiance pour améliorer vos livraisons.",
    merchant: "Créer un compte marchand",
    partner: "Postuler en tant que centre d’appels",
  },
},
paymentMethods: {
  title: "Modes de paiement",
  subtitle:
    "Des options de paiement sécurisées, flexibles et pratiques pour les marchands Teqa Connect.",

  sections: {
    cards: {
      title: "1. Cartes bancaires",
      items: ["Visa", "Mastercard"],
      note:
        "Les paiements sont traités via une passerelle de paiement sécurisée et conforme PCI.",
    },

    transfers: {
      title: "2. Virements bancaires",
      items: ["Virements bancaires internationaux", "Virements bancaires locaux"],
      note:
        "Le délai de traitement est généralement de 1 à 3 jours ouvrables. Veuillez inclure votre identifiant de compte ou numéro de facture pour un crédit précis et rapide.",
    },

    agencies: {
      title: "3. Agences de transfert d’argent",
      items: ["Cash Plus", "Wafa Cash", "Western Union"],
      note:
        "Indiquez toujours votre identifiant de compte Teqa lors du transfert afin d’assurer une affectation correcte.",
    },

    crypto: {
      title: "4. Paiements en crypto-monnaie",
      items: ["USDT (Tether)"],
      note:
        "Les paiements en crypto sont acceptés via notre passerelle sécurisée. Indiquez votre identifiant de compte dans la note de transaction.",
    },

    billing: {
      title: "Facturation & politiques",
      items: [
        "Fréquence d’abonnement : Mensuelle, Trimestrielle ou Annuelle",
        "Tous les paiements sont traités en USD",
        "Les prix n’incluent pas les taxes applicables sauf indication contraire",
        "Les remboursements et frais supplémentaires suivent la politique de remboursement",
      ],
    },

    security: {
      title: "Sécurité",
      text:
        "Tous les moyens de paiement sont protégés par un chiffrement conforme aux normes de l’industrie afin de sécuriser vos données financières.",
    },

    help: {
      title: "Besoin d’aide pour le paiement ?",
      text:
        "Pour toute question liée à la facturation ou au paiement, contactez notre équipe à",
      email: "Billing@teqa.app",
    },
  },
},
pricing: {
  title: "Tarifs Teqa Connect",
  subtitle:
    "Choisissez le plan adapté à votre volume de commandes et à vos besoins analytiques. Modifiez à tout moment.",
  discounts: "Trimestriel : −15 % · Annuel : −20 %",

  plans: [
    {
      name: "Gratuit",
      price: "$0/mois",
      highlight: false,
      features: [
        "Jusqu’à 200 commandes / mois",
        "1 boutique",
        "1 membre d’équipe",
        "Analyses de base (limitées)",
        "Support email (48–72h)",
        "Aucun gestionnaire de compte",
        "2 intégrations gratuites",
      ],
      cta: "Inscription gratuite",
    },
    {
      name: "Starter",
      price: "$55/mois",
      highlight: false,
      features: [
        "Jusqu’à 300 commandes / mois",
        "Dépassement : $0.41 (1–200), $0.55 (201+)",
        "2 boutiques",
        "2 utilisateurs inclus (+$4.10/utilisateur)",
        "Analyses d’expédition par ville / zone",
        "Support email (24–48h)",
        "Intégrations illimitées",
      ],
      cta: "S’inscrire",
    },
    {
      name: "Advanced",
      price: "$245/mois",
      highlight: true,
      features: [
        "Jusqu’à 1 500 commandes / mois",
        "Dépassement : $0.33 (1–1 000), $0.41 (1 001+)",
        "5 boutiques",
        "5 utilisateurs inclus (+$3.30/utilisateur)",
        "Comparaison des transporteurs & analyses régionales",
        "Support email + chat (12–24h)",
        "Gestionnaire de compte optionnel ($82/mois)",
        "Intégrations illimitées",
      ],
      cta: "S’inscrire",
    },
    {
      name: "Professionnel",
      price: "$680/mois",
      highlight: false,
      features: [
        "Jusqu’à 5 000 commandes / mois",
        "Dépassement : $0.25 (1–3 000), $0.33 (3 001+)",
        "10 boutiques",
        "15 utilisateurs inclus (+$2.73/utilisateur)",
        "Analyses avancées des clients COD",
        "Support prioritaire (SLA 4–8h)",
        "Gestionnaire de compte inclus",
        "Module OMS (+$300/mois)",
        "Intégrations illimitées",
      ],
      cta: "S’inscrire",
    },
    {
      name: "Entreprise",
      price: "Sur mesure",
      highlight: false,
      features: [
        "Commandes personnalisées ou illimitées (fair use)",
        "Tarifs de dépassement négociés",
        "20+ boutiques",
        "Jusqu’à 50 utilisateurs inclus (+$2.18/utilisateur)",
        "Tableaux de bord personnalisés & analyses prédictives",
        "Support prioritaire 24/7 avec SLA",
        "Gestionnaire de compte dédié",
        "Module OMS (+$300/mois)",
        "Intégrations illimitées",
      ],
      cta: "Contacter les ventes",
    },
  ],

  billing: {
    title: "Facturation & politiques",
    items: [
      "Les changements de plan sont proratisés en cours de cycle",
      "Remboursements selon contrat ; frais de dépassement non remboursables",
      "Alertes d’utilisation à 80 % et 100 % des limites",
      "Les prix n’incluent pas les taxes applicables sauf indication contraire",
    ],
  },

  addons: {
    title: "Options supplémentaires",
    items: [
      "Intégration OMS personnalisée (+$300/mois)",
      "Rapports d’analyses avancées (sur demande)",
      "Support dédié ou formation",
    ],
  },
},
privacy: {
  title: "Teqa Connect Privacy Policy",
  lastReviewed: "Last reviewed",

  sections: [
    {
      title: "Introduction",
      paragraphs: [
        "At Teqa Connect, accessible from https://www.teqa.app, your privacy is a top priority. This Privacy Policy explains what data we collect, how we use it, and how we protect it.",
      ],
      contact: "Billing@teqa.app",
    },
    {
      title: "1. About Teqa Connect",
      list: [
        "Risk analytics",
        "AI-powered customer scoring",
        "Merchant–delivery–call center marketplace",
      ],
    },
    {
      title: "2. Information We Collect",
      blocks: [
        {
          title: "Information you provide:",
          list: [
            "Contact and account details",
            "Billing information",
            "COD transaction data",
          ],
        },
        {
          title: "Automatically collected:",
          list: [
            "Usage logs and IP address",
            "Device and browser metadata",
            "Aggregated scoring metrics",
          ],
        },
      ],
      note: "Important: We do not sell personal data to third parties.",
    },
    {
      title: "3. How We Use Information",
      list: [
        "Operate and improve Teqa Connect",
        "Generate COD scoring and analytics",
        "Enable secure merchant collaboration",
        "Prevent fraud and misuse",
      ],
    },
    {
      title: "4. Sharing & Third Parties",
      list: [
        "No sharing of personal customer data between merchants",
        "Trusted providers under strict contracts",
        "Legal or security-based disclosure if required",
      ],
    },
    {
      title: "5. Data Retention & Deletion",
      list: [
        "Data retained only as long as necessary",
        "Deletion requests via privacy@teqa.app",
        "Data deleted or anonymized per law",
      ],
    },
    {
      title: "6. Security",
      list: [
        "TLS encryption",
        "Role-based access control",
        "Regular security audits",
      ],
      disclaimer: "No system can guarantee absolute security.",
    },
    {
      title: "7–12. Additional Policies",
      paragraphs: [
        "This includes user controls, cookies, children’s privacy, policy scope, consent, and future updates as outlined in this document.",
      ],
    },
  ],
},
refund: {
  title: "Politique de remboursement Teqa Connect",
  lastUpdated: "Dernière mise à jour",

  sections: [
    {
      title: "Introduction",
      paragraphs: [
        "Chez Teqa Connect, nous proposons une plateforme avancée d’analyse des risques COD, de scoring client et de gestion de marketplace. Nous nous engageons à la transparence et à l’équité dans toutes nos pratiques de facturation et de remboursement.",
      ],
    },
    {
      title: "1. Remboursements (7 premiers jours – premier paiement mensuel uniquement)",
      paragraphs: [
        "Si vous annulez dans les 7 jours calendaires suivant votre premier paiement mensuel, nous rembourserons la partie non utilisée du cycle de facturation sur une base proratisée.",
      ],
      formula:
        "(Frais mensuels ÷ nombre total de jours du cycle) × jours non utilisés",
      exclusionsTitle: "Exclusions :",
      exclusions: [
        "Renouvellements ou paiements d’abonnement ultérieurs",
        "Modules, mises à niveau ou frais basés sur l’utilisation",
        "Services déjà livrés ou activés",
      ],
      request:
        "Comment demander un remboursement : envoyez un email à Billing@teqa.app depuis votre adresse enregistrée avec votre identifiant de compte avant la fin du délai de 7 jours. Les remboursements approuvés sont traités sous 5 à 10 jours ouvrables.",
    },
    {
      title: "2. Facturation & renouvellements",
      list: [
        "Tous les abonnements sont facturés intégralement à l’achat",
        "Les plans se renouvellent automatiquement sauf annulation préalable",
        "Les clients sont responsables de la gestion des annulations",
        "Les paiements sont définitifs sauf éligibilité au remboursement des 7 premiers jours",
      ],
    },
    {
      title: "3. Support & assistance",
      paragraphs: [
        "Pour toute question liée à la facturation ou au support technique, veuillez contacter notre équipe à Billing@teqa.app.",
      ],
    },
    {
      title: "4. Acceptation de la politique",
      paragraphs: [
        "En vous abonnant à Teqa Connect, vous reconnaissez avoir lu et accepté cette politique de remboursement. Si vous n’êtes pas d’accord, veuillez ne pas procéder à l’achat.",
      ],
      note:
        "Important : les remboursements en dehors des conditions indiquées ne sont pas garantis.",
    },
  ],
},
terms: {
  title: "Conditions générales de Teqa Connect",
  lastReviewed: "Dernière révision",

  sections: [
    {
      title: "Introduction",
      paragraphs: [
        "Bienvenue sur Teqa Connect. Les présentes conditions générales régissent l’utilisation de notre plateforme accessible à l’adresse https://www.teqa.app. En utilisant Teqa Connect, vous acceptez ces conditions.",
        "Nous nous réservons le droit de modifier ces conditions à tout moment. L’utilisation continue vaut acceptation des conditions mises à jour.",
      ],
    },
    {
      title: "Définitions",
      list: [
        "Client / Vous : commerçant ou entreprise utilisant Teqa Connect",
        "Teqa / Nous : Teqa Connect et ses filiales",
        "Parties : le Client et Teqa Connect collectivement",
      ],
    },
    {
      title: "1. Utilisation de la plateforme",
      list: [
        "Le respect des lois marocaines et applicables est obligatoire",
        "La plateforme fournit des outils d’analyse COD, de scoring et de marketplace",
        "Tout abus, fraude ou manipulation peut entraîner une résiliation",
      ],
    },
    {
      title: "2. Produits & services interdits",
      paragraphs: [
        "Teqa Connect applique des pratiques commerciales éthiques et conformes à la loi.",
      ],
      grid: [
        "Services financiers à intérêt",
        "Compagnies d’assurance",
        "Jeux d’argent et paris",
        "Alcool et produits à base de porc",
        "Contenu pour adultes",
        "Tabac et drogues",
        "Armes et commerce d’armes",
        "Systèmes pyramidaux / MLM",
        "Modèles commerciaux frauduleux",
      ],
      note:
        "Application : toute violation entraîne une suspension ou résiliation immédiate.",
    },
    {
      title: "3. Scoring client & manipulation",
      list: [
        "Le scoring basé sur l’IA aide à l’évaluation des risques",
        "Les abus des commerçants peuvent affecter les scores clients",
        "Teqa Connect se réserve le droit d’enquêter sur les abus",
      ],
    },
    {
      title: "4. Résiliation de compte",
      paragraphs: [
        "Tout compte enfreignant ces conditions peut être suspendu ou résilié sans préavis afin de protéger la plateforme et ses utilisateurs.",
      ],
    },
    {
      title: "5. Propriété intellectuelle",
      list: [
        "Tout le contenu de la plateforme appartient à Teqa Connect",
        "L’utilisation est limitée à des fins professionnelles autorisées",
        "Toute redistribution non autorisée est interdite",
      ],
    },
    {
      title: "6. Exclusion de responsabilité",
      list: [
        "Les services sont fournis « en l’état »",
        "Aucune garantie d’exactitude à 100 % des analyses",
        "Responsabilité limitée dans la mesure permise par la loi",
      ],
    },
    {
      title: "7. Cookies & suivi",
      paragraphs: [
        "Les cookies améliorent l’expérience utilisateur et l’analyse. Leur désactivation peut limiter certaines fonctionnalités.",
      ],
    },
    {
      title: "8. Politique des médias",
      paragraphs: [
        "Tout contenu inapproprié peut être supprimé. Les violations répétées entraînent une suspension.",
      ],
    },
    {
      title: "9. Mise à jour des conditions",
      paragraphs: [
        "Les conditions peuvent être mises à jour à tout moment. L’utilisation continue vaut acceptation.",
      ],
      note:
        "Important : si vous n’acceptez pas ces conditions, cessez immédiatement d’utiliser Teqa Connect.",
    },
  ],
},

};
