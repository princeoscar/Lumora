import type { Gender, UserMedia } from "@/lib/generated/prisma/client";

export type DiscoveryCandidatePhoto = Pick<
  UserMedia,
  "id" | "url" | "isProfilePhoto" | "displayOrder"
>;

export type DiscoveryCandidate = {
  userId: string;
  profileId: string;
  displayName: string;
  age: number;
  gender: Gender;
  bio: string | null;
  occupation: string | null;
  company: string | null;
  height: number | null;
  photos: DiscoveryCandidatePhoto[];
};
