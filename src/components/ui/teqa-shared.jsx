// components/ui/teqa-shared.jsx
// Composants partagés TEQA — importer depuis ce fichier dans toutes les pages

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info, ChevronLeft, ChevronRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   ICON BOX
   Règle : toutes les icônes dans un container dim carré arrondi
───────────────────────────────────────────────────────────── */

export const ICON_VARIANTS = {
  green:   { bg: "var(--teqa-green-dim)", color: "var(--teqa-green)"   },
  blue:    { bg: "var(--teqa-blue-dim)",  color: "var(--teqa-blue)"    },
  red:     { bg: "var(--teqa-red-dim)",   color: "var(--teqa-red)"     },
  warning: { bg: "rgba(245,158,11,0.12)", color: "var(--teqa-warning)" },
  neutral: { bg: "var(--teqa-surface3)",  color: "var(--teqa-muted)"   },
};

export const IconBox = ({ icon: Icon, variant = "neutral", size = 16, boxSize = 34 }) => {
  const { bg, color } = ICON_VARIANTS[variant] || ICON_VARIANTS.neutral;
  return (
    <div style={{
      width: boxSize, height: boxSize, borderRadius: 8, flexShrink: 0,
      background: bg, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={size} style={{ color }} />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   METRIC CARD
───────────────────────────────────────────────────────────── */

export const MetricCard = ({ title, value, sub, icon: Icon, iconVariant = "green", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="teqa-card teqa-stat"
  >
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
      <p className="teqa-stat__label">{title}</p>
      <IconBox icon={Icon} variant={iconVariant} size={15} boxSize={30} />
    </div>
    <p className="teqa-stat__value">{value}</p>
    {sub && <p className="teqa-stat__delta teqa-stat__delta--neutral">{sub}</p>}
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────
   TEQA MODAL
───────────────────────────────────────────────────────────── */

export const TeqaModal = ({ open, onClose, title, subtitle, icon: Icon, iconVariant = "blue", accentColor, maxWidth = 640, children, footer }) => {
  if (!open) return null;
  const accent = accentColor || "var(--teqa-green)";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -12 }}
        transition={{ duration: 0.16 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--teqa-surface)",
          border: "0.5px solid var(--teqa-border-md)",
          borderRadius: 16,
          maxWidth, width: "100%",
          maxHeight: "88vh",
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Accent top bar */}
        <div style={{ height: 3, background: accent, flexShrink: 0 }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "0.5px solid var(--teqa-border)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Icon && <IconBox icon={Icon} variant={iconVariant} size={18} boxSize={38} />}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--teqa-text)", margin: 0, fontFamily: "var(--font-display)" }}>{title}</h3>
              {subtitle && <p style={{ fontSize: 11, color: "var(--teqa-muted)", margin: "2px 0 0" }}>{subtitle}</p>}
            </div>
          </div>
          <button className="icon-button" style={{ width: 30, height: 30 }} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="var(--teqa-muted)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "16px 18px", flex: 1 }} className="app-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            borderTop: "0.5px solid var(--teqa-border)",
            padding: "12px 18px",
            display: "flex", justifyContent: "flex-end", gap: 8,
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   TEQA TOAST  (autonome, remplace le Toast inline)
───────────────────────────────────────────────────────────── */

export const TeqaToast = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const map = {
    success: { icon: CheckCircle, borderColor: "var(--teqa-green)" },
    error:   { icon: AlertCircle, borderColor: "var(--teqa-red)"   },
    info:    { icon: Info,        borderColor: "var(--teqa-blue)"  },
  };
  const { icon: Icon, borderColor } = map[type] || map.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: -10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      style={{ position: "fixed", top: 80, right: 16, zIndex: 9999 }}
    >
      <div className="toast-card" style={{ borderLeftColor: borderColor }}>
        <div className="toast-icon" style={{ color: borderColor }}>
          <Icon size={16} />
        </div>
        <p className="toast-title">{message}</p>
        <button className="toast-close" onClick={onClose}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   LOADING SCREEN (pyramide TEQA)
───────────────────────────────────────────────────────────── */

export const TeqaLoader = ({ label = "Chargement…" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 14 }}>
    <svg width="52" height="48" viewBox="0 0 18 22" fill="none">
      <polygon className="teqa-loading-tri"  points="9,0 18,8 0,8"              fill="var(--teqa-green)" />
      <rect    className="teqa-loading-bar1" x="2" y="10" width="14" height="4" rx="1" fill="var(--teqa-blue)"  />
      <rect    className="teqa-loading-bar2" x="0" y="16" width="18" height="4" rx="1" fill="var(--teqa-red)"   />
    </svg>
    <p style={{ fontSize: 13, color: "var(--teqa-muted)", margin: 0 }}>{label}</p>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   ERROR STATE
───────────────────────────────────────────────────────────── */

export const TeqaError = ({ message, onRetry }) => (
  <div className="alert-danger" style={{ borderRadius: 14, padding: 28, textAlign: "center", maxWidth: 460, margin: "40px auto" }}>
    <IconBox icon={AlertCircle} variant="red" size={22} boxSize={48} />
    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--teqa-red)", margin: "12px 0 6px" }}>Erreur de chargement</p>
    <p style={{ fontSize: 13, color: "var(--teqa-red)", opacity: 0.8, margin: "0 0 16px" }}>{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-danger" style={{ margin: "0 auto" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
          <path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
        </svg>
        Réessayer
      </button>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */

export const TeqaEmpty = ({ icon: Icon, title, subtitle }) => (
  <div style={{ padding: "48px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <IconBox icon={Icon} variant="neutral" size={22} boxSize={52} />
    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--teqa-text)", margin: 0 }}>{title}</p>
    {subtitle && <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0 }}>{subtitle}</p>}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────────────────────── */

export const TeqaPagination = ({ currentPage, totalPages, total, itemsPerPage, onPage }) => {
  if (totalPages <= 1) return null;
  const from = (currentPage - 1) * itemsPerPage + 1;
  const to   = Math.min(currentPage * itemsPerPage, total);

  return (
    <div style={{
      padding: "10px 16px",
      borderTop: "0.5px solid var(--teqa-border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "var(--teqa-surface2)",
    }}>
      <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0 }}>
        {from}–{to} sur {total}
      </p>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <button onClick={() => onPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="icon-button"
          style={{ width: 30, height: 30, opacity: currentPage === 1 ? 0.4 : 1 }}>
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPage(() => p)} style={{
            width: 30, height: 30, borderRadius: 8, border: "0.5px solid",
            borderColor: p === currentPage ? "var(--teqa-green)" : "var(--teqa-border)",
            background: p === currentPage ? "var(--teqa-green-dim)" : "transparent",
            color: p === currentPage ? "var(--teqa-green)" : "var(--teqa-muted)",
            fontSize: 12, fontWeight: p === currentPage ? 600 : 400, cursor: "pointer", transition: "all 0.15s",
          }}>{p}</button>
        ))}
        <button onClick={() => onPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="icon-button"
          style={{ width: 30, height: 30, opacity: currentPage === totalPages ? 0.4 : 1 }}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   INFO ROW (dans un modal)
───────────────────────────────────────────────────────────── */

export const InfoRow = ({ label, children, variant }) => {
  const bg = variant === "green" ? "rgba(34,197,94,0.06)" : variant === "red" ? "rgba(239,68,68,0.06)" : variant === "warning" ? "rgba(245,158,11,0.06)" : "var(--teqa-surface2)";
  const border = variant === "green" ? "0.5px solid rgba(34,197,94,0.2)" : variant === "red" ? "0.5px solid rgba(239,68,68,0.2)" : "0.5px solid var(--teqa-border)";
  return (
    <div style={{ background: bg, border, borderRadius: 10, padding: "10px 14px" }}>
      <p className="text-label" style={{ marginBottom: 5 }}>{label}</p>
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   PAYMENT ATTEMPT ITEM
───────────────────────────────────────────────────────────── */

export const AttemptItem = ({ attempt, idx, currency, formatPrice, formatDate }) => {
  const ok = attempt.status === "success";
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      style={{
        borderRadius: 10,
        border: `0.5px solid ${ok ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
        background: ok ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
        padding: "12px 14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconBox icon={ok ? CheckCircle : AlertCircle} variant={ok ? "green" : "red"} size={13} boxSize={28} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--teqa-text)", margin: 0 }}>Tentative #{idx + 1}</p>
            <p style={{ fontSize: 11, color: "var(--teqa-muted)", margin: "2px 0 0" }}>{formatDate(attempt.attempted_at)}</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--teqa-text)", margin: 0 }}>
            {formatPrice(attempt.required_amount, currency)}
          </p>
          {attempt.available_balance != null && (
            <p style={{ fontSize: 11, color: "var(--teqa-muted)", margin: "2px 0 0" }}>
              Dispo : {formatPrice(attempt.available_balance, currency)}
            </p>
          )}
        </div>
      </div>
      {attempt.error_code && (
        <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: "var(--teqa-red-dim)", display: "flex", gap: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-red)", margin: 0 }}>{attempt.error_code}</p>
          {attempt.error_message && <p style={{ fontSize: 11, color: "var(--teqa-red)", margin: 0, opacity: 0.8 }}>— {attempt.error_message}</p>}
        </div>
      )}
    </motion.div>
  );
};