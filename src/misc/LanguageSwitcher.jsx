// src/components/LanguageSwitcher.jsx
import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

export default function LanguageSwitcher() {
  const { lang, changeLanguage } = useContext(LanguageContext);

  // Déterminer le nom complet de la langue
  const getLanguageName = (code) => {
    switch (code) {
      case "fr": return "Français";
      case "en": return "English";
      case "ar": return " (soon) العربية";
      default: return code;
    }
  };

  return (
    <div className="relative group">
      {/* Version avec icône et dropdown */}
      <div className="flex items-center gap-1 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <GlobeAltIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getLanguageName(lang)}
        </span>
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        <div className="py-1">
          {[
            { code: "fr", label: "Français", flag: "🇫🇷" },
            { code: "en", label: "English", flag: "🇺🇸" },
            { code: "ar", label: "العربية (soon) ", flag: "🇸🇦" }
          ].map((language) => (
            <button
  key={language.code}
  disabled={language.code === "ar"}
  onClick={() => language.code !== "ar" && changeLanguage(language.code)}
  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
    ${language.code === "ar"
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-gray-100 dark:hover:bg-gray-700"}
    ${
      lang === language.code
        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        : "text-gray-700 dark:text-gray-300"
    }
  `}
>
  <span className="text-lg">{language.flag}</span>
  <span className="flex-1">{language.label}</span>

  {lang === language.code && (
    <svg
      className="w-4 h-4 text-blue-600 dark:text-blue-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )}
</button>

          ))}
        </div>
      </div>
    </div>
  );
}
