/*
  Warnings:

  - A unique constraint covering the columns `[programmeId,month,year]` on the table `monthly_reports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "monthly_reports_programmeId_month_year_key" ON "monthly_reports"("programmeId", "month", "year");
