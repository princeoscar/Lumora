"use server";

import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { markMatchMessagesAsRead } from "@/lib/db/messages";

export async function markMessagesAsRead(matchId: string) {
  try {
    const user = await requireCurrentUser();

    return await markMatchMessagesAsRead(matchId, user.id);
  } catch (error) {
    console.error("❌ Failed to mark messages as read:", error);

    return {
      success: false,
      updatedCount: 0,
    };
  }
}
