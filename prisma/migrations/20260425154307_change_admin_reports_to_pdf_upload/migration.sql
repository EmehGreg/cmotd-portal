-- CreateTable
CREATE TABLE "admin_reports" (
    "id" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_reports_submittedById_idx" ON "admin_reports"("submittedById");

-- CreateIndex
CREATE INDEX "admin_reports_createdAt_idx" ON "admin_reports"("createdAt");

-- AddForeignKey
ALTER TABLE "admin_reports" ADD CONSTRAINT "admin_reports_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
