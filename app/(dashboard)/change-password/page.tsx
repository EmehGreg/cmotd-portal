import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { auth } from "@/auth";
import { changePassword } from "./submit-password";

export default async function ChangePasswordPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 px-4 pt-2">
      <div className="flex items-center gap-3">
        <KeyRound className="h-9 w-9 text-[#2f2a26]" />
        <h1 className="text-[32px] font-semibold text-[#2f2a26]">
          Change Password
        </h1>
      </div>

      <form action={changePassword} className="max-w-2xl space-y-6 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="oldPassword" className="mb-2 block text-sm font-medium text-slate-700">
            Old Password
          </label>
          <input
            id="oldPassword"
            name="oldPassword"
            type="password"
            required
            className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-slate-700">
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}