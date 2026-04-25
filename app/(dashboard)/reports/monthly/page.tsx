import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { MonthlyReportFilters } from "@/components/reports/monthly-report-filters";

type MonthlyReportPageProps = {
  searchParams?: Promise<{
    programme?: string;
    month?: string;
    year?: string;
    success?: string;
  }>;
};

type ProgrammeOption = {
  id: string;
  name: string;
};

export default async function MonthlyReportPage({
  searchParams,
}: MonthlyReportPageProps) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  let programmeId = params.programme ?? "";
  const month = params.month ?? "";
  const year = params.year ?? String(new Date().getFullYear());
  const success = params.success === "1";

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

  const report =
    programmeId && month && year
      ? await prisma.monthlyReport.findFirst({
          where: {
            programmeId,
            month: Number(month),
            year: Number(year),
          },
          select: {
            id: true,
            title: true,
            fileUrl: true,
            submissionDate: true,
            programme: {
              select: {
                name: true,
              },
            },
            submittedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        })
      : null;

  return (
    <div className="space-y-6 px-4 pt-2">
      <div>
        <div className="flex items-center gap-3">
          <FileText className="h-9 w-9 text-[#2f2a26]" />
          <h1 className="text-[32px] font-semibold text-[#2f2a26]">
            View Monthly Report
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-500">Monthly report</span>
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

      {success ? (
        <div className="mx-auto w-fit rounded border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          Monthly report submitted successfully.
        </div>
      ) : null}

      <MonthlyReportFilters
        programmes={programmes}
        initialProgrammeId={programmeId}
        initialMonth={month}
        initialYear={year}
      />

      <div className="rounded-xl bg-white p-6 shadow-sm">
        {!programmeId || !month || !year ? (
          <p className="text-slate-500">
            Select a programme, month, and year to view the report.
          </p>
        ) : !report || !report.fileUrl ? (
          <p className="text-amber-700">
            No report available for that month.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {report.title}
              </h3>
              <p className="text-sm text-slate-500">
                Programme: {report.programme.name}
              </p>
              <p className="text-sm text-slate-500">
                Submitted by {report.submittedBy.firstName} {report.submittedBy.lastName}
              </p>
              <p className="text-sm text-slate-500">
                {report.submissionDate
                  ? new Date(report.submissionDate).toLocaleString()
                  : "No submission date"}
              </p>
            </div>

            <div className="overflow-hidden border border-slate-200">
              <iframe
                src={report.fileUrl}
                title={report.title}
                className="h-[800px] w-full"
              />
            </div>

            <div>
              <a
                href={report.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Open PDF in new tab
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}