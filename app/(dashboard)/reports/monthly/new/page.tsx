import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, FilePlus2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createMonthlyReport } from "./submit-report";

type ProgrammeOption = {
  id: string;
  name: string;
  code: string;
};

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default async function AddMonthlyReportPage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  let programmes: ProgrammeOption[] = [];

  if (session.user.role === "SUPER_ADMIN") {
    programmes = await prisma.programme.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: "asc" },
    });
  } else {
    const assigned = await prisma.userProgramme.findMany({
      where: { userId: session.user.id },
      select: {
        programme: {
          select: {
            id: true,
            name: true,
            code: true,
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
  }

  return (
    <div className="space-y-6 px-4 pt-2">
      <div>
        <div className="flex items-center gap-3">
          <FilePlus2 className="h-9 w-9 text-[#2f2a26]" />
          <h1 className="text-[32px] font-semibold text-[#2f2a26]">
            Add Monthly Report
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-500">Add Monthly Report</span>
        </div>

        <div className="mt-4 pl-[48px]">
          <Link
            href="/reports/monthly"
            className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-[15px] text-primary hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <form action={createMonthlyReport} className="max-w-4xl space-y-6 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label
              htmlFor="programmeId"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Programme
            </label>
            <select
              id="programmeId"
              name="programmeId"
              required
              className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
            >
              <option value="">-- Select Programme --</option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.code} - {programme.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="month"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Month
            </label>
            <select
              id="month"
              name="month"
              required
              className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
            >
              <option value="">-- Select Month --</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="year"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              defaultValue={new Date().getFullYear()}
              required
              className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
            />
          </div>
        </div>

        <div className="rounded-lg bg-slate-100 p-6">
          <label
            htmlFor="uploadedPdf"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Upload Monthly Report PDF
          </label>
          <input
            id="uploadedPdf"
            name="uploadedPdf"
            type="file"
            accept="application/pdf"
            required
            className="block w-full text-sm text-slate-700"
          />
        </div>

        <button
          type="submit"
          className="bg-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Submit Monthly Report
        </button>
      </form>
    </div>
  );
}