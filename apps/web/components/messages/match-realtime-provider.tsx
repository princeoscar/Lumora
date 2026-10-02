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

import {
  getMatchChannelName,
  getMatchPresenceChannelName,
} from "@/lib/pusher/channels";

type TypingPayload = {
  userId: string;
  isTyping: boolean;
};

type PresenceMember = {
  id: string;
};

type PresenceMembers = {
  count: number;
  each: (callback: (member: PresenceMember) => void) => void;
};

type MatchRealtimeContextValue = {
  isOtherUserTyping: boolean;
  isOtherUserOnline: boolean;
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
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);

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

    const privateChannelName = getMatchChannelName(matchId);
    const presenceChannelName = getMatchPresenceChannelName(matchId);

    const channel = pusher.subscribe(privateChannelName);
    const presenceChannel = pusher.subscribe(presenceChannelName);

    channelRef.current = channel;

    const handleMessageCreated = () => {
      router.refresh();
    };

    const handleMessageUpdated = () => {
      router.refresh();
    };

    const handleMessageDeleted = () => {
      router.refresh();
    };

    const handleMatchRemoved = () => {
      router.push("/matches");
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

    const handlePresenceSubscription = (members: PresenceMembers) => {
      let otherUserOnline = false;

      members.each((member) => {
        if (member.id !== currentUserId) {
          otherUserOnline = true;
        }
      });

      setIsOtherUserOnline(otherUserOnline);
    };

    const handleMemberAdded = (member: PresenceMember) => {
      if (member.id !== currentUserId) {
        setIsOtherUserOnline(true);
      }
    };

    const handleMemberRemoved = (member: PresenceMember) => {
      if (member.id !== currentUserId) {
        setIsOtherUserOnline(false);
      }
    };

    channel.bind("message.created", handleMessageCreated);
    channel.bind("message.updated", handleMessageUpdated);
    channel.bind("message.deleted", handleMessageDeleted);
    channel.bind("match.removed", handleMatchRemoved);
    channel.bind("message.read", handleMessageRead);
    channel.bind("client-typing", handleTyping);

    presenceChannel.bind(
      "pusher:subscription_succeeded",
      handlePresenceSubscription,
    );
    presenceChannel.bind("pusher:member_added", handleMemberAdded);
    presenceChannel.bind("pusher:member_removed", handleMemberRemoved);

    channel.bind("pusher:subscription_error", (error: unknown) => {
      console.error(
        `❌ Pusher subscription error for ${privateChannelName}:`,
        error,
      );
    });

    presenceChannel.bind("pusher:subscription_error", (error: unknown) => {
      console.error(
        `❌ Pusher presence subscription error for ${presenceChannelName}:`,
        error,
      );
    });

    return () => {
      channel.unbind("message.created", handleMessageCreated);
      channel.unbind("message.updated", handleMessageUpdated);
      channel.unbind("message.deleted", handleMessageDeleted);
      channel.unbind("match.removed", handleMatchRemoved);
      channel.unbind("message.read", handleMessageRead);
      channel.unbind("client-typing", handleTyping);

      presenceChannel.unbind(
        "pusher:subscription_succeeded",
        handlePresenceSubscription,
      );
      presenceChannel.unbind("pusher:member_added", handleMemberAdded);
      presenceChannel.unbind("pusher:member_removed", handleMemberRemoved);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setIsOtherUserTyping(false);
      setIsOtherUserOnline(false);

      channelRef.current = null;
      pusher.unsubscribe(privateChannelName);
      pusher.unsubscribe(presenceChannelName);
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
      isOtherUserOnline,
      setTyping,
    }),
    [isOtherUserOnline, isOtherUserTyping, setTyping],
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
