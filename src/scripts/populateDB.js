const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function loadCSV(filePath) {
  const data = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
      .on('error', (err) => reject(err));
  });
}

async function main() {
  // Import user_table data
  const userTableData = await loadCSV('./user_table.csv');
  await prisma.userTable.createMany({
    data: userTableData.map((row) => ({
      user_pseudo_id: row.user_pseudo_id,
      install_date: new Date(row.install_date),
      install_timestamp: BigInt(row.install_timestamp),
      platform: row.platform,
      country: row.country,
    })),
  });

  // Import session_table data
  const sessionTableData = await loadCSV('./session_table.csv');
  await prisma.sessionTable.createMany({
    data: sessionTableData.map((row) => ({
      session_id: row.session_id,
      user_pseudo_id: row.user_pseudo_id,
      session_date: new Date(row.session_date),
      session_timestamp: BigInt(row.session_timestamp),
    })),
  });

  console.log('Data imported successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
