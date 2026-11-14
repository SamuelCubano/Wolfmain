"use server";

import { redirect } from "next/navigation";
import { registerSchema, loginSchema } from "@/lib/validations";
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, getCurrentUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { getServerLang, getServerT } from "@/lib/locale-server";
import prisma from "@/prisma/client";

export type AuthState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function registerAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const lang = await getServerLang();
  const t = await getServerT();

  const raw = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema(lang).safeParse(raw);
  if (!parsed.success) {
    return {
      message: t("server.validation"),
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
  if (existingByEmail) errors.email = [t("server.emailTaken")];
  if (existingByUsername) errors.username = [t("server.usernameTaken")];
  if (Object.keys(errors).length > 0) {
    return { message: t("server.emailOrUsernameTaken"), errors };
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

  redirect("/dashboard");
}

export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const lang = await getServerLang();
  const t = await getServerT();

  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema(lang).safeParse(raw);
  if (!parsed.success) {
    return {
      message: t("server.validation"),
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
      message: t("server.invalidCredentials"),
      errors: { email: [t("server.wrongEmailOrPassword")] },
    };
  }

  await setSessionCookie(user.id, user.email);

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function getSessionAction(): Promise<SessionUser | null> {
  return getCurrentUser();
}