import type { Gender } from "@/lib/generated/prisma/client";

export type PublicProfileInterest = {
  id: string;
  name: string;
  slug: string;
};

export type PublicProfile = {
  userId: string;
  profileId: string;
  displayName: string;
  firstName: string;
  lastName: string | null;
  dateOfBirth: Date;
  gender: Gender;
  bio: string | null;
  occupation: string | null;
  company: string | null;
  height: number | null;
  media: {
    id: string;
    url: string;
    isProfilePhoto: boolean;
    displayOrder: number;
  }[];
  interests: PublicProfileInterest[];
};
