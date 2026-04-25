"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CreateAdminState = {
  error: string | null;
  role: "ADMIN" | "SUPER_ADMIN";
  values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    programmeId: string;
  };
};

export const initialCreateAdminState: CreateAdminState = {
  error: null,
  role: "ADMIN",
  values: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    programmeId: "",
  },
};

export async function createAdmin(
  _prevState: CreateAdminState,
  formData: FormData
): Promise<CreateAdminState> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return {
      ...initialCreateAdminState,
      error: "Unauthorized.",
    };
  }

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const role = String(formData.get("role") ?? "ADMIN") as
    | "ADMIN"
    | "SUPER_ADMIN";
  const programmeId = String(formData.get("programmeId") ?? "");

  const values = {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    programmeId,
  };

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return {
      error: "All fields are required.",
      role,
      values,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      error: "Invalid email format.",
      role,
      values,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      role,
      values,
    };
  }

  if (role === "ADMIN" && !programmeId) {
    return {
      error: "Programme selection is required for Admin.",
      role,
      values,
    };
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingAdmin) {
    return {
      error: "Email already registered.",
      role,
      values,
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newAdmin = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      role,
    },
    select: {
      id: true,
    },
  });

  if (role === "ADMIN" && programmeId) {
    await prisma.userProgramme.create({
      data: {
        userId: newAdmin.id,
        programmeId,
      },
    });
  }

  redirect("/admins?created=1");
}