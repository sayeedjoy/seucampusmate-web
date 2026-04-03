"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeProviderProps = {
  children: React.ReactNode
  attribute?: string | string[]
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
}

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{transition:none!important;animation:none!important}"
    )
  )
  document.head.appendChild(style)
  void window.getComputedStyle(document.body)
  setTimeout(() => {
    document.head.removeChild(style)
  }, 1)
}

function applyThemeToDom(
  resolved: ResolvedTheme,
  attribute: string | string[],
  disableTransitionOnChange: boolean
) {
  if (disableTransitionOnChange) disableTransitionsTemporarily()

  const attrs = Array.isArray(attribute) ? attribute : [attribute]
  for (const attr of attrs) {
    if (attr === "class") {
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(resolved)
      continue
    }

    if (attr.startsWith("data-")) {
      document.documentElement.setAttribute(attr, resolved)
    }
  }

  document.documentElement.style.colorScheme = resolved
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>("light")

  React.useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(storageKey) as Theme | null
      const initialTheme = storedTheme ?? defaultTheme
      const resolved =
        initialTheme === "system"
          ? enableSystem
            ? getSystemTheme()
            : "light"
          : initialTheme

      setThemeState(initialTheme)
      setResolvedTheme(resolved)
      applyThemeToDom(resolved, attribute, disableTransitionOnChange)
    } catch {
      const fallbackResolved =
        defaultTheme === "system"
          ? enableSystem
            ? getSystemTheme()
            : "light"
          : defaultTheme

      setThemeState(defaultTheme)
      setResolvedTheme(fallbackResolved)
      applyThemeToDom(fallbackResolved, attribute, disableTransitionOnChange)
    }
  }, [attribute, defaultTheme, disableTransitionOnChange, enableSystem, storageKey])

  React.useEffect(() => {
    if (!enableSystem || theme !== "system") return

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const nextResolved = getSystemTheme()
      setResolvedTheme(nextResolved)
      applyThemeToDom(nextResolved, attribute, disableTransitionOnChange)
    }

    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [attribute, disableTransitionOnChange, enableSystem, theme])

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      const nextTheme = (event.newValue as Theme | null) ?? defaultTheme
      const nextResolved =
        nextTheme === "system"
          ? enableSystem
            ? getSystemTheme()
            : "light"
          : nextTheme

      setThemeState(nextTheme)
      setResolvedTheme(nextResolved)
      applyThemeToDom(nextResolved, attribute, disableTransitionOnChange)
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [attribute, defaultTheme, disableTransitionOnChange, enableSystem, storageKey])

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      const nextResolved =
        nextTheme === "system"
          ? enableSystem
            ? getSystemTheme()
            : "light"
          : nextTheme

      setThemeState(nextTheme)
      setResolvedTheme(nextResolved)
      applyThemeToDom(nextResolved, attribute, disableTransitionOnChange)
      try {
        window.localStorage.setItem(storageKey, nextTheme)
      } catch {
        // localStorage can be unavailable in private contexts
      }
    },
    [attribute, disableTransitionOnChange, enableSystem, storageKey]
  )

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
