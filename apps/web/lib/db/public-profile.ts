import { prisma } from "@/lib/prisma";
import type { PublicProfile } from "@/types/public-profile";

export async function getPublicProfileByUserId(
  userId: string,
): Promise<PublicProfile | null> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      accountStatus: "ACTIVE",
      deletedAt: null,
      onboardingCompleted: true,
      profile: {
        is: {
          deletedAt: null,
          profileVisibility: "PUBLIC",
        },
      },
    },
    select: {
      id: true,
      profile: {
        select: {
          id: true,
          displayName: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          bio: true,
          occupation: true,
          company: true,
          height: true,
        },
      },
      media: {
        where: {
          deletedAt: null,
          mediaType: "IMAGE",
        },
        orderBy: {
          displayOrder: "asc",
        },
        select: {
          id: true,
          url: true,
          isProfilePhoto: true,
          displayOrder: true,
        },
      },
      interests: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          interest: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      prompts: {
        orderBy: {
          displayOrder: "asc",
        },
        select: {
          id: true,
          prompt: true,
          response: true,
          displayOrder: true,
        },
      },
    },
  });

  if (!user?.profile) {
    return null;
  }

  const profile = user.profile;

  return {
    userId: user.id,
    profileId: profile.id,
    displayName:
      profile.displayName?.trim() ||
      `${profile.firstName} ${profile.lastName ?? ""}`.trim(),
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    bio: profile.bio,
    occupation: profile.occupation,
    company: profile.company,
    height: profile.height,
    media: user.media,
    interests: user.interests.map(({ interest }) => interest),
    prompts: user.prompts,
  };
}
