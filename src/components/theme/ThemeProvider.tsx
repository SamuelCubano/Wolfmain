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
  root.setAttribute("data-theme", resolved);
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function readInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const cookie = readCookie("wolfmain-theme") as ThemeMode | null;
  if (cookie === "light" || cookie === "dark" || cookie === "system") return cookie;
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
    try {
      localStorage.setItem("wolfmain-theme", nextMode);
      document.cookie = `wolfmain-theme=${encodeURIComponent(nextMode)}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
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
