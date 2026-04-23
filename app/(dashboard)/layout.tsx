import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar user={session.user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={session.user} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}