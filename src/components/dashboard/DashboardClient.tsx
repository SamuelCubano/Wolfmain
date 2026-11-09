"use client";

import { useMemo, useState, useActionState } from "react";
import Link from "next/link";
import { createProjectAction, deleteProjectAction } from "@/app/actions/project";
import type { ProjectActionState } from "@/app/actions/project";
import type { SessionUser } from "@/lib/auth";

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
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    try {
      await deleteProjectAction(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Error al eliminar el proyecto");
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <section className="card p-5 sm:p-7 mb-6 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none opacity-60">
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />
          </div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Dashboard</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Hola, {user.username}
              </h1>
              <p className="muted mt-1 max-w-2xl">
                Este es tu espacio de trabajo. Crea proyectos, ábrelos en el editor y configura tu cuenta.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/40 px-3 py-1 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {stats.total} proyecto{stats.total === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/40 px-3 py-1 text-xs font-semibold">
                  {stats.files} archivo{stats.files === 1 ? "" : "s"} registrados
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/editor" className="btn btn-ghost">Editor rápido</Link>
              <Link href="/settings" className="btn btn-ghost">Configuración</Link>
              <button onClick={() => setShowCreate((v) => !v)} className="btn btn-primary">
                {showCreate ? "Cerrar" : "+ Nuevo proyecto"}
              </button>
            </div>
          </div>
        </section>

        {showCreate && (
          <section className="card p-6 mb-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Crear nuevo proyecto</h2>
                <p className="text-sm muted">Se creará en tu cuenta y te llevará al editor.</p>
              </div>
            </div>
            {createState?.message && (
              <div className="mb-4 rounded-xl px-4 py-3 text-sm border bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300">
                {createState.message}
              </div>
            )}
            <form action={createFormAction} className="grid gap-4 max-w-2xl">
              <div>
                <label className="label">Nombre del proyecto</label>
                <input name="name" type="text" placeholder="Mi proyecto increíble" className="input" required />
                {createState?.errors?.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{createState.errors.name[0]}</p>
                )}
              </div>
              <div>
                <label className="label">Descripción (opcional)</label>
                <textarea name="description" rows={2} placeholder="Describe tu proyecto..." className="input resize-y" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={isCreating} className="btn btn-primary">
                  {isCreating ? "Creando..." : "Crear y abrir editor"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost">
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {projects.length > 0 && (
          <div className="mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar proyectos por nombre o descripción..."
              className="input max-w-xl"
              aria-label="Buscar proyectos"
            />
          </div>
        )}

        {projects.length === 0 ? (
          <section className="card p-10 sm:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-2xl flex items-center justify-center mx-auto mb-4">📁</div>
            <h3 className="text-lg font-semibold mb-2">Bienvenido a tu dashboard</h3>
            <p className="muted mb-6 max-w-md mx-auto">
              Aún no tienes proyectos. Crea el primero y lo abriremos en el editor.
            </p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">
              Crear primer proyecto
            </button>
          </section>
        ) : filtered.length === 0 ? (
          <section className="card p-8 text-center">
            <p className="muted">No hay proyectos que coincidan con tu búsqueda.</p>
          </section>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <article
                key={project.id}
                className="group card p-5 hover:-translate-y-0.5 hover:border-emerald-500/30 transition duration-200 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-base truncate" title={project.name}>{project.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    {project.visibility}
                  </span>
                </div>
                <p className="text-sm muted mb-4 line-clamp-2 min-h-[2.5rem]">
                  {project.description || "Sin descripción"}
                </p>
                <p className="text-xs muted mb-4 mt-auto">
                  {project._count.files} archivo{project._count.files === 1 ? "" : "s"} · Actualizado{" "}
                  {new Date(project.updated_at).toLocaleDateString("es-ES")}
                </p>
                <div className="flex gap-2">
                  <Link href={`/editor?project=${project.id}`} className="btn btn-primary flex-1 !py-2">
                    Abrir editor
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="btn btn-danger !py-2"
                    title="Eliminar proyecto"
                  >
                    {deletingId === project.id ? "…" : "Eliminar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
