import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MatchRealtimeProvider } from "@/components/messages/match-realtime-provider";
import { MatchOnlineStatus } from "@/components/messages/match-online-status";
import { MessageComposer } from "@/components/messages/message-composer";
import { MarkMessagesRead } from "@/components/messages/mark-messages-read";
import { TypingIndicator } from "@/components/messages/typing-indicator";
import { MainNav } from "@/components/navigation/main-nav";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { getMatchMessages } from "@/lib/db/messages";
import { getUserMatches } from "@/lib/db/matches";

type MatchConversationPageProps = {
  params: Promise<{
    matchId: string;
  }>;
};

export default async function MatchConversationPage({
  params,
}: MatchConversationPageProps) {
  const user = await requireCurrentUserWithProfile();
  const { matchId } = await params;

  const matches = await getUserMatches(user.id);
  const match = matches.find((item) => item.matchId === matchId);

  if (!match) {
    notFound();
  }

  const messages = await getMatchMessages(matchId, user.id);

  const primaryPhoto =
    match.user.photos.find((photo) => photo.isProfilePhoto) ??
    match.user.photos[0] ??
    null;

  return (
    <>
      <MainNav />

      <main className="min-h-screen bg-muted/20">
        <MarkMessagesRead matchId={matchId} />
        <MatchRealtimeProvider matchId={matchId} currentUserId={user.id}>
          <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-4xl flex-col">
            <header className="border-b bg-background px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <Link
                  href="/matches"
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Back
                </Link>

                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  {primaryPhoto ? (
                    <Image
                      src={primaryPhoto.url}
                      alt={`${match.user.displayName}'s profile photo`}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No photo
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold">
                    {match.user.displayName}, {match.user.age}
                  </h1>

                  <MatchOnlineStatus />

                  <p className="text-sm text-muted-foreground">
                    You matched on{" "}
                    {match.createdAt.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </header>

            <section className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6">
              {messages.length === 0 ? (
                <div className="flex min-h-[50vh] items-center justify-center">
                  <div className="max-w-sm text-center">
                    <p className="text-lg font-semibold">
                      Start the conversation
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      You matched with {match.user.displayName}. Send the first
                      message and start getting to know each other.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isMine = message.senderId === user.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[70%] ${
                          isMine
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md border bg-background"
                        }`}
                      >
                        <p>{message.content}</p>

                        <div
                          className={`mt-1 flex items-center gap-1 text-[11px] ${
                            isMine
                              ? "justify-end text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span>
                            {message.createdAt.toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>

                          {isMine && (
                            <span
                              aria-label={message.readAt ? "Read" : "Sent"}
                              title={message.readAt ? "Read" : "Sent"}
                              className="font-medium"
                            >
                              {message.readAt ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>
            <TypingIndicator />
            <MessageComposer matchId={matchId} />
          </div>
        </MatchRealtimeProvider>
      </main>
    </>
  );
}
