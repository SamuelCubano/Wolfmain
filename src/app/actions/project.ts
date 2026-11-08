"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import prisma from "@/prisma/client";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre es demasiado largo"),
  description: z.string().max(500).optional(),
});

export type ProjectActionState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createProjectAction(
  _prevState: ProjectActionState | null,
  formData: FormData
): Promise<ProjectActionState> {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      message: "Errores de validación",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, description } = parsed.data;
  const baseSlug = slugify(name) || "proyecto";
  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.project.findUnique({
      where: { owner_id_slug: { owner_id: user.id, slug } },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const project = await prisma.project.create({
    data: {
      owner_id: user.id,
      name,
      slug,
      description: description || null,
      visibility: "private",
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  redirect(`/editor?project=${project.id}`);
}

export async function listMyProjectsAction() {
  const user = await requireAuth();
  return prisma.project.findMany({
    where: { owner_id: user.id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      visibility: true,
      updated_at: true,
      created_at: true,
      _count: { select: { files: true } },
    },
    orderBy: { updated_at: "desc" },
  });
}

export async function deleteProjectAction(projectId: string) {
  const user = await requireAuth();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { owner_id: true },
  });

  if (!project || project.owner_id !== user.id) {
    throw new Error("Proyecto no encontrado o sin permisos");
  }

  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/dashboard");
}
