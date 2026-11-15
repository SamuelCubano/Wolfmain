"use client";

import { useActionState, type ReactNode } from "react";
import { updateProfileAction, changePasswordAction } from "@/app/actions/profile";
import type { ProfileActionState } from "@/app/actions/profile";
import { useTheme, type ThemeMode } from "@/components/theme/ThemeProvider";
import { useT, useLocaleTag } from "@/components/locale/translate";
import LanguageSwitcher from "@/components/navbar/LanguageSwitcher";

const themeIcons: Record<ThemeMode, ReactNode> = {
  light: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.5 12H5M19 12h2.5M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  ),
  system: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="12" rx="2.5" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
};

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
          ? "bg-[color:color-mix(in_srgb,var(--accent-dusk)_12%,transparent)] border-[var(--card-border)] text-[var(--accent-strong)] dark:text-[var(--accent-bright)]"
          : "bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300"
      }`}
    >
      {state.message}
    </div>
  );
}

function ThemePicker() {
  const { mode, setMode } = useTheme();
  const t = useT();
  const options: { value: ThemeMode; label: string; desc: string }[] = [
    { value: "light", label: t("settings.theme.light"), desc: t("settings.theme.lightDesc") },
    { value: "dark", label: t("settings.theme.dark"), desc: t("settings.theme.darkDesc") },
    { value: "system", label: t("settings.theme.system"), desc: t("settings.theme.systemDesc") },
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
                ? "border-[color:color-mix(in_srgb,var(--accent-dusk)_40%,var(--card-border))] bg-[linear-gradient(145deg,rgba(125,143,161,0.14),rgba(79,102,88,0.1))] shadow-[0_0_0_3px_rgba(125,143,161,0.1)]"
                : "border-[var(--card-border)] hover:border-[color:color-mix(in_srgb,var(--accent-dusk)_28%,var(--card-border))] hover:bg-[color:color-mix(in_srgb,var(--accent-dusk)_8%,transparent)]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="icon-wrap w-10 h-10">{themeIcons[opt.value]}</span>
              {active && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--accent-strong)] dark:text-[var(--accent-bright)] bg-[color:color-mix(in_srgb,var(--accent-dusk)_16%,transparent)] px-2 py-0.5 rounded-full">
                  {t("settings.theme.active")}
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

function LanguagePicker() {
  const t = useT();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[var(--card-border)] p-4 bg-[color:color-mix(in_srgb,var(--card-strong)_60%,transparent)]">
      <div>
        <p className="font-semibold text-sm">{t("settings.language")}</p>
        <p className="text-xs muted mt-0.5">{t("settings.languageDesc")}</p>
      </div>
      <LanguageSwitcher />
    </div>
  );
}

export default function SettingsClient({ initialProfile }: { initialProfile: Profile }) {
  const t = useT();
  const locale = useLocaleTag();
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
          <p className="text-sm font-semibold text-[var(--accent)] dark:text-[var(--accent-bright)] mb-1">{t("settings.account")}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t("settings.title")}</h1>
          <p className="muted mt-2">{t("settings.subtitle")}</p>
        </div>

        <div className="grid gap-6">
          <Section title={t("settings.publicProfile")} description={t("settings.publicProfileDesc")}>
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-[color:color-mix(in_srgb,var(--card-strong)_70%,transparent)] border border-[var(--card-border)]">
              <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2f3e46] via-[#4f6658] to-[#6d8496] text-white flex items-center justify-center text-xl font-bold shadow-[0_12px_30px_-14px_rgba(27,36,43,0.5)] ring-1 ring-white/10">
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
                <label className="label">{t("settings.displayName")}</label>
                <input
                  name="display_name"
                  type="text"
                  defaultValue={initialProfile.display_name || ""}
                  placeholder={t("settings.displayNamePlaceholder")}
                  className="input"
                />
                {profileState?.errors?.display_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {profileState.errors.display_name[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="label">{t("settings.bio")}</label>
                <textarea
                  name="bio"
                  rows={3}
                  defaultValue={initialProfile.bio || ""}
                  placeholder={t("settings.bioPlaceholder")}
                  className="input resize-y"
                />
                {profileState?.errors?.bio && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {profileState.errors.bio[0]}
                  </p>
                )}
              </div>
              <button type="submit" disabled={isSavingProfile} className="btn btn-primary">
                {isSavingProfile ? t("settings.savingProfile") : t("settings.saveProfile")}
              </button>
            </form>
          </Section>

          <Section title={t("settings.appearance")} description={t("settings.appearanceDesc")}>
            <ThemePicker />
          </Section>

          <Section title={t("settings.language")} description={t("settings.languageDesc")}>
            <LanguagePicker />
          </Section>

          <Section title={t("settings.security")} description={t("settings.securityDesc")}>
            <Notice state={passwordState} />
            <form action={passwordAction} className="space-y-4 max-w-xl">
              <div>
                <label className="label">{t("settings.currentPassword")}</label>
                <input name="currentPassword" type="password" className="input" autoComplete="current-password" />
                {passwordState?.errors?.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordState.errors.currentPassword[0]}
                  </p>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t("settings.newPassword")}</label>
                  <input name="newPassword" type="password" className="input" autoComplete="new-password" />
                  {passwordState?.errors?.newPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {passwordState.errors.newPassword[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">{t("settings.confirmNewPassword")}</label>
                  <input name="confirmNewPassword" type="password" className="input" autoComplete="new-password" />
                  {passwordState?.errors?.confirmNewPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {passwordState.errors.confirmNewPassword[0]}
                    </p>
                  )}
                </div>
              </div>
              <button type="submit" disabled={isSavingPassword} className="btn btn-primary">
                {isSavingPassword ? t("settings.updating") : t("settings.changePassword")}
              </button>
            </form>
          </Section>

          <Section title={t("settings.accountInfo")} description={t("settings.accountInfoDesc")}>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card-strong)_55%,transparent)] p-4">
                <dt className="muted mb-1">{t("settings.user")}</dt>
                <dd className="font-semibold">@{initialProfile.username}</dd>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card-strong)_55%,transparent)] p-4">
                <dt className="muted mb-1">{t("settings.email")}</dt>
                <dd className="font-semibold break-all">{initialProfile.email}</dd>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card-strong)_55%,transparent)] p-4">
                <dt className="muted mb-1">{t("settings.memberSince")}</dt>
                <dd className="font-semibold">
                  {new Date(initialProfile.created_at).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card-strong)_55%,transparent)] p-4">
                <dt className="muted mb-1">{t("settings.status")}</dt>
                <dd>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      initialProfile.is_email_verified
                        ? "bg-[color:color-mix(in_srgb,var(--accent-dusk)_14%,transparent)] text-[var(--accent-strong)] dark:text-[var(--accent-bright)] border border-[var(--card-border)]"
                        : "bg-amber-500/12 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {initialProfile.is_email_verified
                      ? t("settings.emailVerified")
                      : t("settings.emailNotVerified")}
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