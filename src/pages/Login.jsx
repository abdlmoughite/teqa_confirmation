import { motion } from "framer-motion";
import { clsx } from "clsx";
import { LockKeyhole } from "lucide-react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
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
      className={clsx(
        "flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:p-6 lg:p-8",
        className
      )}
    >
      <Card className="w-full max-w-md" bodyClassName="space-y-6">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-600 text-white dark:bg-primary-500">
            <LockKeyhole size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {t("login.title", "Connexion")}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("login.subtitle", "Accedez a votre espace TeqaConnect.")}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          {t("login.external", "La connexion est geree par le service Auth TeqaConnect.")}
        </div>

        <Button as="a" href={process.env.REACT_APP_LOGIN_URL || "https://teqaconnect.com/login"} className="w-full">
          {t("login.open", "Ouvrir la page de connexion")}
        </Button>
      </Card>
    </motion.main>
  );
};

export default Login;
