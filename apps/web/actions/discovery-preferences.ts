"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { prisma } from "@/lib/prisma";
import { discoveryPreferenceSchema } from "@/lib/validations/discovery-preferences";

export async function saveDiscoveryPreferences(input: unknown) {
  try {
    const user = await requireCurrentUser();

    const parsed = discoveryPreferenceSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid preferences.",
      };
    }

    const { minAge, maxAge, interestedInGenders } = parsed.data;

    await prisma.discoveryPreference.upsert({
      where: {
        userId: user.id,
      },
      update: {
        minAge,
        maxAge,
        interestedInGenders,
      },
      create: {
        userId: user.id,
        minAge,
        maxAge,
        interestedInGenders,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "We couldn't save your discovery preferences. Please try again.",
    };
  }
}
