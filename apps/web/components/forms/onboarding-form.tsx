"use client";

import { useState, type FormEvent } from "react";

import { onboardingSchema } from "@/lib/validations/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
};

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
};

export function OnboardingForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: keyof FormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = onboardingSchema.safeParse(values);

    if (!result.success) {
      const nextErrors: Record<string, string> = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if (typeof field === "string" && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }

      setErrors(nextErrors);
      setSubmitted(false);
      return;
    }

    setErrors({});
    setSubmitted(true);
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="firstName">First name</Label>

        <Input
          id="firstName"
          name="firstName"
          autoComplete="given-name"
          value={values.firstName}
          onChange={(event) => handleChange("firstName", event.target.value)}
          aria-invalid={Boolean(errors.firstName)}
        />

        {errors.firstName ? (
          <p className="text-sm text-destructive">{errors.firstName}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last name</Label>

        <Input
          id="lastName"
          name="lastName"
          autoComplete="family-name"
          value={values.lastName}
          onChange={(event) => handleChange("lastName", event.target.value)}
          aria-invalid={Boolean(errors.lastName)}
        />

        {errors.lastName ? (
          <p className="text-sm text-destructive">{errors.lastName}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of birth</Label>

        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          autoComplete="bday"
          value={values.dateOfBirth}
          onChange={(event) => handleChange("dateOfBirth", event.target.value)}
          aria-invalid={Boolean(errors.dateOfBirth)}
        />

        {errors.dateOfBirth ? (
          <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>

        <select
          id="gender"
          name="gender"
          value={values.gender}
          onChange={(event) => handleChange("gender", event.target.value)}
          aria-invalid={Boolean(errors.gender)}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-lg border px-3 py-1 text-sm outline-none focus-visible:ring-3"
        >
          <option value="">Select your gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="NON_BINARY">Non-binary</option>
        </select>

        {errors.gender ? (
          <p className="text-sm text-destructive">{errors.gender}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full">
        Continue
      </Button>

      {submitted ? (
        <p className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
          Your information passed validation. Database saving will be added in
          the next step.
        </p>
      ) : null}
    </form>
  );
}
