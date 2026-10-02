import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  getMatchChannelName,
  getMatchPresenceChannelName,
} from "@/lib/pusher/channels";
import { pusherServer } from "@/lib/pusher/server";
import { prisma } from "@/lib/prisma";

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

    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
      select: {
        id: true,
        profile: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const userChannelPrefix = "private-user-";

    if (channelName.startsWith(userChannelPrefix)) {
      const channelUserId = channelName.slice(userChannelPrefix.length);

      if (!channelUserId || channelUserId !== user.id) {
        return new NextResponse("Forbidden", { status: 403 });
      }

      if (`private-user-${user.id}` !== channelName) {
        return new NextResponse("Forbidden", { status: 403 });
      }

      const authResponse = pusherServer.authorizeChannel(socketId, channelName);

      return NextResponse.json(authResponse);
    }

    const privatePrefix = "private-match-";
    const presencePrefix = "presence-match-";

    const isPrivateMatchChannel = channelName.startsWith(privatePrefix);
    const isPresenceMatchChannel = channelName.startsWith(presencePrefix);

    if (!isPrivateMatchChannel && !isPresenceMatchChannel) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const matchId = isPrivateMatchChannel
      ? channelName.slice(privatePrefix.length)
      : channelName.slice(presencePrefix.length);

    if (!matchId) {
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

    if (!match) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (isPrivateMatchChannel) {
      if (getMatchChannelName(match.id) !== channelName) {
        return new NextResponse("Forbidden", { status: 403 });
      }

      const authResponse = pusherServer.authorizeChannel(socketId, channelName);

      return NextResponse.json(authResponse);
    }

    if (getMatchPresenceChannelName(match.id) !== channelName) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const displayName =
      user.profile?.displayName?.trim() ||
      `${user.profile?.firstName ?? ""} ${
        user.profile?.lastName ?? ""
      }`.trim() ||
      "Lumora member";

    const channelData = {
      user_id: user.id,
      user_info: {
        name: displayName,
      },
    };

    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channelName,
      channelData,
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("❌ Pusher channel authorization failed:", error);

    return new NextResponse("Internal server error", {
      status: 500,
    });
  }
}
