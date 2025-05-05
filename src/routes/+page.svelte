<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import type { ProcessedSensorData } from "$lib/types";
  import { getMarkerIcon } from "$lib/utils";
  import { writable } from "svelte/store";

  let LeafletMap: any = null;
  let TileLayer: any = null;
  let Marker: any = null;
  let Popup: any = null;
  let L: any = null;

  let sensors: ProcessedSensorData[] = [];
  let mapReady = false;
  let loading = true;
  let infoExpanded = false;

  // Theme store, default to dark
  const theme = writable<"light" | "dark">("dark");
  let isDarkMode = true;
  theme.subscribe((value) => {
    isDarkMode = value === "dark";
  });

  // Toggle theme
  const toggleTheme = () => {
    theme.update((current) => (current === "light" ? "dark" : "light"));
  };

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
      } finally {
        loading = false;
      }
    }
  });

  const mapOptions = {
    center: [30.3710, -97.7259], // Updated center
    zoom: 11,
  };

  // Switch tile URL based on theme
  $: tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution = isDarkMode
    ? '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>'
    : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const createIcon = (gripText: string) => {
    if (!L) return null;
    return L.divIcon({
      html: getMarkerIcon(gripText, isDarkMode),
      className: "custom-marker",
      iconSize: [120, 20],
      iconAnchor: [60, 10],
    });
  };
</script>

<svelte:head>
  <link rel="stylesheet" href="/leaflet.css" />
</svelte:head>

<div class="container" class:dark={isDarkMode}>
  <h1>Austin Real-Time Road Conditions</h1>
  <button class="theme-toggle" on:click={toggleTheme}>
    {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
  </button>
  {#if loading}
    <div class="spinner-container">
      <div class="spinner"></div>
      <p>Loading map...</p>
    </div>
  {:else if mapReady && LeafletMap && TileLayer && Marker && Popup && L}
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
    <p>Failed to load map.</p>
  {/if}
  <div class="info-panel">
    <button class="info-toggle" on:click={() => (infoExpanded = !infoExpanded)}>
      {infoExpanded ? "Hide Info" : "Show Info"}
    </button>
    {#if infoExpanded}
      <div class="info-content">
        <h2>About the Data</h2>
        <p>
          This application displays real-time road condition data from sensors maintained by the City of Austin. The data includes road grip ratings, surface and air temperatures, and road conditions, sourced from the
          <a href="https://data.austintexas.gov/" target="_blank">City of Austin Open Data Portal</a>.
        </p>
        <p>
          The map updates every 15 minutes to show the latest sensor readings, with markers color-coded by grip rating: green for "GOOD", yellow for "FAIR", and red for "POOR".
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  :root {
    --bg-color: #fff;
    --text-color: #333;
    --popup-bg: #fff;
    --popup-text: #333;
    --button-bg: #007bff;
    --button-text: #fff;
    --info-bg: #f8f9fa;
  }

  .dark {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --popup-bg: #333;
    --popup-text: #e0e0e0;
    --button-bg: #0056b3;
    --info-bg: #2a2a2a;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background: var(--bg-color);
    color: var(--text-color);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1 {
    text-align: center;
    margin-bottom: 20px;
  }

  .theme-toggle {
    align-self: flex-end;
    padding: 8px 16px;
    background: var(--button-bg);
    color: var(--button-text);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 10px;
  }

  .map-container {
    height: 600px;
    width: 100%;
    flex-grow: 1;
  }

  .spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #ccc;
    border-top: 4px solid var(--button-bg);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .popup-content {
    font-size: 14px;
    background: var(--popup-bg);
    color: var(--popup-text);
  }

  .popup-content h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
  }

  .popup-content p {
    margin: 5px 0;
  }

  .info-panel {
    margin-top: 20px;
    background: var(--info-bg);
    padding: 10px;
    border-radius: 4px;
  }

  .info-toggle {
    background: var(--button-bg);
    color: var(--button-text);
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    text-align: center;
  }

  .info-content {
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .info-content a {
    color: var(--button-bg);
    text-decoration: underline;
  }

  :global(.custom-marker) {
    background: none !important;
    border: none !important;
  }

  :global(.leaflet-marker-icon) {
    background: none !important;
    border: none !important;
  }

  :global(.leaflet-marker-shadow) {
    display: none !important;
  }
</style>