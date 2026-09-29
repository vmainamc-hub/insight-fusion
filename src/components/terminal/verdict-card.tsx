import { useState } from "react";
import type { PropositionVerdict } from "@/lib/fusion/verdict";
import { VerdictBadge } from "./verdict-badge";
import { cn } from "@/lib/utils";

function Meter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-grid">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", tone)}
          style={{ width: `${Math.max(1, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function VerdictCard({ verdict }: { verdict: PropositionVerdict }) {
  const [open, setOpen] = useState(false);
  const { spec, digitpulse, fusion } = verdict;

  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        verdict.action === "EXECUTE"
          ? "border-execute/50"
          : verdict.action === "PREPARE"
            ? "border-prepare/40"
            : "border-border",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-mono text-base tracking-wide text-foreground">{spec.label}</h3>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            wins {spec.winningDigits.join("")} · loses {spec.losingDigits.join("")} ·{" "}
            {(spec.theoreticalProbability * 100).toFixed(0)}% base
            {spec.primaryPreference ? " · preferred" : ""}
          </p>
        </div>
        <div className="text-right">
          <VerdictBadge action={verdict.action} />
          <p className="mt-1 font-mono text-2xl leading-none text-foreground">{verdict.score}</p>
        </div>
      </header>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Meter label="Conviction" value={verdict.score} tone="bg-primary" />
        <Meter label="Danger" value={verdict.danger} tone="bg-standdown" />
        <Meter label="Independence" value={verdict.independence} tone="bg-observe" />
      </div>

      <p className="mt-3 font-mono text-[11px] text-muted-foreground">
        {fusion.consensus.replace("_", " ").toLowerCase()} · {digitpulse.supporting.length} for /{" "}
        {digitpulse.opposing.length} against · lifecycle {verdict.lifecycle ?? "unknown"}
      </p>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 font-mono text-[11px] tracking-wider text-primary uppercase hover:underline"
      >
        {open ? "Hide evidence" : "Show evidence"}
      </button>

      {open && (
        <div className="mt-3 space-y-4 border-t border-border pt-3">
          <section>
            <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Why
            </h4>
            <ul className="mt-1.5 space-y-1 text-xs text-foreground/90">
              {verdict.reasons.map((r, i) => (
                <li key={i}>· {r}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Engine attribution
            </h4>
            <ul className="mt-1.5 space-y-1 font-mono text-[11px]">
              {fusion.attributions.map((a) => (
                <li key={a.source} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{a.label}</span>
                  <span
                    className={
                      a.pointsContributed >= 0 ? "text-execute" : "text-standdown"
                    }
                  >
                    {a.pointsContributed >= 0 ? "+" : ""}
                    {a.pointsContributed.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Invalidated if
            </h4>
            <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
              {verdict.invalidations.map((c, i) => (
                <li key={i}>· {c}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </article>
  );
}
