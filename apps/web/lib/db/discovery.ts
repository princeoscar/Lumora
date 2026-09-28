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
      sentDiscoveryActions: {
        none: {
          userId,
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
