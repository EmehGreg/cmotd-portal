import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const students = await prisma.student.findMany({
    where: {
      batch: "2026",
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { registrationNumber: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      programme: true,
      state: true,
      educationBackground: true,
    },
    take: 10,
  });

  return NextResponse.json(
    students.map((student) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth
        ? student.dateOfBirth.toISOString().split("T")[0]
        : "",
      gender: student.gender ?? "",
      residentialAddress: student.residentialAddress ?? "",
      passportPhotoUrl: student.passportPhotoUrl ?? "",
      batch: student.batch ?? "",
      registrationNumber: student.registrationNumber ?? "",
      competencyId: student.competencyId ?? "",
      educationLevel: student.educationLevel ?? "",
      company: student.company ?? "",
      remarks: student.remarks ?? "",
      disability: student.disability,
      programmeId: student.programmeId,
      stateId: student.stateId ?? "",
      educationBackgroundId: student.educationBackgroundId ?? "",
      programmeName: student.programme?.name ?? "",
    }))
  );
}