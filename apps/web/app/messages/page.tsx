import Image from "next/image";
import Link from "next/link";

import { MainNav } from "@/components/navigation/main-nav";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { getMessageThreads } from "@/lib/db/messages";

export default async function MessagesPage() {
  const user = await requireCurrentUserWithProfile();
  const threads = await getMessageThreads(user.id);

  return (
    <>
      <MainNav />

      <main className="min-h-screen bg-muted/20 px-4 py-6 sm:px-6 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Messages
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Your conversations
            </h1>

            <p className="mt-2 text-muted-foreground">
              Continue getting to know the people you matched with.
            </p>
          </div>

          {threads.length === 0 ? (
            <section className="rounded-2xl border border-dashed bg-background p-10 text-center">
              <h2 className="text-xl font-semibold">No conversations yet</h2>

              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                When you match with someone, your conversation will appear here.
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/discover"
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Discover people
                </Link>

                <Link
                  href="/matches"
                  className="rounded-xl border bg-background px-5 py-3 text-sm font-medium hover:bg-muted"
                >
                  View matches
                </Link>
              </div>
            </section>
          ) : (
            <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
              {threads.map((thread, index) => (
                <Link
                  key={thread.matchId}
                  href={`/matches/${thread.matchId}`}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 sm:p-5 ${
                    index !== threads.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted sm:h-16 sm:w-16">
                    {thread.user.profilePhoto ? (
                      <Image
                        src={thread.user.profilePhoto.url}
                        alt={`${thread.user.displayName}'s profile photo`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="truncate text-base font-semibold sm:text-lg">
                        {thread.user.displayName}, {thread.user.age}
                      </h2>

                      {thread.lastMessage && (
                        <time className="shrink-0 text-xs text-muted-foreground">
                          {thread.lastMessage.createdAt.toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </time>
                      )}
                    </div>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {thread.lastMessage
                        ? `${
                            thread.lastMessage.senderId === user.id
                              ? "You: "
                              : ""
                          }${thread.lastMessage.content}`
                        : "Start your conversation"}
                    </p>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
