"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateProfileInterests } from "@/actions/profile-interests";
import { Button } from "@/components/ui/button";

type Interest = {
  id: string;
  name: string;
  slug: string;
};

type ProfileInterestsFormProps = {
  interests: Interest[];
  selectedInterestIds: string[];
};

const MAX_INTERESTS = 10;

export function ProfileInterestsForm({
  interests,
  selectedInterestIds,
}: ProfileInterestsFormProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    selectedInterestIds,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleInterest(interestId: string) {
    setError(null);
    setMessage(null);

    setSelectedIds((current) => {
      if (current.includes(interestId)) {
        return current.filter((id) => id !== interestId);
      }

      if (current.length >= MAX_INTERESTS) {
        setError(`You can choose up to ${MAX_INTERESTS} interests.`);
        return current;
      }

      return [...current, interestId];
    });
  }

  function handleSave() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await updateProfileInterests({
        interestIds: selectedIds,
      });

      if (!result.success) {
        setError(
          result.error ?? "We couldn't update your interests. Please try again.",
        );
        return;
      }

      setMessage("Your interests have been updated.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm text-muted-foreground">
          Choose up to {MAX_INTERESTS} interests that represent you.
        </p>

        <p className="mt-1 text-sm font-medium">
          {selectedIds.length}/{MAX_INTERESTS} selected
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => {
          const isSelected = selectedIds.includes(interest.id);

          return (
            <button
              key={interest.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleInterest(interest.id)}
              disabled={isPending}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {interest.name}
            </button>
          );
        })}
      </div>

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

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save interests"}
        </Button>
      </div>
    </div>
  );
}