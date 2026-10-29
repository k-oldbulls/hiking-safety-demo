/**
 * Everything the static demo needs that the live app gets from a server.
 *
 * The app itself is unchanged: it still asks `/api/...` for its data. Here those calls are answered
 * from JSON captured from a running backend (see `public/data/meta.json` for when), so the whole
 * briefing — routes, forecast, hazards, the turnaround rule — is real output from the real engine
 * for one real day, rather than hand-written sample text.
 *
 * Two things are simulated, and both are stated on screen: the day is pinned to the captured date,
 * and the clock is moved to that morning so field mode has a hike in progress to show.
 */
export const IS_STATIC = import.meta.env.VITE_STATIC === '1'

/** The hike day every captured forecast belongs to. Replaced from `meta.json` at boot. */
export let SNAPSHOT_DATE = '2026-10-31'
export let CAPTURED_AT = ''

/** Field mode is shown mid-morning on the snapshot day: walking, and before the turnaround. */
const DEMO_CLOCK_HOUR = 8
const DEMO_CLOCK_MINUTE = 30

export function setSnapshot(meta: { date: string; capturedAt: string }) {
  SNAPSHOT_DATE = meta.date
  CAPTURED_AT = meta.capturedAt
}

/**
 * Moves the page's clock to the snapshot morning, keeping it ticking from there.
 *
 * Without this the demo would open "past your turnaround time" for ever, because the captured day
 * is in the past — true, but it would read as a broken app rather than as a snapshot.
 */
export function installDemoClock(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  const target = new Date(y, m - 1, d, DEMO_CLOCK_HOUR, DEMO_CLOCK_MINUTE, 0, 0).getTime()
  const offset = target - Date.now()
  if (Math.abs(offset) < 60_000) return
  const RealDate = Date
  class DemoDate extends RealDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(RealDate.now() + offset)
      else super(...(args as [number]))
    }
    static now() {
      return RealDate.now() + offset
    }
  }
  globalThis.Date = DemoDate as unknown as DateConstructor
}
