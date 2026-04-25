"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  initialQ: string;
  initialWeek: string;
  initialYear: string;
};

const weekOptions = Array.from({ length: 16 }, (_, i) => ({
  value: String(i + 1),
  label: `Week ${i + 1}`,
}));

export function AdminReportsFilters({
  initialQ,
  initialWeek,
  initialYear,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [week, setWeek] = useState(initialWeek);
  const [year, setYear] = useState(initialYear);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQueryString = useMemo(
    () => searchParams.toString(),
    [searchParams]
  );

  useEffect(() => setQ(initialQ), [initialQ]);
  useEffect(() => setWeek(initialWeek), [initialWeek]);
  useEffect(() => setYear(initialYear), [initialYear]);

  function buildParams(next?: { q?: string; week?: string; year?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    const nextQ = next?.q ?? q;
    const nextWeek = next?.week ?? week;
    const nextYear = next?.year ?? year;

    if (nextQ.trim()) params.set("q", nextQ.trim());
    else params.delete("q");

    if (nextWeek) params.set("week", nextWeek);
    else params.delete("week");

    if (nextYear.trim()) params.set("year", nextYear.trim());
    else params.delete("year");

    return params;
  }

  function replaceIfChanged(params: URLSearchParams) {
    const nextQueryString = params.toString();
    if (nextQueryString === currentQueryString) return;

    const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;

    startTransition(() => {
      router.replace(nextUrl);
    });
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      replaceIfChanged(buildParams({ q }));
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, week, year, currentQueryString]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm space-y-4">
      <div>
        <label htmlFor="search" className="mb-2 block text-sm font-medium text-slate-700">
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
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label htmlFor="week" className="mb-2 block text-sm font-medium text-slate-700">
            Week
          </label>
          <select
            id="week"
            value={week}
            onChange={(e) => {
              setWeek(e.target.value);
              replaceIfChanged(buildParams({ week: e.target.value }));
            }}
            className="h-11 min-w-[180px] border border-slate-300 bg-white px-3 text-[16px] outline-none"
          >
            <option value="">All weeks</option>
            {weekOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="year" className="mb-2 block text-sm font-medium text-slate-700">
            Year
          </label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            onBlur={() => replaceIfChanged(buildParams({ year }))}
            className="h-11 w-[140px] border border-slate-300 bg-white px-3 text-[16px] outline-none"
          />
        </div>
      </div>

      {isPending ? <p className="text-sm text-slate-500">Searching...</p> : null}
    </div>
  );
}