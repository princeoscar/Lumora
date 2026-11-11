"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { unblockUserAction } from "@/actions/block-actions";
import { Button } from "@/components/ui/button";

type BlockedUser = {
  blockId: string;
  blockedAt: Date;
  userId: string;
  username: string | null;
  displayName: string;
};

type BlockedUsersListProps = {
  initialUsers: BlockedUser[];
};

export function BlockedUsersList({ initialUsers }: BlockedUsersListProps) {
  const router = useRouter();

  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUnblock(targetUserId: string) {
    const confirmed = window.confirm(
      "Unblock this person? They may become discoverable to you again if they meet your preferences.",
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setPendingUserId(targetUserId);

    startTransition(async () => {
      try {
        const result = await unblockUserAction({ targetUserId });

        if (!result.success) {
          setError(
            result.error ??
              "We couldn't unblock this person. Please try again.",
          );
          return;
        }

        setUsers((currentUsers) =>
          currentUsers.filter((user) => user.userId !== targetUserId),
        );

        router.refresh();
      } catch {
        setError("We couldn't unblock this person. Please try again.");
      } finally {
        setPendingUserId(null);
      }
    });
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border bg-card px-6 py-12 text-center">
        <h2 className="text-lg font-semibold">
          You haven&apos;t blocked anyone
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          People you block will appear here. You can return to this page
          whenever you want to manage your blocked users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.blockId}
            className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <h2 className="truncate font-semibold">{user.displayName}</h2>

              {user.username && (
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  @{user.username}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleUnblock(user.userId)}
              className="shrink-0"
            >
              {isPending && pendingUserId === user.userId
                ? "Unblocking..."
                : "Unblock"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
