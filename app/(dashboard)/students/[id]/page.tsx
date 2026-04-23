import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteStudent } from "../actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { PageHeader } from "@/components/shared/page-header";
import { getPassportPhotoUrl } from "@/lib/supabase/get-passport-photo-url";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      programme: true,
      state: true,
      educationBackground: true,
    },
  });

  if (!student) {
    notFound();
  }
  const passportPhotoSrc = await getPassportPhotoUrl(student.passportPhotoUrl);
  return (
    <div className="space-y-6">
      <Card>
        <PageHeader
          title={`${student.firstName} ${student.lastName}`}
          description="Student details and profile information."
          actions={
            <>
              <Link href={`/students/${student.id}/edit`}>
                <Button>Edit</Button>
              </Link>

              <form action={deleteStudent}>
                <input type="hidden" name="id" value={student.id} />
                <Button type="submit" variant="danger">
                  Delete
                </Button>
              </form>

              <Link href="/students">
                <Button variant="secondary">Back</Button>
              </Link>
            </>
          }
        />
      </Card>

      <Card>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
          <div>
          {passportPhotoSrc ? (
            <Image
              src={passportPhotoSrc}
              alt={`${student.firstName} ${student.lastName}`}
              width={220}
              height={220}
              className="rounded-xl object-cover"
            />
          ) :(
              <div className="flex h-[220px] w-[220px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
                No passport photo
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">First Name</p>
              <p className="mt-1 text-slate-900">{student.firstName}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Last Name</p>
              <p className="mt-1 text-slate-900">{student.lastName}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-1 text-slate-900">{student.email ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="mt-1 text-slate-900">{student.phone ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Date of Birth</p>
              <p className="mt-1 text-slate-900">
                {student.dateOfBirth
                  ? student.dateOfBirth.toLocaleDateString()
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Gender</p>
              <p className="mt-1 text-slate-900">{student.gender ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Programme</p>
              <p className="mt-1 text-slate-900">{student.programme.name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">State</p>
              <p className="mt-1 text-slate-900">{student.state?.name ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Batch</p>
              <p className="mt-1 text-slate-900">{student.batch ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Registration Number</p>
              <p className="mt-1 text-slate-900">
                {student.registrationNumber ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Education Background</p>
              <p className="mt-1 text-slate-900">
                {student.educationBackground?.name ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Education Level</p>
              <p className="mt-1 text-slate-900">
                {student.educationLevel ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Competency ID</p>
              <p className="mt-1 text-slate-900">
                {student.competencyId ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Company</p>
              <p className="mt-1 text-slate-900">{student.company ?? "-"}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-slate-500">Residential Address</p>
              <p className="mt-1 text-slate-900">
                {student.residentialAddress ?? "-"}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-slate-500">Remarks</p>
              <p className="mt-1 text-slate-900">{student.remarks ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Disability</p>
              <p className="mt-1 text-slate-900">
                {student.disability ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}