import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, UserCog } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EditAdminForm } from "@/components/admin/edit-admin-form";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAdminPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const admin = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      programmes: {
        select: {
          programmeId: true,
        },
      },
    },
  });

  if (!admin) {
    notFound();
  }

  const programmes = await prisma.programme.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6 px-4 pt-2">
      <div>
        <div className="flex items-center gap-3">
          <UserCog className="h-9 w-9 text-[#2f2a26]" />
          <h1 className="text-[32px] font-semibold text-[#2f2a26]">
            Edit Admin
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <span className="text-slate-500">/</span>
          <Link href="/admins" className="text-primary hover:underline">
            Manage Admins
          </Link>
        </div>

        <div className="mt-4 pl-[48px]">
          <Link
            href="/admins"
            className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-[15px] text-primary hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <EditAdminForm
        admin={{
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
          programmeIds: admin.programmes.map((p) => p.programmeId),
        }}
        programmes={programmes}
      />
    </div>
  );
}