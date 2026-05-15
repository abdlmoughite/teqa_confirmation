import { useContext } from "react";
import { Globe } from "lucide-react";

import { LanguageContext } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

const languages = [
  { code: "en", label: "English", badge: "EN", disabled: false },
  { code: "fr", label: "French (soon)", badge: "FR", disabled: true },
  { code: "ar", label: "Arabic (soon)", badge: "AR", disabled: true },
];

export default function LanguageSwitcher() {
  const { lang, changeLanguage } = useContext(LanguageContext);
  const toast = useToast();

  const activeLanguage = languages.find((language) => language.code === lang) || languages[0];

  const handleSelect = (language) => {
    if (language.disabled) {
      toast.info("Only English is available right now. Other languages are disabled.", "Language unavailable");
      return;
    }
    changeLanguage(language.code);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        title="Only English is available right now. Other languages are disabled."
      >
        <Globe size={16} />
        <span>{activeLanguage.badge}</span>
      </button>

      <div className="invisible absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-1 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800">
        <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
          Only English is available right now.
        </p>
        {languages.map((language) => (
          <button
            key={language.code}
            type="button"
            disabled={language.disabled}
            onClick={() => handleSelect(language)}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
              language.disabled
                ? "cursor-not-allowed text-slate-400"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            } ${lang === language.code ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300" : ""}`}
          >
            <span className="w-8 rounded bg-slate-100 px-1.5 py-0.5 text-center text-xs font-semibold dark:bg-slate-900">
              {language.badge}
            </span>
            <span>{language.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
