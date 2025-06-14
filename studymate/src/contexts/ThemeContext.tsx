
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Helper to safely access localStorage
const getLocalStorage = (key: string, defaultValue: string): string => {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.warn("localStorage access denied:", error);
    return defaultValue;
  }
};

// Helper to safely set localStorage
const setLocalStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn("localStorage write denied:", error);
  }
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Always default to dark mode for new users
  const [theme, setTheme] = useState<Theme>(
    () => getLocalStorage("theme", "dark") as Theme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    // Use helper function for localStorage
    setLocalStorage("theme", theme);
  }, [theme]);

  // Force dark mode as the default for first-time visitors
  useEffect(() => {
    // If no theme is set in localStorage, set it to dark
    if (!localStorage.getItem("theme")) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
