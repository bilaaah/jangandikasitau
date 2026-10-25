"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().trim().email("Masukkan email bisnis yang valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

export interface LoginState {
  error?: string;
}

export async function login(
  _previousState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState | undefined> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Periksa kembali data login." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau kata sandi tidak sesuai." };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
