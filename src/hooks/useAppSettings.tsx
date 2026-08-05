import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AppSettings {
  theme: "light" | "dark";
  toggleTheme: () => void;
  hidden: boolean;
  toggleHidden: () => void;
}

const AppSettingsContext = createContext<AppSettings | null>(null);

const STORAGE_KEY = "meu-bolso:theme";

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const toggleHidden = useCallback(() => setHidden((v) => !v), []);

  const value = useMemo(
    () => ({ theme, toggleTheme, hidden, toggleHidden }),
    [theme, toggleTheme, hidden, toggleHidden],
  );

  return (
    <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettings {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings precisa estar dentro de AppSettingsProvider");
  return ctx;
}
