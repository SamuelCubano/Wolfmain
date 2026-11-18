"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { useT } from "@/components/locale/translate";

export default function RegisterForm() {
  const t = useT();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, null as AuthState | null);

  useEffect(() => {
    if (state?.success) router.replace("/dashboard");
  }, [state?.success, router]);

  return (
    <main className="flex-1 app-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/img/wolfmain-logo.png"
            alt="Wolfmain"
            width={48}
            height={48}
            className="inline-flex h-12 w-12 rounded-2xl mb-4"
            priority
          />
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
            <button type="submit" disabled={isPending || !!state?.success} className="btn btn-primary w-full !py-2.5">
              {isPending || state?.success ? t("auth.creatingAccount") : t("auth.create")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm muted">
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="text-[var(--accent)] dark:text-[var(--accent-bright)] font-semibold hover:underline">
              {t("auth.loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}