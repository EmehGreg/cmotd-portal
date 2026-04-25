"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function changePassword(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized.");
  }

  const oldPassword = String(formData.get("oldPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new Error("All password fields are required.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);

  if (!isValid) {
    throw new Error("Old password is incorrect.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,
    },
  });

  redirect("/dashboard");
}