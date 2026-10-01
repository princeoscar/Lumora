"use client";

import Pusher from "pusher-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { getMatchChannelName } from "@/lib/pusher/channels";

type TypingPayload = {
  userId: string;
  isTyping: boolean;
};

type MatchRealtimeContextValue = {
  isOtherUserTyping: boolean;
  setTyping: (isTyping: boolean) => void;
};

const MatchRealtimeContext = createContext<MatchRealtimeContextValue | null>(
  null,
);

type MatchRealtimeProviderProps = {
  matchId: string;
  currentUserId: string;
  children: ReactNode;
};

export function MatchRealtimeProvider({
  matchId,
  currentUserId,
  children,
}: MatchRealtimeProviderProps) {
  const router = useRouter();
  const channelRef = useRef<ReturnType<Pusher["subscribe"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

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

    channelRef.current = channel;

    const handleMessageCreated = () => {
      router.refresh();
    };

    const handleMessageRead = () => {
      router.refresh();
    };

    const handleTyping = (payload: TypingPayload) => {
      if (payload.userId === currentUserId) {
        return;
      }

      setIsOtherUserTyping(payload.isTyping);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (payload.isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsOtherUserTyping(false);
        }, 3000);
      }
    };

    channel.bind("message.created", handleMessageCreated);
    channel.bind("message.read", handleMessageRead);
    channel.bind("client-typing", handleTyping);

    channel.bind("pusher:subscription_error", (error: unknown) => {
      console.error(`❌ Pusher subscription error for ${channelName}:`, error);
    });

    return () => {
      channel.unbind("message.created", handleMessageCreated);
      channel.unbind("message.read", handleMessageRead);
      channel.unbind("client-typing", handleTyping);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      channelRef.current = null;
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [currentUserId, matchId, router]);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      const channel = channelRef.current;

      if (!channel) {
        return;
      }

      channel.trigger("client-typing", {
        userId: currentUserId,
        isTyping,
      });
    },
    [currentUserId],
  );

  const value = useMemo(
    () => ({
      isOtherUserTyping,
      setTyping,
    }),
    [isOtherUserTyping, setTyping],
  );

  return (
    <MatchRealtimeContext.Provider value={value}>
      {children}
    </MatchRealtimeContext.Provider>
  );
}

export function useMatchRealtime() {
  const context = useContext(MatchRealtimeContext);

  if (!context) {
    throw new Error(
      "useMatchRealtime must be used inside MatchRealtimeProvider.",
    );
  }

  return context;
}
