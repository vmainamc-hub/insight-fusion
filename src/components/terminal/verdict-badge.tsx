import type { VerdictAction } from "@/lib/fusion/verdict";
import { cn } from "@/lib/utils";

const STYLES: Record<VerdictAction, string> = {
  EXECUTE: "border-execute/50 bg-execute/15 text-execute",
  PREPARE: "border-prepare/50 bg-prepare/15 text-prepare",
  OBSERVE: "border-observe/40 bg-observe/10 text-observe",
  STAND_DOWN: "border-standdown/40 bg-standdown/10 text-standdown",
};

const LABELS: Record<VerdictAction, string> = {
  EXECUTE: "Execute",
  PREPARE: "Prepare",
  OBSERVE: "Observe",
  STAND_DOWN: "Stand down",
};

export function VerdictBadge({
  action,
  className,
}: {
  action: VerdictAction;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-widest uppercase",
        STYLES[action],
        className,
      )}
    >
      {LABELS[action]}
    </span>
  );
}
