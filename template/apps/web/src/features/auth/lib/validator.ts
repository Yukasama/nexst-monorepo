import { z } from "zod";

export type EmailProps = z.infer<ReturnType<typeof createEmailSchema>>;

export type NewPasswordProps = z.infer<ReturnType<typeof createNewPasswordSchema>>;
export type SignInProps = z.infer<ReturnType<typeof createSignInSchema>>;
export type SignUpProps = z.infer<ReturnType<typeof createSignUpSchema>>;
type Translate = (key: string) => string;

const MIN_PASSWORD_LENGTH = 8;

export function createEmailSchema(t: Translate) {
  return z.object({
    email: z.email(t("Auth.Errors.emailInvalid")),
  });
}

export function createNewPasswordSchema(t: Translate) {
  return z
    .object({
      confirmPassword: z.string().min(1, t("Auth.Errors.confirmPasswordRequired")),
      password: z.string().min(MIN_PASSWORD_LENGTH, t("Auth.Errors.passwordTooShort")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Auth.Errors.passwordsMustMatch"),
      path: ["confirmPassword"],
    });
}

export function createSignInSchema(t: Translate) {
  return z.object({
    email: z.email(t("Auth.Errors.emailInvalid")),
    password: z.string().min(1, t("Auth.Errors.passwordRequired")),
  });
}

export function createSignUpSchema(t: Translate) {
  return z
    .object({
      confirmPassword: z.string().min(1, t("Auth.Errors.confirmPasswordRequired")),
      email: z.email(t("Auth.Errors.emailInvalid")),
      name: z.string().trim().min(1, t("Auth.Errors.nameRequired")).max(100),
      password: z.string().min(MIN_PASSWORD_LENGTH, t("Auth.Errors.passwordTooShort")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Auth.Errors.passwordsMustMatch"),
      path: ["confirmPassword"],
    });
}
