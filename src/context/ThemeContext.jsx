import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./themeContextInstance";

const STORAGE_KEY = "beyonex-dashboard-theme";
const THEMES = ["light", "dark"];

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (THEMES.includes(saved)) return saved;
  return "light";
}

function applyThemeToDocument(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const initial = getInitialTheme();
    if (typeof document !== "undefined") {
      applyThemeToDocument(initial);
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return;
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
