import dotenv from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

const environmentFile =
  process.env.NODE_ENV === "development" ? ".env.development.local" : ".env";

dotenv.config({
  path: path.resolve(process.cwd(), environmentFile),
  override: true,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
