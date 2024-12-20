import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface RetentionMetricsByDate {
  installDate: string;
  d1Retention: number;
  d7Retention: number;
  d30Retention: number;
}

export async function calculateRetentionMetricsByInstallDate(filters?: {
  installDate?: string;
  country?: string;
}): Promise<RetentionMetricsByDate[]> {
  const installDates = await prisma.user.groupBy({
    by: ["install_date"],
    _count: true,
    orderBy: {
      install_date: "asc",
    },
  });

  const metrics: RetentionMetricsByDate[] = [];

  for (const { install_date } of installDates) {
    const installedUsers = await prisma.user.count({
      where: {
        install_date: {
          equals: install_date,
        },
      },
    });
    const retainedD1 = await prisma.user.count({
      where: {
        install_date: {
          equals: install_date,
        },
        Session: {
          some: {
            session_date: {
              gte: new Date(
                new Date(install_date).setHours(
                  new Date(install_date).getHours() + 24
                )
              ),
              lt: new Date(
                new Date(install_date).setHours(
                  new Date(install_date).getHours() + 48
                )
              ),
            },
          },
        },
      },
    });
    const retainedD7 = await prisma.user.count({
      where: {
        install_date: {
          equals: install_date,
        },
        Session: {
          some: {
            session_date: {
              gte: new Date(
                new Date(install_date).setHours(
                  new Date(install_date).getHours() + 168
                )
              ),
              lt: new Date(
                new Date(install_date).setHours(
                  new Date(install_date).getHours() + 192
                )
              ),
            },
          },
        },
      },
    });
    const retainedD15 = await prisma.user.count({
      where: {
        install_date: {
          equals: install_date,
        },
        Session: {
          some: {
            session_date: {
              gte: new Date(
                new Date(install_date).setHours(
                  new Date(install_date).getHours() + 360
                )
              ),
              lt: new Date(
                new Date(install_date).setHours(
                  new Date(install_date).getHours() + 404
                )
              ),
            },
          },
        },
      },
    });

    metrics.push({
      installDate: install_date.toISOString().split("T")[0],
      d1Retention: retainedD1 / installedUsers,
      d7Retention: retainedD7 / installedUsers,
      d30Retention: retainedD15 / installedUsers,
    });
  }

  return metrics;
}

export interface RetentionMetricsByCountry {
  country: string;
  d1Retention: number;
  d7Retention: number;
  d30Retention: number;
}

export async function calculateRetentionMetricsByCountry(): Promise<
  RetentionMetricsByCountry[]
> {
  const countries = await prisma.user.groupBy({
    by: ["country"],
    _count: true,
    orderBy: {
      country: "asc",
    },
  });

  const metrics: RetentionMetricsByCountry[] = [];

  for (const { country } of countries) {
    const installedUsers = await prisma.user.findMany({
      where: {
        country: {
          equals: country,
        },
      },
      select: {
        install_date: true,
        Session: {
          select: {
            session_date: true,
          },
        },
      },
    });
    if (installedUsers.length === 0) continue;
    let retainedD1 = 0;
    let retainedD7 = 0;
    let retainedD30 = 0;
    for (const user of installedUsers) {
      const d1Start = new Date(user.install_date);
      d1Start.setHours(d1Start.getHours() + 24);
      const d1End = new Date(user.install_date);
      d1End.setHours(d1End.getHours() + 48);

      const d7Start = new Date(user.install_date);
      d7Start.setHours(d7Start.getHours() + 168);
      const d7End = new Date(user.install_date);
      d7End.setHours(d7End.getHours() + 192);

      const d30Start = new Date(user.install_date);
      d30Start.setHours(d30Start.getHours() + 360);
      const d30End = new Date(user.install_date);
      d30End.setHours(d30End.getHours() + 404);

      const hasD1Session = user.Session.some((session) => {
        const sessionDate = new Date(session.session_date);
        return sessionDate >= d1Start && sessionDate < d1End;
      });

      const hasD7Session = user.Session.some((session) => {
        const sessionDate = new Date(session.session_date);
        return sessionDate >= d7Start && sessionDate < d7End;
      });

      const hasD30Session = user.Session.some((session) => {
        const sessionDate = new Date(session.session_date);
        return sessionDate >= d30Start && sessionDate < d30End;
      });

      if (hasD1Session) {
        retainedD1++;
      }
      if (hasD7Session) {
        retainedD7++;
      }
      if (hasD30Session) {
        retainedD30++;
      }
    }

    metrics.push({
      country: country || "Unknown",
      d1Retention: (retainedD1 / installedUsers.length) * 100,
      d7Retention: (retainedD7 / installedUsers.length) * 100,
      d30Retention: (retainedD30 / installedUsers.length) * 100,
    });
  }

  return metrics;
}

export interface RetentionMetricsByPlatform {
  platform: string;
  d1Retention: number;
  d7Retention: number;
  d30Retention: number;
}

// export async function calculateRetentionMetricsByPlatform(): Promise<
//   RetentionMetricsByPlatform[]
// > {
//   const platforms = await prisma.user.groupBy({
//     by: ["platform"],
//     _count: true,
//     orderBy: {
//       platform: "asc",
//     },
//   });

//   const metrics: RetentionMetricsByPlatform[] = [];

//   for (const { platform } of platforms) {
//     const installedUsers = await prisma.user.findMany({
//       where: { platform },
//       select: { user_pseudo_id: true },
//     });

//     const installedUserIds = installedUsers.map((user) => user.user_pseudo_id);

//     if (installedUserIds.length === 0) continue;

//     // Calculate retention metrics
//     const d1Retention = await calculateRetention(installedUserIds, null, 1);
//     const d7Retention = await calculateRetention(installedUserIds, null, 7);
//     const d30Retention = await calculateRetention(installedUserIds, null, 30);

//     metrics.push({
//       platform: platform || "Unknown",
//       d1Retention,
//       d7Retention,
//       d30Retention,
//     });
//   }

//   return metrics;
// }

async function calculateRetention(
  userIds: string[],
  installDate: Date,
  days: number
): Promise<number> {
  const startDate = new Date(installDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);

  const retainedUsers = await prisma.session.count({
    where: {
      user_pseudo_id: { in: userIds },
      session_date: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lt: endDate }),
      },
    },
  });

  return retainedUsers;
}
