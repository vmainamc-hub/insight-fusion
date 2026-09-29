import type { Tick } from "@/lib/analytics";
import { lastDigit } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function FeedStrip({ ticks }: { ticks: Tick[] }) {
  const recent = ticks.slice(-40);
  return (
    <div className="flex gap-1 overflow-hidden">
      {recent.map((t, i) => {
        const d = lastDigit(t.price);
        return (
          <span
            key={`${t.t}-${i}`}
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm font-mono text-xs",
              i === recent.length - 1
                ? "bg-primary text-primary-foreground"
                : d >= 5
                  ? "bg-secondary text-foreground"
                  : "bg-grid text-muted-foreground",
            )}
          >
            {d}
          </span>
        );
      })}
      {!recent.length && (
        <span className="font-mono text-xs text-muted-foreground">Waiting for ticks…</span>
      )}
    </div>
  );
}
