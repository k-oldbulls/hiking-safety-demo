/**
 * The routes this static demo ships, generated from the captured data.
 *
 * Each is a real route the backend computed over swisstopo's network, with a real forecast
 * for 2026-10-31; the blurb lists what the hazard engine flagged on it that day.
 */
import type { PlaceRef } from './domain/types'

export interface DemoRoute {
  name: string
  blurbText: string
  from: PlaceRef
  to: PlaceRef
}

export const DEMO_ROUTES: DemoRoute[] = [
  {
    "name": "Grindelwald → Glecksteinhütte",
    "blurbText": "T3 · 19.6 km · ↑1 517 m — gusts, cold, daylight",
    "from": {
      "name": "Ort Grindelwald (BE) - Grindelwald",
      "latLng": [
        46.624413,
        8.029791
      ]
    },
    "to": {
      "name": "Gebaeude Glecksteinhütte SAC (BE) - Grindelwald",
      "latLng": [
        46.62529,
        8.096954
      ]
    }
  },
  {
    "name": "Oeschinensee → Blüemlisalphütte",
    "blurbText": "T2 · 10.2 km · ↑1 200 m — gusts, cold, snow, daylight",
    "from": {
      "name": "See Oeschinensee (BE) - Kandersteg",
      "latLng": [
        46.504915,
        7.729457
      ]
    },
    "to": {
      "name": "Gebaeude Blüemlisalphütte SAC (BE) - Kandersteg",
      "latLng": [
        46.509962,
        7.771555
      ]
    }
  },
  {
    "name": "Kleine Scheidegg → Männlichen",
    "blurbText": "T1 · 9.2 km · ↑221 m — cold, daylight",
    "from": {
      "name": "Ort Kleine Scheidegg (BE) - Lauterbrunnen",
      "latLng": [
        46.584853,
        7.96136
      ]
    },
    "to": {
      "name": "Männlichen (BE) - Lauterbrunnen,Grindelwald",
      "latLng": [
        46.612314,
        7.942269
      ]
    }
  },
  {
    "name": "Mürren → Schilthorn",
    "blurbText": "T2 · 14.8 km · ↑1 350 m — cold, snow, daylight",
    "from": {
      "name": "Ort Mürren (BE) - Lauterbrunnen",
      "latLng": [
        46.55933,
        7.891731
      ]
    },
    "to": {
      "name": "Hauptgipfel Schilthorn (BE) - Lauterbrunnen",
      "latLng": [
        46.557282,
        7.835296
      ]
    }
  },
  {
    "name": "First → Bachsee",
    "blurbText": "T2 · 6.1 km · ↑169 m — cold, daylight",
    "from": {
      "name": "First (BE) - Grindelwald",
      "latLng": [
        46.660102,
        8.054021
      ]
    },
    "to": {
      "name": "See Bachsee (BE) - Grindelwald",
      "latLng": [
        46.669427,
        8.023642
      ]
    }
  },
  {
    "name": "Griesalp → Rotstockhütte",
    "blurbText": "T2 · 19.9 km · ↑1 271 m — cold, snow, daylight",
    "from": {
      "name": "Ort Griesalp (BE) - Reichenbach im Kandertal",
      "latLng": [
        46.548008,
        7.762362
      ]
    },
    "to": {
      "name": "Gebaeude Rotstockhütte (BE) - Lauterbrunnen",
      "latLng": [
        46.54514,
        7.837812
      ]
    }
  }
]
