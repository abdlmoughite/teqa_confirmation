// src/context/ThemeContext.jsx
import { createContext, useEffect, useState, useContext } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // ----------------------------------------------------
  // APPLY THEME TO <html> (Tailwind compatible)
  // ----------------------------------------------------
  const applyTheme = (mode) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);

    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // ----------------------------------------------------
  // LOAD THEME ON APP START
  // ----------------------------------------------------
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved) {
      applyTheme(saved);
      return;
    }

    // Default = light
    applyTheme("light");
  }, []);

  // ----------------------------------------------------
  // Toggle (light <-> dark)
  // ----------------------------------------------------
  const toggleTheme = () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper (optional)
export const useTheme = () => useContext(ThemeContext);
