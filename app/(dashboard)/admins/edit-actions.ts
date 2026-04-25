"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateAdmin(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized.");
  }

  const adminId = String(formData.get("adminId") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as "ADMIN" | "SUPER_ADMIN";
  const programmeIds = formData.getAll("programmeIds").map(String);

  if (!adminId || !firstName || !lastName || !email || !role) {
    throw new Error("All required fields must be provided.");
  }

  if (role === "ADMIN" && programmeIds.length === 0) {
    throw new Error("At least one programme must be selected for an admin.");
  }

  await prisma.user.update({
    where: { id: adminId },
    data: {
      firstName,
      lastName,
      email,
      role,
    },
  });

  await prisma.userProgramme.deleteMany({
    where: {
      userId: adminId,
    },
  });

  if (role === "ADMIN") {
    await prisma.userProgramme.createMany({
      data: programmeIds.map((programmeId) => ({
        userId: adminId,
        programmeId,
      })),
      skipDuplicates: true,
    });
  }

  redirect("/admins");
}