"use client";

import Pusher from "pusher-js";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getUserChannelName } from "@/lib/pusher/channels";

type RealtimeLikesListenerProps = {
  userId: string;
};

export function RealtimeLikesListener({ userId }: RealtimeLikesListenerProps) {
  const router = useRouter();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.error("❌ Pusher client configuration is missing.");
      return;
    }

    const pusher = new Pusher(key, {
      cluster,
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
    });

    const channelName = getUserChannelName(userId);
    const channel = pusher.subscribe(channelName);

    const handleLikeReceived = () => {
      router.refresh();
    };

    channel.bind("like.received", handleLikeReceived);

    channel.bind("pusher:subscription_error", (error: unknown) => {
      console.error(
        `❌ Pusher likes subscription error for ${channelName}:`,
        error,
      );
    });

    return () => {
      channel.unbind("like.received", handleLikeReceived);
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [router, userId]);

  return null;
}
