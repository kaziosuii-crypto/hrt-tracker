# Asset direction and user requirements

- Every future image generation MUST include actual reference images, with explicit instructions describing what to reference and what must remain original.
- Use a detailed production specification of at least 4,000 Chinese characters for new scene production. The carriage specification used here is 5,835 characters before the reference-image instructions.
- The commute setting is INSIDE a train: overhead straps, opposite windows, bench seats, standing passengers. Platform/exterior generations were rejected and must not be shipped or reused.
- Flat black/white/red graphic shapes; earlier realistic / sepia illustrations were rejected.
- Wordmark images are clickable navigation controls with their own press/selection motion, with NO surrounding tab card, background tile, or decorative outer frame. They are not large page headings.
- Actual health data uses readable text, stable alignment, source and uncertainty disclosure.
- Check composition in 390×844 and 430×932 portrait viewports and inspect animation frames around the covered commit before accepting an asset.

## Shipped assets

All are original generated assets, compressed/cropped with Sharp, not copied game assets.

| File                        | Purpose                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| carriage.webp               | Train interior, generated with the 5,835-character specification plus actual commute and menu reference images |
| carriage-mobile.webp        | Dedicated central portrait crop preserving overhead strap and interior window                                  |
| passengers-far.webp         | Original standing crowd, darker distant layer                                                                  |
| passengers-mid.webp         | Different central standing group, opaque middle layer                                                          |
| passengers-near.webp        | Independent close commuter crop, no duplicate in the middle layer                                              |
| title-0.webp … title-5.webp | Six individually cropped wordmark navigation controls                                                          |

The title generation predates the user's added universal-reference requirement. The final standing crowd was regenerated with real reference frames and a 5093-character specification. Every generation after that requirement includes references. No further unreferenced generations are authorized by this workflow.

Research images were used for reference only and are not in public/ or the repository. Raw rejected generations remain in the Work Library, outside the website bundle. No real health-data fixtures or authenticated browser state are committed.

## Current derivative set

Active assets now use /art/atlas-04988e4d9db3/. The accepted original crowds have offline alpha treatment and the carriage has offline color treatment (scripts/bake-transit.cjs), replacing live filters. A new referenced, transparent HRT ATLAS brand is used in header/login. Its 4,139-character prompt is in prompts/atlas-brand-v2.txt; original generation is preserved in Work storage. Chinese headings and numbers use new OFL font subsets with licenses in public/fonts. No new background scene or borrowed game art was introduced.

## Current reference-led character scene

See DIRECT_MENU_MOTION.md and prompts/atlas-archivist-motion.txt. The three poses were generated together with four actual gameplay reference frames supplied, inspected, split by cell, isolated by connected alpha component, cropped and compressed without enlargement. Reproduce with `node scripts/art/bake-archivist.cjs SOURCE.png`. The generated source stays outside git; only the adopted optimized assets are published. The independent original vector pattern is retained in scripts/art/archive-pattern.svg and baked with sharp at 1600×1280/WebP quality 86. Rest/turn/hand/pattern together are 342,300 bytes. The preceding train assets are no longer loaded.
