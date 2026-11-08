"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

function readInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const saved = localStorage.getItem("wolfmain-theme") as ThemeMode | null;
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readInitialMode());
  const [resolved, setResolved] = useState<"light" | "dark">(() => {
    const m = readInitialMode();
    return m === "system" ? getSystemTheme() : m;
  });

  const update = useCallback((nextMode: ThemeMode) => {
    const nextResolved = nextMode === "system" ? getSystemTheme() : nextMode;
    setModeState(nextMode);
    setResolved(nextResolved);
    applyTheme(nextResolved);
    localStorage.setItem("wolfmain-theme", nextMode);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const current = (localStorage.getItem("wolfmain-theme") as ThemeMode) || "system";
      if (current === "system") {
        const r = mq.matches ? "dark" : "light";
        setResolved(r);
        applyTheme(r);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode: update }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
