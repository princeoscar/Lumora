import type { User } from "@/lib/generated/prisma/client";

export function canAccessApp(user: Pick<User, "accountStatus" | "deletedAt">) {
  return (
    !user.deletedAt &&
    user.accountStatus !== "SUSPENDED" &&
    user.accountStatus !== "BANNED"
  );
}
