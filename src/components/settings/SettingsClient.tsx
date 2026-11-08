"use client";

import { useActionState } from "react";
import { updateProfileAction, changePasswordAction } from "@/app/actions/profile";
import type { ProfileActionState } from "@/app/actions/profile";
import { useTheme, type ThemeMode } from "@/components/theme/ThemeProvider";

type Profile = {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_email_verified: boolean;
  created_at: Date;
} | null;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6 sm:p-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm muted mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Notice({ state }: { state: ProfileActionState | null }) {
  if (!state?.message) return null;
  return (
    <div
      className={`mb-4 rounded-xl px-4 py-3 text-sm border ${
        state.success
          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
          : "bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300"
      }`}
    >
      {state.message}
    </div>
  );
}

function ThemePicker() {
  const { mode, setMode } = useTheme();
  const options: { value: ThemeMode; label: string; desc: string; icon: string }[] = [
    { value: "light", label: "Claro", desc: "Fondo claro, ideal de día", icon: "☀️" },
    { value: "dark", label: "Oscuro", desc: "Reduce el brillo, ideal de noche", icon: "🌙" },
    { value: "system", label: "Sistema", desc: "Sigue la preferencia de tu dispositivo", icon: "💻" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {options.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
            className={`text-left rounded-xl border p-4 transition ${
              active
                ? "border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
                : "border-slate-200/70 dark:border-slate-700/60 hover:border-emerald-400/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">{opt.icon}</span>
              {active && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                  Activo
                </span>
              )}
            </div>
            <p className="font-semibold text-sm">{opt.label}</p>
            <p className="text-xs muted mt-0.5">{opt.desc}</p>
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsClient({ initialProfile }: { initialProfile: Profile }) {
  const [profileState, profileAction, isSavingProfile] = useActionState(
    updateProfileAction,
    null as ProfileActionState | null
  );
  const [passwordState, passwordAction, isSavingPassword] = useActionState(
    changePasswordAction,
    null as ProfileActionState | null
  );

  if (!initialProfile) return null;

  const initial = initialProfile.username.charAt(0).toUpperCase();

  return (
    <main className="flex-1 app-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Cuenta</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Centro de configuración</h1>
          <p className="muted mt-2">Personaliza tu perfil, apariencia y seguridad.</p>
        </div>

        <div className="grid gap-6">
          <Section title="Perfil público" description="Cómo te ven otros en la plataforma.">
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40">
              <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="font-semibold truncate">{initialProfile.display_name || initialProfile.username}</p>
                <p className="text-sm muted truncate">@{initialProfile.username} · {initialProfile.email}</p>
              </div>
            </div>

            <Notice state={profileState} />

            <form action={profileAction} className="space-y-4 max-w-xl">
              <div>
                <label className="label">Nombre para mostrar</label>
                <input
                  name="display_name"
                  type="text"
                  defaultValue={initialProfile.display_name || ""}
                  placeholder="Tu nombre público"
                  className="input"
                />
                {profileState?.errors?.display_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {profileState.errors.display_name[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  defaultValue={initialProfile.bio || ""}
                  placeholder="Cuéntanos sobre ti..."
                  className="input resize-y"
                />
                {profileState?.errors?.bio && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {profileState.errors.bio[0]}
                  </p>
                )}
              </div>
              <button type="submit" disabled={isSavingProfile} className="btn btn-primary">
                {isSavingProfile ? "Guardando..." : "Guardar perfil"}
              </button>
            </form>
          </Section>

          <Section title="Apariencia" description="Elige cómo se ve la interfaz. El cambio se aplica al instante.">
            <ThemePicker />
          </Section>

          <Section title="Seguridad" description="Actualiza tu contraseña regularmente para proteger tu cuenta.">
            <Notice state={passwordState} />
            <form action={passwordAction} className="space-y-4 max-w-xl">
              <div>
                <label className="label">Contraseña actual</label>
                <input name="currentPassword" type="password" className="input" autoComplete="current-password" />
                {passwordState?.errors?.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordState.errors.currentPassword[0]}
                  </p>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nueva contraseña</label>
                  <input name="newPassword" type="password" className="input" autoComplete="new-password" />
                  {passwordState?.errors?.newPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {passwordState.errors.newPassword[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">Confirmar nueva contraseña</label>
                  <input name="confirmNewPassword" type="password" className="input" autoComplete="new-password" />
                  {passwordState?.errors?.confirmNewPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {passwordState.errors.confirmNewPassword[0]}
                    </p>
                  )}
                </div>
              </div>
              <button type="submit" disabled={isSavingPassword} className="btn btn-primary">
                {isSavingPassword ? "Actualizando..." : "Cambiar contraseña"}
              </button>
            </form>
          </Section>

          <Section title="Información de cuenta">
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/50 p-4">
                <dt className="muted mb-1">Usuario</dt>
                <dd className="font-semibold">@{initialProfile.username}</dd>
              </div>
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/50 p-4">
                <dt className="muted mb-1">Correo electrónico</dt>
                <dd className="font-semibold break-all">{initialProfile.email}</dd>
              </div>
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/50 p-4">
                <dt className="muted mb-1">Miembro desde</dt>
                <dd className="font-semibold">
                  {new Date(initialProfile.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/50 p-4">
                <dt className="muted mb-1">Estado</dt>
                <dd>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      initialProfile.is_email_verified
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {initialProfile.is_email_verified ? "Email verificado" : "Email no verificado"}
                  </span>
                </dd>
              </div>
            </dl>
          </Section>
        </div>
      </div>
    </main>
  );
}
