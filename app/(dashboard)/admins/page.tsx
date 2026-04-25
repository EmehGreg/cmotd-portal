import Link from "next/link";
import { redirect } from "next/navigation";
import { UserCog, Plus, Pencil, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DeleteAdminButton } from "@/components/admin/delete-admin-button";

export default async function AdminsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const admins = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      programmes: {
        select: {
          programme: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6 px-4 pt-2">
      <div>
        <div className="flex items-center gap-3">
          <UserCog className="h-9 w-9 text-[#2f2a26]" />
          <h1 className="text-[32px] font-semibold text-[#2f2a26]">
            Manage Admins
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-2 pl-[48px] text-[16px]">
          <span className="text-primary">Dashboard</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-500">Manage Admins</span>
        </div>

        <div className="mt-4 pl-[48px]">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add New Admin
          </Link>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Admins</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-primary text-white">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Full Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Programmes</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No admins found.
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={admin.id} className="border-t border-primary/20">
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4">
                      {admin.firstName} {admin.lastName}
                    </td>
                    <td className="px-4 py-4">{admin.email}</td>
                    <td className="px-4 py-4">{admin.role}</td>
                    <td className="px-4 py-4">
                      {admin.programmes.length > 0
                        ? admin.programmes
                            .map((item) => item.programme.name)
                            .join(", ")
                        : "N/A"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admins/${admin.id}/edit`}
                          className="inline-flex items-center gap-1 rounded bg-amber-500 px-3 py-2 text-xs font-medium text-white hover:opacity-90"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>

                        <DeleteAdminButton
                          adminId={admin.id}
                          currentUserId={session.user.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}