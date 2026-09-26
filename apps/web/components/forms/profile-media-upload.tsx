"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { addProfileMedia } from "@/actions/profile-media";
import { getProfileUploadSignature } from "@/actions/cloudinary";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type CloudinaryUploadResponse = {
  public_id?: string;
  secure_url?: string;
  resource_type?: string;
};

export function ProfileMediaUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(null);
    setError(null);

    const file = inputRef.current?.files?.[0];

    if (!file) {
      setError("Please choose an image first.");
      return;
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Your image must be 10 MB or smaller.");
      return;
    }

    setIsUploading(true);

    try {
      const signatureResult = await getProfileUploadSignature();

      if (
        !signatureResult.cloudName ||
        !signatureResult.apiKey ||
        !signatureResult.signature
      ) {
        throw new Error("Cloudinary upload configuration is incomplete.");
      }

      const formData = new FormData();

      formData.append("file", file);
      formData.append("api_key", signatureResult.apiKey);
      formData.append("timestamp", signatureResult.timestamp.toString());
      formData.append("folder", signatureResult.folder);
      formData.append("signature", signatureResult.signature);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureResult.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadResponse.ok) {
        throw new Error("Cloudinary upload failed.");
      }

      const cloudinaryResult =
        (await uploadResponse.json()) as CloudinaryUploadResponse;

      if (
        !cloudinaryResult.public_id ||
        !cloudinaryResult.secure_url ||
        cloudinaryResult.resource_type !== "image"
      ) {
        throw new Error("Cloudinary returned an invalid upload response.");
      }

      const mediaResult = await addProfileMedia({
        publicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        resourceType: cloudinaryResult.resource_type,
      });

      if (!mediaResult.success) {
        throw new Error(mediaResult.error);
      }

      setMessage("Photo uploaded successfully.");
      router.refresh();

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (uploadError) {
      console.error("❌ Profile photo upload failed:", uploadError);

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "We couldn't upload your photo. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="profile-photo">Profile photo</Label>

        <input
          ref={inputRef}
          id="profile-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={isUploading}
          className="block w-full cursor-pointer rounded-md border bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
        />

        <p className="text-xs text-muted-foreground">
          JPG, PNG, or WebP. Maximum size: 10 MB.
        </p>
      </div>

      {message && (
        <p className="text-sm text-green-600" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload photo"}
        </Button>
      </div>
    </form>
  );
}
