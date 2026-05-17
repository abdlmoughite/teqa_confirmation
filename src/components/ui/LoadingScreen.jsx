import { useEffect, useState } from "react";
import { clsx } from "clsx";

const LoadingScreen = ({ duration = 1500 }) => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLeaving(true), duration);
    const removeTimer = window.setTimeout(() => setVisible(false), duration + 300);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [duration]);

  if (!visible) return null;

  return (
    <div className={clsx("teqa-loading-screen", leaving && "teqa-loading-screen--leaving")}>
      <svg className="teqa-loading-mark" width="60" height="70" viewBox="0 0 18 22" fill="none" aria-hidden="true">
        <polygon className="teqa-loading-tri" points="9,0 18,8 0,8" fill="var(--teqa-green)" />
        <rect className="teqa-loading-bar1" x="2" y="10" width="14" height="4" rx="1" fill="var(--teqa-blue)" />
        <rect className="teqa-loading-bar2" x="0" y="16" width="18" height="4" rx="1" fill="var(--teqa-red)" />
      </svg>

      <div className="teqa-loading-wordmark">TEQA</div>

      <div className="teqa-loading-dots" aria-label="Chargement">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
};

export default LoadingScreen;
