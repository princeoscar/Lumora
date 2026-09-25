import { prisma } from "@/lib/prisma";

type CreateUserData = {
  clerkId: string;
  email: string;
  username?: string | null;
};

export async function createUser(data: CreateUserData) {
  const existingUser = await prisma.user.findUnique({
    where: {
      clerkId: data.clerkId,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  return prisma.user.create({
    data: {
      clerkId: data.clerkId,
      email: data.email,
      username: data.username ?? null,
    },
  });
}
