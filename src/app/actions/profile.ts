"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth, hashPassword, verifyPassword } from "@/lib/auth";
import prisma from "@/prisma/client";

export type ProfileActionState = {
  message?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
};

const updateProfileSchema = z.object({
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
  });

export async function updateProfileAction(
  _prevState: ProfileActionState | null,
  formData: FormData
): Promise<ProfileActionState> {
  const user = await requireAuth();

  const raw = {
    display_name: (formData.get("display_name") as string) || "",
    bio: (formData.get("bio") as string) || "",
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      message: "Errores de validación",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      display_name: parsed.data.display_name || null,
      bio: parsed.data.bio || null,
    },
  });

  revalidatePath("/settings");
  return { success: true, message: "Perfil actualizado" };
}

export async function changePasswordAction(
  _prevState: ProfileActionState | null,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await requireAuth();

  const raw = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmNewPassword: formData.get("confirmNewPassword") as string,
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      message: "Errores de validación",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { password_hash: true },
  });

  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.password_hash))) {
    return {
      message: "Contraseña actual incorrecta",
      errors: { currentPassword: ["Contraseña actual incorrecta"] },
    };
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: session.id },
    data: { password_hash: newHash },
  });

  return { success: true, message: "Contraseña actualizada" };
}

export async function getProfileAction() {
  const session = await requireAuth();
  return prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      username: true,
      display_name: true,
      bio: true,
      avatar_url: true,
      is_email_verified: true,
      created_at: true,
    },
  });
}
