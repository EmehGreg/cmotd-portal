"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadMonthlyReportPdf } from "@/lib/reports/upload-monthly-report-pdf";

export async function createMonthlyReport(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    throw new Error("Unauthorized.");
  }

  const programmeId = String(formData.get("programmeId") ?? "").trim();
  const month = Number(String(formData.get("month") ?? "").trim());
  const year = Number(String(formData.get("year") ?? "").trim());
  const file = formData.get("uploadedPdf");

  if (!programmeId || !month || !year) {
    throw new Error("Programme, month, and year are required.");
  }

  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12.");
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

  const upload = await uploadMonthlyReportPdf({
    file,
    programmeCode: programme.code,
    month,
    year,
  });

  const existing = await prisma.monthlyReport.findFirst({
    where: {
      programmeId,
      month,
      year,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.monthlyReport.update({
      where: { id: existing.id },
      data: {
        title: `${programme.name} Monthly Report - ${new Date(
          year,
          month - 1,
          1
        ).toLocaleString("default", { month: "long" })} ${year}`,
        fileUrl: upload.publicUrl,
        submissionDate: new Date(),
        submittedById: session.user.id,
      },
    });
  } else {
    await prisma.monthlyReport.create({
      data: {
        programmeId,
        submittedById: session.user.id,
        month,
        year,
        title: `${programme.name} Monthly Report - ${new Date(
          year,
          month - 1,
          1
        ).toLocaleString("default", { month: "long" })} ${year}`,
        fileUrl: upload.publicUrl,
        submissionDate: new Date(),
      },
    });
  }

  redirect(
    `/reports/monthly?programme=${encodeURIComponent(programmeId)}&month=${encodeURIComponent(
      String(month)
    )}&year=${encodeURIComponent(String(year))}&success=1`
  );
}