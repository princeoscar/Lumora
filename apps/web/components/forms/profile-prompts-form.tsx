"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateProfilePrompts } from "@/actions/profile-prompts";
import {
  MAX_PROFILE_PROMPTS,
  MAX_PROMPT_RESPONSE_LENGTH,
  PROFILE_PROMPTS,
} from "@/lib/profile/prompts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ExistingPrompt = {
  id: string;
  prompt: string;
  response: string;
  displayOrder: number;
};

type PromptFormItem = {
  prompt: string;
  response: string;
};

type ProfilePromptsFormProps = {
  initialPrompts: ExistingPrompt[];
};

export function ProfilePromptsForm({
  initialPrompts,
}: ProfilePromptsFormProps) {
  const router = useRouter();

  const [prompts, setPrompts] = useState<PromptFormItem[]>(
    initialPrompts.map((item) => ({
      prompt: item.prompt,
      response: item.response,
    })),
  );

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addPrompt() {
    setError(null);
    setMessage(null);

    if (prompts.length >= MAX_PROFILE_PROMPTS) {
      setError(`You can choose up to ${MAX_PROFILE_PROMPTS} prompts.`);
      return;
    }

    setPrompts((current) => [
      ...current,
      {
        prompt: "",
        response: "",
      },
    ]);
  }

  function removePrompt(index: number) {
    setError(null);
    setMessage(null);

    setPrompts((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function updatePrompt(
    index: number,
    field: keyof PromptFormItem,
    value: string,
  ) {
    setError(null);
    setMessage(null);

    setPrompts((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function handleSave() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await updateProfilePrompts({
        prompts,
      });

      if (!result.success) {
        setError(
          result.error ?? "We couldn't update your prompts. Please try again.",
        );
        return;
      }

      setMessage("Your prompts have been updated.");
      router.refresh();
    });
  }

  const selectedPromptSet = new Set(
    prompts.map((item) => item.prompt).filter((prompt) => prompt.length > 0),
  );

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Add up to {MAX_PROFILE_PROMPTS} prompts to show more of your
          personality.
        </p>

        <p className="mt-1 text-sm font-medium">
          {prompts.length}/{MAX_PROFILE_PROMPTS} prompts
        </p>
      </div>

      {prompts.length > 0 && (
        <div className="grid gap-6">
          {prompts.map((item, index) => (
            <div
              key={`${index}-${item.prompt}`}
              className="grid gap-4 rounded-xl border p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor={`profile-prompt-${index}`}>
                  Prompt {index + 1}
                </Label>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePrompt(index)}
                  disabled={isPending}
                >
                  Remove
                </Button>
              </div>

              <select
                id={`profile-prompt-${index}`}
                value={item.prompt}
                onChange={(event) =>
                  updatePrompt(index, "prompt", event.target.value)
                }
                disabled={isPending}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Choose a prompt</option>

                {PROFILE_PROMPTS.map((prompt) => {
                  const isUsedElsewhere =
                    prompt !== item.prompt && selectedPromptSet.has(prompt);

                  return (
                    <option
                      key={prompt}
                      value={prompt}
                      disabled={isUsedElsewhere}
                    >
                      {prompt}
                    </option>
                  );
                })}
              </select>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor={`profile-response-${index}`}>
                    Your answer
                  </Label>

                  <span className="text-xs text-muted-foreground">
                    {item.response.length}/{MAX_PROMPT_RESPONSE_LENGTH}
                  </span>
                </div>

                <textarea
                  id={`profile-response-${index}`}
                  value={item.response}
                  onChange={(event) =>
                    updatePrompt(index, "response", event.target.value)
                  }
                  maxLength={MAX_PROMPT_RESPONSE_LENGTH}
                  rows={4}
                  disabled={isPending}
                  placeholder="Write your answer..."
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm"
        >
          {message}
        </div>
      )}

      <div className="flex flex-wrap justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={addPrompt}
          disabled={isPending || prompts.length >= MAX_PROFILE_PROMPTS}
        >
          Add prompt
        </Button>

        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save prompts"}
        </Button>
      </div>
    </div>
  );
}
