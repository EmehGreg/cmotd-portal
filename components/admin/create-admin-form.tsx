"use client";

import { useActionState, useMemo, useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { createAdmin, initialCreateAdminState } from "@/app/signup/actions";

type ProgrammeOption = {
  id: string;
  name: string;
  code: string;
};

type Props = {
  programmes: ProgrammeOption[];
};

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-[#1798df] to-[#1c67aa] text-[18px] font-medium text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <LogIn className="h-5 w-5" />
      {pending ? "Creating..." : "Create Admin"}
    </button>
  );
}

export function CreateAdminForm({ programmes }: Props) {
  const [state, formAction, pending] = useActionState(
    createAdmin,
    initialCreateAdminState
  );

  const safeValues = state?.values ?? {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    programmeId: "",
  };

  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">(
    state?.role ?? "ADMIN"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState(safeValues.password);
  const [confirmPassword, setConfirmPassword] = useState(
    safeValues.confirmPassword
  );

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const inputClassName =
    "h-[58px] w-full rounded-[3px] border border-[#d7d7d7] bg-[#eef3fb] px-5 text-[16px] text-[#1f2937] outline-none placeholder:text-[#8b8b8b] focus:border-[#4d90fe]";

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(5, 89, 191, 0.78) 0%, rgba(6, 17, 120, 0.88) 100%), url('/marine.jpg')",
      }}
    >
      <div className="w-full max-w-[500px] rounded-[26px] bg-white/95 px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm md:px-10">
        <h1 className="mb-10 text-center text-[34px] font-bold leading-tight text-black">
          Register Admin
        </h1>

        <form action={formAction} className="space-y-4">
          {state?.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          ) : null}

          <input
            name="firstName"
            type="text"
            placeholder="First Name"
            defaultValue={safeValues.firstName}
            className={inputClassName}
            required
          />

          <input
            name="lastName"
            type="text"
            placeholder="Last Name"
            defaultValue={safeValues.lastName}
            className={inputClassName}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            defaultValue={safeValues.email}
            className={inputClassName}
            required
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClassName} pr-14`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputClassName} pr-14`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {!passwordsMatch ? (
            <p className="text-sm text-red-600">Passwords do not match.</p>
          ) : null}

          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
            className={inputClassName}
          >
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>

          {role === "ADMIN" ? (
            <select
              name="programmeId"
              defaultValue={safeValues.programmeId}
              className={inputClassName}
              required
            >
              <option value="">Select Programme</option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.code} - {programme.name}
                </option>
              ))}
            </select>
          ) : null}

          <SubmitButton pending={pending || !passwordsMatch} />
        </form>
      </div>
    </main>
  );
}