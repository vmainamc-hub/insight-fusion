# Insight Fusion

I'll inspect the uploads before deciding how to proceed.

The analysis engines from both projects are in place, along with the six-proposition definitions and the mapping that turns DigitPulse findings into Sentinel evidence. Next I'm wiring the combined verdict and then the live screens.

I've ported the engines and written the shared foundations, but the app doesn't compile yet.

What's done: both analysis code bases are in the project, plus the six-proposition definitions (`src/lib/propositions.ts`) and the DigitPulse-to-Sentinel evidence mapping (`src/lib/fusion/digitpulse-mapping.ts`).

The blocker: the ported code was written against looser type-checking settings, so it currently fails checks in many files — `src/lib/analytics.ts` and `src/lib/apex/*` (bars, engines, core, contracts, …) among them. The fix is to align this project's TypeScript settings with those of the uploaded project (drop the four extra strict flags: `noPropertyAccessFromIndexSignature`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`/`noImplicitReturns`), which is exactly how the original built cleanly.

Still to build: the combined verdict layer, the live screens, tests and docs.

Want me to continue in a new request — starting by aligning those settings and then building the live interface?

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6553638c-61cd-42b7-a10e-9a4f5d851cea).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
