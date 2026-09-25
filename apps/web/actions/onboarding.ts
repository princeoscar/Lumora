"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations/onboarding";

export async function completeOnboarding(input: unknown) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: "You must be signed in to complete onboarding.",
    };
  }

  const validation = onboardingSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, dateOfBirth, gender } = validation.data;

  const profileDateOfBirth = new Date(`${dateOfBirth}T00:00:00.000Z`);

  try {
    await prisma.$transaction([
      prisma.userProfile.upsert({
        where: {
          userId: user.id,
        },
        create: {
          userId: user.id,
          firstName,
          lastName: lastName || null,
          dateOfBirth: profileDateOfBirth,
          gender,
        },
        update: {
          firstName,
          lastName: lastName || null,
          dateOfBirth: profileDateOfBirth,
          gender,
          deletedAt: null,
        },
      }),

      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          onboardingCompleted: true,
        },
      }),
    ]);

    revalidatePath("/onboarding");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Failed to complete onboarding:", error);

    return {
      success: false,
      error: "We couldn't save your profile. Please try again.",
    };
  }
}
