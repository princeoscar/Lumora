"use server";

import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { getMatchChannelName } from "@/lib/pusher/channels";
import { pusherServer } from "@/lib/pusher/server";
import { prisma } from "@/lib/prisma";

const messageIdSchema = z.object({
  messageId: z.string().min(1, "Message is required."),
});

const editMessageSchema = z.object({
  messageId: z.string().min(1, "Message is required."),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message is too long."),
});

async function getOwnedMessage(messageId: string, userId: string) {
  return prisma.message.findFirst({
    where: {
      id: messageId,
      senderId: userId,
      deletedAt: null,
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
}

export async function editMessage(input: unknown) {
  try {
    const user = await requireCurrentUser();

    const parsed = editMessageSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid message.",
      };
    }

    const { messageId, content } = parsed.data;

    const existingMessage = await getOwnedMessage(messageId, user.id);

    if (!existingMessage) {
      return {
        success: false,
        error: "This message is no longer available for editing.",
      };
    }

    const message = await prisma.message.update({
      where: {
        id: existingMessage.id,
      },
      data: {
        content,
        editedAt: new Date(),
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
        "message.updated",
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
      console.error("❌ Failed to publish message update:", error);
    }

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error("❌ Failed to edit message:", error);

    return {
      success: false,
      error: "We couldn't edit your message. Please try again.",
    };
  }
}

export async function deleteMessage(input: unknown) {
  try {
    const user = await requireCurrentUser();

    const parsed = messageIdSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid message.",
      };
    }

    const { messageId } = parsed.data;

    const existingMessage = await getOwnedMessage(messageId, user.id);

    if (!existingMessage) {
      return {
        success: false,
        error: "This message is no longer available for deletion.",
      };
    }

    const message = await prisma.message.update({
      where: {
        id: existingMessage.id,
      },
      data: {
        deletedAt: new Date(),
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
        "message.deleted",
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
      console.error("❌ Failed to publish message deletion:", error);
    }

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error("❌ Failed to delete message:", error);

    return {
      success: false,
      error: "We couldn't delete your message. Please try again.",
    };
  }
}
