/*
  Warnings:

  - The `status` column on the `Verification` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VerificationReviewStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Verification" DROP COLUMN "status",
ADD COLUMN     "status" "VerificationReviewStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Verification_userId_status_idx" ON "Verification"("userId", "status");

-- CreateIndex
CREATE INDEX "Verification_status_idx" ON "Verification"("status");
