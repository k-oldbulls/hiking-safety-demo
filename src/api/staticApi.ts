/**
 * The backend, as a file.
 *
 * Answers the same endpoints `client.ts` would call over HTTP, from the JSON in `public/data/`.
 * Every payload is a real response captured from a running backend; nothing here computes a hazard
 * or invents a figure. What the browser still does for itself is what it does in the live app too:
 * resolving each hazard's severity at the hour you arrive, which is why moving the start time
 * re-colours the route with no request at all.
 */
import type { Answer, AssessmentData, Narration, PlaceResult, Route, RouteRequest } from '../domain/types'
import { setSnapshot } from '../demo'
import { ApiError } from './client'

interface Bundle {
  routes: Record<string, Route>
  assessments: Record<string, AssessmentData>
  narrations: Record<string, Narration>
  searches: Record<string, PlaceResult[]>
  pairs: Record<string, string>
  meta: { date: string; capturedAt: string; routeIds: Record<string, string> }
}

let bundle: Promise<Bundle> | null = null

function load(): Promise<Bundle> {
  if (bundle) return bundle
  const base = import.meta.env.BASE_URL
  const file = <T,>(name: string): Promise<T> =>
    fetch(`${base}data/${name}.json`).then((response) => {
      if (!response.ok) throw new ApiError(response.status, `demo data ${name}.json is missing`)
      return response.json() as Promise<T>
    })
  bundle = Promise.all([
    file<Bundle['routes']>('routes'),
    file<Bundle['assessments']>('assessments'),
    file<Bundle['narrations']>('narrations'),
    file<Bundle['searches']>('searches'),
    file<Bundle['pairs']>('pairs'),
    file<Bundle['meta']>('meta'),
  ]).then(([routes, assessments, narrations, searches, pairs, meta]) => {
    setSnapshot(meta)
    return { routes, assessments, narrations, searches, pairs, meta }
  })
  return bundle
}

/** Searches the captured gazetteer answers, then the ends of every captured route. */
function search(data: Bundle, query: string): PlaceResult[] {
  const needle = query.trim().toLocaleLowerCase()
  if (needle.length < 2) return []
  const captured = data.searches[needle]
  if (captured) return captured
  const prefix = Object.entries(data.searches).find(([term]) => term.startsWith(needle) || needle.startsWith(term))
  const pool: PlaceResult[] = prefix ? prefix[1] : []
  const ends = Object.values(data.routes).flatMap((route) => {
    const first = route.waypoints[0]
    const last = route.waypoints[route.waypoints.length - 1]
    const out: PlaceResult[] = []
    if (first) out.push({ name: route.fromName, latLng: first.latLng, rank: 9 })
    if (last) out.push({ name: route.toName, latLng: last.latLng, rank: 9 })
    return out
  })
  const seen = new Set<string>()
  return [...pool, ...ends]
    .filter((place) => place.name.toLocaleLowerCase().includes(needle))
    .filter((place) => (seen.has(place.name) ? false : (seen.add(place.name), true)))
    .slice(0, 12)
    .map((place, rank) => ({ ...place, rank }))
}

const UNROUTABLE =
  'This demo ships six captured routes. Routing any other pair needs the backend and its trail graph.'

export async function staticApi<T>(path: string, init?: RequestInit): Promise<T> {
  const data = await load()
  const [route, query] = path.split('?')
  const params = new URLSearchParams(query ?? '')
  const method = init?.method ?? 'GET'

  if (route === '/routes/search') return search(data, params.get('q') ?? '') as T

  if (route === '/routes' && method === 'POST') {
    const body = JSON.parse(String(init?.body ?? '{}')) as RouteRequest
    const id = data.pairs[`${body.from?.name}|${body.to?.name}`]
    if (!id) throw new ApiError(503, UNROUTABLE, 'demo')
    return data.routes[id] as T
  }

  if (route === '/forecast/retry' && method === 'POST') {
    return { available: true, checkedAt: 8 * 60 + 30 } as T
  }

  const match = route.match(/^\/routes\/([^/]+)(\/\w+)?$/)
  if (match) {
    const id = decodeURIComponent(match[1])
    const found = data.routes[id]
    if (!found) throw new ApiError(404, 'That route is not in this demo', 'demo')
    switch (match[2]) {
      case undefined:
        return found as T
      case '/assessment':
        // One day was captured, so every date answers with it; the picker is pinned to that day.
        return data.assessments[id] as T
      case '/narration': {
        const lang = params.get('lang') === 'fr' ? 'fr' : 'en'
        return data.narrations[`${id}|${lang}`] as T
      }
      case '/ask': {
        const answer: Answer = { enabled: false, reason: 'disabled', citations: [] }
        return answer as T
      }
    }
  }
  throw new ApiError(404, `No demo data for ${method} ${path}`, 'demo')
}

/** The captured routes, in capture order, for the picker's suggestions. */
export async function demoRoutes(): Promise<{ id: string; label: string; route: Route }[]> {
  const data = await load()
  return Object.entries(data.meta.routeIds)
    .filter(([, id]) => data.routes[id])
    .map(([label, id]) => ({ id, label, route: data.routes[id] }))
}
