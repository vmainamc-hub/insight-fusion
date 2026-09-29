import { describe, expect, it } from "vitest";
import { computeCombinedVerdict, MIN_SAMPLE, buildEngineInputs } from "@/lib/fusion/verdict";
import {
  DIGITPULSE_DIMENSION_MAP,
  emptyDigitPulseEvidence,
  mapDigitPulseEvidence,
} from "@/lib/fusion/digitpulse-mapping";
import { PROPOSITIONS } from "@/lib/propositions";
import type { Tick } from "@/lib/analytics";

function synthetic(count: number, digits: number[]): Tick[] {
  const out: Tick[] = [];
  for (let i = 0; i < count; i++) {
    const d = digits[i % digits.length]!;
    out.push({ t: 1_700_000_000 + i, price: 1000 + d / 100 });
  }
  return out;
}

describe("digitpulse mapping", () => {
  it("maps every published engine to a Sentinel dimension", () => {
    for (const [engine, dimension] of Object.entries(DIGITPULSE_DIMENSION_MAP)) {
      expect(dimension, engine).toBeTruthy();
    }
  });

  it("returns unavailable evidence when no analysis exists", () => {
    const e = mapDigitPulseEvidence("R_75", "OVER2", null, null);
    expect(e.available).toBe(false);
    expect(e.strength).toBe(0);
    expect(buildEngineInputs(e)).toHaveLength(0);
  });

  it("empty evidence is neutral for every proposition", () => {
    for (const p of PROPOSITIONS) {
      const e = emptyDigitPulseEvidence("R_75", p);
      expect(e.side).toBe("NONE");
      expect(e.confirmed).toBe(false);
    }
  });
});

describe("combined verdict", () => {
  it("stands down on every proposition below the minimum sample", () => {
    const v = computeCombinedVerdict("R_75", synthetic(40, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
    expect(v.ready).toBe(false);
    expect(v.verdicts).toHaveLength(6);
    expect(v.verdicts.every((x) => x.action === "STAND_DOWN")).toBe(true);
    expect(v.best).toBeNull();
  });

  it("produces one ranked verdict per canonical proposition on a full window", () => {
    const v = computeCombinedVerdict("R_75", synthetic(MIN_SAMPLE * 3, [3, 7, 5, 9, 4, 8, 6, 5, 7, 9]));
    expect(v.sample).toBeGreaterThanOrEqual(MIN_SAMPLE);
    expect(v.verdicts.map((x) => x.proposition).sort()).toEqual([...PROPOSITIONS].sort());
    for (let i = 1; i < v.verdicts.length; i++) {
      expect(v.verdicts[i - 1]!.score).toBeGreaterThanOrEqual(v.verdicts[i]!.score);
    }
  });

  it("never emits a score outside 0..100 and always explains itself", () => {
    const v = computeCombinedVerdict("R_100", synthetic(400, [1, 2, 8, 9, 4, 6, 0, 7, 3, 5]));
    for (const x of v.verdicts) {
      expect(x.score).toBeGreaterThanOrEqual(0);
      expect(x.score).toBeLessThanOrEqual(100);
      expect(x.danger).toBeGreaterThanOrEqual(0);
      expect(x.reasons.length).toBeGreaterThan(0);
      expect(x.invalidations.length).toBeGreaterThan(0);
    }
  });

  it("stands down whenever a DigitPulse veto is present", () => {
    const v = computeCombinedVerdict("R_50", synthetic(400, [0, 0, 1, 1, 2, 2, 0, 1, 2, 0]));
    for (const x of v.verdicts) {
      if (x.vetoes.length) expect(x.action).toBe("STAND_DOWN");
    }
  });
});
