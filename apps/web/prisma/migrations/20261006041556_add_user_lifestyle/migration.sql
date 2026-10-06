-- CreateEnum
CREATE TYPE "LifestyleFrequency" AS ENUM ('NEVER', 'SOMETIMES', 'OFTEN', 'REGULARLY');

-- CreateEnum
CREATE TYPE "ChildrenStatus" AS ENUM ('HAVE_CHILDREN', 'NO_CHILDREN');

-- CreateEnum
CREATE TYPE "ChildrenPreference" AS ENUM ('WANT_CHILDREN', 'DONT_WANT_CHILDREN', 'OPEN_TO_CHILDREN', 'NOT_SURE');

-- CreateEnum
CREATE TYPE "PetPreference" AS ENUM ('HAVE_PETS', 'LOVE_PETS', 'LIKE_PETS', 'NO_PETS', 'NOT_A_FAN');

-- CreateEnum
CREATE TYPE "DietPreference" AS ENUM ('OMNIVORE', 'VEGETARIAN', 'VEGAN', 'PESCATARIAN', 'HALAL', 'KOSHER', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateTable
CREATE TABLE "UserLifestyle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "smoking" "LifestyleFrequency",
    "drinking" "LifestyleFrequency",
    "cannabis" "LifestyleFrequency",
    "childrenStatus" "ChildrenStatus",
    "childrenPreference" "ChildrenPreference",
    "pets" "PetPreference",
    "diet" "DietPreference",
    "exercise" "LifestyleFrequency",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLifestyle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLifestyle_userId_key" ON "UserLifestyle"("userId");

-- AddForeignKey
ALTER TABLE "UserLifestyle" ADD CONSTRAINT "UserLifestyle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
