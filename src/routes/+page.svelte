<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import type { ProcessedSensorData } from "$lib/types";
  import { getMarkerIcon } from "$lib/utils";

  let LeafletMap: any = null;
  let TileLayer: any = null;
  let Marker: any = null;
  let Popup: any = null;
  let L: any = null;

  let sensors: ProcessedSensorData[] = [];
  let mapReady = false;

  onMount(async () => {
    if (browser) {
      try {
        const leafletModule = await import("svelte-leafletjs");
        LeafletMap = leafletModule.LeafletMap;
        TileLayer = leafletModule.TileLayer;
        Marker = leafletModule.Marker;
        Popup = leafletModule.Popup;
        L = (await import("leaflet")).default;

        const response = await fetch("/api/sensors");
        sensors = await response.json();
        mapReady = true;
      } catch (error) {
        console.error("Error loading map:", error);
      }
    }
  });

  const mapOptions = {
    center: [30.3710, -97.7259],
    zoom: 11,
  };

  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileAttribution =
    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const createIcon = (gripText: string) => {
    if (!L) return null;
    return L.divIcon({
      html: getMarkerIcon(gripText),
      className: "custom-marker",
      iconSize: [120, 20],
      iconAnchor: [60, 10],
    });
  };
</script>

<svelte:head>
  <link rel="stylesheet" href="/leaflet.css" />
</svelte:head>

<div class="container">
  <h1>Austin Real-Time Road Conditions</h1>
  {#if mapReady && LeafletMap && TileLayer && Marker && Popup && L}
    <div class="map-container">
      <svelte:component this={LeafletMap} options={mapOptions}>
        <svelte:component this={TileLayer} url={tileUrl} attribution={tileAttribution} />
        {#each sensors as sensor}
          {#if createIcon(sensor.grip_text)}
            <svelte:component
              this={Marker}
              latLng={[sensor.latitude, sensor.longitude]}
              icon={createIcon(sensor.grip_text)}
            >
              <svelte:component this={Popup}>
                <div class="popup-content">
                  <h3>{sensor.location_name}</h3>
                  <p><strong>Data as of:</strong> {new Date(sensor.timestamp).toLocaleString()}</p>
                  <p><strong>Location:</strong> {sensor.location_name}</p>
                  <p><strong>Road Grip Rating:</strong> {sensor.grip_text}</p>
                  <p><strong>Air Temp:</strong> {sensor.air_temp_f}°F</p>
                  <p><strong>Surface Temp:</strong> {sensor.surface_temp_f}°F</p>
                  <p><strong>Condition:</strong> {sensor.condition}</p>
                </div>
              </svelte:component>
            </svelte:component>
          {/if}
        {/each}
      </svelte:component>
    </div>
  {:else}
    <p>Loading map...</p>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  .map-container {
    height: 600px;
    width: 100%;
  }
  .popup-content {
    font-size: 14px;
  }
  .popup-content h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
  }
  .popup-content p {
    margin: 5px 0;
  }
  :global(.custom-marker) {
    background: none !important;
    border: none !important;
  }
</style>