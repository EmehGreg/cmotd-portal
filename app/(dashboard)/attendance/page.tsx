import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type AttendancePageProps = {
  searchParams?: Promise<{
    programme?: string;
    week?: string;
    year?: string;
    success?: string;
  }>;
};

type ProgrammeOption = {
  id: string;
  name: string;
};

type AttendanceRow = {
  id: string;
  week: number;
  year: number;
  attendance: number;
  student: {
    firstName: string;
    lastName: string;
    phone: string | null;
    batch: string | null;
    registrationNumber: string | null;
    programmeId: string;
  };
};

const weekOptions = Array.from({ length: 16 }, (_, i) => ({
  value: String(i + 1),
  label: `Week ${i + 1}`,
}));

export default async function AttendancePage({
  searchParams,
}: AttendancePageProps) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  let programmeId = params.programme ?? "";
  const week = params.week ?? "1";
  const year = params.year ?? String(new Date().getFullYear());
  const success = params.success === "1";

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

  const attendanceRows: AttendanceRow[] =
    !programmeId || !week
      ? []
      : await prisma.attendance.findMany({
          where: {
            week: Number(week),
            year: Number(year),
            student: {
              programmeId,
              batch: "2026",
            },
          },
          select: {
            id: true,
            week: true,
            year: true,
            attendance: true,
            student: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                batch: true,
                registrationNumber: true,
                programmeId: true,
              },
            },
          },
          orderBy: [
            {
              student: {
                registrationNumber: "asc",
              },
            },
          ],
          take: 300,
        });

  const programmeName =
    programmeId && programmes.length > 0
      ? programmes.find((p) => p.id === programmeId)?.name ?? "-"
      : "-";

  return (
    <div className="space-y-6 px-4 pt-2">
      <div>
        <div className="flex items-center gap-3">
          <Eye className="h-9 w-9 text-[#2f2a26]" />
          <h1 className="text-[32px] font-semibold text-[#2f2a26]">
            View Attendance
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-500">View attendance</span>
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

      <div className="flex justify-center">
        <div className="flex items-center gap-3 text-[20px] font-semibold text-[#2f2a26]">
          <Eye className="h-6 w-6" />
          <span>Attendance Record</span>
        </div>
      </div>

      {success ? (
        <div className="mx-auto w-fit rounded border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          Attendance saved successfully.
        </div>
      ) : null}

      <form className="flex flex-wrap items-center gap-4 px-4" method="get">
        <div className="flex items-center gap-3">
          <label
            htmlFor="programme"
            className="text-[16px] font-medium text-slate-800"
          >
            Programme:
          </label>
          <select
            id="programme"
            name="programme"
            defaultValue={programmeId}
            className="h-11 min-w-[240px] border border-slate-300 bg-white px-3 text-[16px] outline-none"
          >
            <option value="">Select programme</option>
            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {programme.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="week"
            className="text-[16px] font-medium text-slate-800"
          >
            Week:
          </label>
          <select
            id="week"
            name="week"
            defaultValue={week}
            className="h-11 min-w-[180px] border border-slate-300 bg-white px-3 text-[16px] outline-none"
          >
            {weekOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="year"
            className="text-[16px] font-medium text-slate-800"
          >
            Year:
          </label>
          <input
            id="year"
            name="year"
            type="number"
            defaultValue={year}
            className="h-11 w-[140px] border border-slate-300 bg-white px-3 text-[16px] outline-none"
          />
        </div>

        <button
          type="submit"
          className="h-11 bg-primary px-5 text-sm font-medium text-white hover:opacity-90"
        >
          Filter
        </button>
      </form>

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
              {!programmeId ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Select a programme and week to view attendance.
                  </td>
                </tr>
              ) : attendanceRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendanceRows.map((row) => (
                  <tr key={row.id} className="border-t border-primary/30">
                    <td className="px-4 py-4">
                      {row.student.registrationNumber ?? ""}
                    </td>
                    <td className="px-4 py-4">
                      {row.student.firstName} {row.student.lastName}
                    </td>
                    <td className="px-4 py-4">{row.student.phone ?? "-"}</td>
                    <td className="px-4 py-4">{row.student.batch ?? "-"}</td>
                    <td className="px-4 py-4">{programmeName}</td>
                    <td className="px-4 py-4">{row.attendance}</td>
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