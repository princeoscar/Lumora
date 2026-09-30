import { prisma } from "@/lib/prisma";
import type { MatchItem, MatchProfile } from "@/types/matches";

function calculateAge(dateOfBirth: Date) {
  const today = new Date();

  let age = today.getFullYear() - dateOfBirth.getFullYear();

  const birthdayHasPassed =
    today.getMonth() > dateOfBirth.getMonth() ||
    (today.getMonth() === dateOfBirth.getMonth() &&
      today.getDate() >= dateOfBirth.getDate());

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age;
}

function getDisplayName(firstName: string, lastName: string | null) {
  return `${firstName} ${lastName ?? ""}`.trim();
}

function buildMatchProfile(user: {
  id: string;
  profile: {
    id: string;
    displayName: string | null;
    firstName: string;
    lastName: string | null;
    dateOfBirth: Date;
    gender: MatchProfile["gender"];
    bio: string | null;
    occupation: string | null;
    company: string | null;
  } | null;
  media: {
    id: string;
    url: string;
    mediaType: MatchProfile["photos"][number]["mediaType"];
    isProfilePhoto: boolean;
    displayOrder: number;
  }[];
}): MatchProfile | null {
  if (!user.profile) {
    return null;
  }

  return {
    userId: user.id,
    profileId: user.profile.id,
    displayName:
      user.profile.displayName?.trim() ||
      getDisplayName(user.profile.firstName, user.profile.lastName),
    age: calculateAge(user.profile.dateOfBirth),
    gender: user.profile.gender,
    bio: user.profile.bio,
    occupation: user.profile.occupation,
    company: user.profile.company,
    photos: user.media,
  };
}

export async function getUserMatches(userId: string): Promise<MatchItem[]> {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userId }, { matchedUserId: userId }],
    },
    select: {
      id: true,
      createdAt: true,
      userId: true,
      matchedUserId: true,

      user: {
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
              mediaType: true,
              isProfilePhoto: true,
              displayOrder: true,
            },
          },
        },
      },

      matchedUser: {
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
              mediaType: true,
              isProfilePhoto: true,
              displayOrder: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const result: MatchItem[] = [];

  for (const match of matches) {
    const matchedUser =
      match.userId === userId ? match.matchedUser : match.user;

    const profile = buildMatchProfile(matchedUser);

    if (!profile) {
      continue;
    }

    result.push({
      matchId: match.id,
      createdAt: match.createdAt,
      user: profile,
    });
  }

  return result;
}
