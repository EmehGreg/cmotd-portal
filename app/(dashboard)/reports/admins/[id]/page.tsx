import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, FileText } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type AdminReportDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    success?: string;
  }>;
};

export default async function AdminReportDetailPage({
  params,
  searchParams,
}: AdminReportDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const { id } = await params;
  const qp = (await searchParams) ?? {};
  const success = qp.success === "1";

  const report = await prisma.adminReport.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      submissionDate: true,
      submittedById: true,
      week: true,
      year: true,
      submittedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!report) {
    notFound();
  }

  if (
    session.user.role !== "SUPER_ADMIN" &&
    report.submittedById !== session.user.id
  ) {
    redirect("/reports/admins");
  }

  return (
    <div className="space-y-6 px-4 pt-2">
      <div>
        <div className="flex items-center gap-3">
          <FileText className="h-9 w-9 text-[#2f2a26]" />
          <h1 className="text-[32px] font-semibold text-[#2f2a26]">
            {report.title}
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <span className="text-slate-500">/</span>
          <Link href="/reports/admins" className="text-primary hover:underline">
            Admin Reports
          </Link>
        </div>

        <div className="mt-4 pl-[48px]">
          <Link
            href="/reports/admins"
            className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-[15px] text-primary hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      {success ? (
        <div className="mx-auto w-fit rounded border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          Report submitted successfully.
        </div>
      ) : null}

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-slate-500">
          Submitted by {report.submittedBy.firstName} {report.submittedBy.lastName}
          {report.submissionDate
            ? ` on ${new Date(report.submissionDate).toLocaleDateString()}`
            : ""}
          {" · "}Week {report.week} · {report.year}
        </p>

        <div className="overflow-hidden border border-slate-200">
          <iframe
            src={report.fileUrl}
            title={report.title}
            className="h-[800px] w-full"
          />
        </div>

        <div className="mt-4">
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
    </div>
  );
}