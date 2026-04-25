import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const programmeId = searchParams.get("programmeId")?.trim() ?? "";
  const year = Number(searchParams.get("year")?.trim() ?? "");

  if (!programmeId || !year) {
    return NextResponse.json({ availableWeeks: [] });
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const submitted = await prisma.weeklyReport.findMany({
    where: {
      programmeId,
      year,
    },
    select: {
      week: true,
    },
  });

  const submittedWeeks = new Set(submitted.map((item) => item.week));
  const availableWeeks = Array.from({ length: 16 }, (_, i) => i + 1).filter(
    (week) => !submittedWeeks.has(week)
  );

  return NextResponse.json({ availableWeeks });
}