import { BigQuery } from "@google-cloud/bigquery";

const bigQuery = new BigQuery();

export async function fetchDataFromBigQuery(query: string): Promise<any[]> {
  try {
    const [rows] = await bigQuery.query({ query });
    return rows;
  } catch (error) {
    console.error("Error fetching data from BigQuery:", error);
    throw error;
  }
}

export async function fetchUserData(): Promise<any[]> {
  const query = `
    SELECT
        user_pseudo_id,
        install_date,
        install_timestamp,
        platform,
        country
    FROM (
        SELECT
            user_pseudo_id,
            event_date AS install_date,
            (
                SELECT CAST(value.int_value AS INT64)
                FROM UNNEST(user_properties)
                WHERE key = 'first_open_time'
            ) AS install_timestamp,
            platform,
            geo.country AS country,
            ROW_NUMBER() OVER (
                PARTITION BY user_pseudo_id
                ORDER BY event_timestamp ASC
            ) AS row_num
        FROM \`wonderlink-6afca.analytics_354479876.events_*\`
        WHERE _TABLE_SUFFIX BETWEEN '20240901' AND '20241201'
          AND event_name = 'first_open'
    )
    WHERE row_num = 1
  `;

  const [rows] = await bigQuery.query({
    query,
    location: "US", // Adjust based on your dataset location
  });

  return rows;
}

export async function fetchSessionData(): Promise<any[]> {
  const query = `
      SELECT
          CAST(
              (
                  SELECT value.int_value
                  FROM UNNEST(event_params)
                  WHERE key = 'ga_session_id'
              ) AS STRING
          ) AS session_id,
          user_pseudo_id,
          event_date AS session_date,
          event_timestamp AS session_timestamp
      FROM \`wonderlink-6afca.analytics_354479876.events_*\`
      WHERE _TABLE_SUFFIX BETWEEN '20240901' AND '20241201'
        AND event_name = 'session_start'
        AND EXISTS (
            SELECT 1
            FROM UNNEST(event_params)
            WHERE key = 'ga_session_id'
        )
    `;

  const bigQuery = new BigQuery();
  const [rows] = await bigQuery.query({
    query,
    location: "US", // Adjust based on your dataset location
  });

  return rows;
}
