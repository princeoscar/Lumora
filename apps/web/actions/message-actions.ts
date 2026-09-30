"use server";

import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { getMatchChannelName } from "@/lib/pusher/channels";
import { pusherServer } from "@/lib/pusher/server";
import { prisma } from "@/lib/prisma";

const sendMessageSchema = z.object({
  matchId: z.string().min(1, "Match is required."),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message is too long."),
});

export async function sendMessage(input: unknown) {
  try {
    const user = await requireCurrentUser();

    const parsed = sendMessageSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid message.",
      };
    }

    const { matchId, content } = parsed.data;

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
        error: "This conversation is not available.",
      };
    }

    const message = await prisma.message.create({
      data: {
        matchId: match.id,
        senderId: user.id,
        content,
      },
      select: {
        id: true,
        matchId: true,
        senderId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        editedAt: true,
        deletedAt: true,
        readAt: true,
      },
    });

    try {
      await pusherServer.trigger(
        getMatchChannelName(message.matchId),
        "message.created",
        {
          message: {
            id: message.id,
            matchId: message.matchId,
            senderId: message.senderId,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
            updatedAt: message.updatedAt.toISOString(),
            editedAt: message.editedAt?.toISOString() ?? null,
            deletedAt: message.deletedAt?.toISOString() ?? null,
            readAt: message.readAt?.toISOString() ?? null,
          },
        },
      );
    } catch (error) {
      console.error("❌ Failed to publish real-time message:", error);
    }

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error("❌ Failed to send message:", error);

    return {
      success: false,
      error: "We couldn't send your message. Please try again.",
    };
  }
}
