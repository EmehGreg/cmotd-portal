"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { uploadWeeklyReportPdf } from "@/lib/reports/upload-weekly-report-pdf";

export async function createWeeklyReport(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    throw new Error("Unauthorized.");
  }

  const programmeId = String(formData.get("programmeId") ?? "").trim();
  const week = Number(String(formData.get("week") ?? "").trim());
  const year = Number(String(formData.get("year") ?? "").trim());
  const file = formData.get("uploadedPdf");

  if (!programmeId || !week || !year) {
    throw new Error("Programme, week, and year are required.");
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("A PDF file is required.");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed.");
  }

  if (session.user.role === "ADMIN") {
    const allowed = await prisma.userProgramme.findFirst({
      where: {
        userId: session.user.id,
        programmeId,
      },
      select: { id: true },
    });

    if (!allowed) {
      throw new Error("You are not assigned to this programme.");
    }
  }

  const programme = await prisma.programme.findUnique({
    where: { id: programmeId },
    select: { code: true, name: true },
  });

  if (!programme) {
    throw new Error("Programme not found.");
  }

  const existing = await prisma.weeklyReport.findFirst({
    where: {
      programmeId,
      week,
      year,
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error("A weekly report already exists for this programme and week.");
  }

  const upload = await uploadWeeklyReportPdf({
    file,
    programmeCode: programme.code,
    week,
    year,
  });

  await prisma.weeklyReport.create({
    data: {
      programmeId,
      submittedById: session.user.id,
      week,
      year,
      title: `${programme.name} Weekly Report - Week ${week}`,
      fileUrl: upload.publicUrl,
      submissionDate: new Date(),
    },
  });

  redirect(
    `/reports/weekly?programme=${encodeURIComponent(programmeId)}&week=${encodeURIComponent(
      String(week)
    )}&year=${encodeURIComponent(String(year))}&success=1`
  );
}