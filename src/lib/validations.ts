import { z } from "zod";
import { getTranslator, type Lang } from "@/lib/i18n";

export function registerSchema(lang: Lang = "en") {
  const t = getTranslator(lang);
  return z
    .object({
      username: z
        .string()
        .min(3, t("server.usernameMin"))
        .max(30, t("server.usernameMax"))
        .regex(/^[a-zA-Z0-9_]+$/, t("server.usernameInvalid")),
      email: z.string().email(t("server.emailInvalid")),
      password: z
        .string()
        .min(8, t("server.passwordMin"))
        .max(128, t("server.passwordMax")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("server.passwordsMismatch"),
      path: ["confirmPassword"],
    });
}

export function loginSchema(lang: Lang = "en") {
  const t = getTranslator(lang);
  return z.object({
    email: z.string().email(t("server.emailInvalid")),
    password: z.string().min(1, t("server.passwordRequired")),
  });
}

export type RegisterInput = z.infer<ReturnType<typeof registerSchema>>;
export type LoginInput = z.infer<ReturnType<typeof loginSchema>>;