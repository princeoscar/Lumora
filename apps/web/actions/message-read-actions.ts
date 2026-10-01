"use server";

import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { markMatchMessagesAsRead } from "@/lib/db/messages";
import { getMatchChannelName } from "@/lib/pusher/channels";
import { pusherServer } from "@/lib/pusher/server";

export async function markMessagesAsRead(matchId: string) {
  try {
    const user = await requireCurrentUser();

    const result = await markMatchMessagesAsRead(matchId, user.id);

    if (result.success && result.updatedCount > 0) {
      try {
        await pusherServer.trigger(
          getMatchChannelName(matchId),
          "message.read",
          {
            matchId,
            readBy: user.id,
          },
        );
      } catch (error) {
        console.error("❌ Failed to publish message read event:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("❌ Failed to mark messages as read:", error);

    return {
      success: false,
      updatedCount: 0,
    };
  }
}
