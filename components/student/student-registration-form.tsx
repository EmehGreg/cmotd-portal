"use client";

import { useEffect, useState } from "react";
import { registerStudent } from "@/app/(dashboard)/students/actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PassportPhotoField } from "@/components/student/passport-photo-field";
import {
  PersonSearchSelect,
  type SearchStudentResult,
} from "@/components/student/person-search-select";

type Option = {
  id: string;
  name: string;
};

type ProgrammeOption = {
  id: string;
  name: string;
};

type Props = {
  programmes: ProgrammeOption[];
  states: Option[];
};

export function StudentRegistrationForm({ programmes, states }: Props) {
  const [selectedStudent, setSelectedStudent] =
    useState<SearchStudentResult | null>(null);

  const [programmeId, setProgrammeId] = useState("");
  const [batch, setBatch] = useState("");
  const [registrationPreview, setRegistrationPreview] = useState(
    "Auto-generated on registration"
  );

  function handleStudentSelect(student: SearchStudentResult | null) {
    setSelectedStudent(student);
    setProgrammeId(student?.programmeId ?? "");
    setBatch(student?.batch ?? "");
  }

useEffect(() => {
  const timeout = setTimeout(async () => {
    if (selectedStudent?.registrationNumber) {
      setRegistrationPreview(selectedStudent.registrationNumber);
      return;
    }

    if (!programmeId || !batch) {
      setRegistrationPreview("Auto-generated on registration");
      return;
    }

    try {
      const res = await fetch(
        `/api/students/registration-number?programmeId=${encodeURIComponent(
          programmeId
        )}&batch=${encodeURIComponent(batch)}&disability=false`
      );

      const data = await res.json();
      setRegistrationPreview(
        data.registrationNumber || "Auto-generated on registration"
      );
    } catch {
      setRegistrationPreview("Auto-generated on registration");
    }
  }, 200);

  return () => clearTimeout(timeout);
}, [selectedStudent?.registrationNumber, programmeId, batch]);

  return (
    <form action={registerStudent} className="mt-16 space-y-8">
      <input type="hidden" name="studentId" value={selectedStudent?.id ?? ""} />

      <div className="max-w-[380px]">
        <PersonSearchSelect onSelect={handleStudentSelect} />
      </div>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <h2 className="text-[48px] font-bold leading-none text-[#2f2a26]">
            1 Personal Info
          </h2>

          <div className="max-w-[400px] rounded-xl bg-slate-300 px-5 py-3 text-[15px] text-slate-900">
            <span className="font-medium">Reg No:</span>{" "}
            <span className="font-semibold">{registrationPreview}</span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="First Name" htmlFor="firstName">
              <Input
                id="firstName"
                name="firstName"
                required
                defaultValue={selectedStudent?.firstName ?? ""}
                key={`firstName-${selectedStudent?.id ?? "new"}`}
              />
            </Field>

            <Field label="Last Name" htmlFor="lastName">
              <Input
                id="lastName"
                name="lastName"
                required
                defaultValue={selectedStudent?.lastName ?? ""}
                key={`lastName-${selectedStudent?.id ?? "new"}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Gender" htmlFor="gender">
              <Select
                id="gender"
                name="gender"
                defaultValue={selectedStudent?.gender ?? ""}
                key={`gender-${selectedStudent?.id ?? "new"}`}
              >
                <option value="">Select gender</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
              </Select>
            </Field>

            <Field label="D.O.B." htmlFor="dateOfBirth">
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={selectedStudent?.dateOfBirth ?? ""}
                key={`dob-${selectedStudent?.id ?? "new"}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="State of Origin" htmlFor="stateId">
              <Select
                id="stateId"
                name="stateId"
                defaultValue={selectedStudent?.stateId ?? ""}
                key={`state-${selectedStudent?.id ?? "new"}`}
              >
                <option value="">-- Select State --</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Phone Number" htmlFor="phone">
              <Input
                id="phone"
                name="phone"
                defaultValue={selectedStudent?.phone ?? ""}
                key={`phone-${selectedStudent?.id ?? "new"}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={selectedStudent?.email ?? ""}
                key={`email-${selectedStudent?.id ?? "new"}`}
              />
            </Field>

            <Field label="Residential Address" htmlFor="residentialAddress">
              <Input
                id="residentialAddress"
                name="residentialAddress"
                defaultValue={selectedStudent?.residentialAddress ?? ""}
                key={`address-${selectedStudent?.id ?? "new"}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Programme" htmlFor="programmeId">
              <Select
                id="programmeId"
                name="programmeId"
                required
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
              >
                <option value="">-- Select Programme --</option>
                {programmes.map((programme) => (
                  <option key={programme.id} value={programme.id}>
                    {programme.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Admission Year" htmlFor="batch">
              <Input
                id="batch"
                name="batch"
                placeholder="2026"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-[48px] font-bold leading-none text-[#2f2a26]">
            2 Bio Data
          </h2>

          <div className="pt-2">
            <PassportPhotoField
              defaultImageUrl={selectedStudent?.passportPhotoUrl ?? null}
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="bg-primary px-6 py-2 text-white hover:bg-primary/90"
        >
          Save Student
        </Button>
      </div>
    </form>
  );
}