import Link from "next/link";

import type { ProfileWithMedia } from "@/types/profile";
import { getProfileCompletion } from "@/lib/profile/profile-completion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ProfileCompletionCardProps = {
  profile: ProfileWithMedia;
};

export function ProfileCompletionCard({ profile }: ProfileCompletionCardProps) {
  const completion = getProfileCompletion(profile);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Profile completeness</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete your profile to give people a better picture of who you
              are.
            </p>
          </div>

          <span className="shrink-0 text-2xl font-semibold tracking-tight">
            {completion.percentage}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          aria-label={`Profile ${completion.percentage}% complete`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completion.percentage}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${completion.percentage}%` }}
          />
        </div>

        {completion.missingItems.length > 0 ? (
          <div>
            <p className="text-sm font-medium">
              {completion.missingItems.length}{" "}
              {completion.missingItems.length === 1 ? "item is" : "items are"}{" "}
              still missing
            </p>

            <div className="mt-3 space-y-2">
              {completion.missingItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
                >
                  <span className="text-sm">{item.label}</span>

                  <span className="text-xs text-muted-foreground">
                    +{item.weight}%
                  </span>
                </div>
              ))}
            </div>

            <Button asChild className="mt-4">
              <Link href="/profile/edit">Complete profile</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="font-medium">Your profile is complete.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your profile has all the information currently required for
              completion.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
