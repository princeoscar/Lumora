import "dotenv/config";

import { PrismaClient } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const interests = [
  { name: "Music", slug: "music" },
  { name: "Movies", slug: "movies" },
  { name: "Travel", slug: "travel" },
  { name: "Fitness", slug: "fitness" },
  { name: "Cooking", slug: "cooking" },
  { name: "Photography", slug: "photography" },
  { name: "Reading", slug: "reading" },
  { name: "Gaming", slug: "gaming" },
  { name: "Business", slug: "business" },
  { name: "Art", slug: "art" },
  { name: "Fashion", slug: "fashion" },
  { name: "Football", slug: "football" },
  { name: "Basketball", slug: "basketball" },
  { name: "Nature", slug: "nature" },
  { name: "Food", slug: "food" },
  { name: "Writing", slug: "writing" },
  { name: "Dancing", slug: "dancing" },
  { name: "Entrepreneurship", slug: "entrepreneurship" },
  { name: "Volunteering", slug: "volunteering" },
  { name: "Podcasts", slug: "podcasts" },
  { name: "Concerts", slug: "concerts" },
  { name: "Beach", slug: "beach" },
  { name: "Hiking", slug: "hiking" },
  { name: "Cars", slug: "cars" },
  { name: "Technology", slug: "technology" },
  { name: "Languages", slug: "languages" },
  { name: "Coffee", slug: "coffee" },
  { name: "Wine Tasting", slug: "wine-tasting" },
  { name: "Board Games", slug: "board-games" },
];

async function main() {
  for (const interest of interests) {
    await prisma.interest.upsert({
      where: {
        slug: interest.slug,
      },
      update: {
        name: interest.name,
      },
      create: interest,
    });
  }

  console.log(`✅ Seeded ${interests.length} interests.`);
}

main()
  .catch((error) => {
    console.error("❌ Interest seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
