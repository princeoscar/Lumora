"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validations/profile";

export async function updateProfile(input: unknown) {
  const user = await requireCurrentUser();

  const validation = profileUpdateSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const {
    displayName,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    bio,
    occupation,
    company,
    height,
    profileVisibility,
  } = validation.data;

  const profileDateOfBirth = new Date(`${dateOfBirth}T00:00:00.000Z`);

  try {
    await prisma.userProfile.update({
      where: {
        userId: user.id,
      },
      data: {
        displayName: displayName ?? null,
        firstName,
        lastName: lastName ?? null,
        dateOfBirth: profileDateOfBirth,
        gender,
        bio: bio ?? null,
        occupation: occupation ?? null,
        company: company ?? null,
        height: height ?? null,
        profileVisibility,
        deletedAt: null,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Failed to update profile:", error);

    return {
      success: false,
      error: "We couldn't update your profile. Please try again.",
    };
  }
}
