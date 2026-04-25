import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, FilePlus2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createWeeklyReport } from "./submit-report";

type AddWeeklyReportPageProps = {
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

const weekOptions = Array.from({ length: 16 }, (_, i) => ({
  value: String(i + 1),
  label: `Week ${i + 1}`,
}));

export default async function AddWeeklyReportPage({
  searchParams,
}: AddWeeklyReportPageProps) {
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
  } else {
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

  return (
    <div className="space-y-6 px-4 pt-2">
      <div>
        <div className="flex items-center gap-3">
          <FilePlus2 className="h-9 w-9 text-[#2f2a26]" />
          <h1 className="text-[32px] font-semibold text-[#2f2a26]">
            Add Weekly Report
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-500">Weekly report</span>
        </div>

        <div className="mt-4 pl-[48px]">
          <Link
            href="/reports/weekly"
            className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-[15px] text-primary hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <form action={createWeeklyReport} className="max-w-3xl space-y-6 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="programmeId" className="mb-2 block text-sm font-medium text-slate-700">
              Programme
            </label>
            <select
              id="programmeId"
              name="programmeId"
              defaultValue={programmeId}
              required
              className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
            >
              <option value="">Select programme</option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700">
              Report Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
              placeholder="Enter weekly report title"
            />
          </div>

          <div>
            <label htmlFor="week" className="mb-2 block text-sm font-medium text-slate-700">
              Week
            </label>
            <select
              id="week"
              name="week"
              defaultValue={week}
              required
              className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
            >
              <option value="">-- Select Week --</option>
              {weekOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="year" className="mb-2 block text-sm font-medium text-slate-700">
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              defaultValue={year}
              required
              className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="uploadedPdf" className="mb-2 block text-sm font-medium text-slate-700">
            Upload Report PDF
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
          Submit Report
        </button>
      </form>
    </div>
  );
}