import { BigQuery } from "@google-cloud/bigquery";
import dotenv from "dotenv";

dotenv.config();

const bigQuery = new BigQuery();

async function testBigQuery() {
  try {
    const [datasets] = await bigQuery.getDatasets();
    console.log("Datasets:");
    datasets.forEach((dataset) => console.log(dataset.id));
  } catch (error) {
    console.error("Error testing BigQuery:", error);
  }
}

testBigQuery();
