import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Gauge, Users, Settings, Power } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  console.log(session)
  return (
    <div className="h-full px-10 py-8">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <Gauge className="h-10 w-10 text-[#2f2a26]" />
          <h1 className="text-[34px] font-semibold text-[#2f2a26]">
            Dashboard
          </h1>
        </div>

        <p className="mt-2 pl-[52px] text-[18px] text-gray-500">Dashboard</p>
      </div>

      <div>
        <h2 className="mb-14 text-center text-[32px] font-semibold text-[#2f2a26]">
          SLM PORTAL
        </h2>

        <div className="mx-auto flex max-w-[980px] flex-wrap justify-center gap-6">
          <Link
            href="/students"
            className="flex h-[120px] w-[300px] flex-col items-center justify-center rounded-xl border border-[#4c87c8] hover:bg-white/40"
          >
            <Users className="mb-3 h-12 w-12 text-[#1f5aa6]" />
            <span className="text-lg font-medium text-[#1f5aa6]">Students</span>
          </Link>

          <Link
            href="/admins"
            className="flex h-[120px] w-[300px] flex-col items-center justify-center rounded-xl border border-[#4c87c8] hover:bg-white/40"
          >
            <Settings className="mb-3 h-12 w-12 text-[#1f5aa6]" />
            <span className="text-lg font-medium text-[#1f5aa6]">
              Manage Admins
            </span>
          </Link>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
            className="flex h-[120px] w-[300px]"
          >
            <button
              type="submit"
              className="flex w-full flex-col items-center justify-center rounded-xl border border-[#4c87c8] hover:bg-white/40"
            >
              <Power className="mb-3 h-12 w-12 text-red-600" />
              <span className="text-lg font-medium text-[#1f5aa6]">Logout</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}