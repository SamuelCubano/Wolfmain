"use client";

import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";
import Link from "next/link";
import { useT } from "@/components/locale/translate";

export default function RegisterForm() {
  const t = useT();
  const [state, formAction, isPending] = useActionState(registerAction, null as AuthState | null);

  return (
    <main className="flex-1 app-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-lg font-bold shadow-lg shadow-emerald-500/25 mb-4">
            W
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("auth.createAccount")}</h1>
          <p className="muted mt-1">{t("auth.registerSubtitle")}</p>
        </div>

        <div className="card p-6 sm:p-8">
          {state?.message && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm border bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label className="label">{t("auth.username")}</label>
              <input name="username" type="text" placeholder={t("auth.usernamePlaceholder")} className="input" autoComplete="username" />
              {state?.errors?.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.username[0]}</p>
              )}
            </div>
            <div>
              <label className="label">{t("auth.email")}</label>
              <input name="email" type="email" placeholder={t("auth.emailPlaceholder")} className="input" autoComplete="email" />
              {state?.errors?.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.email[0]}</p>
              )}
            </div>
            <div>
              <label className="label">{t("auth.password")}</label>
              <input name="password" type="password" placeholder={t("auth.passwordHint")} className="input" autoComplete="new-password" />
              {state?.errors?.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.password[0]}</p>
              )}
            </div>
            <div>
              <label className="label">{t("auth.confirmPassword")}</label>
              <input name="confirmPassword" type="password" placeholder="••••••••" className="input" autoComplete="new-password" />
              {state?.errors?.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.confirmPassword[0]}</p>
              )}
            </div>
            <button type="submit" disabled={isPending} className="btn btn-primary w-full !py-2.5">
              {isPending ? t("auth.creatingAccount") : t("auth.create")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm muted">
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              {t("auth.loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}