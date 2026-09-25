import { z } from "zod";

const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date of birth")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const [year, month, day] = value.split("-").map(Number);

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day
    );
  }, "Enter a valid date of birth")
  .refine((value) => {
    const today = new Date();
    const dateOfBirth = new Date(`${value}T00:00:00.000Z`);

    let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();

    const monthDifference = today.getUTCMonth() - dateOfBirth.getUTCMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getUTCDate() < dateOfBirth.getUTCDate())
    ) {
      age -= 1;
    }

    return age >= 18;
  }, "You must be at least 18 years old");

export const onboardingSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be 50 characters or fewer"),

  lastName: z
    .string()
    .trim()
    .max(50, "Last name must be 50 characters or fewer")
    .optional()
    .or(z.literal("")),

  dateOfBirth: dateOfBirthSchema,

  gender: z.enum(["MALE", "FEMALE", "NON_BINARY"]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
