---
name: teqa-frontend
description: >
  Design system et règles de style pour le frontend du projet TEQA Marketplace.
  Utiliser ce fichier avant toute création ou modification de composant UI dans
  les services `marketplace` et `teqa_confirmation` côté frontend.
  Couvre : loading screen, auth, dashboard agent/agence, marketplace offres,
  négociation, commissions, navigation, et tous les états visuels.
---

# TEQA — Frontend Design System

## 1. Identité de marque

### Logo
Le logo TEQA est composé de :
- Texte **TEQA** en bold sans-serif
- Icône pyramide à droite constituée de :
  - Triangle vert `#22c55e` (sommet)
  - Barre bleue `#3b82f6`
  - Barre rouge `#ef4444`
  - Swoosh/vague noire `#1a1a1a` (base)

L'icône représente une hiérarchie (agence → agent → store).

### Implémentation logo en React/SVG
```tsx
export const TeqaLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 20, md: 28, lg: 36 }
  const s = sizes[size]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: s, fontWeight: 700, color: 'var(--teqa-text)', letterSpacing: '-0.5px' }}>
        TEQA
      </span>
      <svg width={s * 0.6} height={s * 0.75} viewBox="0 0 18 22" fill="none">
        <polygon points="9,0 18,8 0,8" fill="#22c55e" />
        <rect x="2" y="10" width="14" height="4" rx="1" fill="#3b82f6" />
        <rect x="0" y="16" width="18" height="4" rx="1" fill="#ef4444" />
        <path d="M1 21 Q9 18 17 21" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
```

---

## 2. Palette de couleurs

### CSS Variables (à définir dans `:root` ou `globals.css`)
```css
:root {
  /* Backgrounds */
  --teqa-bg:        #2e2e2e;   /* fond principal dark */
  --teqa-surface:   #3a3a3a;   /* cartes, panels */
  --teqa-surface2:  #444444;   /* éléments imbriqués */
  --teqa-surface3:  #505050;   /* hover states */

  /* Borders */
  --teqa-border:    rgba(255, 255, 255, 0.08);
  --teqa-border-md: rgba(255, 255, 255, 0.14);

  /* Brand colors — extraites du logo */
  --teqa-green:     #22c55e;
  --teqa-green-dim: rgba(34, 197, 94, 0.12);
  --teqa-green-hover: #16a34a;

  --teqa-blue:      #3b82f6;
  --teqa-blue-dim:  rgba(59, 130, 246, 0.12);

  --teqa-red:       #ef4444;
  --teqa-red-dim:   rgba(239, 68, 68, 0.12);

  /* Text */
  --teqa-text:      #f5f5f5;
  --teqa-muted:     #9a9a9a;
  --teqa-hint:      #666666;

  /* Semantic */
  --teqa-success:   #22c55e;
  --teqa-warning:   #f59e0b;
  --teqa-danger:    #ef4444;
  --teqa-info:      #3b82f6;
}
```

### Règle d'usage des couleurs par rôle
| Rôle | Couleur primaire | Usage |
|---|---|---|
| Agency Owner | `--teqa-green` `#22c55e` | Badges, accents, CTA principaux |
| Agency Agent | `--teqa-blue` `#3b82f6` | Badges, accents secondaires |
| Erreur / Rejet | `--teqa-red` `#ef4444` | Alertes, refus, suppression |
| Store (lecture seule) | `--teqa-hint` `#666` | Référence uniquement |

---

## 3. Typographie

### Fonts
```css
/* Dans index.html ou _document.tsx */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --font-display: 'Syne', sans-serif;   /* titres, logo texte */
  --font-body:    'DM Sans', sans-serif; /* tout le reste */
}
```

### Échelle typographique
```css
/* Titres */
.text-display  { font-family: var(--font-display); font-size: 28px; font-weight: 700; }
.text-title    { font-family: var(--font-display); font-size: 20px; font-weight: 500; }
.text-heading  { font-size: 16px; font-weight: 500; color: var(--teqa-text); }

/* Corps */
.text-body     { font-size: 14px; font-weight: 400; color: var(--teqa-text); }
.text-sm       { font-size: 12px; color: var(--teqa-muted); }
.text-xs       { font-size: 10px; color: var(--teqa-hint); }

/* Labels */
.text-label    { font-size: 10px; letter-spacing: 0.10em; text-transform: uppercase; font-weight: 500; color: var(--teqa-hint); }
```

---

## 4. Loading Screen

Le loading screen doit refléter l'identité TEQA avec animation de la pyramide.

```tsx
// components/LoadingScreen.tsx
export const LoadingScreen = () => (
  <div style={{
    position: 'fixed', inset: 0,
    background: '#2e2e2e',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 9999
  }}>
    <style>{`
      @keyframes teqa-pulse {
        0%, 100% { opacity: 1; transform: translateY(0); }
        50% { opacity: 0.4; transform: translateY(-4px); }
      }
      .teqa-tri  { animation: teqa-pulse 1.2s ease-in-out infinite 0s; }
      .teqa-bar1 { animation: teqa-pulse 1.2s ease-in-out infinite 0.2s; }
      .teqa-bar2 { animation: teqa-pulse 1.2s ease-in-out infinite 0.4s; }
    `}</style>

    <svg width="60" height="70" viewBox="0 0 18 22" fill="none" style={{ marginBottom: 24 }}>
      <polygon className="teqa-tri"  points="9,0 18,8 0,8"              fill="#22c55e" />
      <rect    className="teqa-bar1" x="2" y="10" width="14" height="4" rx="1" fill="#3b82f6" />
      <rect    className="teqa-bar2" x="0" y="16" width="18" height="4" rx="1" fill="#ef4444" />
    </svg>

    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.5px', marginBottom: 32 }}>
      TEQA
    </div>

    <div style={{ display: 'flex', gap: 6 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: i === 0 ? '#22c55e' : i === 1 ? '#3b82f6' : '#ef4444',
          animation: `teqa-pulse 1.2s ease-in-out infinite ${i * 0.2}s`
        }} />
      ))}
    </div>
  </div>
)
```

---

## 5. Page Login / Auth

### Layout
- Fond plein `--teqa-bg` (#2e2e2e)
- Carte centrée `--teqa-surface` avec `border-radius: 16px` et `border: 0.5px solid var(--teqa-border)`
- Logo TEQA en haut de la carte
- Toggle Agence / Agent avant les champs

### Toggle rôle
```tsx
// Le toggle change la couleur d'accent selon le rôle
const roleColors = {
  AGENCY_OWNER: { bg: 'var(--teqa-green-dim)', text: 'var(--teqa-green)' },
  AGENCY_AGENT:  { bg: 'var(--teqa-blue-dim)',  text: 'var(--teqa-blue)' },
}
```

### Composants inputs
```css
.teqa-input {
  width: 100%;
  background: var(--teqa-bg);
  border: 0.5px solid var(--teqa-border-md);
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px;
  color: var(--teqa-text);
  font-family: var(--font-body);
  transition: border-color 0.15s;
}
.teqa-input:focus {
  outline: none;
  border-color: var(--teqa-green);
}
.teqa-input::placeholder { color: var(--teqa-hint); }
```

### Boutons
```css
/* Primaire — vert */
.btn-primary {
  background: var(--teqa-green);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 11px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s, transform 0.1s;
}
.btn-primary:hover  { background: var(--teqa-green-hover); }
.btn-primary:active { transform: scale(0.98); }

/* Secondaire — outline */
.btn-outline {
  background: transparent;
  color: var(--teqa-muted);
  border: 0.5px solid var(--teqa-border-md);
  border-radius: 10px;
  padding: 11px 20px;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  transition: border-color 0.15s, color 0.15s;
}
.btn-outline:hover { border-color: var(--teqa-green); color: var(--teqa-green); }

/* Danger — rouge */
.btn-danger {
  background: var(--teqa-red-dim);
  color: var(--teqa-red);
  border: 0.5px solid rgba(239, 68, 68, 0.25);
  border-radius: 10px;
  padding: 11px 20px;
  font-size: 14px;
  cursor: pointer;
}
```

---

## 6. Navigation / Sidebar

### Sidebar dark (desktop)
- Fond `#1e1e1e` (plus sombre que le BG principal)
- Largeur : 220px collapsed / 56px icon-only
- Items actif : fond `--teqa-green-dim` + texte `--teqa-green` + `border-left: 3px solid var(--teqa-green)`
- Items inactif : texte `--teqa-muted`, hover fond `rgba(255,255,255,0.04)`
- Logo TEQA en haut
- Avatar + nom utilisateur en bas

### Structure des items par rôle
```
Agency Owner :
  - Dashboard
  - Marketplace (offres publiées)
  - Collaborations
  - Agents (gestion équipe)
  - Commissions & Wallet
  - Messages
  - Paramètres

Agency Agent :
  - Dashboard
  - Marketplace (parcourir offres)
  - Mes Collaborations
  - Commissions
  - Messages
  - Paramètres
```

---

## 7. Cards & Composants réutilisables

### Card standard
```css
.teqa-card {
  background: var(--teqa-surface);
  border-radius: 14px;
  border: 0.5px solid var(--teqa-border);
  padding: 16px 20px;
}
.teqa-card-header {
  font-size: 10px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--teqa-hint);
  font-weight: 500;
  padding-bottom: 12px;
  border-bottom: 0.5px solid var(--teqa-border);
  margin-bottom: 14px;
}
```

### Stat card (métriques dashboard)
```tsx
interface StatCardProps {
  value: string | number
  label: string
  delta?: string
  deltaType?: 'up' | 'down' | 'neutral'
}
// delta color: up → --teqa-green, down → --teqa-red, neutral → --teqa-muted
```

### Badges / Pills
```css
.badge          { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
.badge-green    { background: var(--teqa-green-dim); color: var(--teqa-green); }
.badge-blue     { background: var(--teqa-blue-dim);  color: var(--teqa-blue); }
.badge-red      { background: var(--teqa-red-dim);   color: var(--teqa-red); }
.badge-neutral  { background: rgba(255,255,255,0.07); color: var(--teqa-muted); }
```

### Mapping status → badge
```ts
const statusBadge = {
  active:    'badge-green',
  pending:   'badge-blue',
  rejected:  'badge-red',
  cancelled: 'badge-red',
  countered: 'badge-neutral',
  inactive:  'badge-neutral',
  paid:      'badge-green',
  failed:    'badge-red',
}
```

---

## 8. Offre Marketplace — Card

Structure :
- En-tête : nom de l'offre + badge rôle (Agence vert / Agent bleu)
- Prix en vert aligné à droite
- Description courte grisée
- Tags : étoile (rating), nombre de collabs, localisation
- Footer : 2 boutons — "Négocier" (outline) + "Accepter" (vert plein)

---

## 9. Négociation — Thread

Le thread de négociation ressemble à une messagerie :
- Bulles gauche `--teqa-surface2` = message de l'autre partie
- Bulles droite `--teqa-green` fond vert = mes messages
- Chaque bulle a un label de rôle en `font-size: 10px` au-dessus
- Les contre-offres affichent le prix en `font-weight: 500`
- Message d'acceptation : icône check vert + texte "Accepté à X MAD"
- Footer : champ texte + bouton envoyer vert

---

## 10. Dashboard

### Layout desktop
```
┌─────────────────────────────────────────────────────┐
│ Sidebar 220px │ Header (salutation + notif)          │
│               │─────────────────────────────────────│
│               │ Stat cards row (3-4 métriques)       │
│               │─────────────────────────────────────│
│               │ Collaborations actives | Activité    │
│               │                        récente       │
└─────────────────────────────────────────────────────┘
```

### Stat cards principales
- Agency Owner : Collaborations actives / Revenus du mois / Taux de confirmation / Agents actifs
- Agency Agent : Collaborations / Commandes confirmées / Revenus / Taux

---

## 11. États & Feedback

### Toast notifications
```css
/* Position: bottom-right, max 3 toasts empilés */
.toast         { background: var(--teqa-surface); border: 0.5px solid var(--teqa-border-md); border-radius: 10px; padding: 12px 16px; }
.toast-success { border-left: 3px solid var(--teqa-green); }
.toast-error   { border-left: 3px solid var(--teqa-red); }
.toast-info    { border-left: 3px solid var(--teqa-blue); }
```

### Skeleton loading
- Fond `var(--teqa-surface2)` avec animation shimmer de gauche à droite
- Couleur shimmer `rgba(255,255,255,0.06)`

### État vide (empty state)
- Icône Tabler outline centré en `--teqa-hint`
- Titre en `--teqa-muted`
- Bouton CTA vert si action disponible

---

## 12. Animations globales

```css
/* Toutes les transitions */
* { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }

/* Page load — stagger fade-in */
@keyframes teqa-fadein {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter { animation: teqa-fadein 0.3s ease forwards; }

/* Hover sur cards */
.teqa-card { transition: border-color 0.2s; }
.teqa-card:hover { border-color: var(--teqa-border-md); }

/* Focus ring inputs */
.teqa-input:focus { box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15); }
```

---

## 13. Responsive

| Breakpoint | Comportement |
|---|---|
| `> 1024px` | Sidebar expanded 220px |
| `768–1024px` | Sidebar icon-only 56px |
| `< 768px` | Sidebar cachée, bottom nav 4 items |

### Bottom nav mobile (< 768px)
- 4 items max : Dashboard / Marketplace / Collabs / Profil
- Item actif : icône + label vert
- Fond `#1e1e1e`, border-top `0.5px solid var(--teqa-border)`

---

## 14. Structure de fichiers recommandée

```
src/
├── styles/
│   ├── globals.css          ← variables CSS TEQA + reset
│   ├── components.css       ← classes réutilisables (btn, badge, card...)
│   └── animations.css       ← keyframes
├── components/
│   ├── ui/
│   │   ├── TeqaLogo.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── StatCard.tsx
│   │   ├── Toast.tsx
│   │   └── Skeleton.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── BottomNav.tsx
│   ├── marketplace/
│   │   ├── OfferCard.tsx
│   │   ├── OfferList.tsx
│   │   └── NegotiationThread.tsx
│   └── dashboard/
│       ├── StatsRow.tsx
│       └── CollaborationList.tsx
├── pages/ (ou app/)
│   ├── login/
│   ├── dashboard/
│   ├── marketplace/
│   ├── collaborations/
│   ├── commissions/
│   └── messages/

......
```

---

## 15. Règles absolues à respecter

1. **Ne jamais utiliser de fond blanc ou clair** — tout est dark (`#2e2e2e` minimum)
2. **Tout texte sur fond coloré** utilise la version `dim` (opacity 0.12) + texte pleine couleur
3. **Les borders font 0.5px**, jamais 1px, sauf focus ring (3px outline teinté)
4. **Le vert est le CTA principal** — bouton submit, accepter, confirmer = toujours vert
5. **Le rouge est destructif uniquement** — refus, suppression, erreur
6. **Le bleu identifie les agents** — jamais utilisé comme CTA principal
7. **Icons = Tabler outline uniquement** via `<i class="ti ti-NOM">` ou `lucide-react`
8. **Font-size minimum : 10px** pour les labels uppercase
9. **Toujours inclure le loading screen** au premier rendu de l'app
10. **Les toasts remplacent les alerts natifs** du navigateur

---

*Ce fichier est la source de vérité du design TEQA frontend.*
*Toute déviation doit être validée avant implémentation.*