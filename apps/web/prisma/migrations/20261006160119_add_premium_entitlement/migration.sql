-- CreateEnum
CREATE TYPE "EntitlementType" AS ENUM ('UNLIMITED_LIKES', 'SEE_WHO_LIKED_YOU', 'SUPER_LIKE', 'BOOST', 'ADVANCED_FILTERS', 'INCOGNITO_MODE', 'READ_RECEIPTS', 'PREMIUM_PROFILE_ACCESS');

-- CreateTable
CREATE TABLE "PremiumEntitlement" (
    "id" TEXT NOT NULL,
    "premiumPlanId" TEXT NOT NULL,
    "type" "EntitlementType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremiumEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PremiumEntitlement_premiumPlanId_idx" ON "PremiumEntitlement"("premiumPlanId");

-- CreateIndex
CREATE INDEX "PremiumEntitlement_type_idx" ON "PremiumEntitlement"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PremiumEntitlement_premiumPlanId_type_key" ON "PremiumEntitlement"("premiumPlanId", "type");

-- AddForeignKey
ALTER TABLE "PremiumEntitlement" ADD CONSTRAINT "PremiumEntitlement_premiumPlanId_fkey" FOREIGN KEY ("premiumPlanId") REFERENCES "PremiumPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
