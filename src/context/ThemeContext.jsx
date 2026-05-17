import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("teqa-theme");
    if (saved) return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
  });

  const applyTheme = useCallback((mode) => {
    const nextMode = mode === "dark" ? "dark" : "light";
    setTheme(nextMode);
    localStorage.setItem("teqa-theme", nextMode);
    document.documentElement.classList.toggle("dark", nextMode === "dark");
    document.documentElement.classList.toggle("light", nextMode === "light");
    document.documentElement.dataset.theme = nextMode;
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [applyTheme, theme]);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [applyTheme, theme]);

  const value = useMemo(
    () => ({ theme, dark: theme === "dark", applyTheme, toggleTheme }),
    [theme, applyTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
