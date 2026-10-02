"use server";

import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { getMatchChannelName } from "@/lib/pusher/channels";
import { pusherServer } from "@/lib/pusher/server";
import { prisma } from "@/lib/prisma";

const unmatchSchema = z.object({
  matchId: z.string().min(1, "Match is required."),
});

export async function unmatchUser(input: unknown) {
  try {
    const user = await requireCurrentUser();

    const parsed = unmatchSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid match.",
      };
    }

    const { matchId } = parsed.data;

    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ userId: user.id }, { matchedUserId: user.id }],
      },
      select: {
        id: true,
      },
    });

    if (!match) {
      return {
        success: false,
        error: "This match is no longer available.",
      };
    }

    await prisma.match.delete({
      where: {
        id: match.id,
      },
    });

    try {
      await pusherServer.trigger(
        getMatchChannelName(match.id),
        "match.removed",
        {
          matchId: match.id,
        },
      );
    } catch (error) {
      console.error("❌ Failed to publish unmatch event:", error);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Failed to unmatch user:", error);

    return {
      success: false,
      error: "We couldn't remove this match. Please try again.",
    };
  }
}
