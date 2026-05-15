import { useContext } from "react";

import { LanguageContext } from "../context/LanguageContext";

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  const locale = context?.lang || "fr";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return {
    t: context?.t || ((key, fallback) => fallback || key),
    locale,
    lang: locale,
    dir,
    isRTL: dir === "rtl",
    setLocale: context?.changeLanguage,
    changeLanguage: context?.changeLanguage,
    supportedLanguages: context?.supportedLanguages || ["fr", "en", "ar"],
  };
};

export default useTranslation;
