# TECQACONNECT STYLE GUIDE

## 🎨 COULEURS

### Light Mode
- Fond principal: `bg-slate-50`
- Cartes: `bg-white`
- Bordure: `border-slate-200`
- Texte principal: `text-slate-900`
- Texte secondaire: `text-slate-600`
- Texte muet: `text-slate-400`

### Dark Mode (toujours ajouter `dark:`)
- Fond principal: `dark:bg-slate-950`
- Cartes: `dark:bg-slate-900`
- Bordure: `dark:border-slate-800`
- Texte principal: `dark:text-slate-100`
- Texte secondaire: `dark:text-slate-400`
- Texte muet: `dark:text-slate-500`

### Couleurs d'accent
- Primary: `bg-primary-600 dark:bg-primary-500` (bleu)
- Danger: `bg-danger-600 dark:bg-danger-500` (rouge)
- Succès: `bg-success-600 dark:bg-success-500` (vert)
- Warning: `bg-warning-600 dark:bg-warning-500` (orange)

## 📐 ESPACEMENTS

- Padding mobile: `p-4`
- Padding tablette: `md:p-6`
- Padding desktop: `lg:p-8`
- Gap petit: `gap-2`
- Gap normal: `gap-4`
- Gap grand: `gap-6`

## 🔤 TYPOGRAPHIE

- Titre H1: `text-2xl md:text-3xl font-bold tracking-tight`
- Titre H2: `text-xl md:text-2xl font-semibold`
- Titre H3: `text-lg font-semibold`
- Corps texte: `text-sm md:text-base`
- Petit texte: `text-xs md:text-sm text-secondary`

## 🧩 COMPOSANTS DE BASE

### Button
```jsx
// Primary
<button className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-all duration-200 active:scale-95 disabled:opacity-50">

// Secondary
<button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200">

// Danger
<button className="px-4 py-2 rounded-lg bg-danger-600 hover:bg-danger-700 text-white transition-all duration-200">

<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
  <div className="p-4 md:p-6">
    {children}
  </div>
</div>

<input className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200" />

<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
  <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
  Active
</span>

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
>
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl"
  >
    {children}
  </motion.div>
</motion.div>

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.3 }}
>

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  <motion.div variants={item}>Item 1</motion.div>
</motion.div>

<motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>

// Pattern à suivre pour TOUS les composants
className="
  bg-white dark:bg-slate-900
  text-slate-900 dark:text-slate-100
  border-slate-200 dark:border-slate-800
  hover:bg-slate-50 dark:hover:bg-slate-800
  shadow-sm dark:shadow-slate-900/50
"

// Mobile first - breakpoints
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px

// Layout responsive
<div className="p-4 md:p-6 lg:p-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {items}
  </div>
</div>

// Sidebar responsive
// Mobile: absolute left-0 top-0 w-64 z-50
// Desktop: fixed left-0 top-0 w-64

const { t, locale, setLocale, dir } = useTranslation();

// Usage
t('common.save') // "Save" ou "Enregistrer" ou "حفظ"

// Direction RTL pour arabe
<div dir={dir} className={locale === 'ar' ? 'rtl' : 'ltr'}>

<div className="animate-pulse space-y-3">
  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
  <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
</div>

