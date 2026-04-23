"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateRegistrationNumber } from "@/lib/students/registration-number";
import { uploadPassportPhoto } from "@/lib/supabase/upload-passport";

function parseOptionalString(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();
  return parsed ? parsed : null;
}

function parseOptionalDate(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();
  return parsed ? new Date(parsed) : null;
}

function parseOptionalBoolean(value: FormDataEntryValue | null) {
  return String(value ?? "") === "on";
}

export async function registerStudent(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const programmeId = String(formData.get("programmeId") ?? "").trim();
  const batch = String(formData.get("batch") ?? "").trim();
  const disability = parseOptionalBoolean(formData.get("disability"));

  if (!firstName || !lastName || !programmeId || !batch) {
    throw new Error(
      "First name, last name, programme, and admission year are required."
    );
  }

  const passportPhoto = formData.get("passportPhoto");
  const uploadedPassportPhotoUrl =
    passportPhoto instanceof File && passportPhoto.size > 0
      ? await uploadPassportPhoto(passportPhoto)
      : null;

if (studentId) {
  const existingStudent = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      registrationNumber: true,
      passportPhotoUrl: true,
      registeredAt: true,
    },
  });

  if (!existingStudent) {
    throw new Error("Selected student was not found.");
  }

  const registrationNumber =
    existingStudent.registrationNumber ??
    (await generateRegistrationNumber({
      programmeId,
      batch,
      disability,
    }));

  const passportPhotoUrl =
    uploadedPassportPhotoUrl ?? existingStudent.passportPhotoUrl;

  await prisma.student.update({
    where: { id: studentId },
    data: {
      firstName,
      lastName,
      email: parseOptionalString(formData.get("email")),
      phone: parseOptionalString(formData.get("phone")),
      dateOfBirth: parseOptionalDate(formData.get("dateOfBirth")),
      gender:
        parseOptionalString(formData.get("gender")) === "MALE"
          ? "MALE"
          : parseOptionalString(formData.get("gender")) === "FEMALE"
          ? "FEMALE"
          : null,
      residentialAddress: parseOptionalString(
        formData.get("residentialAddress")
      ),
      passportPhotoUrl,
      batch,
      registrationNumber,
      competencyId: parseOptionalString(formData.get("competencyId")),
      educationLevel: parseOptionalString(formData.get("educationLevel")),
      company: parseOptionalString(formData.get("company")),
      remarks: parseOptionalString(formData.get("remarks")),
      disability,
      programmeId,
      stateId: parseOptionalString(formData.get("stateId")),
      educationBackgroundId: parseOptionalString(
        formData.get("educationBackgroundId")
      ),
      isRegistered: true,
      registeredAt: existingStudent.registrationNumber
        ? existingStudent.registeredAt ?? new Date()
        : new Date(),
    },
  });

  redirect(`/students/${studentId}`);
}

  const registrationNumber = await generateRegistrationNumber({
    programmeId,
    batch,
    disability,
  });

  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      email: parseOptionalString(formData.get("email")),
      phone: parseOptionalString(formData.get("phone")),
      dateOfBirth: parseOptionalDate(formData.get("dateOfBirth")),
      gender:
        parseOptionalString(formData.get("gender")) === "MALE"
          ? "MALE"
          : parseOptionalString(formData.get("gender")) === "FEMALE"
          ? "FEMALE"
          : null,
      residentialAddress: parseOptionalString(
        formData.get("residentialAddress")
      ),
      passportPhotoUrl: uploadedPassportPhotoUrl,
      batch,
      registrationNumber,
      competencyId: parseOptionalString(formData.get("competencyId")),
      educationLevel: parseOptionalString(formData.get("educationLevel")),
      company: parseOptionalString(formData.get("company")),
      remarks: parseOptionalString(formData.get("remarks")),
      disability,
      programmeId,
      stateId: parseOptionalString(formData.get("stateId")),
      educationBackgroundId: parseOptionalString(
        formData.get("educationBackgroundId")
      ),
      isRegistered: true,
      registeredAt: new Date(),
    },
  });

  redirect(`/students/${student.id}`);
}

export async function updateStudent(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const programmeId = String(formData.get("programmeId") ?? "").trim();

  if (!id || !firstName || !lastName || !programmeId) {
    throw new Error("ID, first name, last name, and programme are required.");
  }

  const existingStudent = await prisma.student.findUnique({
    where: { id },
    select: { passportPhotoUrl: true },
  });

  if (!existingStudent) {
    throw new Error("Student not found.");
  }

  const passportPhoto = formData.get("passportPhoto");
  let passportPhotoUrl = existingStudent.passportPhotoUrl;

  if (passportPhoto instanceof File && passportPhoto.size > 0) {
    passportPhotoUrl = await uploadPassportPhoto(passportPhoto);
  }

  await prisma.student.update({
    where: { id },
    data: {
      firstName,
      lastName,
      email: parseOptionalString(formData.get("email")),
      phone: parseOptionalString(formData.get("phone")),
      dateOfBirth: parseOptionalDate(formData.get("dateOfBirth")),
      gender:
        parseOptionalString(formData.get("gender")) === "MALE"
          ? "MALE"
          : parseOptionalString(formData.get("gender")) === "FEMALE"
          ? "FEMALE"
          : null,
      residentialAddress: parseOptionalString(
        formData.get("residentialAddress")
      ),
      passportPhotoUrl,
      batch: parseOptionalString(formData.get("batch")),
      registrationNumber: parseOptionalString(
        formData.get("registrationNumber")
      ),
      competencyId: parseOptionalString(formData.get("competencyId")),
      educationLevel: parseOptionalString(formData.get("educationLevel")),
      company: parseOptionalString(formData.get("company")),
      remarks: parseOptionalString(formData.get("remarks")),
      disability: parseOptionalBoolean(formData.get("disability")),
      programmeId,
      stateId: parseOptionalString(formData.get("stateId")),
      educationBackgroundId: parseOptionalString(
        formData.get("educationBackgroundId")
      ),
    },
  });

  redirect(`/students/${id}`);
}

export async function deleteStudent(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Student ID is required.");
  }

  await prisma.student.delete({
    where: { id },
  });

  redirect("/students");
}