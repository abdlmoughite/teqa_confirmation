import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { updateLanguage } from "../api/auth";
import { AuthContext } from "./AuthContext";
import { useToast } from "./ToastContext";

import fr from "../translations/fr";
import en from "../translations/en";
import ar from "../translations/ar";

export const LanguageContext = createContext();

const dictionaries = { fr, en, ar };
const supportedLanguages = ["en"];

const normalizeLanguage = (language) =>
  supportedLanguages.includes(language) ? language : "en";

export const LanguageProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [lang, setLang] = useState(() =>
    normalizeLanguage(localStorage.getItem("teqa-lang") || localStorage.getItem("lang") || "en")
  );

  const applyLang = useCallback((lng) => {
    const nextLang = normalizeLanguage(lng);
    setLang(nextLang);
    localStorage.setItem("teqa-lang", nextLang);
    localStorage.removeItem("lang");
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    if (user?.language) {
      applyLang(user.language);
      return;
    }

    applyLang(lang);
  }, [applyLang, lang, user?.language]);

  const t = useCallback((key, fallback = "") => {
    try {
      const value = key
        .split(".")
        .reduce((obj, subKey) => obj?.[subKey], dictionaries[lang]);

      return value ?? fallback ?? key;
    } catch {
      return fallback || key;
    }
  }, [lang]);

  const changeLanguage = useCallback(async (newLang) => {
    const previousLang = lang;
    const nextLang = normalizeLanguage(newLang);
    if (newLang !== nextLang) {
      toast.info("Only English is available right now. Other languages are disabled.", "Language unavailable");
      return;
    }
    applyLang(nextLang);

    if (!user) return;

    try {
      await updateLanguage({ language: nextLang });
      toast.success("La langue a ete mise a jour.", "Preference enregistree");
    } catch (err) {
      applyLang(previousLang);
      toast.error("Impossible de changer la langue.", "Synchronisation echouee");
    }
  }, [applyLang, lang, toast, user]);

  const value = useMemo(
    () => ({
      lang,
      locale: lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      isRTL: lang === "ar",
      t,
      setLocale: changeLanguage,
      changeLanguage,
      supportedLanguages,
    }),
    [lang, t, changeLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
