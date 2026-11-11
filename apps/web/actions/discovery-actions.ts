"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { isDiscoverableTarget } from "@/lib/db/discovery";
import { getUserChannelName } from "@/lib/pusher/channels";
import { pusherServer } from "@/lib/pusher/server";
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

    const transactionResult = await prisma.$transaction(async (tx) => {
      const existingBlock = await tx.userBlock.findFirst({
        where: {
          OR: [
            {
              blockerId: user.id,
              blockedId: targetUserId,
            },
            {
              blockerId: targetUserId,
              blockedId: user.id,
            },
          ],
        },
        select: {
          id: true,
        },
      });

      if (existingBlock) {
        return {
          blocked: true,
        };
      }

      await tx.discoveryAction.upsert({
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

      if (action !== "LIKE") {
        return {
          blocked: false,
        };
      }

      const reciprocalLike = await tx.discoveryAction.findUnique({
        where: {
          userId_targetUserId: {
            userId: targetUserId,
            targetUserId: user.id,
          },
        },
      });

      if (reciprocalLike?.action !== "LIKE") {
        return {
          blocked: false,
        };
      }

      const [firstUserId, secondUserId] = [user.id, targetUserId].sort();

      await tx.match.upsert({
        where: {
          userId_matchedUserId: {
            userId: firstUserId,
            matchedUserId: secondUserId,
          },
        },
        update: {},
        create: {
          userId: firstUserId,
          matchedUserId: secondUserId,
        },
      });

      return {
        blocked: false,
      };
    });

    if (transactionResult.blocked) {
      return {
        success: false,
        error: "This profile is not currently available for discovery.",
      };
    }

    if (action === "LIKE") {
      try {
        await pusherServer.trigger(
          getUserChannelName(targetUserId),
          "like.received",
          {
            userId: user.id,
          },
        );
      } catch (error) {
        console.error("❌ Failed to publish like event:", error);
      }
    }

    revalidatePath("/discover");
    revalidatePath("/likes");

    return {
      success: true,
      action,
    };
  } catch (error) {
    console.error("❌ Failed to save discovery action:", error);

    return {
      success: false,
      error: "We couldn't save your choice. Please try again.",
    };
  }
}
