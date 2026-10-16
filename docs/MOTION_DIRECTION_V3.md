# Atlas composition and motion revision

## Reference evidence

Primary recorded gameplay: https://www.bilibili.com/video/BV18v4y1S7DG/
The accessible 152.9-second excerpt was examined at 30fps around 69.0–70.2 seconds. Around frames 8–16, the foreground hand / silhouette becomes the wipe; the new information stack appears while the patterned field is still moving; around frames 20–29 the large paper foreground settles. This is a handoff between foreground, graphic field and information, not a collection of independent card fades. Contact sheets and video are private research artifacts in /tmp, not shipped assets.

## Composition

- One original HRT ATLAS wordmark replaces the generic boxed A + typed header. Generation uses the two actual reference images, a 4,139-character art specification, and transparent output. See prompts/atlas-brand-v2.txt. It is cropped/compressed to a 70,246-byte WebP and actually used in the header and signed-out art.
- Chinese headings use a subset of Noto Sans SC at weight 800; numerical display uses Barlow Semi Condensed Bold. Normal letter spacing and tabular numeral treatment prevent the earlier merged digits. Body data stays in readable system text.
- Weight is a large independent value strip and a dark, heavier trend composition with three readable axis guides. Actual date spacing and values remain unchanged. Archive entries use strong contrast and deliberate columns.
- Body and lab session contents use a two-column desktop composition rather than stretching every short metric across the full display. HRT entries remain grouped within their source period; undated records stay explicitly undated. Mobile is a single-column composition. Long non-clock intake time notes span a row rather than being squeezed into a time column.
- Search is a paper control with a FIND marker, actual input and explicit focus state. It is not an ornamental fake input.

## Page choreography

Direction.js defines separate entry vectors for all six menus. The overall graphic field, title, numerical foreground, chart / dossier and session blocks enter as complete planes. The current composition withdraws on selection. The incoming composition starts while the train clears and settles independently. Native WAAPI transform animations are created through anime.js 4.5.0; anime.js also coordinates timing and draws the precise trend path. Spring behavior remains on brand and navigation. No additional framework or animation size padding is added.

The accepted 2,600ms train transfer remains. The actual React view commits at the covered 1,420ms point, independent of network completion. All animation handles are reverted on unmount, rapid destination changes retain the last intended view, and reduced motion bypasses the scene.

## Render pipeline

The former alpha threshold SVG filter was evaluated live on three large crowd layers. Alpha treatment is now baked into the original WebPs; train brightness/saturation is baked as well. These are optimization derivatives of the accepted original artwork, not new generations or copied game footage.

An ablation identified the full-scene feather mask as a major desktop cost. Instead of masking the moving group, only two 56px edge strips carry the feather and irregular contour. The opaque interior no longer needs a full-viewport mask/filter surface. Individual scene layers move through native compositor transform keyframes created via anime.js WAAPI, with explicit offsets for entry, covered hold and departure. The strips are outside the viewport at the covered commit, preserving complete coverage.

Artwork has a new versioned path, /art/atlas-04988e4d9db3/, with one-year immutable HTTP caching. Existing decoded-image reuse is retained. Total active art remains roughly 0.5 MiB including the new brand.

## Performance methodology

Run tests/motion-profile.cjs against a production build, with 390×844 and 1920×1080 viewports and Chromium CDP CPU throttling at 4×. It records rAF intervals, long tasks and layout/task duration. These cloud-browser measurements are comparative evidence, not a physical-device frame-rate guarantee. HRT_PROFILE_CSS supports a controlled style ablation; HRT_PROFILE_DESKTOP limits sampling to the desktop case.

Before this revision, the desktop sample recorded p95 116.7ms and 25 intervals above 34ms. Removing the full mask during ablation brought p95 to 33.3ms and four intervals above 34ms. The final native-motion sample reached 188 mobile rAF samples (p95 16.8ms) and 136 desktop samples (p95 49.9ms), versus 176/70 samples and p95 33.4/116.7ms before the revision. See VERIFICATION.md for method and limits.

## Privacy and data

No Supabase schema, authentication policy or source record writes. Real-data visual reviews use a private /tmp snapshot; committed fixtures are synthetic. No medical image, predicted body, fabricated date, synthetic health event or inferred medication period is added.
