"use client";

import { useState, useActionState } from "react";
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
  updated_at: Date;
  created_at: Date;
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
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const displayName = user.username;

  return (
    <main className="flex-1 app-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Espacio de trabajo</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Mis proyectos</h1>
            <p className="muted mt-2">Hola, <span className="font-semibold text-slate-800 dark:text-slate-200">{displayName}</span>. Crea, abre y gestiona tus proyectos.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/settings" className="btn btn-ghost">Configuración</Link>
            <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
              {showCreate ? "Cancelar" : "+ Nuevo proyecto"}
            </button>
          </div>
        </div>

        {showCreate && (
          <div className="card p-6 mb-8">
            <h2 className="text-lg font-semibold mb-1">Crear nuevo proyecto</h2>
            <p className="text-sm muted mb-5">Dale un nombre y una descripción opcional.</p>
            {createState?.message && (
              <div className="mb-4 rounded-xl px-4 py-3 text-sm border bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300">
                {createState.message}
              </div>
            )}
            <form action={createFormAction} className="space-y-4 max-w-xl">
              <div>
                <label className="label">Nombre del proyecto</label>
                <input name="name" type="text" placeholder="Mi proyecto increíble" className="input" />
                {createState?.errors?.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{createState.errors.name[0]}</p>
                )}
              </div>
              <div>
                <label className="label">Descripción (opcional)</label>
                <textarea name="description" rows={2} placeholder="Describe tu proyecto..." className="input resize-y" />
              </div>
              <button type="submit" disabled={isCreating} className="btn btn-primary">
                {isCreating ? "Creando..." : "Crear y abrir editor"}
              </button>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="card p-10 sm:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-2xl flex items-center justify-center mx-auto mb-4">📁</div>
            <h3 className="text-lg font-semibold mb-2">Aún no tienes proyectos</h3>
            <p className="muted mb-6 max-w-sm mx-auto">Crea tu primer proyecto y empieza a construir en el editor.</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">
              Crear primer proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <article
                key={project.id}
                className="group card p-5 hover:-translate-y-0.5 hover:border-emerald-500/30 transition duration-200 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-base truncate">{project.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    {project.visibility}
                  </span>
                </div>
                <p className="text-sm muted mb-4 line-clamp-2 min-h-[2.5rem]">
                  {project.description || "Sin descripción"}
                </p>
                <p className="text-xs muted mb-4 mt-auto">
                  {project._count.files} archivos · {new Date(project.updated_at).toLocaleDateString("es-ES")}
                </p>
                <div className="flex gap-2">
                  <Link href={`/editor?project=${project.id}`} className="btn btn-primary flex-1 !py-2">
                    Abrir
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
