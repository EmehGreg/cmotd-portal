"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function deleteAdmin(adminId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized.");
  }

  if (!adminId) {
    throw new Error("Admin ID is required.");
  }

  if (adminId === session.user.id) {
    throw new Error("You cannot delete your own account.");
  }

  await prisma.userProgramme.deleteMany({
    where: {
      userId: adminId,
    },
  });

  await prisma.user.delete({
    where: {
      id: adminId,
    },
  });

  redirect("/admins");
}