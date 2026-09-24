import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { createUser } from "@/lib/clerk/create-user";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("❌ Missing CLERK_WEBHOOK_SECRET");

    return new Response("Webhook secret is not configured", {
      status: 500,
    });
  }

  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("❌ Missing Svix headers");

    return new Response("Missing Svix headers", {
      status: 400,
    });
  }

  const payload = await req.text();

  const webhook = new Webhook(secret);

  let event: WebhookEvent;

  try {
    event = webhook.verify(payload, {
  "svix-id": svixId,
  "svix-timestamp": svixTimestamp,
  "svix-signature": svixSignature,
}) as unknown as WebhookEvent;
  } catch (error) {
    console.error("❌ Clerk webhook verification failed:", error);

    return new Response("Invalid signature", {
      status: 400,
    });
  }

  console.log(`✅ Clerk event received: ${event.type}`);

  try {
    switch (event.type) {
      case "user.created": {
        const { id, email_addresses, username } = event.data;

        const primaryEmail =
          email_addresses.find(
            (email) => email.id === event.data.primary_email_address_id
          )?.email_address ??
          email_addresses[0]?.email_address;

        if (!primaryEmail) {
          console.error("❌ Clerk user has no email address:", id);

          return new Response("User email is required", {
            status: 400,
          });
        }

        await createUser({
          clerkId: id,
          email: primaryEmail,
          username,
        });

        console.log(`✅ User synced to database: ${id}`);

        break;
      }

      case "user.updated": {
        const { id, email_addresses, username } = event.data;

        const primaryEmail =
          email_addresses.find(
            (email) => email.id === event.data.primary_email_address_id
          )?.email_address ??
          email_addresses[0]?.email_address;

        if (!primaryEmail) {
          console.error("❌ Updated Clerk user has no email address:", id);

          return new Response("User email is required", {
            status: 400,
          });
        }

        const existingUser = await prisma.user.findUnique({
          where: {
            clerkId: id,
          },
        });

        if (!existingUser) {
          console.warn(
            `⚠️ User does not exist in database. Creating user: ${id}`
          );

          await createUser({
            clerkId: id,
            email: primaryEmail,
            username,
          });

          console.log(`✅ Missing user created from update event: ${id}`);

          break;
        }

        await prisma.user.update({
          where: {
            clerkId: id,
          },
          data: {
            email: primaryEmail,
            username: username ?? null,
            deletedAt: null,
          },
        });

        console.log(`✅ User updated in database: ${id}`);

        break;
      }

      case "user.deleted": {
        const { id } = event.data;

        const existingUser = await prisma.user.findUnique({
          where: {
            clerkId: id,
          },
        });

        if (!existingUser) {
          console.warn(
            `⚠️ Deleted Clerk user not found in database: ${id}`
          );

          break;
        }

        await prisma.user.update({
          where: {
            clerkId: id,
          },
          data: {
            deletedAt: new Date(),
            accountStatus: "SUSPENDED",
          },
        });

        console.log(`✅ User soft-deleted in database: ${id}`);

        break;
      }

      default:
        console.log(`ℹ️ Ignoring Clerk event: ${event.type}`);
    }
  } catch (error) {
    console.error(
      `❌ Failed to process Clerk event: ${event.type}`,
      error
    );

    return new Response("Webhook processing failed", {
      status: 500,
    });
  }

  return Response.json({
    success: true,
  });
}