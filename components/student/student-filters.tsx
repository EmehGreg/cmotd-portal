"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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

  const [inputValue, setInputValue] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [programmeId, setProgrammeId] = useState(initialProgrammeId);
  const [stateId, setStateId] = useState(initialStateId);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQueryString = useMemo(
    () => searchParams.toString(),
    [searchParams]
  );

  useEffect(() => {
    setInputValue(initialQ);
    setDebouncedQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    setProgrammeId(initialProgrammeId);
  }, [initialProgrammeId]);

  useEffect(() => {
    setStateId(initialStateId);
  }, [initialStateId]);

  function replaceIfChanged(params: URLSearchParams) {
    const nextQueryString = params.toString();

    if (nextQueryString === currentQueryString) {
      return;
    }

    const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;

    startTransition(() => {
      router.replace(nextUrl);
    });
  }

  function buildParams(next?: {
    q?: string;
    programme?: string;
    state?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    const nextQ = next?.q ?? debouncedQuery;
    const nextProgrammeId = next?.programme ?? programmeId;
    const nextStateId = next?.state ?? stateId;

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

    return params;
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 1000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue]);

  useEffect(() => {
    replaceIfChanged(buildParams({ q: debouncedQuery }));
  }, [debouncedQuery]);

  function handleProgrammeChange(value: string) {
    setProgrammeId(value);
    replaceIfChanged(buildParams({ programme: value }));
  }

  function handleStateChange(value: string) {
    setStateId(value);
    replaceIfChanged(buildParams({ state: value }));
  }

  function handleReset() {
    setInputValue("");
    setDebouncedQuery("");
    setProgrammeId("");
    setStateId("");
    replaceIfChanged(new URLSearchParams());
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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