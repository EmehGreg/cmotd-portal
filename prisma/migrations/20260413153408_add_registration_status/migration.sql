-- AlterTable
ALTER TABLE "students" ADD COLUMN     "isRegistered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registeredAt" TIMESTAMP(3);
