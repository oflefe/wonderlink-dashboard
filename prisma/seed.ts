import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import sessionData from "../data/session-data.json";
import {
  fetchSessionData,
  fetchUserData,
} from "../src/services/bigQueryService";

async function seedUsers() {
  const userData = await fetchUserData();
  await prisma.user.createMany({
    data: userData.map((user: any) => ({
      user_pseudo_id: user.user_pseudo_id,
      install_date: new Date(
        `${user.install_date.substring(0, 4)}-${user.install_date.substring(
          4,
          6
        )}-${user.install_date.substring(6, 8)}`
      ),
      install_timestamp: BigInt(user.install_timestamp),
      platform: user.platform,
      country: user.country,
    })),
  });

  console.log("UserTable data seeded.");
}

async function upsertUsers() {
  try {
    const userData = await fetchUserData();

    const transformedData = userData.map((user) => ({
      user_pseudo_id: user.user_pseudo_id,
      install_date: new Date(
        `${user.install_date.substring(0, 4)}-${user.install_date.substring(
          4,
          6
        )}-${user.install_date.substring(6, 8)}`
      ),
      install_timestamp: BigInt(user.install_timestamp),
      platform: user.platform,
      country: user.country,
    }));

    await prisma.user.createMany({
      data: transformedData,
      skipDuplicates: true, // Optional: Avoid errors if duplicates exist
    });
    console.log("User table seeded successfully!");
  } catch (error) {
    console.error("Error seeding user table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function seedSessionTable() {
  try {
    // Fetch session data from BigQuery
    const sessionData = await fetchSessionData();

    const validUserIds = new Set(
      (
        await prisma.user.findMany({
          select: { user_pseudo_id: true },
        })
      ).map((user) => user.user_pseudo_id)
    );

    const filteredSessionData = sessionData.filter((session) =>
      validUserIds.has(session.user_pseudo_id)
    );

    // Transform the data for Prisma
    const transformedData = filteredSessionData.map((session) => ({
      session_id: session.session_id,
      user_pseudo_id: session.user_pseudo_id,
      session_date: new Date(
        `${session.session_date.substring(
          0,
          4
        )}-${session.session_date.substring(
          4,
          6
        )}-${session.session_date.substring(6, 8)}`
      ),
      session_timestamp: BigInt(session.session_timestamp),
    }));

    await prisma.session.createMany({
      data: transformedData,
      skipDuplicates: true, // Optional: Avoid errors if duplicates exist
    });

    console.log("Session table seeded successfully with createMany!");
  } catch (error) {
    console.error("Error seeding session table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  // await prisma.session.deleteMany();
  // await prisma.user.deleteMany();
  // await upsertUsers();
  await seedSessionTable();
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
