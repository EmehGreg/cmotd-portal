"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export type SearchStudentResult = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string;
  gender: string;
  residentialAddress: string;
  passportPhotoUrl: string;
  batch: string;
  registrationNumber: string;
  competencyId: string;
  educationLevel: string;
  company: string;
  remarks: string;
  disability: boolean;
  programmeId: string;
  stateId: string;
  educationBackgroundId: string;
  programmeName: string;
};

type Props = {
  onSelect: (student: SearchStudentResult) => void;
};

export function PersonSearchSelect({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchStudentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/students/search?q=${encodeURIComponent(query.trim())}`
        );
        const data: SearchStudentResult[] = await res.json();
        setResults(data);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id="student-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        placeholder="Search by name, email, phone, or reg number"
      />

      {loading ? (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500 shadow-lg">
          Searching...
        </div>
      ) : null}

      {open && results.length > 0 ? (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {results.map((student) => (
            <button
              key={student.id}
              type="button"
              className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
              onClick={() => {
                onSelect(student);
                setQuery(`${student.firstName} ${student.lastName}`);
                setOpen(false);
              }}
            >
              <div className="font-medium text-slate-900">
                {student.firstName} {student.lastName}
              </div>
              <div className="text-sm text-slate-500">
                {student.email || "No email"} · {student.phone || "No phone"}
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}