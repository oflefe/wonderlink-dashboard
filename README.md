## Prerequisites

- Docker, Docker desktop, docker compose (if applicable): this is to spin up the postgres instance. If you'd rather use your own postgres instance, then change `DATABASE_URL` in `.env` with your database connection string.
- Nodejs and npm

## Install dependencies

```bash
npm install
```

## Getting Started

Run database:

```bash
docker compose up
```

Run migrations

```
npx prisma generate
npx prisma migrate dev --name init
```

### Seeding the database / Fetching data from BigQuery

1. Download service account key from Big Query Console
   1. Go to [Google Cloud Console](https://console.cloud.google.com/welcome?hl=en&inv=1&invt=Abkp7Q&project=wonderlink-6afca)
   2. Choose `Wonderlink` as project if you have not
   3. Go to APIs & Services -> Credentials
   4. From Service Accounts click on the one that begins with "wonderlink-bigquery-viewer"
   5. Navigate to "Keys" tab -> ADD KEY -> Create New Key
   6. Select json and click create. This will download a json file with proper credentials to access BigQuery via API
   7. Rename this file to `wonderlink-bigquery-viewer.json` and copy it into the root of this project
   8. `export GOOGLE_APPLICATION_CREDENTIALS=./wonderlink-bigquery-viewer.json` or place `GOOGLE_APPLICATION_CREDENTIALS=./wonderlink-bigquery-viewer.json` in `.env`
2. Check that you can connect to BigQuery: `npx ts-node src/scripts/bigQueryConnect.ts` you should see something like.

```bash
Datasets:
analytics_354479876
firebase_crashlytics
firebase_performance
```

3. Fetch and seed the database. This will take a while since it will fetch 3 months worth of data from BigQuery and dump it in postgres.

```bash
npx ts-node prisma/seed.ts
```

Run the development server:

```bash
npm run dev
```

Navigate to localhost:3000/dashboard
