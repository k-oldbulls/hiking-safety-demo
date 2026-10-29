import { CAPTURED_AT, SNAPSHOT_DATE } from '../demo'

const DAY = { weekday: 'short', day: 'numeric', month: 'short' } as const

function day(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y) return iso
  return new Intl.DateTimeFormat('en-GB', DAY).format(new Date(y, m - 1, d))
}

/**
 * Says what this build is, on every screen.
 *
 * A safety tool that quietly showed a week-old forecast as today's would be the exact failure the
 * app is built to avoid, so the snapshot is named where it cannot be missed: the day the briefing
 * is for, and the day its forecast was taken.
 */
export function DemoBanner({ dark }: { dark: boolean }) {
  const captured = CAPTURED_AT ? day(CAPTURED_AT.slice(0, 10)) : ''
  return (
    <div
      className={`flex items-baseline justify-center gap-1.5 px-3 py-1.5 text-center text-[11px] leading-tight ${
        dark ? 'bg-black/40 text-white/70' : 'bg-ink/5 text-muted'
      }`}
    >
      <span className="font-semibold tracking-wide uppercase">Demo</span>
      <span>
        real briefing for {day(SNAPSHOT_DATE)}, captured {captured} — not live
      </span>
    </div>
  )
}
