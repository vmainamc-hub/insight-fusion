import { cn } from "@/lib/utils";

export function DigitDistribution({
  frequency,
  winning,
  losing,
  last,
}: {
  frequency: number[];
  winning?: number[];
  losing?: number[];
  last?: number | null;
}) {
  const max = Math.max(10, ...frequency);
  return (
    <div className="grid grid-cols-10 gap-1.5">
      {frequency.map((pct, digit) => {
        const isWin = winning?.includes(digit);
        const isLose = losing?.includes(digit);
        return (
          <div key={digit} className="flex flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end overflow-hidden rounded-sm bg-grid">
              <div
                className={cn(
                  "w-full rounded-sm transition-[height] duration-500",
                  isLose ? "bg-standdown/70" : isWin ? "bg-execute/70" : "bg-muted-foreground/40",
                )}
                style={{ height: `${Math.max(2, (pct / max) * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">{pct.toFixed(1)}</span>
            <span
              className={cn(
                "flex h-6 w-full items-center justify-center rounded-sm font-mono text-xs",
                digit === last
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              {digit}
            </span>
          </div>
        );
      })}
    </div>
  );
}
