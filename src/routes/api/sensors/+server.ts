// src/routes/api/sensors/+server.ts
import { json } from "@sveltejs/kit";
import { getCachedSensorData } from "$lib/cache";

export const GET = async () => {
  console.log("Handling /api/sensors request");
  const data = await getCachedSensorData();
  console.log("API /sensors returning data:", data);
  if (!data || data.length === 0) {
    console.warn("Warning: No sensor data returned from getCachedSensorData");
  }
  return json(data);
};
