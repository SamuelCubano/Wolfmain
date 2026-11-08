"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionAction, logoutAction } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/auth";
import { useTheme } from "@/components/theme/ThemeProvider";

function ThemeIcon({ mode }: { mode: "light" | "dark" | "system" }) {
  if (mode === "dark") {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    );
  }
  if (mode === "light") {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export default function AuthNavbar() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { mode, setMode } = useTheme();

  useEffect(() => {
    getSessionAction().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) setOpen(false);
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  function cycleTheme() {
    const next = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <span className="animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/60 w-9 h-9" />
        <span className="animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/60 w-20 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={cycleTheme}
          className="btn btn-ghost !p-2"
          title={`Tema: ${mode}`}
          aria-label="Cambiar tema"
        >
          <ThemeIcon mode={mode} />
        </button>
        <Link href="/login" className="btn btn-ghost">
          Iniciar sesión
        </Link>
        <Link href="/register" className="btn btn-primary">
          Regístrate
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={cycleTheme}
        className="btn btn-ghost !p-2"
        title={`Tema: ${mode}`}
        aria-label="Cambiar tema"
      >
        <ThemeIcon mode={mode} />
      </button>

      <div className="relative" data-user-menu>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-emerald-500/20">
            {user.username.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline max-w-[120px] truncate">
            {user.username}
          </span>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-64 rounded-2xl glass overflow-hidden z-40"
          >
            <div className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-700/50">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
            <div className="p-1.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
              >
                <span>📁</span> Mis proyectos
              </Link>
              <Link
                href="/editor"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
              >
                <span>⚡</span> Editor rápido
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
              >
                <span>⚙️</span> Centro de configuración
              </Link>
            </div>
            <div className="border-t border-slate-200/60 dark:border-slate-700/50 p-1.5">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  <span>↩</span> Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
