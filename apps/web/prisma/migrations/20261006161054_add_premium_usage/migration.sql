-- CreateEnum
CREATE TYPE "PremiumUsageType" AS ENUM ('LIKE', 'SUPER_LIKE', 'BOOST');

-- CreateTable
CREATE TABLE "PremiumUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PremiumUsageType" NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "usageLimit" INTEGER,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremiumUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PremiumUsage_userId_type_idx" ON "PremiumUsage"("userId", "type");

-- CreateIndex
CREATE INDEX "PremiumUsage_periodEnd_idx" ON "PremiumUsage"("periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "PremiumUsage_userId_type_periodStart_key" ON "PremiumUsage"("userId", "type", "periodStart");

-- AddForeignKey
ALTER TABLE "PremiumUsage" ADD CONSTRAINT "PremiumUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
