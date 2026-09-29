import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { DERIV_SYMBOLS, useDerivStream } from "@/hooks/useDerivStream";
import { computeCombinedVerdict, MIN_SAMPLE, type CombinedVerdict } from "@/lib/fusion/verdict";
import { VerdictCard } from "@/components/terminal/verdict-card";
import { VerdictBadge } from "@/components/terminal/verdict-badge";
import { DigitDistribution } from "@/components/terminal/digit-distribution";
import { FeedStrip } from "@/components/terminal/feed-strip";
import { lastDigit } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentinel × DigitPulse — Live Proposition Terminal" },
      {
        name: "description",
        content:
          "Live Over/Under proposition terminal fusing Sentinel decision authority with DigitPulse evidence across six canonical propositions.",
      },
      { property: "og:title", content: "Sentinel × DigitPulse — Live Proposition Terminal" },
      {
        property: "og:description",
        content:
          "Six canonical Over/Under propositions, ranked live from a shared tick stream with full evidence attribution.",
      },
    ],
  }),
  component: Terminal,
});

/** Recompute cadence — the engines are heavy, the feed is faster than the eye. */
const RECOMPUTE_MS = 1200;

function Terminal() {
  const [symbol, setSymbol] = useState("R_75");
  const [running, setRunning] = useState(false);
  const { ticks, status, error } = useDerivStream(symbol, running);

  const [verdict, setVerdict] = useState<CombinedVerdict | null>(null);
  const prevV3 = useRef<Record<string, never>>({});
  const lastRun = useRef(0);

  useEffect(() => {
    setVerdict(null);
    prevV3.current = {};
  }, [symbol]);

  useEffect(() => {
    if (!running || ticks.length < 30) return;
    const now = Date.now();
    if (now - lastRun.current < RECOMPUTE_MS) return;
    lastRun.current = now;
    setVerdict(computeCombinedVerdict(symbol, ticks, prevV3.current));
  }, [ticks, running, symbol]);

  const last = ticks.length ? lastDigit(ticks[ticks.length - 1]!.price) : null;
  const groups = useMemo(() => {
    const map = new Map<string, typeof DERIV_SYMBOLS>();
    for (const s of DERIV_SYMBOLS) map.set(s.group, [...(map.get(s.group) ?? []), s]);
    return [...map];
  }, []);
  const activeName = DERIV_SYMBOLS.find((s) => s.symbol === symbol)?.name ?? symbol;

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-primary uppercase">
              Sentinel × DigitPulse
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Live proposition terminal
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sentinel decides. DigitPulse only supplies evidence. Six Over/Under propositions,
              ranked continuously.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase",
                status === "live"
                  ? "text-execute"
                  : status === "error"
                    ? "text-standdown"
                    : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  status === "live"
                    ? "animate-pulse bg-execute"
                    : status === "error"
                      ? "bg-standdown"
                      : "bg-muted-foreground",
                )}
              />
              {status}
            </span>
            <button
              onClick={() => setRunning((v) => !v)}
              className="rounded-md bg-primary px-4 py-2 font-mono text-xs tracking-widest text-primary-foreground uppercase transition-opacity hover:opacity-90"
            >
              {running ? "Stop feed" : "Start feed"}
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-lg border border-border bg-card p-4">
            <label className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Market
            </label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-foreground"
            >
              {groups.map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <dl className="mt-4 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sample</dt>
                <dd className="text-foreground">
                  {ticks.length} / {MIN_SAMPLE} min
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Regime</dt>
                <dd className="text-foreground">{verdict?.analysis?.regime.state ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Entropy</dt>
                <dd className="text-foreground">
                  {verdict?.analysis ? verdict.analysis.entropy.toFixed(1) : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sweep</dt>
                <dd className="text-foreground">{verdict?.analysis?.sweep.side ?? "—"}</dd>
              </div>
            </dl>

            {error && <p className="mt-3 text-xs text-standdown">{error}</p>}
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {activeName} · live digits
              </h2>
              {verdict?.best && <VerdictBadge action={verdict.best.action} />}
            </div>
            <FeedStrip ticks={ticks} />
            <p className="font-mono text-sm text-foreground">
              {verdict?.headline ??
                (running ? "Collecting the canonical window…" : "Feed stopped.")}
            </p>
            <DigitDistribution
              frequency={verdict?.digitFrequency ?? new Array(10).fill(0)}
              winning={verdict?.best?.spec.winningDigits}
              losing={verdict?.best?.spec.losingDigits}
              last={last}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Six propositions — ranked
          </h2>
          {verdict ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {verdict.verdicts.map((v) => (
                <VerdictCard key={v.proposition} verdict={v} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Start the feed to rank the six propositions against live ticks.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
