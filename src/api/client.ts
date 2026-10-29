import { IS_STATIC } from '../demo'

export class ApiError extends Error {
  status: number
  /** For a 503, which source could not answer (`swisstlm3d`, `geoadmin`, …), when the body says. */
  source?: string

  constructor(status: number, message: string, source?: string) {
    super(message)
    this.status = status
    this.source = source
  }
}

/**
 * Calls the backend. In this static build there is none: `staticApi` answers from the captured
 * JSON in `public/data/`, which is what lets the app run on GitHub Pages unchanged.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (IS_STATIC) {
    const { staticApi } = await import('./staticApi')
    return staticApi<T>(path, init)
  }
  const response = await fetch(`/api${path}`, { ...init, headers: { Accept: 'application/json', ...init?.headers } })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { source?: unknown } | null
    const source = typeof body?.source === 'string' ? body.source : undefined
    throw new ApiError(response.status, `${init?.method ?? 'GET'} /api${path} failed (${response.status})`, source)
  }
  return response.json() as Promise<T>
}
