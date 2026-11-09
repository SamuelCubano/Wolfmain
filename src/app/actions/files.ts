"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import prisma from "@/prisma/client";

export type ProjectFile = {
  id: string;
  name: string;
  path: string;
  content: string | null;
  is_folder: boolean;
  parent_id: string | null;
  file_type: string | null;
  language: string | null;
  updated_at: Date;
};

async function assertProjectOwner(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, owner_id: true, name: true },
  });
  if (!project || project.owner_id !== userId) {
    throw new Error("Proyecto no encontrado o sin permisos");
  }
  return project;
}

function languageFromName(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    html: "html",
    htm: "html",
    css: "css",
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    json: "json",
    md: "markdown",
    txt: "plaintext",
    svg: "xml",
  };
  return ext ? map[ext] ?? "plaintext" : "plaintext";
}

export async function getProjectEditorDataAction(projectId: string) {
  const user = await requireAuth();
  const project = await assertProjectOwner(projectId, user.id);
  const files = await prisma.file.findMany({
    where: { project_id: projectId },
    select: {
      id: true,
      name: true,
      path: true,
      content: true,
      is_folder: true,
      parent_id: true,
      file_type: true,
      language: true,
      updated_at: true,
    },
    orderBy: [{ is_folder: "desc" }, { name: "asc" }],
  });
  return { project, files };
}

const createFileSchema = z.object({
  projectId: z.string().min(1),
  name: z
    .string()
    .min(1, "Nombre requerido")
    .max(80, "Nombre demasiado largo")
    .refine((n) => !/[\\/:*?"<>|]/.test(n), "Nombre contiene caracteres no permitidos")
    .refine((n) => n !== "." && n !== "..", "Nombre inválido"),
  parentId: z.string().nullable().optional(),
  isFolder: z.boolean().optional(),
});

export async function createProjectFileAction(input: {
  projectId: string;
  name: string;
  parentId?: string | null;
  isFolder?: boolean;
}) {
  const user = await requireAuth();
  const parsed = createFileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Datos inválidos" };
  }
  const { projectId, name, parentId, isFolder } = parsed.data;
  await assertProjectOwner(projectId, user.id);

  let parentPath = "";
  if (parentId) {
    const parent = await prisma.file.findFirst({
      where: { id: parentId, project_id: projectId, is_folder: true },
      select: { path: true },
    });
    if (!parent) return { error: "Carpeta padre no encontrada" };
    parentPath = parent.path;
  }

  const path = parentPath ? `${parentPath}/${name}` : `/${name}`;
  const existing = await prisma.file.findUnique({
    where: { project_id_path: { project_id: projectId, path } },
    select: { id: true },
  });
  if (existing) return { error: "Ya existe un archivo o carpeta con ese nombre" };

  const defaultContent = isFolder
    ? null
    : name.endsWith(".html")
      ? `<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${name.replace(/\.html$/i, "")}</title>\n</head>\n<body>\n  \n</body>\n</html>\n`
      : name.endsWith(".css")
        ? "/* styles */\n"
        : name.endsWith(".js")
          ? "// script\n"
          : "";

  const file = await prisma.file.create({
    data: {
      project_id: projectId,
      parent_id: parentId || null,
      name,
      path,
      content: defaultContent,
      is_folder: !!isFolder,
      file_type: isFolder ? "folder" : name.split(".").pop() || "file",
      language: isFolder ? null : languageFromName(name),
    },
    select: {
      id: true,
      name: true,
      path: true,
      content: true,
      is_folder: true,
      parent_id: true,
      file_type: true,
      language: true,
      updated_at: true,
    },
  });

  revalidatePath(`/editor`);
  return { file };
}

export async function saveProjectFileAction(input: {
  projectId: string;
  fileId: string;
  content: string;
}) {
  const user = await requireAuth();
  await assertProjectOwner(input.projectId, user.id);
  const file = await prisma.file.findFirst({
    where: { id: input.fileId, project_id: input.projectId, is_folder: false },
    select: { id: true },
  });
  if (!file) return { error: "Archivo no encontrado" };
  const updated = await prisma.file.update({
    where: { id: input.fileId },
    data: { content: input.content, size: input.content.length },
    select: { id: true, updated_at: true },
  });
  return { file: updated };
}

export async function deleteProjectFileAction(input: {
  projectId: string;
  fileId: string;
}) {
  const user = await requireAuth();
  await assertProjectOwner(input.projectId, user.id);
  const file = await prisma.file.findFirst({
    where: { id: input.fileId, project_id: input.projectId },
    select: { id: true, is_folder: true },
  });
  if (!file) return { error: "Archivo no encontrado" };
  if (file.is_folder) {
    // delete children by path prefix handled by FK? parent relation has no cascade on children via path; schema: parent File relation cascade on parent delete? "parent File? @relation(..., onDelete: Cascade)" means deleting parent cascades to this row? Wait: on File.parent relation: fields [parent_id] references parent id, onDelete Cascade - so deleting the referenced parent cascades delete of children. Yes.
    await prisma.file.delete({ where: { id: input.fileId } });
  } else {
    await prisma.file.delete({ where: { id: input.fileId } });
  }
  revalidatePath(`/editor`);
  return { ok: true };
}

export async function renameProjectFileAction(input: {
  projectId: string;
  fileId: string;
  name: string;
}) {
  const user = await requireAuth();
  await assertProjectOwner(input.projectId, user.id);
  const name = input.name.trim();
  if (!name || /[\\/:*?"<>|]/.test(name)) return { error: "Nombre inválido" };

  const file = await prisma.file.findFirst({
    where: { id: input.fileId, project_id: input.projectId },
    select: { id: true, parent_id: true, is_folder: true, path: true },
  });
  if (!file) return { error: "Archivo no encontrado" };

  let parentPath = "";
  if (file.parent_id) {
    const parent = await prisma.file.findUnique({ where: { id: file.parent_id }, select: { path: true } });
    parentPath = parent?.path ?? "";
  }
  const newPath = parentPath ? `${parentPath}/${name}` : `/${name}`;
  const conflict = await prisma.file.findUnique({
    where: { project_id_path: { project_id: input.projectId, path: newPath } },
    select: { id: true },
  });
  if (conflict && conflict.id !== file.id) return { error: "Ya existe ese nombre" };

  const oldPath = file.path;
  const updated = await prisma.file.update({
    where: { id: file.id },
    data: {
      name,
      path: newPath,
      file_type: file.is_folder ? "folder" : name.split(".").pop() || "file",
      language: file.is_folder ? null : languageFromName(name),
    },
    select: {
      id: true, name: true, path: true, content: true, is_folder: true,
      parent_id: true, file_type: true, language: true, updated_at: true,
    },
  });

  if (file.is_folder) {
    // update descendants paths
    const descendants = await prisma.file.findMany({
      where: { project_id: input.projectId, path: { startsWith: oldPath + "/" } },
      select: { id: true, path: true },
    });
    for (const d of descendants) {
      await prisma.file.update({
        where: { id: d.id },
        data: { path: newPath + d.path.slice(oldPath.length) },
      });
    }
  }

  revalidatePath(`/editor`);
  return { file: updated };
}
