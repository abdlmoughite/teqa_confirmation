// src/context/LanguageContext.jsx
import { createContext, useEffect, useState, useContext } from "react";
import { updateLanguage } from "../api/auth";
import { AuthContext } from "./AuthContext";

// Translations
import fr from "../translations/fr";
import en from "../translations/en";
import ar from "../translations/ar";

export const LanguageContext = createContext();

const dictionaries = { fr, en, ar };

export const LanguageProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [lang, setLang] = useState("fr");

  // -------------------------------------------------------
  // 🔵 Appliquer la langue
  // -------------------------------------------------------
  const applyLang = (lng) => {
    setLang(lng);
    localStorage.setItem("lang", lng);

    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
  };

  // -------------------------------------------------------
  // 🔵 Initialisation automatique
  // -------------------------------------------------------
  useEffect(() => {
    if (user?.language) {
      applyLang(user.language);
      return;
    }

    const saved = localStorage.getItem("lang");
    if (saved) {
      applyLang(saved);
      return;
    }

    applyLang("fr");
  }, [user]);

  // -------------------------------------------------------
  // 🔵 Fonction de traduction
  // -------------------------------------------------------
  const t = (key, fallback = "") => {
    try {
      const value = key
        .split(".")
        .reduce((obj, subKey) => obj?.[subKey], dictionaries[lang]);

      return value ?? fallback ?? key;
    } catch {
      return fallback || key;
    }
  };

  // -------------------------------------------------------
  // 🔵 Changement manuel + sync backend
  // -------------------------------------------------------
  const changeLanguage = async (newLang) => {
    applyLang(newLang);

    if (user) {
      try {
        await updateLanguage({ language: newLang });
      } catch (err) {
        console.error("Language sync failed:", err);
      }
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        isRTL: lang === "ar",
        t,
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
