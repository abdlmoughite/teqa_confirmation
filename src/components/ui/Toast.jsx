import { X } from "lucide-react";
import { clsx } from "clsx";

const Toast = ({ type = "info", title, message, onClose, className }) => (
  <div className={clsx("toast-card", `toast-card--${type}`, className)} role={type === "error" ? "alert" : "status"}>
    <div className="min-w-0 flex-1">
      {title ? <p className="toast-title">{title}</p> : null}
      {message ? <p className="toast-message">{message}</p> : null}
    </div>
    {onClose ? (
      <button type="button" onClick={onClose} className="toast-close" aria-label="Fermer la notification">
        <X size={15} />
      </button>
    ) : null}
  </div>
);

export default Toast;
