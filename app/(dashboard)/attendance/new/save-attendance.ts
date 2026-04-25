"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function saveAttendance(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    throw new Error("Unauthorized.");
  }

  const programmeId = String(formData.get("programmeId") ?? "").trim();
  const week = Number(String(formData.get("week") ?? "").trim());
  const year = Number(String(formData.get("year") ?? "").trim());
  const studentIds = formData.getAll("studentIds").map(String);

  if (!programmeId || !week || !year || studentIds.length === 0) {
    throw new Error("Programme, week, year, and students are required.");
  }

  if (week < 1 || week > 16) {
    throw new Error("Week must be between 1 and 16.");
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

  const rows = studentIds.map((studentId) => {
    const raw = String(formData.get(`attendance_${studentId}`) ?? "").trim();
    const attendance = Number(raw);

    if (Number.isNaN(attendance) || attendance < 0 || attendance > 4) {
      throw new Error("Attendance values must be between 0 and 4.");
    }

    return {
      studentId,
      week,
      year,
      attendance,
    };
  });

  await prisma.$transaction(
    rows.map((row) =>
      prisma.attendance.upsert({
        where: {
          studentId_week_year: {
            studentId: row.studentId,
            week: row.week,
            year: row.year,
          },
        },
        update: {
          attendance: row.attendance,
        },
        create: row,
      })
    )
  );

  redirect(
    `/attendance?programme=${encodeURIComponent(programmeId)}&week=${encodeURIComponent(
      String(week)
    )}&year=${encodeURIComponent(String(year))}&success=1`
  );
}