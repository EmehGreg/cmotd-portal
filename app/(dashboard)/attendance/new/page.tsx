import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, PencilLine } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { saveAttendance } from "./save-attendance";
import { AttendanceFilters } from "@/components/attendance/attendance-filters";

type AddAttendancePageProps = {
  searchParams?: Promise<{
    programme?: string;
    week?: string;
    year?: string;
  }>;
};

type ProgrammeOption = {
  id: string;
  name: string;
};

type AttendanceStudent = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  batch: string | null;
  registrationNumber: string | null;
  programme: {
    id: string;
    name: string;
  };
};

const weekOptions = Array.from({ length: 16 }, (_, i) => ({
  value: String(i + 1),
  label: `Week ${i + 1}`,
}));

export default async function AddAttendancePage({
  searchParams,
}: AddAttendancePageProps) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  let programmeId = params.programme ?? "";
  const week = params.week ?? "";
  const year = params.year ?? String(new Date().getFullYear());

  let programmes: ProgrammeOption[] = [];

  if (session.user.role === "SUPER_ADMIN") {
    programmes = await prisma.programme.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } else if (session.user.role === "ADMIN") {
    const assigned = await prisma.userProgramme.findMany({
      where: { userId: session.user.id },
      select: {
        programme: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        programme: {
          name: "asc",
        },
      },
    });

    programmes = assigned.map((item) => item.programme);

    if (!programmeId && programmes.length > 0) {
      programmeId = programmes[0].id;
    }
  }

  const students: AttendanceStudent[] =
    !programmeId || !week
      ? []
      : await prisma.student.findMany({
          where: {
            programmeId,
            batch: "2026",
            registrationNumber: {
              not: null,
            },
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            batch: true,
            registrationNumber: true,
            programme: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            registrationNumber: "asc",
          },
          take: 300,
        });

  return (
    <div className="space-y-6 px-4 pt-2">
      <div>
        <div className="flex items-center gap-3">
          <PencilLine className="h-9 w-9 text-[#2f2a26]" />
          <h1 className="text-[32px] font-semibold text-[#2f2a26]">
            Add Attendance
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-500">Add attendance</span>
        </div>

        <div className="mt-4 pl-[48px]">
          <Link
            href="/attendance"
            className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-[15px] text-primary hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-3 text-[20px] font-semibold text-[#2f2a26]">
          <PencilLine className="h-6 w-6" />
          <span>Add New Attendance</span>
        </div>
      </div>

      <AttendanceFilters
        programmes={programmes}
        initialProgrammeId={programmeId}
        initialWeek={week}
        initialYear={year}
      />

      <form action={saveAttendance} className="space-y-4">
        <input type="hidden" name="programmeId" value={programmeId} />
        <input type="hidden" name="week" value={week} />
        <input type="hidden" name="year" value={year} />

        <div className="overflow-hidden border border-primary/40 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-primary text-white">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Reg. No.</th>
                  <th className="px-4 py-3 font-semibold">Full Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Batch</th>
                  <th className="px-4 py-3 font-semibold">Programme</th>
                  <th className="px-4 py-3 font-semibold">Weekly Attendance</th>
                </tr>
              </thead>

              <tbody>
                {!programmeId || !week ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Select a programme and week to add attendance.
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No students found.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="border-t border-primary/30">
                      <td className="px-4 py-4">
                        {student.registrationNumber ?? "-"}
                        <input
                          type="hidden"
                          name="studentIds"
                          value={student.id}
                        />
                      </td>

                      <td className="px-4 py-4">
                        {student.firstName} {student.lastName}
                      </td>

                      <td className="px-4 py-4">{student.phone ?? "-"}</td>
                      <td className="px-4 py-4">{student.batch ?? "-"}</td>
                      <td className="px-4 py-4">{student.programme.name}</td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          name={`attendance_${student.id}`}
                          min={0}
                          max={4}
                          step={1}
                          required
                          className="h-11 w-full border border-slate-300 bg-white px-3 font-semibold outline-none"
                          inputMode="numeric"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {programmeId && week && students.length > 0 ? (
          <div className="px-4">
            <button
              type="submit"
              className="bg-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Save Attendance
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}