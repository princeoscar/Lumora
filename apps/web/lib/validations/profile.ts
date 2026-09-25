import { z } from "zod";

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(maxLength).optional(),
  );

function isValidDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isAtLeast18(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  const today = new Date();

  let age = today.getFullYear() - year;

  const birthdayHasPassed =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age >= 18;
}

const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.")
  .refine(isValidDateOnly, "Enter a valid date.")
  .refine(isAtLeast18, "You must be at least 18 years old.");

const optionalHeight = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}, z.number().int().min(100, "Height must be at least 100 cm.").max(250, "Height must be at most 250 cm.").optional());

export const profileUpdateSchema = z.object({
  displayName: optionalText(50),

  firstName: z.string().trim().min(2).max(50),

  lastName: optionalText(50),

  dateOfBirth: dateOfBirthSchema,

  gender: z.enum(["MALE", "FEMALE", "NON_BINARY"]),

  bio: optionalText(500),

  occupation: optionalText(100),

  company: optionalText(100),

  height: optionalHeight,

  profileVisibility: z.enum(["PUBLIC", "PRIVATE", "PREMIUM_ONLY"]),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
