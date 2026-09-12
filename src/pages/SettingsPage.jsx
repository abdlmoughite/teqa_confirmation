// SettingsPage.jsx
import { motion } from "framer-motion";
import {
  BellRing,
  Languages,
  SlidersHorizontal,
  Shield,
  Users,
  CreditCard,
  Palette,
  Database,
  Globe,
  Lock,
  Mail,
  Smartphone,
  Zap,
  Sparkles,
  Clock,
  BadgeCheck,
  Rocket,
  Compass,
  Heart,
  Star,
  TrendingUp,
  BarChart3,
  FileText,
  MessageSquare,
  Headphones,
  Gift,
  Award,
  Crown,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

const SettingsPage = () => {
  // Features coming soon
  const comingSoonFeatures = [
    {
      id: 1,
      title: "Advanced Notifications",
      description: "Custom notification rules, smart alerts, and real-time updates",
      icon: BellRing,
      status: "in-development",
      eta: "Q3 2024",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      id: 2,
      title: "Multi-language Support",
      description: "Full localization with RTL support and regional preferences",
      icon: Languages,
      status: "planned",
      eta: "Q4 2024",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      id: 3,
      title: "Security Center",
      description: "2FA, session management, and security audit logs",
      icon: Shield,
      status: "planned",
      eta: "Q4 2024",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      id: 4,
      title: "Team Management",
      description: "Advanced roles, permissions, and team collaboration tools",
      icon: Users,
      status: "planned",
      eta: "Q1 2025",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 5,
      title: "Payment & Billing",
      description: "Subscription plans, invoices, and payment methods",
      icon: CreditCard,
      status: "planned",
      eta: "Q1 2025",
      gradient: "from-rose-500 to-red-500"
    },
    {
      id: 6,
      title: "Appearance",
      description: "Custom themes, layouts, and personalization options",
      icon: Palette,
      status: "in-development",
      eta: "Q3 2024",
      gradient: "from-fuchsia-500 to-pink-500"
    },
    {
      id: 7,
      title: "Data Export",
      description: "Export your data, activity logs, and compliance reports",
      icon: Database,
      status: "planned",
      eta: "Q2 2025",
      gradient: "from-slate-500 to-gray-500"
    },
    {
      id: 8,
      title: "API Access",
      description: "API keys management, webhooks, and integrations",
      icon: Globe,
      status: "in-development",
      eta: "Q4 2024",
      gradient: "from-cyan-500 to-blue-500"
    }
  ];

  // Active features
  const activeFeatures = [
    {
      id: 1,
      title: "Profile Settings",
      description: "Manage your personal information and account preferences",
      icon: User,
      status: "active",
      link: "/profile"
    },
    {
      id: 2,
      title: "Email Preferences",
      description: "Configure email notifications and communication settings",
      icon: Mail,
      status: "active",
      link: "/settings/email"
    },
    {
      id: 3,
      title: "Mobile App",
      description: "Download our mobile app for iOS and Android",
      icon: Smartphone,
      status: "active",
      link: "/download"
    }
  ];

  // Announcements
  const announcements = [
    {
      id: 1,
      title: "New Collaboration Features Coming Soon!",
      description: "We're working on enhanced collaboration tools including real-time chat, file sharing, and task management.",
      date: "May 15, 2024",
      icon: Sparkles,
      type: "feature",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      id: 2,
      title: "Security Improvements",
      description: "Two-factor authentication and enhanced encryption will be available next month.",
      date: "May 10, 2024",
      icon: Shield,
      type: "security",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      id: 3,
      title: "Mobile App Beta",
      description: "Join our beta program for early access to the mobile application.",
      date: "May 5, 2024",
      icon: Smartphone,
      type: "beta",
      gradient: "from-blue-500 to-indigo-500"
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'in-development':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <Clock size={10} className="hidden xs:inline" />
            In Dev
          </span>
        );
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            Planned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <BadgeCheck size={10} className="hidden xs:inline" />
            Active
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
              <SlidersHorizontal size={20} className="sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                Manage your account preferences and explore upcoming features
              </p>
            </div>
          </div>
        </motion.div>

        {/* Announcements Section - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10">
              <BellRing size={16} className="sm:w-[18px] sm:h-[18px] text-violet-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">What's New</h2>
            <span className="text-[10px] sm:text-xs bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 px-2 py-0.5 rounded-full">
              Latest Updates
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {announcements.map((announcement, idx) => {
              const Icon = announcement.icon;
              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-l-4 border-l-violet-500 border-gray-200 dark:border-gray-800 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${announcement.gradient} bg-opacity-10 flex-shrink-0`}>
                      <Icon size={14} className="sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-1 mb-1">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">{announcement.title}</h3>
                        <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">{announcement.date}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{announcement.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Active Features - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
              <BadgeCheck size={16} className="sm:w-[18px] sm:h-[18px] text-emerald-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Available Now</h2>
            <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full">
              Active Features
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {activeFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.button
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4 text-left shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition flex-shrink-0">
                      <Icon size={14} className="sm:w-4 sm:h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">{feature.title}</h3>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                          <BadgeCheck size={8} className="hidden xs:inline" />
                          Available
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-2" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Coming Soon Features - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10">
              <Rocket size={16} className="sm:w-[18px] sm:h-[18px] text-violet-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Coming Soon</h2>
            <span className="text-[10px] sm:text-xs bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 px-2 py-0.5 rounded-full">
              In Development
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {comingSoonFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.03 }}
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-l-4 border-l-gray-300 dark:border-l-gray-700 border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div className="p-3 sm:p-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${feature.gradient} bg-opacity-10 flex items-center justify-center mb-2 sm:mb-3`}>
                      <Icon size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-1 mb-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">{feature.title}</h3>
                      {getStatusBadge(feature.status)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2">{feature.description}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
                        <Clock size={10} className="sm:w-3 sm:h-3" />
                        <span>ETA: {feature.eta}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400">
                          {feature.status === 'in-development' ? 'In progress' : 'Planned'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Roadmap Section - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6 sm:mb-8"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown size={16} className="sm:w-5 sm:h-5 text-white/80" />
                    <span className="text-white/80 text-xs sm:text-sm font-medium uppercase tracking-wider">Product Roadmap</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Help Shape Our Future</h3>
                  <p className="text-white/80 text-xs sm:text-sm max-w-md">
                    We're constantly improving. Check out what we're working on and vote for features you'd like to see.
                  </p>
                </div>
                <button className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm sm:text-base font-medium transition-all backdrop-blur-sm whitespace-nowrap">
                  View Roadmap →
                </button>
              </div>

              <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="text-center p-2">
                  <div className="text-xl sm:text-2xl font-bold text-white">8+</div>
                  <div className="text-[10px] sm:text-xs text-white/70">Planned Features</div>
                </div>
                <div className="text-center p-2 border-l border-r border-white/20">
                  <div className="text-xl sm:text-2xl font-bold text-white">3</div>
                  <div className="text-[10px] sm:text-xs text-white/70">In Development</div>
                </div>
                <div className="text-center p-2">
                  <div className="text-xl sm:text-2xl font-bold text-white">Q4 2024</div>
                  <div className="text-[10px] sm:text-xs text-white/70">Next Release</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feedback Section - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <Heart size={12} className="sm:w-3.5 sm:h-3.5 text-rose-500" />
            <span>Have suggestions?</span>
            <button className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Share your feedback
            </button>
            <span>to help us improve</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Composant User (si non importé)
const User = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default SettingsPage;