"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionAction, logoutAction } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/auth";

export default function AuthNavbar() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

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
    <div className="relative" data-user-menu>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
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
          className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-40"
        >
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
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
              <span>⚙️</span> Configuración
            </Link>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 p-1.5">
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
  );
}
