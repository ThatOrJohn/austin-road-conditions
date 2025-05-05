// src/lib/types.ts
export interface Location {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface SensorData {
  id: string;
  sensor_id: string;
  location_name: string;
  location: Location;
  timestamp: string; // ISO 8601 string, e.g., "2025-05-05T13:14:34.000"
  temp_surface: string; // Celsius, e.g., "19.87"
  air_temp_primary: string; // Celsius, e.g., "19.31"
  condition_code_displayed: string; // e.g., "3"
  grip_text: string; // e.g., "FAIR"
  relative_humidity: string; // e.g., "90.36"
}

export interface ProcessedSensorData {
  sensor_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  air_temp_f: number; // Fahrenheit
  surface_temp_f: number; // Fahrenheit
  condition: string; // e.g., "Wet"
  grip_text: string;
}
