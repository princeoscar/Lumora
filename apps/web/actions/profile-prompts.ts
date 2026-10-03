"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import {
  MAX_PROFILE_PROMPTS,
  MAX_PROMPT_RESPONSE_LENGTH,
  PROFILE_PROMPTS,
} from "@/lib/profile/prompts";
import { prisma } from "@/lib/prisma";

const profilePromptSchema = z.object({
  prompt: z.string().trim().min(1),
  response: z
    .string()
    .trim()
    .min(1, "Your answer cannot be empty.")
    .max(
      MAX_PROMPT_RESPONSE_LENGTH,
      `Your answer must be ${MAX_PROMPT_RESPONSE_LENGTH} characters or fewer.`,
    ),
});

const updateProfilePromptsSchema = z.object({
  prompts: z
    .array(profilePromptSchema)
    .max(
      MAX_PROFILE_PROMPTS,
      `You can choose up to ${MAX_PROFILE_PROMPTS} prompts.`,
    ),
});

export async function updateProfilePrompts(input: unknown) {
  const user = await requireCurrentUserWithProfile();

  const validation = updateProfilePromptsSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "Your prompts are invalid.",
    };
  }

  const { prompts } = validation.data;

  const allowedPrompts = new Set<string>(PROFILE_PROMPTS);

  for (const item of prompts) {
    if (!allowedPrompts.has(item.prompt)) {
      return {
        success: false,
        error: "One or more selected prompts are invalid.",
      };
    }
  }

  const promptTexts = prompts.map((item) => item.prompt);

  if (new Set(promptTexts).size !== promptTexts.length) {
    return {
      success: false,
      error: "You cannot use the same prompt more than once.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.userPrompt.deleteMany({
        where: {
          userId: user.id,
        },
      });

      if (prompts.length > 0) {
        await tx.userPrompt.createMany({
          data: prompts.map((item, index) => ({
            userId: user.id,
            prompt: item.prompt,
            response: item.response,
            displayOrder: index,
          })),
        });
      }
    });

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Failed to update profile prompts:", error);

    return {
      success: false,
      error: "We couldn't update your prompts. Please try again.",
    };
  }
}
