-- CreateTable
CREATE TABLE "DiscoveryPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL DEFAULT 18,
    "maxAge" INTEGER NOT NULL DEFAULT 100,
    "interestedInGenders" "Gender"[] DEFAULT ARRAY[]::"Gender"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoveryPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveryPreference_userId_key" ON "DiscoveryPreference"("userId");

-- AddForeignKey
ALTER TABLE "DiscoveryPreference" ADD CONSTRAINT "DiscoveryPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
