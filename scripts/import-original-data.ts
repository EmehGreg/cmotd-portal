import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient, UserRole, Gender } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

type LegacyProgramme = {
  id: number;
  name: string;
  code: string;
};

type LegacyState = {
  id: number;
  name: string;
};

type LegacyEducation = {
  id: number;
  name: string;
};

type LegacyAdmin = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  password: string | null;
  role: "admin" | "super_admin" | null;
  created_at: string | null;
};

type LegacyTrainee = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  dob: string | null;
  gender: "M" | "F" | null;
  phone: string | null;
  residential_address: string | null;
  passport_photo: string | null;
  programme_id: number | null;
  batch: string | null;
  registration_number: string | null;
  created_at: string | null;
  competency_id: string | null;
  education_level: string | null;
  company: string | null;
  remarks: string | null;
  state_id: number | null;
  education_or_training_id: number | null;
  disability: number | null;
  updated_at: string | null;
};

function cleanString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str || str.toUpperCase() === "NULL") return null;
  return str;
}

function parseNullableNumber(value: unknown): number | null {
  const str = cleanString(value);
  if (str === null) return null;
  const num = Number(str);
  return Number.isNaN(num) ? null : num;
}

function parseNullableDate(value: unknown): Date | null {
  const str = cleanString(value);
  if (!str) return null;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizePhpBcryptHash(hash: string | null): string | null {
  if (!hash) return null;
  if (hash.startsWith("$2y$")) {
    return `$2b$${hash.slice(4)}`;
  }
  return hash;
}

function mapLegacyGender(gender: "M" | "F" | null): Gender | null {
  if (gender === "M") return "MALE";
  if (gender === "F") return "FEMALE";
  return null;
}

function mapLegacyRole(role: "admin" | "super_admin" | null): UserRole {
  return role === "super_admin" ? "SUPER_ADMIN" : "ADMIN";
}

/**
 * Parse a VALUES section like:
 * (1,'abc',NULL),(2,'def','ghi')
 */
function parseValuesSection(valuesSection: string): unknown[][] {
  const rows: unknown[][] = [];
  let i = 0;

  while (i < valuesSection.length) {
    while (i < valuesSection.length && /\s|,/.test(valuesSection[i])) i++;

    if (i >= valuesSection.length) break;
    if (valuesSection[i] !== "(") {
      i++;
      continue;
    }

    i++; // skip "("
    const row: unknown[] = [];
    let current = "";
    let inString = false;

    while (i < valuesSection.length) {
      const char = valuesSection[i];
      const next = valuesSection[i + 1];

      if (inString) {
        if (char === "\\") {
          if (i + 1 < valuesSection.length) {
            current += valuesSection[i + 1];
            i += 2;
            continue;
          }
        }

        if (char === "'" && next === "'") {
          current += "'";
          i += 2;
          continue;
        }

        if (char === "'") {
          inString = false;
          i++;
          continue;
        }

        current += char;
        i++;
        continue;
      }

      if (char === "'") {
        inString = true;
        i++;
        continue;
      }

      if (char === ",") {
        row.push(normalizeToken(current));
        current = "";
        i++;
        continue;
      }

      if (char === ")") {
        row.push(normalizeToken(current));
        current = "";
        i++;
        break;
      }

      current += char;
      i++;
    }

    rows.push(row);
  }

  return rows;
}

function normalizeToken(token: string): unknown {
  const trimmed = token.trim();

  if (!trimmed || trimmed.toUpperCase() === "NULL") {
    return null;
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function extractInsertRows(sql: string, tableName: string): unknown[][] {
  const regex = new RegExp(
    `INSERT INTO\\s+\`${tableName}\`\\s*\\(([^)]+)\\)\\s*VALUES\\s*([\\s\\S]*?);`,
    "g"
  );

  const rows: unknown[][] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(sql)) !== null) {
    const valuesSection = match[2];
    rows.push(...parseValuesSection(valuesSection));
  }

  return rows;
}

function mapProgrammes(rows: unknown[][]): LegacyProgramme[] {
  return rows.map((row) => ({
    id: Number(row[0]),
    name: String(row[1]),
    code: String(row[2]),
  }));
}

function mapStates(rows: unknown[][]): LegacyState[] {
  return rows.map((row) => ({
    id: Number(row[0]),
    name: String(row[1]),
  }));
}

function mapEducation(rows: unknown[][]): LegacyEducation[] {
  return rows.map((row) => ({
    id: Number(row[0]),
    name: String(row[1]),
  }));
}

function mapAdmins(rows: unknown[][]): LegacyAdmin[] {
  return rows.map((row) => ({
    id: Number(row[0]),
    first_name: cleanString(row[1]),
    last_name: cleanString(row[2]),
    email: cleanString(row[3]),
    password: cleanString(row[4]),
    role: cleanString(row[5]) as LegacyAdmin["role"],
    created_at: cleanString(row[6]),
  }));
}

function mapTrainees(rows: unknown[][]): LegacyTrainee[] {
  return rows.map((row) => ({
    id: Number(row[0]),
    first_name: cleanString(row[1]),
    last_name: cleanString(row[2]),
    email: cleanString(row[3]),
    dob: cleanString(row[4]),
    gender: cleanString(row[5]) as LegacyTrainee["gender"],
    phone: cleanString(row[6]),
    residential_address: cleanString(row[7]),
    passport_photo: cleanString(row[8]),
    programme_id: parseNullableNumber(row[9]),
    batch: cleanString(row[10]),
    registration_number: cleanString(row[11]),
    created_at: cleanString(row[12]),
    competency_id: cleanString(row[13]),
    education_level: cleanString(row[14]),
    company: cleanString(row[15]),
    remarks: cleanString(row[16]),
    state_id: parseNullableNumber(row[17]),
    education_or_training_id: parseNullableNumber(row[18]),
    disability: parseNullableNumber(row[19]),
    updated_at: cleanString(row[20]),
  }));
}

async function main() {
  const sqlPath = path.join(process.cwd(), "legacy", "somatrix_cmotd.sql");
  const sql = await fs.readFile(sqlPath, "utf8");

  console.log("Reading legacy SQL dump...");

  const legacyProgrammes = mapProgrammes(extractInsertRows(sql, "programme"));
  const legacyStates = mapStates(extractInsertRows(sql, "state"));
  const legacyEducation = mapEducation(
    extractInsertRows(sql, "education_or_training")
  );
  const legacyAdmins = mapAdmins(extractInsertRows(sql, "admin"));
  const legacyTrainees = mapTrainees(extractInsertRows(sql, "trainee"));

  console.log(`Found ${legacyProgrammes.length} programmes`);
  console.log(`Found ${legacyStates.length} states`);
  console.log(`Found ${legacyEducation.length} education backgrounds`);
  console.log(`Found ${legacyAdmins.length} admins`);
  console.log(`Found ${legacyTrainees.length} trainees`);

  const programmeIdMap = new Map<number, string>();
  const stateIdMap = new Map<number, string>();
  const educationIdMap = new Map<number, string>();

  console.log("Importing programmes...");
  for (const programme of legacyProgrammes) {
    const created = await prisma.programme.upsert({
      where: { code: programme.code },
      update: {
        name: programme.name,
      },
      create: {
        name: programme.name,
        code: programme.code,
      },
      select: { id: true },
    });

    programmeIdMap.set(programme.id, created.id);
  }

  console.log("Importing states...");
  for (const state of legacyStates) {
    const created = await prisma.state.upsert({
      where: { name: state.name },
      update: {},
      create: {
        name: state.name,
      },
      select: { id: true },
    });

    stateIdMap.set(state.id, created.id);
  }

  console.log("Importing education backgrounds...");
  for (const item of legacyEducation) {
    const created = await prisma.educationBackground.upsert({
      where: { name: item.name },
      update: {},
      create: {
        name: item.name,
      },
      select: { id: true },
    });

    educationIdMap.set(item.id, created.id);
  }

  console.log("Importing admins...");
  for (const admin of legacyAdmins) {
    if (!admin.email) continue;

    await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        firstName: admin.first_name ?? "Admin",
        lastName: admin.last_name ?? "User",
        passwordHash: normalizePhpBcryptHash(admin.password) ?? "",
        role: mapLegacyRole(admin.role),
        isActive: true,
      },
      create: {
        firstName: admin.first_name ?? "Admin",
        lastName: admin.last_name ?? "User",
        email: admin.email,
        passwordHash: normalizePhpBcryptHash(admin.password) ?? "",
        role: mapLegacyRole(admin.role),
        isActive: true,
      },
    });
  }

  console.log("Importing trainees...");
  let importedCount = 0;
  let skippedCount = 0;

  for (const trainee of legacyTrainees) {
    const programmeId = trainee.programme_id
      ? programmeIdMap.get(trainee.programme_id) ?? null
      : null;

    const stateId = trainee.state_id
      ? stateIdMap.get(trainee.state_id) ?? null
      : null;

    const educationBackgroundId = trainee.education_or_training_id
      ? educationIdMap.get(trainee.education_or_training_id) ?? null
      : null;

    if (!programmeId || !trainee.first_name || !trainee.last_name) {
      skippedCount++;
      continue;
    }

    const studentData = {
      firstName: trainee.first_name,
      lastName: trainee.last_name,
      email: trainee.email,
      dateOfBirth: parseNullableDate(trainee.dob),
      gender: mapLegacyGender(trainee.gender),
      phone: trainee.phone,
      residentialAddress: trainee.residential_address,
      passportPhotoUrl: trainee.passport_photo
        ? `/${trainee.passport_photo.replace(/^\/+/, "")}`
        : null,
      programmeId,
      batch: trainee.batch,
      registrationNumber: trainee.registration_number,
      competencyId: trainee.competency_id,
      educationLevel: trainee.education_level,
      company: trainee.company,
      remarks: trainee.remarks,
      stateId,
      educationBackgroundId,
      disability: Boolean(trainee.disability),
      isRegistered: Boolean(trainee.registration_number),
      registeredAt: trainee.registration_number
        ? parseNullableDate(trainee.created_at) ?? new Date()
        : null,
    };

    if (trainee.registration_number) {
      await prisma.student.upsert({
        where: { registrationNumber: trainee.registration_number },
        update: studentData,
        create: studentData,
      });
      importedCount++;
      continue;
    }

    if (trainee.email) {
      const existingStudent = await prisma.student.findFirst({
        where: { email: trainee.email },
        select: { id: true },
      });

      if (existingStudent) {
        await prisma.student.update({
          where: { id: existingStudent.id },
          data: studentData,
        });
      } else {
        await prisma.student.create({
          data: studentData,
        });
      }
      importedCount++;
      continue;
    }

    await prisma.student.create({
      data: studentData,
    });
    importedCount++;
  }

  console.log(`Imported trainees: ${importedCount}`);
  console.log(`Skipped trainees: ${skippedCount}`);
  console.log("Legacy import completed successfully.");
}

main()
  .catch((error) => {
    console.error("Legacy import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });