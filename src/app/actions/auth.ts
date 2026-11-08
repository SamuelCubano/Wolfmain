"use server";

import { redirect } from "next/navigation";
import { registerSchema, loginSchema } from "@/lib/validations";
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, getCurrentUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import prisma from "@/prisma/client";

export type AuthState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function registerAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      message: "Errores de validación",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { username, email, password } = parsed.data;

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  const existingByUsername = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  const errors: Record<string, string[]> = {};
  if (existingByEmail) errors.email = ["El correo ya está en uso"];
  if (existingByUsername) errors.username = ["El usuario ya está en uso"];
  if (Object.keys(errors).length > 0) {
    return { message: "El correo o el usuario ya están registrados", errors };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password_hash: passwordHash,
    },
    select: { id: true, email: true },
  });

  await setSessionCookie(user.id, user.email);

  redirect("/editor");
}

export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      message: "Errores de validación",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password_hash: true },
  });

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return {
      message: "Credenciales inválidas",
      errors: { email: ["Correo o contraseña incorrectos"] },
    };
  }

  await setSessionCookie(user.id, user.email);

  redirect("/editor");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function getSessionAction(): Promise<SessionUser | null> {
  return getCurrentUser();
}
