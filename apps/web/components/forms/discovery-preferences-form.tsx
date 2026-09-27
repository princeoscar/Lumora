"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { saveDiscoveryPreferences } from "@/actions/discovery-preferences";
import { Button } from "@/components/ui/button";

type GenderOption = "MALE" | "FEMALE" | "NON_BINARY";

type DiscoveryPreferencesFormProps = {
  initialMinAge?: number;
  initialMaxAge?: number;
  initialInterestedInGenders?: GenderOption[];
};

const genderOptions: {
  value: GenderOption;
  label: string;
}[] = [
  {
    value: "MALE",
    label: "Men",
  },
  {
    value: "FEMALE",
    label: "Women",
  },
  {
    value: "NON_BINARY",
    label: "Non-binary people",
  },
];

export function DiscoveryPreferencesForm({
  initialMinAge = 18,
  initialMaxAge = 100,
  initialInterestedInGenders = [],
}: DiscoveryPreferencesFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [minAge, setMinAge] = useState(String(initialMinAge));
  const [maxAge, setMaxAge] = useState(String(initialMaxAge));
  const [interestedInGenders, setInterestedInGenders] = useState<
    GenderOption[]
  >(initialInterestedInGenders);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleGender(gender: GenderOption) {
    setSuccess(false);
    setError(null);

    setInterestedInGenders((current) =>
      current.includes(gender)
        ? current.filter((value) => value !== gender)
        : [...current, gender],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await saveDiscoveryPreferences({
        minAge,
        maxAge,
        interestedInGenders,
      });

      if (!result.success) {
        setError(
          result.error ??
            "We couldn't save your discovery preferences. Please try again.",
        );
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">
            Who are you interested in?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select one or more options.
          </p>
        </div>

        <div className="grid gap-3">
          {genderOptions.map((option) => {
            const checked = interestedInGenders.includes(option.value);

            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 transition hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGender(option.value)}
                  className="size-4 accent-current"
                />

                <span className="text-sm font-medium">{option.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Preferred age range</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the minimum and maximum age you want to discover.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="min-age" className="text-sm font-medium">
              Minimum age
            </label>

            <input
              id="min-age"
              type="number"
              min={18}
              max={100}
              value={minAge}
              onChange={(event) => {
                setSuccess(false);
                setError(null);
                setMinAge(event.target.value);
              }}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="max-age" className="text-sm font-medium">
              Maximum age
            </label>

            <input
              id="max-age"
              type="number"
              min={18}
              max={100}
              value={maxAge}
              onChange={(event) => {
                setSuccess(false);
                setError(null);
                setMaxAge(event.target.value);
              }}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={isPending}
            />
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm"
        >
          Discovery preferences saved successfully.
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save preferences"}
      </Button>
    </form>
  );
}
