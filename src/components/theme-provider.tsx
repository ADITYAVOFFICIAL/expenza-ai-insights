import React, { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme", // Ensure this matches your storage key in App.tsx
  ...props
}: ThemeProviderProps) {
  const { user, updateUserThemePreferences } = useAuth(); // Get user and update function

  const [theme, setThemeState] = useState<Theme>(() => {
    // Prioritize user profile theme, then localStorage, then default
    const userTheme = user?.themePreference;
    if (userTheme) return userTheme;
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    return storedTheme || defaultTheme;
  });

  useEffect(() => {
    // If user logs in/out or their profile theme changes, update component state
    if (user?.themePreference && user.themePreference !== theme) {
      setThemeState(user.themePreference);
    } else if (!user && localStorage.getItem(storageKey) !== theme) {
      // User logged out, fall back to localStorage or default
      setThemeState((localStorage.getItem(storageKey) as Theme) || defaultTheme);
    }
  }, [user, theme, storageKey, defaultTheme]);


  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
    }
    root.classList.add(effectiveTheme);

  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme); // Keep localStorage for immediate offline access/fallback
    setThemeState(newTheme);
    if (user?.$id) {
      updateUserThemePreferences(user.$id, { themePreference: newTheme });
    }
  };

  const value = {
    theme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}