import type { Gender, MediaType } from "@/lib/generated/prisma/client";

export type MatchProfile = {
  userId: string;
  profileId: string;
  displayName: string;
  age: number;
  gender: Gender;
  bio: string | null;
  occupation: string | null;
  company: string | null;
  lastActiveAt: Date | null;
  photos: {
    id: string;
    url: string;
    mediaType: MediaType;
    isProfilePhoto: boolean;
    displayOrder: number;
  }[];
};

export type MatchItem = {
  matchId: string;
  createdAt: Date;
  user: MatchProfile;
};
