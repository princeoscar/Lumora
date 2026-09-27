import { z } from "zod";

export const discoveryPreferenceSchema = z
  .object({
    minAge: z.coerce.number().int().min(18).max(100),
    maxAge: z.coerce.number().int().min(18).max(100),
    interestedInGenders: z
      .array(z.enum(["MALE", "FEMALE", "NON_BINARY"]))
      .min(1, "Select at least one gender")
      .max(3),
  })
  .refine((data) => data.minAge <= data.maxAge, {
    message: "Minimum age cannot be greater than maximum age",
    path: ["maxAge"],
  });

export type DiscoveryPreferenceInput = z.infer<
  typeof discoveryPreferenceSchema
>;
