import { loginAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to access the CMOTD portal.
          </p>
        </div>

        <form action={loginAction} className="space-y-4">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@cmotd.local"
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
            />
          </Field>

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </main>
  );
}