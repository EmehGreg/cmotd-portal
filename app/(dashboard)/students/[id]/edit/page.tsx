import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateStudent } from "../../actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/shared/card";
import { PageHeader } from "@/components/shared/page-header";
import { PassportPhotoField } from "@/components/student/passport-photo-field";
import { getPassportPhotoUrl } from "@/lib/supabase/get-passport-photo-url";

type ProgrammeOption = {
  id: string;
  name: string;
};

type StateOption = {
  id: string;
  name: string;
};

type EducationBackgroundOption = {
  id: string;
  name: string;
};

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [student, programmes, states, educationBackgrounds] =
    await Promise.all([
      prisma.student.findUnique({
        where: { id },
      }),
      prisma.programme.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }) as Promise<ProgrammeOption[]>,
      prisma.state.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }) as Promise<StateOption[]>,
      prisma.educationBackground.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }) as Promise<EducationBackgroundOption[]>,
    ]);

  if (!student) {
    notFound();
  }

  const passportPhotoSrc = await getPassportPhotoUrl(student.passportPhotoUrl);
  const dateValue = student.dateOfBirth
    ? student.dateOfBirth.toISOString().split("T")[0]
    : "";

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader
          title="Edit Student"
          description="Update student information and replace passport photo if needed."
          actions={
            <Link href={`/students/${student.id}`}>
              <Button variant="secondary">Back</Button>
            </Link>
          }
        />
      </Card>

      <Card>
        <form action={updateStudent} className="space-y-8">
          <input type="hidden" name="id" value={student.id} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  1 Personal Info
                </h2>
              </div>

              <Field label="Reg No." htmlFor="registrationNumber">
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  defaultValue={student.registrationNumber ?? ""}
                />
              </Field>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="First Name" htmlFor="firstName">
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    defaultValue={student.firstName}
                  />
                </Field>

                <Field label="Last Name" htmlFor="lastName">
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    defaultValue={student.lastName}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Gender" htmlFor="gender">
                  <Select
                    id="gender"
                    name="gender"
                    defaultValue={student.gender ?? ""}
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
                    defaultValue={dateValue}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="State of Origin" htmlFor="stateId">
                  <Select
                    id="stateId"
                    name="stateId"
                    defaultValue={student.stateId ?? ""}
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
                    defaultValue={student.phone ?? ""}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Email" htmlFor="email">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={student.email ?? ""}
                  />
                </Field>

                <Field label="Residential Address" htmlFor="residentialAddress">
                  <Input
                    id="residentialAddress"
                    name="residentialAddress"
                    defaultValue={student.residentialAddress ?? ""}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Programme" htmlFor="programmeId">
                  <Select
                    id="programmeId"
                    name="programmeId"
                    required
                    defaultValue={student.programmeId}
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
                    defaultValue={student.batch ?? ""}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field
                  label="Education Background"
                  htmlFor="educationBackgroundId"
                >
                  <Select
                    id="educationBackgroundId"
                    name="educationBackgroundId"
                    defaultValue={student.educationBackgroundId ?? ""}
                  >
                    <option value="">Select education background</option>
                    {educationBackgrounds.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Education Level" htmlFor="educationLevel">
                  <Input
                    id="educationLevel"
                    name="educationLevel"
                    defaultValue={student.educationLevel ?? ""}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Competency ID" htmlFor="competencyId">
                  <Input
                    id="competencyId"
                    name="competencyId"
                    defaultValue={student.competencyId ?? ""}
                  />
                </Field>

                <Field label="Company" htmlFor="company">
                  <Input
                    id="company"
                    name="company"
                    defaultValue={student.company ?? ""}
                  />
                </Field>
              </div>

              <Field label="Remarks" htmlFor="remarks">
                <textarea
                  id="remarks"
                  name="remarks"
                  rows={4}
                  defaultValue={student.remarks ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </Field>

              <div className="flex items-center gap-3">
                <input
                  id="disability"
                  name="disability"
                  type="checkbox"
                  defaultChecked={student.disability}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <label
                  htmlFor="disability"
                  className="text-sm font-medium text-slate-700"
                >
                  Student has a disability
                </label>
              </div>
            </div>

            <PassportPhotoField defaultImageUrl={passportPhotoSrc} />
          </div>

          <div>
            <Button type="submit">Update Student</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}