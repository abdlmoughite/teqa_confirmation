// src/components/misc/ThemeToggle.jsx
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="
        relative w-14 h-7 rounded-full p-1 transition-all duration-300
        bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-900
        hover:from-gray-400 hover:to-gray-500 dark:hover:from-gray-600 dark:hover:to-gray-800
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        shadow-lg hover:shadow-xl
        overflow-hidden
      "
      aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {/* Bouton circulaire qui glisse */}
      <div className={`
        absolute top-1 left-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800
        transform transition-all duration-300 ease-in-out
        ${theme === "dark" ? "translate-x-7" : "translate-x-0"}
        shadow-md flex items-center justify-center
      `}>
        {/* Animation des étoiles en mode dark */}
        {theme === "dark" && (
          <>
            <div className="absolute -top-1 -left-1 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
            <div className="absolute -top-1 right-0 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse delay-100"></div>
            <div className="absolute bottom-0 -right-1 w-0.5 h-0.5 bg-yellow-100 rounded-full animate-pulse delay-200"></div>
          </>
        )}
      </div>

      {/* Icônes à l'intérieur */}
      <div className="relative w-full h-full flex items-center justify-between px-1">
        <SunIcon className={`
          w-4 h-4 transition-all duration-300
          ${theme === "dark" ? "text-yellow-500 opacity-50" : "text-yellow-500"}
        `} />

        <MoonIcon className={`
          w-4 h-4 transition-all duration-300
          ${theme === "dark" ? "text-blue-300" : "text-gray-400 opacity-50"}
        `} />
      </div>
    </button>
  );
}
