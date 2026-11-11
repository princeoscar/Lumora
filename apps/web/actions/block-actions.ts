"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { blockUser, unblockUser } from "@/lib/db/blocks";
import { getMatchChannelName } from "@/lib/pusher/channels";
import { pusherServer } from "@/lib/pusher/server";
import { prisma } from "@/lib/prisma";

const blockActionSchema = z.object({
  targetUserId: z.string().min(1, "Target user is required."),
});

export async function blockUserAction(input: unknown) {
  const user = await requireCurrentUser();

  const parsed = blockActionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid block request.",
    };
  }

  try {
    const result = await blockUser(user.id, parsed.data.targetUserId);

    if (!result.success) {
      return {
        success: false,
        error:
          result.reason === "CANNOT_BLOCK_SELF"
            ? "You cannot block your own account."
            : "This user could not be found.",
      };
    }

    // Notify both users if they already have a match.
    // Keep the database match and messages intact.
    try {
      const matches = await prisma.match.findMany({
        where: {
          OR: [
            {
              userId: user.id,
              matchedUserId: parsed.data.targetUserId,
            },
            {
              userId: parsed.data.targetUserId,
              matchedUserId: user.id,
            },
          ],
        },
        select: {
          id: true,
        },
      });

      for (const match of matches) {
        try {
          await pusherServer.trigger(
            getMatchChannelName(match.id),
            "match.removed",
            {
              matchId: match.id,
            },
          );
        } catch (error) {
          console.error("Failed to publish block notification:", error);
        }
      }
    } catch (error) {
      console.error("Failed to find matches for block notification:", error);
    }

    revalidatePath("/discover");
    revalidatePath("/likes");
    revalidatePath("/matches");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to block user:", error);

    return {
      success: false,
      error: "We couldn't block this user. Please try again.",
    };
  }
}

export async function unblockUserAction(input: unknown) {
  const user = await requireCurrentUser();

  const parsed = blockActionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid unblock request.",
    };
  }

  try {
    const result = await unblockUser(user.id, parsed.data.targetUserId);

    if (!result.success) {
      return {
        success: false,
        error: "This unblock request is invalid.",
      };
    }

    revalidatePath("/discover");
    revalidatePath("/likes");
    revalidatePath("/matches");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to unblock user:", error);

    return {
      success: false,
      error: "We couldn't unblock this user. Please try again.",
    };
  }
}
