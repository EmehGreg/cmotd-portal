"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteAdmin } from "@/app/(dashboard)/admins/actions";

type Props = {
  adminId: string;
  currentUserId: string;
};

export function DeleteAdminButton({ adminId, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();

  const isSelf = adminId === currentUserId;

  return (
    <button
      type="button"
      disabled={isSelf || isPending}
      onClick={() => {
        if (isSelf) return;
        const ok = window.confirm("Are you sure you want to delete this admin?");
        if (!ok) return;

        startTransition(async () => {
          await deleteAdmin(adminId);
        });
      }}
      className="inline-flex items-center gap-1 rounded bg-red-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isSelf ? "Cannot Delete Self" : isPending ? "Deleting..." : "Delete"}
    </button>
  );
}