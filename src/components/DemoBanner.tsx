import { CAPTURED_LABEL, SNAPSHOT_LABEL } from '../demoMeta.generated'

/**
 * Says what this build is, on every screen.
 *
 * A safety tool that quietly showed a week-old forecast as today's would be the exact failure the
 * app is built to avoid, so the snapshot is named where it cannot be missed: the day the briefing
 * is for, and the day its forecast was taken. Both labels are written at build time, so this
 * renders the same on first paint as it does later, and owes nothing to the demo clock.
 */
export function DemoBanner({ dark }: { dark: boolean }) {
  return (
    <div
      className={`flex items-baseline justify-center gap-1.5 px-3 py-1.5 text-center text-[11px] leading-tight ${
        dark ? 'bg-black/40 text-white/70' : 'bg-ink/5 text-muted'
      }`}
    >
      <span className="font-semibold tracking-wide uppercase">Demo</span>
      <span>
        real briefing for {SNAPSHOT_LABEL}, captured {CAPTURED_LABEL} — not live
      </span>
    </div>
  )
}
