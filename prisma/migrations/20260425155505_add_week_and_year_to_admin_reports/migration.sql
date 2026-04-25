/*
  Warnings:

  - Added the required column `week` to the `admin_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `admin_reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admin_reports" ADD COLUMN     "week" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "admin_reports_week_year_idx" ON "admin_reports"("week", "year");
