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
  const title = String(formData.get("title") ?? "").trim();
  const week = Number(String(formData.get("week") ?? "").trim());
  const year = Number(String(formData.get("year") ?? "").trim());
  const file = formData.get("uploadedPdf");

  if (!programmeId || !title || !week || !year) {
    throw new Error("Programme, title, week, and year are required.");
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
    select: { code: true },
  });

  if (!programme) {
    throw new Error("Programme not found.");
  }

  const upload = await uploadWeeklyReportPdf({
    file,
    programmeCode: programme.code,
    week,
    year,
  });

  const existing = await prisma.weeklyReport.findFirst({
    where: {
      programmeId,
      week,
      year,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.weeklyReport.update({
      where: { id: existing.id },
      data: {
        title,
        fileUrl: upload.publicUrl,
        submissionDate: new Date(),
        submittedById: session.user.id,
      },
    });
  } else {
    await prisma.weeklyReport.create({
      data: {
        programmeId,
        submittedById: session.user.id,
        week,
        year,
        title,
        fileUrl: upload.publicUrl,
        submissionDate: new Date(),
      },
    });
  }

  redirect(
    `/reports/weekly?programme=${encodeURIComponent(programmeId)}&week=${encodeURIComponent(
      String(week)
    )}&year=${encodeURIComponent(String(year))}&success=1`
  );
}