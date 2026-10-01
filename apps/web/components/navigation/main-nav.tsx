import { ActivityTracker } from "@/components/activity/activity-tracker";
import Link from "next/link";

export function MainNav() {
  return (
    <>
      <ActivityTracker />

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
              href="/matches"
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
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
          </div>
        </div>
      </nav>
    </>
  );
}
