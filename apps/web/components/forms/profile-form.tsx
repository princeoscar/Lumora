"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateProfile } from "@/actions/profile";
import type { Profile } from "@/types/profile";
import { profileUpdateSchema } from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileFormValues = {
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Profile["gender"];
  bio: string;
  occupation: string;
  company: string;
  height: string;
  profileVisibility: Profile["profileVisibility"];
};

type ProfileFormProps = {
  profile: Profile;
};

function getInitialValues(profile: Profile): ProfileFormValues {
  return {
    displayName: profile.displayName ?? "",
    firstName: profile.firstName,
    lastName: profile.lastName ?? "",
    dateOfBirth: profile.dateOfBirth.toISOString().slice(0, 10),
    gender: profile.gender,
    bio: profile.bio ?? "",
    occupation: profile.occupation ?? "",
    company: profile.company ?? "",
    height: profile.height?.toString() ?? "",
    profileVisibility: profile.profileVisibility,
  };
}

type FieldErrors = Partial<Record<keyof ProfileFormValues, string[]>>;

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();

  const [values, setValues] = useState<ProfileFormValues>(() =>
    getInitialValues(profile),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof ProfileFormValues>(
    field: K,
    value: ProfileFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldErrors({});
    setError(null);

    const validation = profileUpdateSchema.safeParse(values);

    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors);
      setError("Please correct the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateProfile(values);

      if (!result.success) {
        setError(
          result.error ?? "We couldn't update your profile. Please try again.",
        );
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      router.push("/profile");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={values.displayName}
          onChange={(event) => updateField("displayName", event.target.value)}
          placeholder="How you want your name displayed"
          maxLength={50}
        />
        {fieldErrors.displayName?.[0] && (
          <p className="text-sm text-destructive">
            {fieldErrors.displayName[0]}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={values.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            maxLength={50}
            required
          />
          {fieldErrors.firstName?.[0] && (
            <p className="text-sm text-destructive">
              {fieldErrors.firstName[0]}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={values.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            maxLength={50}
          />
          {fieldErrors.lastName?.[0] && (
            <p className="text-sm text-destructive">
              {fieldErrors.lastName[0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={values.dateOfBirth}
            onChange={(event) => updateField("dateOfBirth", event.target.value)}
            required
          />
          {fieldErrors.dateOfBirth?.[0] && (
            <p className="text-sm text-destructive">
              {fieldErrors.dateOfBirth[0]}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            value={values.gender}
            onChange={(event) =>
              updateField("gender", event.target.value as Profile["gender"])
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            required
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="NON_BINARY">Non-binary</option>
          </select>
          {fieldErrors.gender?.[0] && (
            <p className="text-sm text-destructive">{fieldErrors.gender[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="bio">Bio</Label>
          <span className="text-xs text-muted-foreground">
            {values.bio.length}/500
          </span>
        </div>

        <textarea
          id="bio"
          value={values.bio}
          onChange={(event) => updateField("bio", event.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Tell people a little about yourself..."
          className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        {fieldErrors.bio?.[0] && (
          <p className="text-sm text-destructive">{fieldErrors.bio[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={values.occupation}
            onChange={(event) => updateField("occupation", event.target.value)}
            placeholder="e.g. Software Developer"
            maxLength={100}
          />
          {fieldErrors.occupation?.[0] && (
            <p className="text-sm text-destructive">
              {fieldErrors.occupation[0]}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={values.company}
            onChange={(event) => updateField("company", event.target.value)}
            placeholder="e.g. Lumora"
            maxLength={100}
          />
          {fieldErrors.company?.[0] && (
            <p className="text-sm text-destructive">{fieldErrors.company[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            min={100}
            max={250}
            value={values.height}
            onChange={(event) => updateField("height", event.target.value)}
            placeholder="e.g. 175"
          />
          {fieldErrors.height?.[0] && (
            <p className="text-sm text-destructive">{fieldErrors.height[0]}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profileVisibility">Profile visibility</Label>
          <select
            id="profileVisibility"
            value={values.profileVisibility}
            onChange={(event) =>
              updateField(
                "profileVisibility",
                event.target.value as Profile["profileVisibility"],
              )
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            required
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="PREMIUM_ONLY">Premium only</option>
          </select>
          {fieldErrors.profileVisibility?.[0] && (
            <p className="text-sm text-destructive">
              {fieldErrors.profileVisibility[0]}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
