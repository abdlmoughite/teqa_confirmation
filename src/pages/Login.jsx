import { motion } from "framer-motion";
import { clsx } from "clsx";
import { LockKeyhole } from "lucide-react";

import Button from "../components/ui/Button";
import TeqaLogo from "../components/ui/TeqaLogo";
import { useTranslation } from "../hooks/useTranslation";

const Login = ({ className }) => {
  const { t, dir } = useTranslation();

  return (
    <motion.main
      dir={dir}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={clsx("teqa-login", className)}
    >
      <div
        className="w-full max-w-sm"
        style={{
          background: "var(--teqa-surface)",
          border: "0.5px solid var(--teqa-border-md)",
          borderRadius: 16,
          padding: "32px 28px",
          boxShadow: "0 20px 56px rgba(0,0,0,0.18)",
        }}
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <TeqaLogo size="lg" />
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--teqa-text)", marginBottom: 6, letterSpacing: 0 }}>
            {t("login.title", "Connexion")}
          </h1>
          <p style={{ fontSize: 13, color: "var(--teqa-muted)" }}>
            {t("login.subtitle", "Accédez à votre espace TeqaConnect.")}
          </p>
        </div>

        {/* Info banner */}
        <div
          className="mb-6 flex items-start gap-3 rounded-lg p-3.5 text-sm"
          style={{
            background: "var(--teqa-blue-dim)",
            border: "0.5px solid rgba(8,145,178,0.25)",
            color: "var(--teqa-blue)",
          }}
        >
          <LockKeyhole size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{t("login.external", "La connexion est gérée par le service Auth TeqaConnect.")}</span>
        </div>

        {/* CTA */}
        <Button
          as="a"
          href={process.env.REACT_APP_LOGIN_URL || "https://teqa.net/login"}
          className="w-full"
          size="lg"
        >
          {t("login.open", "Ouvrir la page de connexion")}
        </Button>

        <p
          className="mt-5 text-center text-xs"
          style={{ color: "var(--teqa-hint)" }}
        >
          TEQA Marketplace · v1.0
        </p>
      </div>
    </motion.main>
  );
};

export default Login;
