"""Rewrite src/demoRoutes.generated.ts from the captured data in public/data.

Run after `capture.py`, so the picker lists what was actually captured and each blurb says what the
hazard engine flagged on that route that day.
"""

import json
import pathlib
import sys

data = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "public/data")
routes = json.loads((data / "routes.json").read_text())
assessments = json.loads((data / "assessments.json").read_text())
meta = json.loads((data / "meta.json").read_text())

KIND = {
    "gusts": "gusts",
    "showers": "rain",
    "thunder": "thunder",
    "cold": "cold",
    "snow": "snow",
    "visibility": "cloud",
    "daylight": "daylight",
}
THIN_SPACE = " "

entries = []
for label, route_id in meta["routeIds"].items():
    route = routes[route_id]
    kinds = [KIND.get(h["kind"], h["kind"]) for h in assessments[route_id].get("hazards", [])]
    ascent = f"{route['ascentM']:,}".replace(",", THIN_SPACE)
    flagged = ", ".join(kinds) if kinds else "nothing flagged"
    entries.append(
        {
            "name": label,
            "blurbText": f"{route['grade']} · {route['distanceKm']} km · ↑{ascent} m — {flagged}",
            "from": {"name": route["fromName"], "latLng": route["waypoints"][0]["latLng"]},
            "to": {"name": route["toName"], "latLng": route["waypoints"][-1]["latLng"]},
        }
    )

header = f"""/**
 * The routes this static demo ships, generated from the captured data.
 *
 * Each is a real route the backend computed over swisstopo's network, with a real forecast
 * for {meta["date"]}; the blurb lists what the hazard engine flagged on it that day.
 */
import type {{ PlaceRef }} from './domain/types'

export interface DemoRoute {{
  name: string
  blurbText: string
  from: PlaceRef
  to: PlaceRef
}}

export const DEMO_ROUTES: DemoRoute[] = """

out = pathlib.Path("src/demoRoutes.generated.ts")
out.write_text(header + json.dumps(entries, ensure_ascii=False, indent=2) + "\n")
print(f"wrote {out} with {len(entries)} routes for {meta['date']}")

snapshot = pathlib.Path("src/demoMeta.generated.ts")
snapshot.write_text(
    "/** When the captured data is for, and when it was taken. Written by scripts/gen_routes.py. */\n"
    f"export const SNAPSHOT_DATE = '{meta['date']}'\n"
    f"export const CAPTURED_AT = '{meta['capturedAt']}'\n"
)
print(f"wrote {snapshot}: {meta['date']}, captured {meta['capturedAt'][:10]}")
