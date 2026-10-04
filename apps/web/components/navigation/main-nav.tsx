import Link from "next/link";

import { ActivityTracker } from "@/components/activity/activity-tracker";
import { getPendingLikeCount } from "@/lib/db/discovery";
import { RealtimeLikesListener } from "@/components/likes/realtime-likes-listener";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";

export async function MainNav() {
  const user = await requireCurrentUserWithProfile();
  const pendingLikeCount = await getPendingLikeCount(user.id);

  return (
    <>
      <ActivityTracker />
      <RealtimeLikesListener userId={user.id} />

      <nav className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-10">
          {/* Mobile Header */}
          <div className="flex h-16 items-center md:hidden">
            <Link
              href="/dashboard"
              className="font-serif text-2xl font-semibold tracking-tight"
            >
              Lumora
            </Link>

            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="overflow-x-auto pb-3 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-center gap-1.5">
              <Link
                href="/dashboard"
                className="rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Home
              </Link>

              <Link
                href="/discover"
                className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary/15"
              >
                Discover
              </Link>

              <Link
                href="/likes"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                    className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground"
                  >
                    {pendingLikeCount > 99 ? "99+" : pendingLikeCount}
                  </span>
                )}
              </Link>

              <Link
                href="/matches"
                className="rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Matches
              </Link>

              <Link
                href="/messages"
                className="rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Messages
              </Link>

              <Link
                href="/profile"
                className="rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Profile
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden h-16 items-center md:flex">
            <Link
              href="/dashboard"
              className="mr-auto font-serif text-2xl font-semibold tracking-tight"
            >
              Lumora
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Home
              </Link>

              <Link
                href="/discover"
                className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary/15"
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
                Matches
              </Link>

              <Link
                href="/messages"
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

              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
