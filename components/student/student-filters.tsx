"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Option = {
  id: string;
  name: string;
};

type StudentFiltersProps = {
  programmes: Option[];
  states: Option[];
  initialQ: string;
  initialProgrammeId: string;
  initialStateId: string;
};

export function StudentFilters({
  programmes,
  states,
  initialQ,
  initialProgrammeId,
  initialStateId,
}: StudentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [programmeId, setProgrammeId] = useState(initialProgrammeId);
  const [stateId, setStateId] = useState(initialStateId);

  const currentParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  const updateParams = useCallback(
    (next: { q?: string; programme?: string; state?: string }) => {
      const params = new URLSearchParams(currentParams.toString());

      const nextQ = next.q ?? q;
      const nextProgrammeId = next.programme ?? programmeId;
      const nextStateId = next.state ?? stateId;

      if (nextQ.trim()) {
        params.set("q", nextQ.trim());
      } else {
        params.delete("q");
      }

      if (nextProgrammeId) {
        params.set("programme", nextProgrammeId);
      } else {
        params.delete("programme");
      }

      if (nextStateId) {
        params.set("state", nextStateId);
      } else {
        params.delete("state");
      }

      startTransition(() => {
        router.replace(
          params.toString() ? `${pathname}?${params.toString()}` : pathname
        );
      });
    },
    [currentParams, pathname, programmeId, q, router, stateId]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParams({ q });
    }, 350);

    return () => clearTimeout(timeout);
  }, [q, updateParams]);

  function handleProgrammeChange(value: string) {
    setProgrammeId(value);
    updateParams({ programme: value });
  }

  function handleStateChange(value: string) {
    setStateId(value);
    updateParams({ state: value });
  }

  function handleReset() {
    setQ("");
    setProgrammeId("");
    setStateId("");

    startTransition(() => {
      router.replace(pathname);
    });
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_330px_330px_auto] md:items-end">
        <div>
          <label
            htmlFor="q"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Search
          </label>
          <input
            id="q"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, or reg number"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="programme"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Programme
          </label>
          <select
            id="programme"
            name="programme"
            value={programmeId}
            onChange={(e) => handleProgrammeChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All programmes</option>
            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {programme.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="state"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            State
          </label>
          <select
            id="state"
            name="state"
            value={stateId}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All states</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reset
        </button>
      </div>
    </div>
  );
}