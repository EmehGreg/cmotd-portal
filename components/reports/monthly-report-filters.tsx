"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ProgrammeOption = {
  id: string;
  name: string;
};

type Props = {
  programmes: ProgrammeOption[];
  initialProgrammeId: string;
  initialMonth: string;
  initialYear: string;
};

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function MonthlyReportFilters({
  programmes,
  initialProgrammeId,
  initialMonth,
  initialYear,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [programmeId, setProgrammeId] = useState(initialProgrammeId);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQueryString = useMemo(
    () => searchParams.toString(),
    [searchParams]
  );

  useEffect(() => setProgrammeId(initialProgrammeId), [initialProgrammeId]);
  useEffect(() => setMonth(initialMonth), [initialMonth]);
  useEffect(() => setYear(initialYear), [initialYear]);

  function buildParams(next?: {
    programme?: string;
    month?: string;
    year?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    const nextProgrammeId = next?.programme ?? programmeId;
    const nextMonth = next?.month ?? month;
    const nextYear = next?.year ?? year;

    if (nextProgrammeId) params.set("programme", nextProgrammeId);
    else params.delete("programme");

    if (nextMonth) params.set("month", nextMonth);
    else params.delete("month");

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

  function handleProgrammeChange(value: string) {
    setProgrammeId(value);
    replaceIfChanged(buildParams({ programme: value }));
  }

  function handleMonthChange(value: string) {
    setMonth(value);
    replaceIfChanged(buildParams({ month: value }));
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (!year.trim()) return;
      replaceIfChanged(buildParams({ year }));
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [year, programmeId, month, currentQueryString]);

  return (
    <div className="flex flex-wrap items-center gap-4 px-4">
      <div className="flex items-center gap-3">
        <label htmlFor="programme" className="text-[16px] font-medium text-slate-800">
          Programme:
        </label>
        <select
          id="programme"
          value={programmeId}
          onChange={(e) => handleProgrammeChange(e.target.value)}
          className="h-11 min-w-[240px] border border-slate-300 bg-white px-3 text-[16px] outline-none"
        >
          <option value="">Select programme</option>
          {programmes.map((programme) => (
            <option key={programme.id} value={programme.id}>
              {programme.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="month" className="text-[16px] font-medium text-slate-800">
          Month:
        </label>
        <select
          id="month"
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="h-11 min-w-[200px] border border-slate-300 bg-white px-3 text-[16px] outline-none"
        >
          <option value="">-- Select Month --</option>
          {monthOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="year" className="text-[16px] font-medium text-slate-800">
          Year:
        </label>
        <input
          id="year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="h-11 w-[140px] border border-slate-300 bg-white px-3 text-[16px] outline-none"
        />
      </div>

      {isPending ? <div className="text-sm text-slate-500">Loading...</div> : null}
    </div>
  );
}