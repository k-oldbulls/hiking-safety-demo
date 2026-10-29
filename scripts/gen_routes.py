"""Rewrite src/demoRoutes.generated.ts from the captured data in public/data."""
import json, pathlib, sys

data = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "public/data")
routes = json.loads((data / "routes.json").read_text())
assess = json.loads((data / "assessments.json").read_text())
meta = json.loads((data / "meta.json").read_text())
KIND = {"gusts": "gusts", "showers": "rain", "thunder": "thunder", "cold": "cold",
        "snow": "snow", "visibility": "cloud", "daylight": "daylight"}

entries = []
for label, rid in meta["routeIds"].items():
    route, assessment = routes[rid], assess[rid]
    kinds = [KIND.get(h["kind"], h["kind"]) for h in assessment.get("hazards", [])]
    ascent = f"{route[\'ascentM\']:,}".replace(",", "\u202f")
    blurb = f"{route[\'grade\']} \u00b7 {route[\'distanceKm\']} km \u00b7 \u2191{ascent} m \u2014 " + (", ".join(kinds) or "nothing flagged")
    entries.append({"name": label, "blurbText": blurb,
                    "from": {"name": route["fromName"], "latLng": route["waypoints"][0]["latLng"]},
                    "to": {"name": route["toName"], "latLng": route["waypoints"][-1]["latLng"]}})

body = ("/**\n * The routes this static demo ships, generated from the captured data.\n *\n"
        " * Each is a real route the backend computed over swisstopo\'s network, with a real forecast\n"
        f" * for {meta[\'date\']}; the blurb lists what the hazard engine flagged on it that day.\n */\n"
        "import type { PlaceRef } from \'./domain/types\'\n\n"
        "export interface DemoRoute {\n  name: string\n  blurbText: string\n  from: PlaceRef\n  to: PlaceRef\n}\n\n"
        "export const DEMO_ROUTES: DemoRoute[] = " + json.dumps(entries, ensure_ascii=False, indent=2) + "\n")
pathlib.Path("src/demoRoutes.generated.ts").write_text(body)
print(f"wrote src/demoRoutes.generated.ts with {len(entries)} routes for {meta[\'date\']}")
