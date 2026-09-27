import type { ProfileWithMedia } from "@/types/profile";

export type ProfileCompletionItem = {
  key:
    | "profilePhoto"
    | "displayName"
    | "bio"
    | "occupation"
    | "company"
    | "height";
  label: string;
  completed: boolean;
  weight: number;
};

export type ProfileCompletion = {
  percentage: number;
  completedItems: number;
  totalItems: number;
  missingItems: ProfileCompletionItem[];
  items: ProfileCompletionItem[];
};

export function getProfileCompletion(
  profile: ProfileWithMedia,
): ProfileCompletion {
  const items: ProfileCompletionItem[] = [
    {
      key: "profilePhoto",
      label: "Add a profile photo",
      completed: profile.media.length > 0,
      weight: 30,
    },
    {
      key: "displayName",
      label: "Add a display name",
      completed: Boolean(profile.displayName?.trim()),
      weight: 15,
    },
    {
      key: "bio",
      label: "Write a short bio",
      completed: Boolean(profile.bio?.trim()),
      weight: 20,
    },
    {
      key: "occupation",
      label: "Add your occupation",
      completed: Boolean(profile.occupation?.trim()),
      weight: 15,
    },
    {
      key: "company",
      label: "Add your company",
      completed: Boolean(profile.company?.trim()),
      weight: 10,
    },
    {
      key: "height",
      label: "Add your height",
      completed: profile.height !== null,
      weight: 10,
    },
  ];

  const percentage = items.reduce(
    (total, item) => (item.completed ? total + item.weight : total),
    0,
  );

  const completedItems = items.filter((item) => item.completed).length;

  const missingItems = items.filter((item) => !item.completed);

  return {
    percentage,
    completedItems,
    totalItems: items.length,
    missingItems,
    items,
  };
}
