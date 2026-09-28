-- CreateEnum
CREATE TYPE "DiscoveryActionType" AS ENUM ('LIKE', 'PASS');

-- CreateTable
CREATE TABLE "DiscoveryAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "action" "DiscoveryActionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoveryAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscoveryAction_userId_action_idx" ON "DiscoveryAction"("userId", "action");

-- CreateIndex
CREATE INDEX "DiscoveryAction_targetUserId_action_idx" ON "DiscoveryAction"("targetUserId", "action");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveryAction_userId_targetUserId_key" ON "DiscoveryAction"("userId", "targetUserId");

-- AddForeignKey
ALTER TABLE "DiscoveryAction" ADD CONSTRAINT "DiscoveryAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryAction" ADD CONSTRAINT "DiscoveryAction_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
