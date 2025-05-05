# Austin Real-Time Road Conditions Map

A SvelteKit application displaying real-time road condition data from Austin's open data API, visualized on a Leaflet map. Markers show road grip ratings ("GOOD", "FAIR", "POOR") with color-coded dots and labels.

## Features

- Fetches data from Austin's road condition sensors API.
- Displays sensors on a Leaflet map with custom markers.
- Caches data in 15-minute buckets for performance.
- Handles Central Time timezone for accurate filtering.
- Uses custom `divIcon` markers to avoid default Leaflet marker images.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ThatOrJohn/austin-road-conditions.git
   cd austin-road-conditions
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

## Dependencies

- SvelteKit
- Leaflet
- svelte-leafletjs

## Data Source

The City of Austin's [Real-Time Road Conditions](https://data.austintexas.gov/Transportation-and-Mobility/Real-Time-Road-Conditions/ypbq-i42h/about_data). This contains data from a handful of IceSight 5433 sensors deployed around the city.
