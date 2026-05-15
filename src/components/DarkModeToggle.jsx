import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function DarkModeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="btn-icon btn-ghost"
      title={dark ? "Mode clair" : "Mode sombre"}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export default DarkModeToggle;
