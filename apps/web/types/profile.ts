import type { UserMedia, UserProfile } from "@/lib/generated/prisma/client";

export type Profile = Pick<
  UserProfile,
  | "id"
  | "userId"
  | "displayName"
  | "firstName"
  | "lastName"
  | "dateOfBirth"
  | "gender"
  | "bio"
  | "occupation"
  | "company"
  | "height"
  | "profileVisibility"
  | "createdAt"
  | "updatedAt"
>;

export type ProfileMedia = Pick<
  UserMedia,
  | "id"
  | "userId"
  | "url"
  | "publicId"
  | "mediaType"
  | "isProfilePhoto"
  | "isVerified"
  | "displayOrder"
  | "createdAt"
  | "updatedAt"
>;

export type ProfileWithMedia = Profile & {
  media: ProfileMedia[];
};
