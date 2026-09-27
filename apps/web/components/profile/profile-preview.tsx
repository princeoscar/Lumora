import Image from "next/image";

import type { ProfileWithMedia } from "@/types/profile";

type ProfilePreviewProps = {
  profile: ProfileWithMedia;
};

function calculateAge(dateOfBirth: Date) {
  const today = new Date();

  let age = today.getFullYear() - dateOfBirth.getFullYear();

  const birthdayHasPassed =
    today.getMonth() > dateOfBirth.getMonth() ||
    (today.getMonth() === dateOfBirth.getMonth() &&
      today.getDate() >= dateOfBirth.getDate());

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age;
}

function getDisplayName(profile: ProfileWithMedia) {
  return (
    profile.displayName ||
    `${profile.firstName} ${profile.lastName ?? ""}`.trim()
  );
}

export function ProfilePreview({ profile }: ProfilePreviewProps) {
  const age = calculateAge(profile.dateOfBirth);
  const displayName = getDisplayName(profile);
  const profilePhoto =
    profile.media.find((media) => media.isProfilePhoto) ??
    profile.media[0] ??
    null;

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative aspect-[4/5] w-full bg-muted">
        {profilePhoto ? (
          <Image
            src={profilePhoto.url}
            alt={`${displayName}'s profile photo`}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div>
              <p className="text-sm font-medium">No profile photo yet</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add a photo to complete your profile preview.
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 pt-20 text-white">
          <h2 className="text-3xl font-semibold tracking-tight">
            {displayName}, {age}
          </h2>

          {profile.occupation && (
            <p className="mt-1 text-sm text-white/85">{profile.occupation}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 p-6">
        {profile.bio && (
          <section>
            <h3 className="text-sm font-semibold">About me</h3>

            <p className="mt-2 leading-7 text-muted-foreground">
              {profile.bio}
            </p>
          </section>
        )}

        {(profile.company || profile.height) && (
          <section className="grid gap-4 sm:grid-cols-2">
            {profile.company && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Company
                </p>

                <p className="mt-1 font-medium">{profile.company}</p>
              </div>
            )}

            {profile.height && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Height
                </p>

                <p className="mt-1 font-medium">{profile.height} cm</p>
              </div>
            )}
          </section>
        )}

        <section>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Gender
          </p>

          <p className="mt-1 font-medium">{profile.gender}</p>
        </section>

        {profile.media.length > 1 && (
          <p className="text-sm text-muted-foreground">
            {profile.media.length} profile photos
          </p>
        )}
      </div>
    </article>
  );
}
