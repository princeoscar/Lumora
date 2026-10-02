import { prisma } from "@/lib/prisma";
import type { DiscoveryCandidate } from "@/types/discovery";

const DISCOVERY_PAGE_SIZE = 20;

function getAgeDateBoundaries(minAge: number, maxAge: number) {
  const today = new Date();

  const maximumDateOfBirth = new Date(
    today.getFullYear() - minAge,
    today.getMonth(),
    today.getDate(),
  );

  const tomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );

  const minimumDateOfBirth = new Date(
    tomorrow.getFullYear() - maxAge - 1,
    tomorrow.getMonth(),
    tomorrow.getDate(),
  );

  return {
    minimumDateOfBirth,
    maximumDateOfBirth,
  };
}

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

export async function getDiscoveryCandidates(
  userId: string,
): Promise<DiscoveryCandidate[]> {
  const preferences = await prisma.discoveryPreference.findUnique({
    where: {
      userId,
    },
    select: {
      minAge: true,
      maxAge: true,
      interestedInGenders: true,
    },
  });

  if (!preferences || preferences.interestedInGenders.length === 0) {
    return [];
  }

  const { minimumDateOfBirth, maximumDateOfBirth } = getAgeDateBoundaries(
    preferences.minAge,
    preferences.maxAge,
  );

  const candidates = await prisma.user.findMany({
    where: {
      id: {
        not: userId,
      },
      accountStatus: "ACTIVE",
      receivedDiscoveryActions: {
        none: {
          userId,
        },
      },
      sentDiscoveryActions: {
        none: {
          targetUserId: userId,
        },
      },
      deletedAt: null,
      onboardingCompleted: true,
      profile: {
        is: {
          deletedAt: null,
          profileVisibility: "PUBLIC",
          gender: {
            in: preferences.interestedInGenders,
          },
          dateOfBirth: {
            gte: minimumDateOfBirth,
            lte: maximumDateOfBirth,
          },
        },
      },
      media: {
        some: {
          deletedAt: null,
          mediaType: "IMAGE",
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
    },
    orderBy: {
      createdAt: "desc",
    },
    take: DISCOVERY_PAGE_SIZE,
  });

  return candidates
    .filter((candidate) => candidate.profile !== null)
    .map((candidate) => {
      const profile = candidate.profile!;

      return {
        userId: candidate.id,
        profileId: profile.id,
        displayName:
          profile.displayName?.trim() ||
          getDisplayName(profile.firstName, profile.lastName),
        age: calculateAge(profile.dateOfBirth),
        gender: profile.gender,
        bio: profile.bio,
        occupation: profile.occupation,
        company: profile.company,
        height: profile.height,
        photos: candidate.media,
      };
    });
}

export async function isDiscoverableTarget(
  userId: string,
  targetUserId: string,
): Promise<boolean> {
  if (userId === targetUserId) {
    return false;
  }

  const preferences = await prisma.discoveryPreference.findUnique({
    where: {
      userId,
    },
    select: {
      minAge: true,
      maxAge: true,
      interestedInGenders: true,
    },
  });

  if (!preferences || preferences.interestedInGenders.length === 0) {
    return false;
  }

  const { minimumDateOfBirth, maximumDateOfBirth } = getAgeDateBoundaries(
    preferences.minAge,
    preferences.maxAge,
  );

  const target = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      accountStatus: "ACTIVE",
      deletedAt: null,
      onboardingCompleted: true,
      profile: {
        is: {
          deletedAt: null,
          profileVisibility: "PUBLIC",
          gender: {
            in: preferences.interestedInGenders,
          },
          dateOfBirth: {
            gte: minimumDateOfBirth,
            lte: maximumDateOfBirth,
          },
        },
      },
      media: {
        some: {
          deletedAt: null,
          mediaType: "IMAGE",
        },
      },
    },
    select: {
      id: true,
    },
  });

  return target !== null;
}

export async function getPendingLikeCount(userId: string) {
  const [incomingLikes, matches] = await Promise.all([
    prisma.discoveryAction.findMany({
      where: {
        targetUserId: userId,
        userId: {
          not: userId,
        },
        action: "LIKE",
      },
      select: {
        userId: true,
      },
    }),

    prisma.match.findMany({
      where: {
        OR: [{ userId }, { matchedUserId: userId }],
      },
      select: {
        userId: true,
        matchedUserId: true,
      },
    }),
  ]);

  const matchedUserIds = new Set<string>();

  for (const match of matches) {
    matchedUserIds.add(
      match.userId === userId ? match.matchedUserId : match.userId,
    );
  }

  const pendingLikeUserIds = new Set(
    incomingLikes
      .map((like) => like.userId)
      .filter((likeUserId) => !matchedUserIds.has(likeUserId)),
  );

  return pendingLikeUserIds.size;
}

export async function getPendingLikes(
  userId: string,
): Promise<DiscoveryCandidate[]> {
  const incomingLikes = await prisma.discoveryAction.findMany({
    where: {
      targetUserId: userId,
      userId: {
        not: userId,
      },
      action: "LIKE",
    },
    select: {
      userId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (incomingLikes.length === 0) {
    return [];
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userId }, { matchedUserId: userId }],
    },
    select: {
      userId: true,
      matchedUserId: true,
    },
  });

  const matchedUserIds = new Set<string>();

  for (const match of matches) {
    matchedUserIds.add(
      match.userId === userId ? match.matchedUserId : match.userId,
    );
  }

  const pendingUserIds = incomingLikes
    .map((like) => like.userId)
    .filter((likedUserId) => !matchedUserIds.has(likedUserId));

  if (pendingUserIds.length === 0) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: pendingUserIds,
      },
      accountStatus: "ACTIVE",
      deletedAt: null,
      onboardingCompleted: true,
      profile: {
        is: {
          deletedAt: null,
          profileVisibility: "PUBLIC",
        },
      },
      media: {
        some: {
          deletedAt: null,
          mediaType: "IMAGE",
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
    },
  });

  const usersById = new Map(users.map((user) => [user.id, user]));

  const pendingLikes: DiscoveryCandidate[] = [];

  for (const pendingUserId of pendingUserIds) {
    const user = usersById.get(pendingUserId);

    if (!user?.profile) {
      continue;
    }

    const profile = user.profile;

    pendingLikes.push({
      userId: user.id,
      profileId: profile.id,
      displayName:
        profile.displayName?.trim() ||
        getDisplayName(profile.firstName, profile.lastName),
      age: calculateAge(profile.dateOfBirth),
      gender: profile.gender,
      bio: profile.bio,
      occupation: profile.occupation,
      company: profile.company,
      height: profile.height,
      photos: user.media,
    });
  }

  return pendingLikes;
}
