import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface RetentionMetricsByDate {
  installDate: string;
  d1Retention: number;
  d7Retention: number;
  d30Retention: number;
}

export async function calculateOverallRetention(filters: {
  country?: string;
  platform?: string;
  installDateStart?: string;
  installDateEnd?: string;
}) {
  const { country, platform, installDateStart, installDateEnd } = filters;
  const allUsers = await prisma.user.findMany({
    where: {
      country: {
        equals: country,
        mode: "insensitive",
      },
      platform,
      ...(installDateStart && {
        install_date: {
          gte: new Date(installDateStart),
        },
      }),
      ...(installDateEnd && {
        install_date: {
          lte: new Date(installDateEnd),
        },
      }),
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
  let retainedD1 = 0;
  let retainedD7 = 0;
  let retainedD30 = 0;
  for (const user of allUsers) {
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

  return {
    allUsers,
    d1Retention: (retainedD1 / allUsers.length) * 100,
    d7Retention: (retainedD7 / allUsers.length) * 100,
    d30Retention: (retainedD30 / allUsers.length) * 100,
  };
}

export async function calculateRetentionMetricsByInstallDate(filters?: {
  platform?: string;
  country?: string;
}): Promise<RetentionMetricsByDate[]> {
  let userFilters: any = {};
  if (filters?.country) {
    userFilters.country.contains = filters.country;
  }
  if (filters?.platform) {
    userFilters.platform.contains = filters.platform;
  }

  const installDates = await prisma.user.groupBy({
    by: ["install_date"],
    _count: true,
    where: userFilters,
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
                  new Date(install_date).getHours() + 720
                )
              ),
              lt: new Date(
                new Date(install_date).setHours(
                  new Date(install_date).getHours() + 744
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

export async function calculateRetentionMetricsByPlatform(): Promise<
  RetentionMetricsByPlatform[]
> {
  const platforms = await prisma.user.groupBy({
    by: ["platform"],
    _count: true,
    orderBy: {
      platform: "asc",
    },
  });

  const metrics: RetentionMetricsByPlatform[] = [];

  for (const { platform } of platforms) {
    const installedUsers = await prisma.user.findMany({
      where: { platform },
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

    let d1Retention = 0;
    let d7Retention = 0;
    let d30Retention = 0;
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
        d1Retention++;
      }
      if (hasD7Session) {
        d7Retention++;
      }
      if (hasD30Session) {
        d30Retention++;
      }
    }

    metrics.push({
      platform: platform || "Unknown",
      d1Retention: d1Retention / installedUsers.length,
      d7Retention: d7Retention / installedUsers.length,
      d30Retention: d30Retention / installedUsers.length,
    });
  }

  return metrics;
}
