# Verification — 2026-10-16

## Completed before production release

- Next.js production build: PASS (15.5.28), first-load JavaScript 179 kB. XLSX is imported only when exporting.
- Five record-adapter checks: valid date-only handling, invalid/null dates, no created_at fallback, distinct session identities / timestamps, lab unknown and abnormal flags, malformed row rejection.
- Production-build Chromium: 390×844, 430×932, 1440×1000. All six pages, session selector, metric selector, expand/collapse, search, XLSX download, no document overflow, 48 rapid tab selections per viewport, last destination correct, no pageerror. PASS.
- Production-build Playwright WebKit: same three widths and same navigation / interaction checks, using synthetic fixtures. PASS. Linux browser libraries were staged in /tmp; no system or project runtime dependencies were changed for this.
- Reduced motion: immediate page selection, no commute overlay. PASS in both engines.
- Request resilience: reversed refresh completion, token-refresh cache retention, signout with delayed response, slow network independent of animation duration, invalid non-array payload. PASS.
- Actual 30fps reference transfer inspected frame by frame around 14.5–16.0 seconds in the referenced gameplay recording. Original application animation keyframes captured and inspected separately.
- 390px rendering, 4× CPU slowdown: rAF sampling reported 107 samples over about 2.4 seconds, median interval 16.7ms, p95 50ms, transition finished. This is a rendering-clock sample in a cloud browser, not a measured iPhone display frame rate.

## Data and authentication boundaries

Supabase was accessed read-only to inspect the existing view columns and an isolated snapshot. No schema, migrations, writes, policies or production authentication rules changed. Actual records were used only in private /tmp browser fixtures; committed tests contain synthetic records. A real user Google consent/login was not available in the cloud browser and is not claimed as tested. Cross-tab token-refresh and signout behavior used an isolated mock session.

## Known limitations

- No physical iPhone hardware test; mobile Chromium and WebKit viewports were tested.
- Real Google first-time consent, production authenticated API responses and the user's live account session require a real user session; no test-only bypass is shipped.
- Existing body/lab views do not expose batch IDs; grouping uses the actual sampling timestamp and honors IDs whenever future responses expose them. Separate sessions sharing an identical timestamp cannot be distinguished without source identifiers.
- Missing medication dates remain undated records, not an asserted current plan. Explicitly planned/unconfirmed intakes are separated from actual intake counts.
- No 60fps guarantee on physical devices; the 4× CPU p95 sample shows occasional 50ms intervals.

## Reproduce locally

Build with a test-only Supabase public configuration, start the production server, then run:

```
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=test npm run build
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=test npm start
npm test
npm run test:browser
npm run test:resilience
```

Browser scripts intercept auth and data only inside the isolated test browser. Application code has no fixture mode or login bypass. Set TEST_URL to change the server and HRT_ENGINE=webkit to run the navigation suite in installed WebKit. HRT_TEST_RECORDS can point to a private, uncommitted record snapshot. Screenshots are private /tmp artifacts, not public assets.
