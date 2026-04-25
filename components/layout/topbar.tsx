import Image from "next/image";
import { signOut } from "@/auth";

export default function Topbar({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  return (
    <header className="flex items-center justify-between bg-primary px-6 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Image
          src="/logos/logo.jpg"
          alt="CMOTD Logo"
          width={85}
          height={85}
          loading="eager"
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-white">
          Welcome: {user?.name ?? user?.email ?? "User"}
        </span>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}