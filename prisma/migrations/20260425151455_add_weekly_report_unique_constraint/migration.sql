/*
  Warnings:

  - A unique constraint covering the columns `[programmeId,week,year]` on the table `weekly_reports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "weekly_reports_programmeId_week_year_key" ON "weekly_reports"("programmeId", "week", "year");
