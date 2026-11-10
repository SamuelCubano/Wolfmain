"use client";

import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";
import Link from "next/link";

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null as AuthState | null);

  return (
    <main className="flex-1 app-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-lg font-bold shadow-lg shadow-emerald-500/25 mb-4">
            W
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Crea tu cuenta</h1>
          <p className="muted mt-1">Únete a Wolfmain y empieza a construir</p>
        </div>

        <div className="card p-6 sm:p-8">
          {state?.message && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm border bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label className="label">Usuario</label>
              <input name="username" type="text" placeholder="devjuan" className="input" autoComplete="username" />
              {state?.errors?.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.username[0]}</p>
              )}
            </div>
            <div>
              <label className="label">Correo electrónico</label>
              <input name="email" type="email" placeholder="tú@correo.com" className="input" autoComplete="email" />
              {state?.errors?.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.email[0]}</p>
              )}
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input name="password" type="password" placeholder="Mínimo 8 caracteres" className="input" autoComplete="new-password" />
              {state?.errors?.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.password[0]}</p>
              )}
            </div>
            <div>
              <label className="label">Confirmar contraseña</label>
              <input name="confirmPassword" type="password" placeholder="••••••••" className="input" autoComplete="new-password" />
              {state?.errors?.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.confirmPassword[0]}</p>
              )}
            </div>
            <button type="submit" disabled={isPending} className="btn btn-primary w-full !py-2.5">
              {isPending ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm muted">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
