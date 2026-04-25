import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderOpen, ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminReportsFilters } from "@/components/reports/admin-reports-filters";

type AdminReportsPageProps = {
  searchParams?: Promise<{
    q?: string;
    week?: string;
    year?: string;
  }>;
};

export default async function AdminReportsPage({
  searchParams,
}: AdminReportsPageProps) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const q = params.q?.trim() ?? "";
  const week = params.week ?? "";
  const year = params.year ?? String(new Date().getFullYear());

  const where =
    session.user.role === "SUPER_ADMIN"
      ? {
          ...(q
            ? {
                OR: [
                  { title: { contains: q, mode: "insensitive" as const } },
                  {
                    submittedBy: {
                      firstName: { contains: q, mode: "insensitive" as const },
                    },
                  },
                  {
                    submittedBy: {
                      lastName: { contains: q, mode: "insensitive" as const },
                    },
                  },
                ],
              }
            : {}),
          ...(week ? { week: Number(week) } : {}),
          ...(year ? { year: Number(year) } : {}),
        }
      : {
          submittedById: session.user.id,
          ...(q
            ? {
                OR: [{ title: { contains: q, mode: "insensitive" as const } }],
              }
            : {}),
          ...(week ? { week: Number(week) } : {}),
          ...(year ? { year: Number(year) } : {}),
        };

  const reports = await prisma.adminReport.findMany({
    where,
    select: {
      id: true,
      title: true,
      week: true,
      year: true,
      createdAt: true,
      submittedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ year: "desc" }, { week: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div className="space-y-6 px-4 pt-2">
      <div>
        <div className="flex items-center gap-3">
          <FolderOpen className="h-9 w-9 text-[#2f2a26]" />
          <h1 className="text-[32px] font-semibold text-[#2f2a26]">
            View Admin Reports
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-500">Admin Reports</span>
        </div>

        <div className="mt-4 flex gap-3 pl-[48px]">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-[15px] text-primary hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>

          <Link
            href="/reports/admins/new"
            className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Add Report
          </Link>
        </div>
      </div>

      <AdminReportsFilters initialQ={q} initialWeek={week} initialYear={year} />

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Available Reports
        </h2>

        {reports.length === 0 ? (
          <p className="text-slate-500">No reports found.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {reports.map((report) => (
              <li key={report.id} className="py-4">
                <Link
                  href={`/reports/admins/${report.id}`}
                  className="text-primary hover:underline"
                >
                  {report.title}
                </Link>
                <div className="mt-1 text-sm text-slate-500">
                  Week {report.week} · {report.year} · {report.submittedBy.firstName}{" "}
                  {report.submittedBy.lastName}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}