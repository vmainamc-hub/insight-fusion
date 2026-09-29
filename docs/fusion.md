# Sentinel × DigitPulse — unified pipeline

## Authority

Sentinel is the only decision authority. DigitPulse never produces a competing
verdict: each of its engines is mapped into the Sentinel evidence dimension it
genuinely speaks to, and Sentinel's fusion weights decide what that evidence is
worth.

## Layers

1. **Canonical tick stream** — `src/lib/deriv/tick-bus.ts` feeds one shared
   history per market; `useDerivStream` exposes it to the UI.
2. **Propositions** — `src/lib/propositions.ts` defines the six and only six
   Over/Under propositions (Over 1/2/3, Under 6/7/8) with their winning, losing,
   boundary and danger digits, entry characteristics and invalidation
   conditions. No parity (even/odd) exists anywhere in this application.
3. **DigitPulse analysis** — `src/lib/liquidity/engine.ts` (`analyzeMarket`)
   computes reservoir, exhaustion, delivery, migration, absorption, regime,
   sweep, entropy and lifecycle on that same history.
4. **Evidence mapping** — `src/lib/fusion/digitpulse-mapping.ts` turns each
   DigitPulse engine reading into a stance (supporting / opposing / neutral)
   inside one Sentinel dimension: psychology, pressure, liquidity, danger,
   confirmation, regime or engine agreement.
5. **Combined verdict** — `src/lib/fusion/verdict.ts` collapses the mapped
   readings into one input per dimension, runs Sentinel's correlation-aware
   `fuseEvidence`, and produces a ranked verdict per proposition.
6. **Live screens** — `src/routes/index.tsx` renders the terminal: market
   selector, feed, digit distribution, and the six ranked proposition cards with
   full evidence attribution.

## Verdict rules

| Action | Condition |
| --- | --- |
| `STAND_DOWN` | sample below `MIN_SAMPLE` (120), any DigitPulse veto, danger ≥ 60, or engine consensus in conflict |
| `EXECUTE` | score ≥ 72, DigitPulse confirmed **and** ripe, danger < 40 |
| `PREPARE` | score ≥ 60 |
| `OBSERVE` | anything else with a valid sample |

Score starts from the redundancy-adjusted fusion score plus its bounded ranking
delta, adds small confirmation/ripeness and preferred-profile bonuses, then
subtracts a quarter of the observed danger and eight points per veto. Because
the score derives from the *effective* fusion score, five engines reading the
same tick stream cannot inflate conviction beyond their real independence.

## Type-checking

The ported engines were authored without `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`,
`noImplicitOverride` and `noImplicitReturns`. `tsconfig.json` drops those five
flags; `strict` itself remains on.

## Tests

`src/lib/fusion/verdict.test.ts` covers the published mapping table, the
empty-evidence path, sample gating, ranking order, score bounds and veto
behaviour. Run with `bunx vitest run`.
