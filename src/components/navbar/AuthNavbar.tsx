"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSessionAction, logoutAction } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/auth";
import { useT } from "@/components/locale/translate";

function IconProjects() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3.5 7.5a2 2 0 0 1 2-2h4.2l1.8 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <path d="M3.5 10.5h17" />
    </svg>
  );
}

function IconEditor() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M13 3 5.5 14h6L10 21l8.5-11h-6z" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
      <path d="M19 12a7 7 0 0 0-.08-1l2.02-1.58-1.9-3.29-2.45.99a7.2 7.2 0 0 0-1.73-1L14.5 3.5h-3.8l-.36 2.62c-.62.25-1.2.59-1.73 1l-2.45-.99-1.9 3.29L6.28 11a7.5 7.5 0 0 0 0 2l-2.02 1.58 1.9 3.29 2.45-.99c.53.41 1.11.75 1.73 1l.36 2.62h3.8l.36-2.62c.62-.25 1.2-.59 1.73-1l2.45.99 1.9-3.29L18.92 13c.05-.33.08-.66.08-1Z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H4" />
    </svg>
  );
}

export default function AuthNavbar() {
  const t = useT();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const refreshSession = useCallback(() => {
    let cancelled = false;
    getSessionAction()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return refreshSession();
  }, [pathname, refreshSession]);

  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) refreshSession();
    }
    function onHistoryChange() {
      refreshSession();
    }
    function onVisibility() {
      if (document.visibilityState === "visible") refreshSession();
    }
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onHistoryChange);
    window.addEventListener("focus", onHistoryChange);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onHistoryChange);
      window.removeEventListener("focus", onHistoryChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshSession]);

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
        <span className="animate-pulse rounded-xl bg-[color:color-mix(in_srgb,var(--accent-dusk)_18%,var(--card-strong))] w-9 h-9" />
        <span className="animate-pulse rounded-xl bg-[color:color-mix(in_srgb,var(--accent-dusk)_18%,var(--card-strong))] w-20 h-8 hidden sm:block" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/login" className="btn btn-ghost !py-2">
          {t("nav.login")}
        </Link>
        <Link href="/register" className="btn btn-primary !py-2">
          {t("nav.register")}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" data-user-menu>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl transition border ${
          open
            ? "bg-[var(--accent)] dark:bg-[var(--accent)] border-[var(--accent)]"
            : "border-transparent hover:bg-[var(--accent)]/10 dark:hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/30"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] via-[var(--accent-strong)] to-[var(--accent-dusk)] text-white flex items-center justify-center text-sm font-bold shadow-sm ring-1 ring-white/15">
          {user.username.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm font-semibold text-[var(--foreground)] hidden sm:inline max-w-[120px] truncate">
          {user.username}
        </span>
        <svg
          className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
          className="absolute right-0 mt-2.5 w-72 rounded-2xl border border-[var(--card-border)] bg-[var(--card-strong)]/96 backdrop-blur-xl shadow-[var(--shadow)] overflow-hidden z-50"
        >
          <div className="px-4 py-3.5 border-b border-[var(--card-border)] bg-[var(--accent)]/10">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] via-[var(--accent-strong)] to-[var(--accent-dusk)] text-white flex items-center justify-center text-sm font-bold shadow-sm ring-1 ring-white/15 shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user.username}</p>
                <p className="text-xs muted truncate">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="p-2 space-y-0.5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-[var(--foreground)] hover:bg-[var(--accent)]/10 hover:text-[var(--foreground)] transition-colors"
            >
              <span className="icon-wrap w-8 h-8 rounded-lg shrink-0"><IconProjects /></span>
              {t("nav.myProjects")}
            </Link>
            <Link
              href="/editor"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-[var(--foreground)] hover:bg-[var(--accent)]/10 hover:text-[var(--foreground)] transition-colors"
            >
              <span className="icon-wrap w-8 h-8 rounded-lg shrink-0"><IconEditor /></span>
              {t("nav.quickEditor")}
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-[var(--foreground)] hover:bg-[var(--accent)]/10 hover:text-[var(--foreground)] transition-colors"
            >
              <span className="icon-wrap w-8 h-8 rounded-lg shrink-0"><IconSettings /></span>
              {t("nav.settings")}
            </Link>
          </div>
          <div className="border-t border-[var(--card-border)] p-2">
            <form
              action={async () => {
                setOpen(false);
                await logoutAction();
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0"><IconLogout /></span>
                {t("nav.logout")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}