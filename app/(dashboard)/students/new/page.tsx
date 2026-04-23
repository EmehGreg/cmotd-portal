import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, UserPlus } from "lucide-react";
import { StudentRegistrationForm } from "@/components/student/student-registration-form";

export default async function NewStudentPage() {
  const [programmes, states] = await Promise.all([
    prisma.programme.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.state.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 px-4 pt-2">
      <div>
        <div className="flex items-center gap-3">
          <UserPlus className="h-9 w-9 text-[#2f2a26]" />
          <h1 className="text-[32px] font-semibold text-[#2f2a26]">
            Register Student
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-500">Register Student</span>
        </div>

        <div className="mt-4 pl-[48px]">
          <Link
            href="/students"
            className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-[15px] text-primary hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <StudentRegistrationForm programmes={programmes} states={states} />
    </div>
  );
}