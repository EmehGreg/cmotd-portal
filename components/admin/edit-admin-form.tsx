"use client";

import { useState } from "react";
import { updateAdmin } from "@/app/(dashboard)/admins/edit-actions";

type AdminRole = "ADMIN" | "SUPER_ADMIN";

type Props = {
  admin: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: AdminRole;
    programmeIds: string[];
  };
  programmes: {
    id: string;
    name: string;
  }[];
};

export function EditAdminForm({ admin, programmes }: Props) {
  const [role, setRole] = useState<AdminRole>(admin.role);

  return (
    <form action={updateAdmin} className="max-w-3xl space-y-6 rounded-xl bg-white p-6 shadow-sm">
      <input type="hidden" name="adminId" value={admin.id} />

      <div>
        <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-700">
          First Name
        </label>
        <input
          id="firstName"
          name="firstName"
          defaultValue={admin.firstName}
          required
          className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
        />
      </div>

      <div>
        <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-slate-700">
          Last Name
        </label>
        <input
          id="lastName"
          name="lastName"
          defaultValue={admin.lastName}
          required
          className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={admin.email}
          required
          className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
        />
      </div>

      <div>
        <label htmlFor="role" className="mb-2 block text-sm font-medium text-slate-700">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as AdminRole)}
          className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
        >
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      {role === "ADMIN" ? (
        <div>
          <label className="mb-3 block text-sm font-medium text-slate-700">
            Assign Programme(s)
          </label>
          <div className="space-y-3 rounded border border-slate-200 p-4">
            {programmes.map((programme) => (
              <label key={programme.id} className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="programmeIds"
                  value={programme.id}
                  defaultChecked={admin.programmeIds.includes(programme.id)}
                />
                {programme.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        className="rounded bg-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Update Admin
      </button>
    </form>
  );
}