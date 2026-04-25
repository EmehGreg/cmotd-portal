-- CreateIndex
CREATE INDEX "attendances_studentId_idx" ON "attendances"("studentId");

-- CreateIndex
CREATE INDEX "files_category_idx" ON "files"("category");

-- CreateIndex
CREATE INDEX "monthly_reports_submittedById_idx" ON "monthly_reports"("submittedById");

-- CreateIndex
CREATE INDEX "students_educationBackgroundId_idx" ON "students"("educationBackgroundId");

-- CreateIndex
CREATE INDEX "students_batch_idx" ON "students"("batch");

-- CreateIndex
CREATE INDEX "students_isRegistered_idx" ON "students"("isRegistered");

-- CreateIndex
CREATE INDEX "weekly_reports_submittedById_idx" ON "weekly_reports"("submittedById");
