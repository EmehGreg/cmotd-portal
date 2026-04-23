"use server";

import AuthError from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Invalid email or password.");
    }

    throw error;
  }
}