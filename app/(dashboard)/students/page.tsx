import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, Users } from "lucide-react";
import { StudentFilters } from "@/components/student/student-filters";

type StudentsPageProps = {
  searchParams?: Promise<{
    q?: string;
    programme?: string;
    state?: string;
  }>;
};

type StudentRow = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  phone: string | null;
  email: string | null;
  registrationNumber: string | null;
  programme: {
    name: string;
  };
};

function buildStudentWhereClause({
  q,
  programmeId,
  stateId,
}: {
  q: string;
  programmeId: string;
  stateId: string;
}) {
  return {
    batch: "2026",
    AND: [
      q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" as const } },
              { lastName: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              {
                registrationNumber: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {},
      programmeId ? { programmeId } : {},
      stateId ? { stateId } : {},
    ],
  };
}

function sortStudents(students: StudentRow[]) {
  return [...students].sort((a, b) => {
    const aHasReg = Boolean(a.registrationNumber);
    const bHasReg = Boolean(b.registrationNumber);

    if (aHasReg && !bHasReg) return -1;
    if (!aHasReg && bHasReg) return 1;

    if (a.registrationNumber && b.registrationNumber) {
      return a.registrationNumber.localeCompare(
        b.registrationNumber,
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      );
    }

    return `${a.firstName} ${a.lastName}`.localeCompare(
      `${b.firstName} ${b.lastName}`,
      undefined,
      {
        sensitivity: "base",
      }
    );
  });
}

export default async function StudentsPage({
  searchParams,
}: StudentsPageProps) {
  const params = (await searchParams) ?? {};
  const q = params.q?.trim() ?? "";
  const programmeId = params.programme ?? "";
  const stateId = params.state ?? "";

  const where = buildStudentWhereClause({ q, programmeId, stateId });

  const studentsRaw = await prisma.student.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      gender: true,
      phone: true,
      email: true,
      registrationNumber: true,
      programme: {
        select: {
          name: true,
        },
      },
    },
    take: 300,
  });

  const programmes = await prisma.programme.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  const states = await prisma.state.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  const totalCount = await prisma.student.count({
    where,
  });

  const students = sortStudents(studentsRaw);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="px-4 pt-2">
          <div className="flex items-center gap-3">
            <Users className="h-9 w-9 text-[#2f2a26]" />
            <h1 className="text-[32px] font-semibold text-[#2f2a26]">
              Students
            </h1>
          </div>

          <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
            <Link href="/dashboard" className="text-primary hover:underline">
              Dashboard
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-500">Students</span>
          </div>

          <div className="mt-4 pl-[48px]">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-[15px] text-primary hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between px-4">
          <div />
          <div className="flex items-center gap-4">
            <div className="text-[16px] text-slate-800">
              Total Number of Students:{" "}
              <span className="font-bold text-green-600">[{totalCount}]</span>
            </div>

            <Link
              href="/students/new"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              New Student
            </Link>
          </div>
        </div>
      </div>

      <StudentFilters
        programmes={programmes}
        states={states}
        initialQ={q}
        initialProgrammeId={programmeId}
        initialStateId={stateId}
      />

      <div className="mt-32 overflow-hidden border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-primary text-white">
              <tr className="text-left">
                <th className="px-6 py-3 font-semibold">Reg. No.</th>
                <th className="px-6 py-3 font-semibold">Full Name</th>
                <th className="px-6 py-3 font-semibold">Gender</th>
                <th className="px-6 py-3 font-semibold">Phone</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Programme</th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No students found for the 2026 batch.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-t border-primary/30 text-slate-700"
                  >
                    <td className="px-6 py-4">
                      {student.registrationNumber ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/students/${student.id}`}
                        className="text-primary hover:underline"
                      >
                        {student.firstName} {student.lastName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{student.gender ?? "-"}</td>
                    <td className="px-6 py-4">{student.phone ?? "-"}</td>
                    <td className="px-6 py-4">{student.email ?? "-"}</td>
                    <td className="px-6 py-4">{student.programme.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}