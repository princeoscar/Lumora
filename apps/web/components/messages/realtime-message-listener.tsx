"use client";

import Pusher from "pusher-js";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getMatchChannelName } from "@/lib/pusher/channels";

type RealtimeMessageListenerProps = {
  matchId: string;
};

export function RealtimeMessageListener({
  matchId,
}: RealtimeMessageListenerProps) {
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

    const channelName = getMatchChannelName(matchId);
    const channel = pusher.subscribe(channelName);

    const handleMessageCreated = () => {
      router.refresh();
    };

    const handleMessageRead = () => {
      router.refresh();
    };

    channel.bind("message.created", handleMessageCreated);

    channel.bind("message.read", handleMessageRead);

    channel.bind("pusher:subscription_error", (error: unknown) => {
      console.error("❌ Pusher subscription error:", error);
    });

    return () => {
      channel.unbind("message.created", handleMessageCreated);
      channel.unbind("message.read", handleMessageRead);
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [matchId, router]);

  return null;
}
