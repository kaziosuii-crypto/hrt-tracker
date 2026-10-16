# Verification — 2026-10-16

## Current direct-menu revision

The train has been removed from navigation and login resource loading. See DIRECT_MENU_MOTION.md for actual gameplay-frame evidence and the current 1800ms character / patterned field / information-plane handoff. The covered React view swap is at 460ms; data controls are inert until the composition settles. Three new original generated character layers total 224,150 bytes; the original baked pattern adds 118,150 bytes. Current production build first-load JavaScript is 202kB. No data/API/schema/authentication implementation changed.

Final 4× CPU Chromium rAF samples (3.2 seconds): 390px 185 frames, median 16.7ms, p95 16.8ms, three intervals over34ms, long tasks 57/53ms; 1920px 166 frames, median 16.7ms, p95 33.4ms, seven intervals over34ms, long task57ms. Replacing the moving SVG pattern with a baked bitmap reduced the observed desktop p95 from49.9ms to33.4ms in sequential samples. This is a cloud rendering-clock measurement, not a physical-device or uninterrupted-60fps claim.

Current checks: record regression, production build, slow-network/stale-response/session-refresh/signout resilience, covered handoff/inert release/cancel-on-signout, rapid disclosure reversals and private-record contrast/number separation at390/1920 all pass. Six complete pages were visually inspected at1920 and390 with no document overflow or client exceptions. Original gameplay reference and choreography keyframes were inspected separately; reference assets are never shipped. Chromium and WebKit full suites pass at 390×844, 430×932 and 1440×1000: six pages, actual session controls, expansion, search/export, 48 rapid selections per viewport and reduced motion; zero client exceptions or obsolete train requests. All five critical images pass one-year immutable caching and zero-byte repeat transfers. Phone artwork clipping was tightened after screenshot review so the static figure ends in the title area rather than overlapping session controls.

## Previous release validation

- Next.js 15.5.28 production build PASS. First-load JavaScript 201 kB; XLSX remains loaded only on export.
- Record-adapter regression PASS. No data-layer/API/schema/authentication changes in this revision.
- Chromium and Playwright WebKit: 390×844, 430×932 and 1440×1000; all six pages, body sessions/metric selection, expand/collapse, search, XLSX export, no document overflow, 48 rapid selections per viewport, last intended destination retained, zero pageerror. PASS with native WAAPI train and page motion. Reduced motion PASS in both engines.
- Readability checks at 390 and 1920px using the private real-record snapshot: nonnegative numeric spacing and visible lab/daily/intake text contrast at least 4.5:1. PASS. Full-page screenshots inspected for all six pages at desktop and phone widths. Fixed inherited dark text on dark lab backgrounds and long non-clock time notes squeezing into narrow columns during review.
- Disclosure stress: seven reversals 45ms apart, nested source details, animated unmount: PASS.
- Resilience: reversed refresh responses, same-user token refresh cache retention, signout with delayed response, slow API independent of transit, invalid response shape: PASS.
- Exact choreography screenshots at 450, 700, 1000, 1420, 1700, 2100, 2500, 2800 and 3200ms. Playwright drives JS timing and aligns native WAAPI clocks separately. Phone and 1920px screenshots inspected; the 1420ms swap remains fully covered.
- Versioned asset cache: one-year immutable response headers, repeated asset transferSize 0 bytes in a context without request interception. For this managed proxy, use HRT_CACHE_SPKI to trust the public proxy certificate key; the blanket ignore-certificate-errors flag disables the intended Chromium HTTPS cache behavior.

## Comparative performance

Production-build Chromium, CDP CPU throttling 4×. Approximately 3.2-second rAF sampling window; one warm-up before selection. These are cloud rendering-clock samples, not measured physical display frame rates.

| Width | Before frames | After frames | Before p95 | After p95 | Before intervals >34ms | After intervals >34ms |
| ----- | ------------: | -----------: | ---------: | --------: | ---------------------: | --------------------: |
| 390   |           176 |          188 |     33.4ms |    16.8ms |                      2 |                     2 |
| 1920  |            70 |          136 |    116.7ms |    49.9ms |                     25 |                     7 |

Median interval was approximately 16.7ms in all four samples. The final mobile sample had no observed long tasks; desktop had two (60ms and 55ms). A controlled full-mask ablation and an earlier optimized sample reached desktop p95 33.3–33.4ms; final native-motion sample was 49.9ms, so this release does not claim uninterrupted 60fps. The native compositor can continue transform animation while the main thread handles a view commit; rAF sampling alone does not measure those compositor frames.

The alpha threshold and train color correction are baked into versioned WebPs; full-scene filtering/masking is replaced by two narrow edge strips. See MOTION_DIRECTION_V3.md for reference evidence, timings and asset provenance.

## Data and authentication boundaries

Real records are only private /tmp browser fixtures for visual review. Committed fixtures are synthetic. All UI tests intercept auth/data inside the isolated browser; application code ships no fixture mode or bypass. No Supabase schema, migration, writes, policy or production authentication changes. No medical imagery, predicted body shape, fabricated dates or inferred medication periods.

## Known limits

- No physical iPhone or user's desktop test; Chromium and WebKit viewports were tested.
- Real first-time Google consent and production authenticated API responses require the user's real session and are not claimed as tested.
- Body/lab views without batch IDs retain the existing actual timestamp grouping; identical timestamps cannot resolve distinct source sessions without identifiers.
- Missing medication dates remain undated. Planned/unconfirmed intake events remain excluded from actual meal/event counts.
- Occasional slow frames remain in the cloud CPU-throttled measurements; no device-wide frame-rate guarantee.

## Reproduce

Build with a Supabase public configuration and start a production server. Set TEST_URL and, for a project other than the test project, HRT_AUTH_STORAGE to its public auth storage key. Run npm test, tests/browser.cjs, tests/resilience.cjs, tests/disclosure.cjs, tests/readability.cjs, tests/visual.cjs, tests/assets-cache.cjs and tests/motion-profile.cjs. HRT_ENGINE=webkit selects installed WebKit; HRT_TEST_RECORDS can reference an uncommitted private snapshot. Screenshots remain private /tmp artifacts.
