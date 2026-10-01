"use client";

import Pusher from "pusher-js";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getMatchChannelName } from "@/lib/pusher/channels";

type RealtimeMessageInboxListenerProps = {
  matchIds: string[];
};

export function RealtimeMessageInboxListener({
  matchIds,
}: RealtimeMessageInboxListenerProps) {
  const router = useRouter();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster || matchIds.length === 0) {
      return;
    }

    const pusher = new Pusher(key, {
      cluster,
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
    });

    const handleMessageCreated = () => {
      router.refresh();
    };

    const channels = matchIds.map((matchId) => {
      const channelName = getMatchChannelName(matchId);
      const channel = pusher.subscribe(channelName);

      channel.bind("message.created", handleMessageCreated);

      channel.bind("pusher:subscription_error", (error: unknown) => {
        console.error(
          `❌ Pusher subscription error for ${channelName}:`,
          error,
        );
      });

      return {
        channel,
        channelName,
      };
    });

    return () => {
      for (const { channel, channelName } of channels) {
        channel.unbind("message.created", handleMessageCreated);
        pusher.unsubscribe(channelName);
      }

      pusher.disconnect();
    };
  }, [matchIds, router]);

  return null;
}
