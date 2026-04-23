-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_programmes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_backgrounds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "education_backgrounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "phone" TEXT,
    "residentialAddress" TEXT,
    "passportPhotoUrl" TEXT,
    "batch" TEXT,
    "registrationNumber" TEXT,
    "competencyId" TEXT,
    "educationLevel" TEXT,
    "company" TEXT,
    "remarks" TEXT,
    "disability" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "programmeId" TEXT NOT NULL,
    "stateId" TEXT,
    "educationBackgroundId" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "attendance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_reports" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "submissionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_reports" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "submissionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sizeInBytes" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "programmes_code_key" ON "programmes"("code");

-- CreateIndex
CREATE INDEX "user_programmes_programmeId_idx" ON "user_programmes"("programmeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_programmes_userId_programmeId_key" ON "user_programmes"("userId", "programmeId");

-- CreateIndex
CREATE UNIQUE INDEX "states_name_key" ON "states"("name");

-- CreateIndex
CREATE UNIQUE INDEX "education_backgrounds_name_key" ON "education_backgrounds"("name");

-- CreateIndex
CREATE UNIQUE INDEX "students_registrationNumber_key" ON "students"("registrationNumber");

-- CreateIndex
CREATE INDEX "students_programmeId_idx" ON "students"("programmeId");

-- CreateIndex
CREATE INDEX "students_stateId_idx" ON "students"("stateId");

-- CreateIndex
CREATE INDEX "attendances_week_year_idx" ON "attendances"("week", "year");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_week_year_key" ON "attendances"("studentId", "week", "year");

-- CreateIndex
CREATE INDEX "weekly_reports_programmeId_week_year_idx" ON "weekly_reports"("programmeId", "week", "year");

-- CreateIndex
CREATE INDEX "monthly_reports_programmeId_month_year_idx" ON "monthly_reports"("programmeId", "month", "year");

-- CreateIndex
CREATE INDEX "files_studentId_idx" ON "files"("studentId");

-- AddForeignKey
ALTER TABLE "user_programmes" ADD CONSTRAINT "user_programmes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_programmes" ADD CONSTRAINT "user_programmes_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_educationBackgroundId_fkey" FOREIGN KEY ("educationBackgroundId") REFERENCES "education_backgrounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_reports" ADD CONSTRAINT "monthly_reports_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_reports" ADD CONSTRAINT "monthly_reports_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
