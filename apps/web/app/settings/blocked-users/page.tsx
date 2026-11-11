import Link from "next/link";

import { MainNav } from "@/components/navigation/main-nav";
import { BlockedUsersList } from "@/components/settings/blocked-users-list";
import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { getUsersBlockedByUser } from "@/lib/db/blocks";

export default async function BlockedUsersPage() {
  const user = await requireCurrentUser();
  const blockedUsers = await getUsersBlockedByUser(user.id);

  return (
    <>
      <MainNav />

      <main className="min-h-screen px-4 py-10 sm:px-6 md:px-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/profile"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to profile
          </Link>

          <div className="mt-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Account settings
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Blocked users
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Manage the people you have blocked. Unblocking someone allows them
              to become discoverable to you again if they meet your discovery
              preferences. It does not automatically restore a match or previous
              conversation.
            </p>
          </div>

          <div className="mt-8">
            <BlockedUsersList initialUsers={blockedUsers} />
          </div>
        </div>
      </main>
    </>
  );
}
