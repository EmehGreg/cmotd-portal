import { logoutAction } from "./logout-action";

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded bg-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Log out
        </button>
      </form>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener("DOMContentLoaded", function () {
              document.forms[0]?.requestSubmit();
            });
          `,
        }}
      />
    </div>
  );
}