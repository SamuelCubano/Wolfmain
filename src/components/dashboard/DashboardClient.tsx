"use client";

import { useMemo, useState, useActionState } from "react";
import Link from "next/link";
import { createProjectAction, deleteProjectAction } from "@/app/actions/project";
import type { ProjectActionState } from "@/app/actions/project";
import type { SessionUser } from "@/lib/auth";
import { useT, useLocaleTag } from "@/components/locale/translate";

type Project = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: string;
  updated_at: Date | string;
  created_at: Date | string;
  _count: { files: number };
};

export default function DashboardClient({
  user,
  initialProjects,
}: {
  user: SessionUser;
  initialProjects: Project[];
}) {
  const t = useT();
  const locale = useLocaleTag();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showCreate, setShowCreate] = useState(initialProjects.length === 0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [createState, createFormAction, isCreating] = useActionState(
    async (prev: ProjectActionState | null, formData: FormData) => {
      return createProjectAction(prev, formData);
    },
    null as ProjectActionState | null
  );

  async function handleDelete(id: string) {
    if (!confirm(t("dashboard.deleteConfirm"))) return;
    setDeletingId(id);
    try {
      await deleteProjectAction(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert(t("dashboard.deleteError"));
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [projects, query]);

  const stats = useMemo(() => {
    const totalFiles = projects.reduce((acc, p) => acc + (p._count?.files || 0), 0);
    return { total: projects.length, files: totalFiles };
  }, [projects]);

  return (
    <main className="flex-1 app-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <section className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card-strong)_82%,transparent)] p-6 sm:p-8 lg:p-10 mb-8 shadow-[var(--shadow)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[rgba(79,132,161,0.18)] blur-3xl" />
            <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-[rgba(63,118,83,0.14)] blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--accent-dusk)_45%,transparent)] to-transparent" />
          </div>
          <div className="relative flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card-strong)_70%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--muted)] mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                {t("dashboard.badge")}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05] mb-3">
                {t("dashboard.hello", { name: user.username })}
              </h1>
              <p className="text-base sm:text-lg muted max-w-xl leading-relaxed">{t("dashboard.subtitle")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="min-w-[140px] rounded-2xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card-strong)_65%,transparent)] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.12em] muted mb-1">Proyectos</p>
                  <p className="text-2xl font-bold tracking-tight">{stats.total}</p>
                </div>
                <div className="min-w-[140px] rounded-2xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card-strong)_65%,transparent)] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.12em] muted mb-1">Archivos</p>
                  <p className="text-2xl font-bold tracking-tight">{stats.files}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row xl:flex-col gap-2 sm:items-center xl:items-stretch">
              <button onClick={() => setShowCreate((v) => !v)} className="btn btn-primary !px-5 !py-3 text-sm sm:min-w-[180px]">
                {showCreate ? t("dashboard.close") : t("dashboard.newProject")}
              </button>
              <div className="flex gap-2">
                <Link href="/editor" className="btn btn-ghost flex-1 sm:flex-none !px-4 !py-3">{t("dashboard.quickEditor")}</Link>
                <Link href="/settings" className="btn btn-ghost flex-1 sm:flex-none !px-4 !py-3">{t("dashboard.settings")}</Link>
              </div>
            </div>
          </div>
        </section>

        {showCreate && (
          <section className="card p-6 sm:p-7 mb-8">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{t("dashboard.createTitle")}</h2>
                <p className="text-sm muted mt-1">{t("dashboard.createSubtitle")}</p>
              </div>
              <span className="hidden sm:inline-flex text-xs font-medium muted px-3 py-1 rounded-full border border-[var(--card-border)]">Nuevo espacio</span>
            </div>
            {createState?.message && (
              <div className="mb-4 rounded-xl px-4 py-3 text-sm border bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300">
                {createState.message}
              </div>
            )}
            <form action={createFormAction} className="grid gap-5 max-w-3xl">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">{t("dashboard.projectName")}</label>
                  <input name="name" type="text" placeholder={t("dashboard.projectNamePlaceholder")} className="input" required />
                  {createState?.errors?.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{createState.errors.name[0]}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">{t("dashboard.description")}</label>
                  <textarea name="description" rows={3} placeholder={t("dashboard.descriptionPlaceholder")} className="input resize-y" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="submit" disabled={isCreating} className="btn btn-primary !px-5">
                  {isCreating ? t("dashboard.creating") : t("dashboard.createAndOpen")}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost">
                  {t("dashboard.cancel")}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Tus proyectos</h2>
            <p className="text-sm muted">Gestiona y abre tus espacios de trabajo</p>
          </div>
          {projects.length > 0 && (
            <div className="w-full sm:w-auto sm:min-w-[320px]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("dashboard.searchPlaceholder")}
                className="input"
                aria-label={t("dashboard.searchAria")}
              />
            </div>
          )}
        </div>

        {projects.length === 0 ? (
          <section className="card p-12 sm:p-16 text-center border-dashed">
            <div className="icon-wrap w-16 h-16 rounded-2xl mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M3.5 7.5a2 2 0 0 1 2-2h4.2l1.8 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
                <path d="M12 11v4M10 13h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 tracking-tight">{t("dashboard.emptyTitle")}</h3>
            <p className="muted mb-7 max-w-md mx-auto leading-relaxed">{t("dashboard.emptyDesc")}</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary !px-6">
              {t("dashboard.createFirst")}
            </button>
          </section>
        ) : filtered.length === 0 ? (
          <section className="card p-10 text-center">
            <p className="font-medium mb-1">Sin resultados</p>
            <p className="muted text-sm">{t("dashboard.noMatches")}</p>
          </section>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <article
                key={project.id}
                className="group card p-5 sm:p-6 hover:-translate-y-1 hover:shadow-[var(--shadow)] hover:border-[color:color-mix(in_srgb,var(--accent-dusk)_38%,var(--card-border))] transition-all duration-300 flex flex-col min-h-[220px]"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="icon-wrap w-10 h-10 rounded-xl shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                        <path d="M3.5 7.5a2 2 0 0 1 2-2h4.2l1.8 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base tracking-tight truncate" title={project.name}>{project.name}</h3>
                      <p className="text-xs muted truncate">/{project.slug}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card-strong)_70%,transparent)] text-[var(--muted)] shrink-0">
                    {project.visibility}
                  </span>
                </div>
                <p className="text-sm muted mb-5 line-clamp-2 leading-relaxed min-h-[2.75rem]">
                  {project.description || t("dashboard.noDescription")}
                </p>
                <div className="mt-auto pt-4 border-t border-[var(--card-border)]">
                  <div className="flex items-center justify-between text-xs muted mb-4">
                    <span>
                      {project._count.files === 1
                        ? t("dashboard.fileOne", { count: project._count.files })
                        : t("dashboard.fileMany", { count: project._count.files })}
                    </span>
                    <span>
                      {t("dashboard.updated")} {new Date(project.updated_at).toLocaleDateString(locale)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/editor?project=${project.id}`} className="btn btn-primary flex-1 !py-2.5">
                      {t("dashboard.openEditor")}
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="btn btn-ghost !py-2.5 !px-3 text-red-600 dark:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                      title={t("dashboard.deleteTitle")}
                    >
                      {deletingId === project.id ? "…" : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M4 7h16" /><path d="M9 7V5h6v2" /><path d="M8 7l1 12h6l1-12" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}