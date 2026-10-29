"""Capture real API responses from a locally running backend into static JSON for the demo build."""
import json, sys, time, urllib.parse, urllib.request
from pathlib import Path

API = "http://127.0.0.1:8099/api"
DATE = sys.argv[1] if len(sys.argv) > 1 else "2026-10-31"
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "/tmp/hsa_capture/data")
OUT.mkdir(parents=True, exist_ok=True)

# name as the gazetteer returns it -> the search term a visitor would type
ROUTES = [
    ("Grindelwald → Glecksteinhütte", "Grindelwald", "Ort Grindelwald (BE) - Grindelwald",
     "Gleckstein", "Gebaeude Glecksteinhütte SAC (BE) - Grindelwald"),
    ("Oeschinensee → Blüemlisalphütte", "Oeschinensee", "See Oeschinensee (BE) - Kandersteg",
     "Blüemlisalphütte", "Gebaeude Blüemlisalphütte SAC (BE) - Kandersteg"),
    ("Kleine Scheidegg → Männlichen", "Kleine Scheidegg", "Ort Kleine Scheidegg (BE) - Lauterbrunnen",
     "Männlichen", "Männlichen (BE) - Lauterbrunnen,Grindelwald"),
    ("Mürren → Schilthorn", "Mürren", "Ort Mürren (BE) - Lauterbrunnen",
     "Schilthorn", "Hauptgipfel Schilthorn (BE) - Lauterbrunnen"),
    ("First → Bachsee", "First", "First (BE) - Grindelwald", "Bachsee", "See Bachsee (BE) - Grindelwald"),
    ("Griesalp → Rotstockhütte", "Griesalp", "Ort Griesalp (BE) - Reichenbach im Kandertal",
     "Rotstockhütte", "Gebaeude Rotstockhütte (BE) - Lauterbrunnen"),
]

def get(path):
    with urllib.request.urlopen(f"{API}{path}", timeout=300) as r:
        return json.load(r)

def post(path, body):
    req = urllib.request.Request(f"{API}{path}", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.load(r)

def find_place(term, want):
    results = get(f"/routes/search?q={urllib.parse.quote(term)}")
    for r in results:
        if r["name"] == want:
            return {"name": r["name"], "latLng": r["latLng"]}
    raise SystemExit(f"no exact match for {want!r} among {[r['name'] for r in results][:6]}")

places, routes, assessments, narrations, searches = {}, {}, {}, {}, {}
for label, from_term, from_name, to_term, to_name in ROUTES:
    t0 = time.time()
    a, b = find_place(from_term, from_name), find_place(to_term, to_name)
    searches.setdefault(from_term.lower(), get(f"/routes/search?q={urllib.parse.quote(from_term)}"))
    searches.setdefault(to_term.lower(), get(f"/routes/search?q={urllib.parse.quote(to_term)}"))
    route = post("/routes", {"from": a, "to": b})
    rid = route["id"]
    routes[rid] = route
    places[f"{a['name']}|{b['name']}"] = rid
    assessments[rid] = get(f"/routes/{urllib.parse.quote(rid)}/assessment?date={DATE}")
    for lang in ("en", "fr"):
        narrations[f"{rid}|{lang}"] = get(f"/routes/{urllib.parse.quote(rid)}/narration?date={DATE}&lang={lang}")
    out = assessments[rid]["outcome"]
    flagged = sum(1 for h in assessments[rid].get("hazards", []) if h.get("intervals"))
    print(f"{label:34s} {rid}  {route['grade']} {route['distanceKm']}km ↑{route['ascentM']}m  "
          f"outcome={out} hazards={flagged}  ({time.time()-t0:.1f}s)")

meta = {"capturedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "date": DATE,
        "source": "local backend over swisstopo + MeteoSwiss ICON via Open-Meteo",
        "routeOrder": [r[0] for r in ROUTES],
        "routeIds": {label: rid for (label, *_), rid in zip(ROUTES, routes)}}
for name, blob in (("routes", routes), ("assessments", assessments), ("narrations", narrations),
                   ("searches", searches), ("pairs", places), ("meta", meta)):
    (OUT / f"{name}.json").write_text(json.dumps(blob, ensure_ascii=False, separators=(",", ":")))
    print(f"wrote {name}.json ({(OUT / f'{name}.json').stat().st_size/1024:.0f} KB)")
