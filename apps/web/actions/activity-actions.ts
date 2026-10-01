"use server";

import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export async function updateLastActiveAt() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return { success: false };
    }

    const result = await prisma.user.updateMany({
      where: {
        clerkId: clerkUserId,
        deletedAt: null,
      },
      data: {
        lastActiveAt: new Date(),
      },
    });

    return {
      success: result.count > 0,
    };
  } catch (error) {
    console.error("❌ Failed to update last active time:", error);

    return {
      success: false,
    };
  }
}
