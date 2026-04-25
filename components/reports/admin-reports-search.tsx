"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  initialQ: string;
};

export function AdminReportsSearch({ initialQ }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(initialQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQueryString = useMemo(
    () => searchParams.toString(),
    [searchParams]
  );

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (q.trim()) params.set("q", q.trim());
      else params.delete("q");

      const nextQueryString = params.toString();
      if (nextQueryString === currentQueryString) return;

      const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;

      startTransition(() => {
        router.replace(nextUrl);
      });
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, pathname, router, searchParams, currentQueryString]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <label
        htmlFor="search"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Search reports
      </label>
      <input
        id="search"
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by title or author..."
        className="h-11 w-full max-w-md border border-slate-300 bg-white px-3 text-[16px] outline-none"
      />
      {isPending ? (
        <p className="mt-2 text-sm text-slate-500">Searching...</p>
      ) : null}
    </div>
  );
}