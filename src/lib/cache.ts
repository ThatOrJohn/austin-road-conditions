// src/lib/cache.ts
import type { SensorData, ProcessedSensorData } from "./types";
import { conditionCodeToText, celsiusToFahrenheit } from "./utils";

interface CacheEntry {
  timestamp: string;
  data: ProcessedSensorData[];
}

let cache: CacheEntry | null = null;

const getBucketTimestamp = (timestamp: string): string => {
  console.log("Getting bucket timestamp for:", timestamp);
  const date = new Date(timestamp);
  const minutes = date.getMinutes();
  const bucketMinutes = Math.floor(minutes / 15) * 15;
  date.setMinutes(bucketMinutes, 0, 0);
  return date.toISOString();
};

const processSensorData = (data: SensorData[]): ProcessedSensorData[] => {
  console.log("Raw data to process:", data);
  const latestBySensor: { [key: string]: SensorData } = {};
  for (const entry of data) {
    console.log("Processing entry:", entry);
    if (
      !latestBySensor[entry.sensor_id] ||
      new Date(entry.timestamp) >
        new Date(latestBySensor[entry.sensor_id].timestamp)
    ) {
      console.log(
        `Adding/Updating sensor_id ${entry.sensor_id} with timestamp ${entry.timestamp}`
      );
      latestBySensor[entry.sensor_id] = entry;
    }
  }
  console.log("Grouped by sensor:", latestBySensor);

  const processed = Object.values(latestBySensor).map((entry) => ({
    sensor_id: entry.sensor_id,
    location_name: entry.location_name,
    latitude: entry.location.coordinates[1],
    longitude: entry.location.coordinates[0],
    timestamp: entry.timestamp,
    air_temp_f: celsiusToFahrenheit(entry.air_temp_primary),
    surface_temp_f: celsiusToFahrenheit(entry.temp_surface),
    condition: conditionCodeToText(entry.condition_code_displayed),
    grip_text: entry.grip_text,
  }));
  console.log("Processed data:", processed);
  return processed;
};

export const getCachedSensorData = async (): Promise<ProcessedSensorData[]> => {
  console.log("Starting getCachedSensorData");
  const now = new Date();
  const currentBucket = getBucketTimestamp(now.toISOString());
  console.log("Current bucket:", currentBucket);

  if (cache && cache.timestamp === currentBucket) {
    console.log("Returning cached data:", cache.data);
    return cache.data;
  }

  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
  const timestampFilter = fifteenMinutesAgo
    .toLocaleString("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, "$3-$1-$2T$4");
  const query = `
    SELECT
      id,
      sensor_id,
      location_name,
      location,
      timestamp,
      temp_surface,
      air_temp_primary,
      condition_code_displayed,
      grip_text,
      relative_humidity
    WHERE
      dirty_lens_score NOT IN (2, 6, 8)
      AND condition_code_displayed NOT IN (15, 9, 10)
      AND (timestamp > "${timestampFilter}" :: floating_timestamp)
    ORDER BY timestamp DESC
  `;
  const encodedQuery = encodeURIComponent(query);
  const url = `https://data.austintexas.gov/resource/ypbq-i42h.json?$query=${encodedQuery}`;

  try {
    console.log("Fetching data from API:", url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }
    const data: SensorData[] = await response.json();
    console.log("Raw API response:", data);

    if (!data || data.length === 0) {
      console.warn("No data returned from API");
      return [];
    }

    const processedData = processSensorData(data);
    console.log("Processed data:", processedData);

    cache = {
      timestamp: currentBucket,
      data: processedData,
    };
    console.log("Updated cache with processed data:", cache);
    return processedData;
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return [];
  }
};
