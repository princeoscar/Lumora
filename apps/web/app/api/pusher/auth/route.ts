import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getMatchChannelName } from "@/lib/pusher/channels";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();

    const socketId = formData.get("socket_id");
    const channelName = formData.get("channel_name");

    if (
      typeof socketId !== "string" ||
      typeof channelName !== "string" ||
      !socketId ||
      !channelName
    ) {
      return new NextResponse("Invalid authorization request", {
        status: 400,
      });
    }

    const channelPrefix = "private-match-";

    if (!channelName.startsWith(channelPrefix)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const matchId = channelName.slice(channelPrefix.length);

    if (!matchId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ userId: user.id }, { matchedUserId: user.id }],
      },
      select: {
        id: true,
      },
    });

    if (!match || getMatchChannelName(match.id) !== channelName) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("❌ Pusher channel authorization failed:", error);

    return new NextResponse("Internal server error", {
      status: 500,
    });
  }
}
