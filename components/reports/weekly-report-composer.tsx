"use client";

import { useEffect, useState, useTransition } from "react";

type ProgrammeOption = {
  id: string;
  name: string;
  code: string;
};

type Props = {
  programmes: ProgrammeOption[];
  action: (formData: FormData) => void | Promise<void>;
};

export function WeeklyReportComposer({ programmes, action }: Props) {
  const [programmeId, setProgrammeId] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [week, setWeek] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [loadingWeeks, setLoadingWeeks] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!programmeId) {
      setAvailableWeeks([]);
      setWeek("");
      return;
    }

    let cancelled = false;

    async function loadAvailableWeeks() {
      try {
        setLoadingWeeks(true);

        const res = await fetch(
          `/api/reports/weekly/available-weeks?programmeId=${encodeURIComponent(
            programmeId
          )}&year=${encodeURIComponent(year)}`
        );

        if (!res.ok) {
          throw new Error("Failed to load available weeks.");
        }

        const data: { availableWeeks: number[] } = await res.json();

        if (!cancelled) {
          setAvailableWeeks(data.availableWeeks);
          setWeek(data.availableWeeks[0] ? String(data.availableWeeks[0]) : "");
        }
      } catch {
        if (!cancelled) {
          setAvailableWeeks([]);
          setWeek("");
        }
      } finally {
        if (!cancelled) {
          setLoadingWeeks(false);
        }
      }
    }

    loadAvailableWeeks();

    return () => {
      cancelled = true;
    };
  }, [programmeId, year]);

  return (
    <form
      action={(formData) => startTransition(() => action(formData))}
      className="max-w-4xl space-y-6 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-[260px]">
          <label
            htmlFor="programmeId"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Programme
          </label>
          <select
            id="programmeId"
            name="programmeId"
            value={programmeId}
            onChange={(e) => setProgrammeId(e.target.value)}
            required
            className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
          >
            <option value="">-- Select Programme --</option>
            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {programme.code} - {programme.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[180px]">
          <label
            htmlFor="week"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Week
          </label>
          <select
            id="week"
            name="week"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            required
            disabled={!programmeId || loadingWeeks || availableWeeks.length === 0}
            className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none disabled:bg-slate-100"
          >
            <option value="">-- Select Week --</option>
            {availableWeeks.map((weekNumber) => (
              <option key={weekNumber} value={weekNumber}>
                Week {weekNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[140px]">
          <label
            htmlFor="year"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            className="h-11 w-full border border-slate-300 bg-white px-3 text-[16px] outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg bg-slate-100 p-6">
        <div>
          <label
            htmlFor="uploadedPdf"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Upload PDF Report
          </label>
          <input
            id="uploadedPdf"
            name="uploadedPdf"
            type="file"
            accept="application/pdf"
            required
            className="block w-full text-sm text-slate-700"
          />
        </div>
      </div>

      {programmeId && availableWeeks.length === 0 && !loadingWeeks ? (
        <p className="text-sm text-amber-700">
          All weeks have already been submitted for this programme and year.
        </p>
      ) : null}

      {loadingWeeks ? (
        <p className="text-sm text-slate-500">Loading available weeks...</p>
      ) : null}

      <button
        type="submit"
        disabled={!programmeId || !week || isPending}
        className="bg-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}