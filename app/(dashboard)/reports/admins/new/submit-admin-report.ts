"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadAdminReportPdf } from "@/lib/reports/upload-admin-report-pdf";

export async function createAdminReport(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    throw new Error("Unauthorized.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const week = Number(String(formData.get("week") ?? "").trim());
  const year = Number(String(formData.get("year") ?? "").trim());
  const file = formData.get("uploadedPdf");

  if (!title) {
    throw new Error("Report title is required.");
  }

  if (!week || week < 1 || week > 16) {
    throw new Error("Week must be between 1 and 16.");
  }

  if (!year) {
    throw new Error("Year is required.");
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("A PDF file is required.");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed.");
  }

  const existing = await prisma.adminReport.findFirst({
    where: {
      submittedById: session.user.id,
      week,
      year,
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error("You already submitted an admin report for this week and year.");
  }

  const upload = await uploadAdminReportPdf({
    file,
    title,
    submittedById: session.user.id,
  });

  const report = await prisma.adminReport.create({
    data: {
      submittedById: session.user.id,
      title,
      fileUrl: upload.publicUrl,
      storageKey: upload.storageKey,
      week,
      year,
      submissionDate: new Date(),
    },
    select: {
      id: true,
    },
  });

  redirect(`/reports/admins/${report.id}?success=1`);
}