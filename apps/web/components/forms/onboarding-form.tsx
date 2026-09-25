"use client";

import { useState, type FormEvent } from "react";

import { completeOnboarding } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { onboardingSchema } from "@/lib/validations/onboarding";

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
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof FormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setServerError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setServerError("");

    const clientValidation = onboardingSchema.safeParse(values);

    if (!clientValidation.success) {
      const nextErrors: Record<string, string> = {};

      for (const issue of clientValidation.error.issues) {
        const field = issue.path[0];

        if (typeof field === "string" && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await completeOnboarding(values);

      if (!result.success) {
        if (result.fieldErrors) {
          const nextErrors: Record<string, string> = {};

          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            const message = messages?.[0];

            if (message) {
              nextErrors[field] = message;
            }
          }

          setErrors(nextErrors);
        }

        setServerError(
          result.error || "We couldn't save your profile. Please try again.",
        );

        return;
      }

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Failed to complete onboarding:", error);

      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-lg border px-3 py-1 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
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

      {serverError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {serverError}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving profile..." : "Continue"}
      </Button>
    </form>
  );
}
