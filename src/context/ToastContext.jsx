import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type = "info", duration = 4200 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast = { id, title, message, type };

      setToasts((current) => [toast, ...current].slice(0, 5));

      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      success: (message, title = "Success") => showToast({ type: "success", title, message }),
      error: (message, title = "Error") => showToast({ type: "error", title, message, duration: 6200 }),
      warning: (message, title = "Warning") => showToast({ type: "warning", title, message }),
      info: (message, title = "Info") => showToast({ type: "info", title, message }),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-relevant="additions removals">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const Icon = TOAST_ICONS[toast.type] || Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 18, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`toast-card toast-card--${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <div className="toast-icon">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="toast-title">{toast.title}</p>
        {toast.message ? <p className="toast-message">{toast.message}</p> : null}
      </div>
      <button type="button" onClick={onClose} className="toast-close" aria-label="Close notification">
        <X size={15} />
      </button>
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
};
