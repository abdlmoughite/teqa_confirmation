export default {
  common: {
    back: "Back",
    continue: "Continue",
    submit: "Submit",
    loading: "Loading...",
    field_required: "This field is required",
    success: "Success",
    save: "Save",
    next: "Next",
    previous: "Previous",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    error: "An error occurred",
    checking: "Checking…",
    home: "Home",
    go_home: "Back to home",

    morocco: "Morocco",
    france: "France",
    tunisia: "Tunisia",
    algeria: "Algeria",
    belgium: "Belgium",
    canada: "Canada",
    switzerland: "Switzerland",

    select: "Select",
    country: "Country",
  },

  auth: {
    account_info: "Account information",
    email: "Email",
    email_placeholder: "example@mail.com",
    email_invalid: "Invalid email address",
    email_taken: "Email already used",
    email_available: "Email available",
    required: "This field is required",

    username: "Username",
    username_placeholder: "Your username",
    username_taken: "Username already taken",

    password: "Password",
    password_min: "Minimum 8 characters",
    password_uppercase: "Requires an uppercase letter",
    password_lowercase: "Requires a lowercase letter",
    password_number: "Requires a number",
    password_special: "Requires a special character",

    country: "Country",

    account_type: "Account type",
    select: "Select...",
    role_store: "Store",
    role_agency_owner: "Agency owner",
    role_agency_agent: "Agent",

    pass_min: "Minimum 8 characters",
    pass_upper: "At least one uppercase letter",
    pass_digit: "At least one digit",
    pass_special: "At least one special character",
    checking: "Checking...",
  },

  register: {
    success_title: "Registration successful!",
    success_message: "Your account has been created successfully.",
    redirecting: "Redirecting in",
    go_to_login: "Go to login now",
    step: "Step",
    of: "of",
    have_account: "Already have an account?",
    login_here: "Sign in here",
    title: "Create an account",
    subtitle: "Join our platform in a few steps",

    step1_title: "Account information",
    step1_subtitle: "Enter your details to continue",
    step_progress: "Step 1 of 3",

    account_type: "Account type",
    select_role: "Please choose an account type",

    role_store: "Store",
    role_agency_owner: "Agency owner",
    role_agency_agent: "Agency agent",

    fix_errors: "Please correct the invalid fields.",
    success: "Account created successfully!",
    can_login_now: "You can now log in.",
    success_description:
      "Your account has been created successfully. All information has been saved.",
    validation_failed:
      "Registration could not be validated. Please correct the fields below.",
  },

  store: {
    title: "Store information",
    name: "Store name",
    activity: "Business sector",
    address: "Store address",
    available: "Name available ✓",
    errors: {
      required: "This field is required",
      exists: "This name is already taken",
      too_short: "The name must contain at least 3 characters",
      check_failed: "Verification failed",
    },
  },

  agency: {
    title: "Agency information",
    name: "Agency name",
    industry: "Industry",
    verification_file: "Verification document",
    submit: "Create my agency",
    taken: "Name already taken",
  },

  agent: {
    title: "Agent information",
    first_name: "First name",
    last_name: "Last name",
    bio: "Biography",
    skills: "Skills",
    submit: "Create my profile",
  },

  home: {
    title: "Welcome to",
    subtitle: "A modern platform to easily manage your services.",
    login: "Log in",
    register: "Create an account",
  },

  auth_login: {
    login_title: "Login",
    email: "Email",
    password: "Password",
    login_btn: "Sign in",
    forgot_password: "Forgot password?",
    create_account: "Create an account",
    invalid_credentials: "Invalid email or password.",

    errors: {
      unauthorized: "Unauthorized access.",
      forbidden: "Your account is disabled.",
      not_found: "No matching account found.",
      too_many_requests: "Too many attempts, please try again later.",
      server: "Internal server error.",
      unknown: "An unknown error occurred.",
    },
  },

  reset: {
    request_title: "Reset password",
    send_link: "Send reset link",
    email_sent: "If the email exists, a link has been sent.",
    required: "This field is required",
    confirm_title: "Password reset",
    new_password: "New password",
    confirm_button: "Confirm",
    success: "Password reset successfully!",
    error_generic: "Error resetting password.",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    password_mismatch: "Passwords do not match.",
    password_required: "Password is required",
    confirm_password: "Confirm password",
  },
  // accueil //
  faq: {
  title: "Frequently Asked Questions",
  subtitle: "Everything you need to know about Teqa Connect",

  items: [
    {
      question: "How does the AI scoring work?",
      answer:
        "Our AI analyzes customer order history, delivery patterns, and return behavior to calculate a risk score (0–100). Customers are classified as High Risk, Medium Risk, or Safe.",
    },
    {
      question: "What e-commerce platforms do you support?",
      answer: "We support Shopify, WooCommerce, YouCan.",
    },
    {
      question: "Can I integrate with my existing systems?",
      answer:
        "Yes. Teqa Connect integrates seamlessly with existing CRMs, ERPs, and custom systems via API and webhooks.",
    },
    {
      question: "How quickly will I see results?",
      answer:
        "Most merchants see measurable improvements within the first few weeks.",
    },
    {
      question: "Is my customer data secure?",
      answer:
        "Absolutely. We use enterprise-grade security, encryption, and strict access controls.",
    },
    {
      question: "What's your refund policy?",
      answer:
        "If you cancel within 7 days after your first payment, unused days are refunded on a pro-rated basis.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "Yes. Contact Billing@teqa.app for billing or technical assistance.",
    },
  ],
},
  features: {
  title: "Powerful Features",
  subtitle:
    "Everything you need to reduce returns and optimize COD operations.",

  items: [
    {
      title: "COD Risk Scoring",
      description:
        "AI-powered scoring evaluates each customer from 0 to 100 and classifies them into High Risk, Medium Risk, or Safe.",
    },
    {
      title: "Smart Order Confirmation System",
      description:
        "Automatically routes orders based on scoring rules and priority.",
    },
    {
      title: "Seamless E-commerce Integrations",
      description:
        "Ready-made plugins and flexible API integration.",
    },
    {
      title: "Fraud & Spam Detection",
      description:
        "Automatically identifies suspicious or duplicate orders.",
    },
    {
      title: "Customer History & Profiling",
      description:
        "Tracks past deliveries, returns, and interaction notes.",
    },
    {
      title: "Real-Time Status Sync",
      description:
        "Instant synchronization with your e-commerce store.",
    },
    {
      title: "Social Media Integrations",
      description:
        "WhatsApp API, Facebook Leads, TikTok Forms, and more.",
    },
    {
      title: "Performance Tracking & SLA Monitoring",
      description:
        "Track confirmation rates and operational efficiency.",
    },
    {
      title: "Bulk Data Import & Export",
      description:
        "Import customer lists and export analytics easily.",
    },
  ],
},
  howItWorks: {
  title: "How It Works",
  subtitle: "Teqa End-to-End COD Ecosystem Workflow",

  steps: [
    {
      id: 1,
      title: "Account Registration & Subscription",
      description:
        "Merchants create their Teqa account and select the subscription plan that fits their business needs. Platform features are instantly unlocked based on the chosen tier.",
    },
    {
      id: 2,
      title: "Store Integration",
      description:
        "Merchants connect their e-commerce store (Shopify, WooCommerce, PrestaShop, or custom API). Orders are automatically synced and imported into Teqa for processing.",
    },
    {
      id: 3,
      title: "Connect Your Shipping Company",
      description:
        "Merchants connect their shipping company or logistics partners. Shipping rules, zones, and tracking are configured to enable seamless COD delivery operations.",
    },
    {
      id: 4,
      title: "Customer Risk Analysis & Scoring",
      description:
        "Each order is analyzed using AI-powered algorithms. Customers receive a risk score from 0 to 100 and are classified as High Risk, Medium Risk, or Safe.",
    },
    {
      id: 5,
      title: "Smart Order Confirmation",
      description:
        "Orders are routed to call-center partners or internal teams based on risk score and priority. All confirmation actions are tracked in real time.",
    },
    {
      id: 6,
      title: "Shipping Dispatch & Tracking",
      description:
        "Confirmed orders are automatically dispatched to the connected shipping company. Delivery status and COD outcomes are tracked in real time.",
    },
    {
      id: 7,
      title: "Reporting & Continuous Optimization",
      description:
        "Merchants access detailed reports on order performance, customer reliability, shipping success rates, and call-center efficiency—enabling continuous optimization of COD operations.",
    },
  ],
},
  pricing: {
  title: "Simple, Transparent Pricing",
  subtitle: "Choose the plan that fits your COD volume and analytics needs.",
  contactText: "Questions about pricing? Contact",

  plans: [
    {
      name: "Free",
      price: "$0",
      period: "/mo",
      description: "Best to explore Teqa basics",
      features: [
        "200 orders / month",
        "1 store",
        "1 team member",
        "Basic analytics (limited)",
        "Email support (48–72h)",
        "2 free integrations",
      ],
      cta: "Sign Up Free",
      highlighted: false,
    },
    {
      name: "Starter",
      price: "$55",
      period: "/mo",
      description: "For small growing stores",
      features: [
        "300 orders / month",
        "2 stores",
        "2 team members",
        "Shipping & COD success overview",
        "Email support (24–48h)",
        "Unlimited integrations",
      ],
      cta: "Sign Up",
      highlighted: true,
    },
    {
      name: "Advanced",
      price: "$245",
      period: "/mo",
      description: "Advanced analytics & performance",
      features: [
        "1,500 orders / month",
        "5 stores",
        "5 team members",
        "Carrier comparison by city",
        "Delivery speed & reliability",
        "Email + Chat support (12–24h)",
        "Optional account manager",
        "Unlimited integrations",
      ],
      cta: "Sign Up",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$680",
      period: "/mo",
      description: "For high-volume COD operations",
      features: [
        "5,000 orders / month",
        "10 stores",
        "15 team members",
        "Customer & basket analytics",
        "Preferred delivery windows",
        "Priority support (4–8h SLA)",
        "Account manager included",
        "Unlimited integrations",
      ],
      cta: "Sign Up",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Large-scale & custom operations",
      features: [
        "Unlimited orders (Fair Use)",
        "20+ stores",
        "50 users",
        "Custom dashboards & AI models",
        "24/7 priority support",
        "Dedicated account manager",
        "Unlimited integrations",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ],
},
 footer: {
  brand: {
    slogan:
      "Score. Connect. Deliver — Your end-to-end COD ecosystem for smarter shipping decisions.",
  },

  social: {
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    x: "X",
  },

  product: {
    title: "Product",
    links: [
      { label: "Features", path: "/Features" },
      { label: "Pricing", path: "/Pricing" },
      { label: "How It Works", path: "/How_It_Works" },
      { label: "Marketplace", path: "/Marketplace_page" },
    ],
  },

  company: {
    title: "Company",
    links: [
      { label: "About Us", path: "/about" },
      { label: "Contact Us", path: "/Contact" },
      { label: "FAQ", path: "/faq" },
    ],
  },

  legal: {
    title: "Legal & Support",
    links: [
      { label: "Privacy Policy", path: "/Privacy_Policy" },
      { label: "Terms & Conditions", path: "/Terms_And_Conditions" },
      { label: "Refund Policy", path: "/Refund_Policy" },
      { label: "Payment Methods", path: "/Payment_Methods" },
      { label: "Cookie Policy", path: "/Cookie_Policy" },
    ],
  },

  contact: {
    title: "Get in touch",
    email: "contact@teqa.app",
    sales: "sales@teqa.app",
    support: "support@teqa.app",
  },

  copyright:
    "© 2025 Teqa Connect · Av Allal Ben Abdullah · Rabat, Morocco",
},
  hero: {
  badge: "COD Excellence Platform",

  title: {
    line1: "Score. Connect.",
    line2: "Deliver —",
    line3: "Upsell Smarter,",
    line4: "Save More.",
  },

  description:
    "Teqa Connect is an end-to-end COD ecosystem offering risk analytics, customer scoring, and a merchant–call center marketplace.",

  cta: {
    primary: "Get Started Free",
    secondary: "Request Demo",
  },

  footerNote:
    "No credit card required. Join hundreds of merchants.",
},
integrations: {
  title: "Platform Integrations",
  subtitle: "Supported platforms and upcoming integrations",

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
  title: "Teqa Marketplace Pricing",
  subtitle:
    "Pay only for successful COD deliveries — zero risk for merchants.",

  slides: [
    {
      title: "Pay-Per-Success Model",
      subtitle: "No subscriptions. No setup fees.",
      highlight: "Only pay when orders are delivered",
      points: [
        "Fees apply only to successful shipments",
        "No cost for canceled or failed orders",
        "Commission paid by call centers",
        "Encourages quality & fast confirmations",
      ],
      cta: "Get Started",
    },
    {
      title: "Agent Plan",
      subtitle: "For Freelance Call Center Agents",
      highlight: "8–10 MAD / successful order",
      points: [
        "Teqa commission: 20%",
        "1,000–3,000 orders → 18%",
        "3,000+ orders → 15%",
        "Paid only for delivered orders",
      ],
      cta: "Join as Agent",
    },
    {
      title: "Company Plan",
      subtitle: "For Call Center Companies",
      highlight: "8–10 MAD / successful order",
      points: [
        "Teqa commission: 15%",
        "5,000–15,000 orders → 12%",
        "15,000+ orders → 10%",
        "Higher volume = higher margins",
      ],
      cta: "Apply as Company",
    },
  ],
},
marketplaceOverview: {
  badge: "Teqa Marketplace",

  title: "The Smart Bridge Between Merchants and Call Centers",
  subtitle:
    "One marketplace. Trusted COD confirmations. Better delivery results.",

  intro: {
    title: "What Is Teqa Marketplace?",
    paragraphs: [
      "Teqa Marketplace is an integrated platform within the Teqa ecosystem that connects e-commerce merchants with verified call centers in a secure, data-driven environment.",
      "It enables transparent collaboration, performance-based order assignment, and shared intelligence to reduce COD risks and improve delivery success rates.",
    ],
  },

  benefits: [
    "Verified & performance-rated call centers",
    "Smart order distribution by risk, location & language",
    "Real-time confirmation & tracking",
  ],

  steps: [
    {
      title: "Partner Onboarding & Verification",
      description:
        "Call centers are verified based on performance history, capacity, and service quality.",
    },
    {
      title: "Smart Order Distribution",
      description:
        "Orders are assigned using risk score, availability, and past performance.",
    },
    {
      title: "Real-Time Confirmation",
      description:
        "Call centers confirm orders while merchants track progress instantly.",
    },
    {
      title: "Performance Scoring",
      description:
        "Call centers are ranked using confirmation rate, speed, and accuracy.",
    },
  ],

  cta: {
    merchant: "Create a Merchant Account",
    partner: "Apply as a Call Center Partner",
  },
},
navbar: {
  links: [
    { label: "Features", path: "/features" },
    { label: "How It Works", path: "/How_It_Works" },
    { label: "Pricing", path: "/pricing" },
    { label: "FAQ", path: "/faq" },
  ],

  auth: {
    login: "Log in",
    signup: "Sign up",
    getStarted: "Get Started",
  },
},
testimonials: {
  title: "What Our Merchants Say",
  subtitle:
    "Join hundreds of e-commerce businesses already saving money with Teqa Connect",

  items: [
    {
      quote:
        "Teqa Connect reduced our return rate by 40% in just two months. The AI scoring is incredibly accurate and saved us thousands.",
      name: "Ahmed Hassan",
      role: "E-commerce Manager at Fashion Retail",
      location: "Morocco",
      avatar: "https://i.pravatar.cc/100?img=12",
    },
    {
      quote:
        "We integrated Teqa in less than an hour. The smart order confirmation system streamlined our entire COD workflow.",
      name: "Fatima Bennani",
      role: "Operations Director at Electronics Hub",
      avatar: "https://i.pravatar.cc/100?img=32",
    },
    {
      quote:
        "Simple to use, powerful results. Teqa Connect is now essential to our business operations. Highly recommended!",
      name: "Mohammed Karim",
      role: "Store Owner at Premium Shop",
      avatar: "https://i.pravatar.cc/100?img=48",
    },
  ],
},
whyChoose: {
  title: "Why Choose Teqa Connect",
  subtitle:
    "Protect your business, make smarter decisions, and integrate seamlessly.",

  reasons: [
    {
      title: "Risk Analytics",
      description:
        "Understand potential risks before accepting COD orders and make data-driven decisions.",
    },
    {
      title: "Customer Scoring",
      description:
        "Evaluate customer reliability based on purchasing behavior and delivery outcomes.",
    },
    {
      title: "Merchant–Call Center Marketplace",
      description:
        "Connect with verified call centers and delivery partners to streamline operations and ensure smooth COD processes.",
    },
  ],
},
// pages /////
about: {
  header: {
    title: "About Teqa Connect",
    subtitle:
      "Revolutionizing <strong>Cash on Delivery</strong> with data-driven risk intelligence and AI-powered decision tools.",
  },

  intro:
    "Teqa Connect is built for modern merchants operating in high-risk Cash on Delivery environments. We combine advanced risk analytics, customer reliability scoring, and a trusted merchant–call center marketplace to reduce losses, optimize operations, and increase customer trust.",

  mission: {
    title: "Our Mission",
    text:
      "We go beyond traditional CRM platforms. Teqa Connect equips merchants with actionable insights, predictive scoring, and intelligent automation to make safer decisions, reduce COD failures, and scale confidently.",
    codeExample: {
      approve: "approveCOD();",
      verify: "verifyWithCallCenter();",
    },
  },

  offer: {
    title: "What We Offer",
    items: [
      {
        title: "Risk Analytics",
        text:
          "Detect fraud and high-risk orders before confirmation using data-driven risk models.",
      },
      {
        title: "Customer Scoring",
        text:
          "Evaluate customer reliability based on historical behavior and delivery outcomes.",
      },
      {
        title: "Merchant–Call Center Marketplace",
        text:
          "Collaborate with verified call centers and delivery partners in one ecosystem.",
      },
    ],
  },

  whyChoose: {
    title: "Why Choose Teqa Connect",
    points: [
      "Protect your business from fraudulent or high-risk transactions",
      "Make smarter decisions with AI-powered analytics",
      "Integrate seamlessly with any CRM or e-commerce platform",
      "Operate with compliance, transparency, and trust",
    ],
  },

  commitment: {
    title: "Our Commitment",
    text:
      "Security, transparency, and ethical data usage are at the core of Teqa Connect. Customer data is never sold to third parties, and all insights are used exclusively to improve COD performance. While our algorithms are highly reliable, external factors such as delivery or merchant errors may occasionally affect outcomes.",
  },

  contact: {
    title: "Contact Us",
    subtitle: "Want to learn more about Teqa Connect?",
    email: "contact@teqa.app",
    website: "https://www.teqa.app",
  },
},
contactPage: {
  hero: {
    title: "Contact Teqa",
    subtitle:
      "Have questions or need assistance? We're here to help you grow your e-commerce business.",
  },

  info: {
    title: "Contact Information",
    emails: {
      general: "General inquiries",
      sales: "Sales",
      support: "Support",
      billing: "Billing",
      privacy: "Privacy",
    },
    addressTitle: "Address",
    address: "Av. Allal Ben Abdullah\nRabat – Morocco",
    follow: "Follow Us",
  },

  form: {
    title: "Send Us a Message",
    name: "Your name",
    email: "Your email",
    message: "Your message",
    submit: "Send Message",
  },
},
cookiePolicy: {
  header: {
    title: "Teqa Connect Cookie Policy",
    updated: "Last Updated: December 2, 2025",
  },

  intro: {
    title: "Introduction",
    text:
      "At <strong>Teqa Connect</strong>, accessible at https://www.teqa.app, we use cookies and similar technologies to enhance user experience, improve our services, and understand platform usage.",
  },

  whatAreCookies: {
    title: "1. What Are Cookies",
    text:
      "Cookies are small text files stored on your device by your browser. They help remember preferences, analyze usage, and deliver a smoother, personalized experience. Cookies may be session-based or persistent.",
  },

  types: {
    title: "2. Types of Cookies We Use",
    sections: {
      essential: {
        title: "Essential Cookies",
        items: [
          "Enable login, session management, and security",
          "Cannot be disabled without impacting platform functionality",
        ],
      },
      analytics: {
        title: "Performance & Analytics Cookies",
        items: [
          "Track pages visited, usage patterns, and errors",
          "Help optimize performance and user experience",
        ],
      },
      functional: {
        title: "Functional Cookies",
        items: [
          "Store preferences such as language and UI settings",
          "Enable a more personalized experience",
        ],
      },
      thirdParty: {
        title: "Third-Party Cookies",
        items: [
          "Used for analytics, marketing, or integrations",
          "Subject to third-party privacy policies",
        ],
      },
    },
  },

  usage: {
    title: "3. How We Use Cookies",
    items: [
      "Operate and improve Teqa Connect services",
      "Analyze platform performance and usage",
      "Personalize user experience",
      "Detect fraud or unauthorized access",
      "Measure marketing effectiveness",
    ],
  },

  choices: {
    title: "4. Your Cookie Choices",
    items: [
      "Manage or disable cookies via browser settings",
      "Blocking essential cookies may limit platform features",
      "Disabling analytics may reduce personalization",
    ],
    browsers: "Browsers: Google Chrome · Mozilla Firefox · Apple Safari",
  },

  consent: {
    title: "5. Consent",
    text:
      "By using Teqa Connect, you consent to the use of cookies as outlined in this policy. You may withdraw consent at any time by adjusting browser settings.",
  },

  contact: {
    title: "6. Contact Us",
    text: "For questions regarding this Cookie Policy, contact us at:",
    email: "support@teqa.app",
    website: "https://www.teqa.app",
  },
},
faqPage: {
  title: "Teqa Connect — FAQ",
  subtitle:
    "Answers to common questions about plans, orders, analytics, and security.",

  sections: [
    {
      title: "Subscription & Plans",
      items: [
        {
          q: "Can I switch my plan anytime?",
          a: "Yes, you can upgrade or downgrade at any time. Mid-cycle changes are prorated.",
        },
        {
          q: "Are discounts applied to overage fees?",
          a: "No, discounts apply only to the base subscription.",
        },
        {
          q: "How do I upgrade from Free to a paid plan?",
          a: "Log in, select the plan, and complete the payment process. Overage fees start after included limits.",
        },
        {
          q: "Are there any setup fees?",
          a: "No, Teqa Connect does not charge setup fees.",
        },
        {
          q: "Can I pause my subscription?",
          a: "Subscriptions cannot be paused but can be canceled anytime; unused days are prorated for the first month only.",
        },
        {
          q: "How are additional orders billed?",
          a: "Additional orders above your plan are billed at tiered overage rates specified for your plan.",
        },
        {
          q: "Can I add more team members?",
          a: "Yes, each plan allows extra users at the specified monthly rate.",
        },
        {
          q: "Does the Free plan allow multiple stores?",
          a: "No, the Free plan supports 1 store only. Paid plans allow multiple stores.",
        },
        {
          q: "How do I downgrade my plan?",
          a: "You can downgrade at any time; new limits take effect in the next billing cycle.",
        },
        {
          q: "Are annual or quarterly plans refundable?",
          a: "Refunds are only available as described in the contract; overage fees are non-refundable.",
        },
      ],
    },

    {
      title: "Orders & COD",
      items: [
        {
          q: "What counts as an Order Received?",
          a: "An order is marked as received when the COD is collected and confirmed by the carrier.",
        },
        {
          q: "What happens if a delivery is canceled by the customer?",
          a: "Orders canceled before delivery are not counted and do not generate fees.",
        },
        {
          q: "Can I track order status in real time?",
          a: "Yes, you can monitor delivery progress and COD collection in your dashboard.",
        },
        {
          q: "Does Teqa handle customer refunds?",
          a: "No, refunds are handled directly by the merchant.",
        },
        {
          q: "Are returned orders included in analytics?",
          a: "Yes, return rates are included in the Advanced Analytics dashboard.",
        },
      ],
    },

    {
      title: "Analytics & Scoring",
      items: [
        {
          q: "What metrics are included in Advanced Analytics?",
          a: "Customer behavior, delivery windows, carrier performance, return rates, and regional statistics.",
        },
        {
          q: "Is customer scoring 100% accurate?",
          a: "No, scoring depends on the quality of merchant and carrier data.",
        },
        {
          q: "Can analytics be exported?",
          a: "Yes, reports can be exported in CSV or PDF formats.",
        },
        {
          q: "Can analytics be segmented?",
          a: "Yes, by store, city, or neighborhood.",
        },
      ],
    },

    {
      title: "Integrations & API",
      items: [
        {
          q: "Which platforms are supported?",
          a: "WooCommerce, Shopify, YouCan, and custom stores via API.",
        },
        {
          q: "Is API documentation available?",
          a: "Yes, full API documentation is available after signup.",
        },
        {
          q: "Can I test the API?",
          a: "Yes, sandbox environments are provided.",
        },
        {
          q: "Are custom integrations possible?",
          a: "Yes, for Enterprise plans.",
        },
      ],
    },

    {
      title: "Billing & Payments",
      items: [
        {
          q: "What payment methods are accepted?",
          a: "Major credit cards and PayPal (where available).",
        },
        {
          q: "Are invoices provided?",
          a: "Yes, invoices are downloadable from your dashboard.",
        },
        {
          q: "Are overage fees refundable?",
          a: "No, overage fees are non-refundable.",
        },
      ],
    },

    {
      title: "Security & Privacy",
      items: [
        {
          q: "How does Teqa protect data?",
          a: "All data is encrypted, access-controlled, and securely stored.",
        },
        {
          q: "Does Teqa sell customer data?",
          a: "No, customer data is never sold.",
        },
        {
          q: "Is Teqa GDPR compliant?",
          a: "Yes, we comply with regional and international data protection standards.",
        },
      ],
    },
  ],
},
featuresPage: {
  hero: {
    title: "Teqa Connect Features",
    subtitle:
      "Everything you need to reduce COD risk, automate confirmations, and scale operations with confidence.",
  },

  items: [
    {
      title: "COD Risk Scoring",
      desc:
        "AI-powered scoring evaluates each customer from 0 to 100 and classifies them as High Risk, Medium Risk, or Safe. Merchants can request prepayments, flag risky orders, or prioritize safe ones to reduce returns and improve delivery success.",
    },
    {
      title: "Advanced Risk Analytics Dashboard",
      desc:
        "A full behavioral overview including preferred shipping companies, frequently ordered product categories, recommended delivery windows, and feedback from other merchants. Includes instant WhatsApp verification for rapid scoring.",
    },
    {
      title: "Smart Order Confirmation System",
      desc:
        "Automatically routes orders to call-center partners or internal teams based on scoring rules and priority. Includes notifications, tracking, and SLA monitoring for fast and accurate confirmations.",
    },
    {
      title: "Merchant–Call Center Marketplace",
      desc:
        "Connect with verified call-center partners through a transparent marketplace featuring performance ratings, SLA tracking, smart order assignment, and collaborative risk management.",
    },
    {
      title: "Seamless E-commerce Integrations",
      desc:
        "Ready-made plugins for Shopify, WooCommerce, YouCan, Dropify, Prestashop, Zid, and Salla, plus a flexible API. Supports full data sync, automation, and order import/export.",
    },
    {
      title: "Fraud & Spam Detection",
      desc:
        "Automatically detects suspicious behavior, duplicate orders, fake accounts, and abnormal patterns, protecting merchants from fraud and financial loss.",
    },
    {
      title: "Automated Rules & Webhooks",
      desc:
        "Configure intelligent rules to auto-cancel risky orders, trigger follow-up calls or WhatsApp verification, pause campaigns, or prioritize safe orders for faster shipping.",
    },
    {
      title: "Multi-Role Dashboards",
      desc:
        "Dedicated dashboards for Merchants, Call Centers, and Admins, each optimized to manage orders, confirmations, analytics, SLAs, and marketplace performance.",
    },
    {
      title: "Customer History & Behavior Profiling",
      desc:
        "Build detailed customer profiles tracking past deliveries, returns, and interactions to improve prediction accuracy and reduce operational risk.",
    },
    {
      title: "Real-Time Status Sync",
      desc:
        "All order updates — confirmations, cancellations, and deliveries — are instantly synced with your e-commerce store for full transparency.",
    },
    {
      title: "Social Media Integrations",
      desc:
        "Native support for WhatsApp API, Facebook Leads, TikTok Forms, and Google Sheets — perfect for merchants selling directly through social channels.",
    },
    {
      title: "Performance Tracking & SLA Monitoring",
      desc:
        "Track call-center response times, confirmation rates, and service quality to ensure consistent, high-standard operations.",
    },
    {
      title: "Bulk Data Import & Export",
      desc:
        "Import customer lists, export analytics, and synchronize records across systems to save time and improve decision-making.",
    },
  ],

  cta: {
    title: "Ready to Secure Your COD Operations?",
    text:
      "Start using Teqa Connect to reduce fraud, improve delivery success, and make smarter decisions with AI-powered insights.",
    button: "Get Started",
  },
},
howItWorksPage: {
  hero: {
    title: "How Teqa Works",
    subtitle:
      "An end-to-end Cash on Delivery ecosystem designed to reduce risk, automate confirmations, and optimize performance.",
  },

  steps: [
    {
      id: 1,
      title: "Account Registration & Subscription",
      description:
        "Merchants create their Teqa account and select the subscription plan that fits their business needs. Platform features are instantly unlocked based on the chosen tier.",
    },
    {
      id: 2,
      title: "Store Integration",
      description:
        "Merchants connect their e-commerce store (Shopify, WooCommerce, PrestaShop, or custom API). Orders are automatically synced and imported into Teqa for processing.",
    },
    {
      id: 3,
      title: "Connect Your Shipping Company",
      description:
        "Merchants connect their shipping company or logistics partners. Shipping rules, zones, and tracking are configured to enable seamless COD delivery operations.",
    },
    {
      id: 4,
      title: "Customer Risk Analysis & Scoring",
      description:
        "Each order is analyzed using AI-powered algorithms. Customers receive a risk score from 0 to 100 and are classified as High Risk, Medium Risk, or Safe.",
    },
    {
      id: 5,
      title: "Smart Order Confirmation",
      description:
        "Orders are routed to call-center partners or internal teams based on risk score and priority. All confirmation actions are tracked in real time.",
    },
    {
      id: 6,
      title: "Shipping Dispatch & Tracking",
      description:
        "Confirmed orders are automatically dispatched to the connected shipping company. Delivery status and COD outcomes are tracked in real time.",
    },
    {
      id: 7,
      title: "Reporting & Continuous Optimization",
      description:
        "Merchants access detailed reports on order performance, customer reliability, shipping success rates, and call-center efficiency—enabling continuous optimization of COD operations.",
    },
  ],

  contact: {
    title: "Contact Information",
    general: "General",
    sales: "Sales",
    support: "Support",
    addressLabel: "Address",
    address: "Av. Allal Ben Abdullah\nRabat – Morocco",
    follow: "Follow & Learn More",
    blog: "Blog",
  },
},
marketplacePage: {
  hero: {
    title: "One Marketplace. Trusted COD Confirmations.",
    subtitle: "Better Delivery Results.",
    description:
      "Teqa Marketplace connects e-commerce merchants with verified call centers to confirm Cash-on-Delivery orders and reduce returns.",
    merchantCta: "Get Started with Teqa Marketplace",
    partnerCta: "Join as a Call Center Partner",
  },

  finalCta: {
    title: "Start Reducing COD Risk Today",
    description:
      "Join Teqa Marketplace and connect with trusted partners that improve your delivery outcomes.",
    merchant: "Create a Merchant Account",
    partner: "Apply as a Call Center Partner",
  },
},
paymentMethods: {
  title: "Payment Methods",
  subtitle:
    "Secure, flexible, and convenient payment options for Teqa Connect merchants.",

  sections: {
    cards: {
      title: "1. Bank Cards",
      items: ["Visa", "Mastercard"],
      note:
        "Payments are processed through a PCI-compliant and secure payment gateway.",
    },

    transfers: {
      title: "2. Bank Transfers",
      items: ["International bank transfers", "Local bank transfers"],
      note:
        "Processing time is typically 1–3 business days. Please include your account ID or invoice number to ensure accurate and timely credit.",
    },

    agencies: {
      title: "3. Money Transfer Agencies",
      items: ["Cash Plus", "Wafa Cash", "Western Union"],
      note:
        "Always provide your Teqa account ID when completing the transfer to ensure proper allocation.",
    },

    crypto: {
      title: "4. Crypto Payments",
      items: ["USDT (Tether)"],
      note:
        "Crypto payments are accepted via our secure crypto gateway. Include your account ID in the transaction note.",
    },

    billing: {
      title: "Billing & Policies",
      items: [
        "Subscription frequency: Monthly, Quarterly, or Annual",
        "All payments are processed in USD",
        "Prices exclude applicable taxes unless stated otherwise",
        "Refunds and overage fees follow the Refund Policy",
      ],
    },

    security: {
      title: "Security",
      text:
        "All payment methods are protected with industry-standard encryption and secure processing to safeguard your financial data.",
    },

    help: {
      title: "Need Help with Payment?",
      text:
        "For billing issues or payment assistance, contact our billing team at",
      email: "Billing@teqa.app",
    },
  },
},
pricing: {
  title: "Teqa Connect Pricing",
  subtitle:
    "Choose the plan that fits your order volume and analytics needs. Switch anytime.",
  discounts: "Quarterly: 15% off · Annual: 20% off",

  plans: [
    {
      name: "Free",
      price: "$0/mo",
      highlight: false,
      features: [
        "Up to 200 orders / month",
        "1 store",
        "1 team member",
        "Basic analytics (limited)",
        "Email support (48–72h)",
        "No account manager",
        "2 free integrations",
      ],
      cta: "Sign Up Free",
    },
    {
      name: "Starter",
      price: "$55/mo",
      highlight: false,
      features: [
        "Up to 300 orders / month",
        "Overage: $0.41 (1–200), $0.55 (201+)",
        "2 stores",
        "2 users included (+$4.10/user)",
        "Shipping analytics by city/area",
        "Email support (24–48h)",
        "Unlimited integrations",
      ],
      cta: "Sign Up",
    },
    {
      name: "Advanced",
      price: "$245/mo",
      highlight: true,
      features: [
        "Up to 1,500 orders / month",
        "Overage: $0.33 (1–1,000), $0.41 (1,001+)",
        "5 stores",
        "5 users included (+$3.30/user)",
        "Carrier comparison & regional insights",
        "Email + chat support (12–24h)",
        "Optional account manager ($82/mo)",
        "Unlimited integrations",
      ],
      cta: "Sign Up",
    },
    {
      name: "Professional",
      price: "$680/mo",
      highlight: false,
      features: [
        "Up to 5,000 orders / month",
        "Overage: $0.25 (1–3,000), $0.33 (3,001+)",
        "10 stores",
        "15 users included (+$2.73/user)",
        "Advanced COD customer analytics",
        "Priority support (4–8h SLA)",
        "Account manager included",
        "OMS integration add-on (+$300/mo)",
        "Unlimited integrations",
      ],
      cta: "Sign Up",
    },
    {
      name: "Enterprise",
      price: "Custom",
      highlight: false,
      features: [
        "Custom or unlimited orders (fair use)",
        "Negotiated overage rates",
        "20+ stores",
        "Up to 50 users included (+$2.18/user)",
        "Custom dashboards & predictive analytics",
        "24/7 priority support with SLA",
        "Dedicated account manager",
        "OMS integration add-on (+$300/mo)",
        "Unlimited integrations",
      ],
      cta: "Contact Sales",
    },
  ],

  billing: {
    title: "Billing & Policies",
    items: [
      "Mid-cycle plan changes are prorated",
      "Refunds per contract; overage fees are non-refundable",
      "Usage notifications at 80% and 100% of order limits",
      "Prices exclude applicable taxes unless stated",
    ],
  },

  addons: {
    title: "Optional Add-ons",
    items: [
      "OMS Custom Integration (+$300/mo)",
      "Advanced Analytics Reports (on request)",
      "Dedicated Support or Training",
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
  title: "Teqa Connect Refund Policy",
  lastUpdated: "Last updated",

  sections: [
    {
      title: "Introduction",
      paragraphs: [
        "At Teqa Connect, we provide an advanced platform for Cash-on-Delivery risk analytics, customer scoring, and marketplace management. We are committed to transparency and fairness in all billing and refund practices.",
      ],
    },
    {
      title: "1. Refunds (First 7 Days – First Monthly Payment Only)",
      paragraphs: [
        "If you cancel within 7 calendar days after your first monthly subscription payment, we will refund the unused portion of that billing cycle on a pro-rated basis.",
      ],
      formula:
        "(Monthly fee ÷ total days in billing cycle) × unused days remaining",
      exclusionsTitle: "Exclusions:",
      exclusions: [
        "Renewals or subsequent subscription payments",
        "Add-ons, upgrades, or usage-based fees",
        "Services already delivered or activated",
      ],
      request:
        "How to request a refund: Email Billing@teqa.app from your registered email with your account ID before the 7-day window ends. Approved refunds are issued within 5–10 business days.",
    },
    {
      title: "2. Billing & Renewals",
      list: [
        "All subscriptions are billed in full at purchase",
        "Plans renew automatically unless canceled before renewal",
        "Customers are responsible for managing cancellations",
        "Payments are final except for the first 7-day refund eligibility",
      ],
    },
    {
      title: "3. Support & Assistance",
      paragraphs: [
        "For billing or technical inquiries, please contact our billing team at Billing@teqa.app.",
      ],
    },
    {
      title: "4. Acceptance of Policy",
      paragraphs: [
        "By subscribing to Teqa Connect, you acknowledge and agree to this Refund Policy. If you do not agree, please do not proceed with your purchase.",
      ],
      note:
        "Important: Refunds outside the stated conditions are not guaranteed.",
    },
  ],
},
terms: {
  title: "Teqa Connect Terms & Conditions",
  lastReviewed: "Last reviewed",

  sections: [
    {
      title: "Introduction",
      paragraphs: [
        "Welcome to Teqa Connect. These Terms and Conditions govern your use of our platform accessible at https://www.teqa.app. By accessing or using Teqa Connect, you agree to these Terms.",
        "We reserve the right to update these Terms at any time. Continued use constitutes acceptance of the updated Terms.",
      ],
    },
    {
      title: "Definitions",
      list: [
        "Client / You: Merchant or business using Teqa Connect",
        "Teqa / We: Teqa Connect and its affiliates",
        "Parties: Client and Teqa Connect collectively",
      ],
    },
    {
      title: "1. Use of Platform",
      list: [
        "Compliance with Moroccan and applicable laws is required",
        "Platform provides COD analytics, scoring, and marketplace tools",
        "Abuse, fraud, or manipulation may result in termination",
      ],
    },
    {
      title: "2. Prohibited Products & Services",
      paragraphs: [
        "Teqa Connect enforces ethical business practices and legal compliance.",
      ],
      grid: [
        "Interest-based financial services",
        "Insurance companies",
        "Gambling & betting",
        "Alcohol & pork products",
        "Adult content",
        "Tobacco & drugs",
        "Weapons & arms trading",
        "Pyramid / MLM schemes",
        "Fraudulent business models",
      ],
      note:
        "Enforcement: Violations result in immediate suspension or termination.",
    },
    {
      title: "3. Customer Scoring & Manipulation",
      list: [
        "AI-based scoring supports risk assessment",
        "Merchant misconduct may affect customer scores",
        "Teqa Connect may investigate scoring abuse",
      ],
    },
    {
      title: "4. Account Termination",
      paragraphs: [
        "Accounts violating these Terms may be suspended or terminated without prior notice to protect the platform and users.",
      ],
    },
    {
      title: "5. Intellectual Property",
      list: [
        "All platform content belongs to Teqa Connect",
        "Use is limited to permitted business purposes",
        "Unauthorized redistribution is prohibited",
      ],
    },
    {
      title: "6. Disclaimer & Liability",
      list: [
        "Services are provided “as is”",
        "No guarantee of 100% analytics accuracy",
        "Liability limited to the extent permitted by law",
      ],
    },
    {
      title: "7. Cookies & Tracking",
      paragraphs: [
        "Cookies improve experience and analytics. Disabling cookies may limit platform functionality.",
      ],
    },
    {
      title: "8. Media Policy",
      paragraphs: [
        "Inappropriate media may be removed. Repeated violations may lead to suspension.",
      ],
    },
    {
      title: "9. Updates to Terms",
      paragraphs: [
        "Terms may be updated at any time. Continued use indicates acceptance.",
      ],
      note:
        "Important: If you do not agree with these Terms, stop using Teqa Connect immediately.",
    },
  ],
},

};
