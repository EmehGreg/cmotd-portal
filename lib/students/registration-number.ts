import { prisma } from "@/lib/prisma";

type GenerateRegistrationNumberArgs = {
  programmeId: string;
  batch: string;
  disability: boolean;
};

const DISABILITY_PRIORITY_PROGRAMME_CODES = new Set(["BDA", "OOW", "SDC"]);

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

  const supportsDisabilityPriority =
    DISABILITY_PRIORITY_PROGRAMME_CODES.has(programme.code);

  if (disability && supportsDisabilityPriority) {
    for (let i = 1; i <= 20; i++) {
      if (!usedNumbers.has(i)) {
        return `${prefix}${String(i).padStart(2, "0")}`;
      }
    }
  }

  const highestUsedNumber =
    usedNumbers.size > 0 ? Math.max(...usedNumbers) : 0;

  const nextNumber = highestUsedNumber + 1;

  return `${prefix}${String(nextNumber).padStart(2, "0")}`;
}