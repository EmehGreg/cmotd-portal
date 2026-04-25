import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, FilePlus2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createWeeklyReport } from "./submit-report";
import { WeeklyReportComposer } from "@/components/reports/weekly-report-composer";

type ProgrammeOption = {
  id: string;
  name: string;
  code: string;
};

export default async function AddWeeklyReportPage() {
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
            Add Weekly Report
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-500">Add Weekly Report</span>
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

      <WeeklyReportComposer programmes={programmes} action={createWeeklyReport} />
    </div>
  );
}