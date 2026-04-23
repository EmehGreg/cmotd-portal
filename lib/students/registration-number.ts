import { prisma } from "@/lib/prisma";

type GenerateRegistrationNumberArgs = {
  programmeId: string;
  batch: string;
  disability: boolean;
};

export async function generateRegistrationNumber({
  programmeId,
  batch,
  disability,
}: GenerateRegistrationNumberArgs) {
  const programme = await prisma.programme.findUnique({
    where: { id: programmeId },
    select: { code: true },
  });

  if (!programme) {
    throw new Error("Programme not found.");
  }

  const shortYear = batch.slice(-2);
  const prefix = `CMOTD-${programme.code}-${shortYear}-`;

  const students = await prisma.student.findMany({
    where: {
      registrationNumber: {
        startsWith: prefix,
      },
    },
    select: {
      registrationNumber: true,
    },
  });

  const usedNumbers = new Set<number>();

  for (const student of students) {
    const regNo = student.registrationNumber;
    if (!regNo) continue;

    const lastPart = regNo.split("-").pop();
    const parsed = Number(lastPart);

    if (!Number.isNaN(parsed)) {
      usedNumbers.add(parsed);
    }
  }

  if (disability) {
    for (let i = 1; i <= 20; i++) {
      if (!usedNumbers.has(i)) {
        return `${prefix}${String(i).padStart(2, "0")}`;
      }
    }

    throw new Error(
      "Disability priority slots (01-20) are full for this programme and year."
    );
  }

  let i = 21;
  while (usedNumbers.has(i)) {
    i++;
  }

  return `${prefix}${String(i).padStart(2, "0")}`;
}