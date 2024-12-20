import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import userData from "../data/user-data.json";
import sessionData from "../data/session-data.json";

async function seedUsers() {
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

async function seedSession() {
  const validUserPseudoIds = new Set(
    userData.map((user: any) => user.user_pseudo_id)
  );

  const filteredSessionTableData = sessionData.filter((session: any) =>
    validUserPseudoIds.has(session.user_pseudo_id)
  );

  const sessionJson = filteredSessionTableData as any[];
  await prisma.session.createMany({
    data: sessionJson.map((session: any) => ({
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
    })),
  });

  console.log("SessionTable data seeded.");
}

async function main() {
  // Load user_table data from JSON

  // Load session_table data from JSON;
  await seedSession();

  console.log("SessionTable data seeded.");
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
