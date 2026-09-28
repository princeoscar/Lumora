"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isDiscoverableTarget } from "@/lib/db/discovery";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { prisma } from "@/lib/prisma";

const discoveryActionSchema = z.object({
  targetUserId: z.string().min(1, "Target user is required."),
  action: z.enum(["LIKE", "PASS"]),
});

export async function saveDiscoveryAction(input: unknown) {
  try {
    const user = await requireCurrentUser();

    const parsed = discoveryActionSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid discovery action.",
      };
    }

    const { targetUserId, action } = parsed.data;

    const targetIsDiscoverable = await isDiscoverableTarget(
      user.id,
      targetUserId,
    );

    if (!targetIsDiscoverable) {
      return {
        success: false,
        error: "This profile is not currently available for discovery.",
      };
    }

    await prisma.discoveryAction.upsert({
      where: {
        userId_targetUserId: {
          userId: user.id,
          targetUserId,
        },
      },
      update: {
        action,
      },
      create: {
        userId: user.id,
        targetUserId,
        action,
      },
    });

    revalidatePath("/discover");

    return {
      success: true,
      action,
    };
  } catch {
    return {
      success: false,
      error: "We couldn't save your choice. Please try again.",
    };
  }
}
