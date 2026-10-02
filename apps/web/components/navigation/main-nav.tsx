import Link from "next/link";

import { ActivityTracker } from "@/components/activity/activity-tracker";
import { getPendingLikeCount } from "@/lib/db/discovery";
import { RealtimeLikesListener } from "@/components/likes/realtime-likes-listener";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";

export async function MainNav() {
  const user = await requireCurrentUserWithProfile();
  const pendingLikeCount = await getPendingLikeCount(user.id);

  return (
    <>
      <ActivityTracker />
      <RealtimeLikesListener userId={user.id} />

      <nav className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-4 md:px-10">
          <Link
            href="/dashboard"
            className="mr-auto font-serif text-2xl font-semibold tracking-tight"
          >
            Lumora
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Home
            </Link>

            <Link
              href="/discover"
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Discover
            </Link>

            <Link
              href="/likes"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <span>Likes</span>

              {pendingLikeCount > 0 && (
                <span
                  aria-label={`${pendingLikeCount} pending like${
                    pendingLikeCount === 1 ? "" : "s"
                  }`}
                  title={`${pendingLikeCount} ${
                    pendingLikeCount === 1
                      ? "person likes you"
                      : "people like you"
                  }`}
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold leading-none text-primary-foreground"
                >
                  {pendingLikeCount > 99 ? "99+" : pendingLikeCount}
                </span>
              )}
            </Link>

            <Link
              href="/matches"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <span>Matches</span>
            </Link>

            <Link
              href="apps/web/components/likes/realtime-likes-listener.tsx `/messages"
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Messages
            </Link>

            <Link
              href="/profile"
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Profile
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
