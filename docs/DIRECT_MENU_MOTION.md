# Reference-led menu scene

The character implementation below is historical. See ARTICULATED_ACTOR.md for the current joint rig, access scene and revised asset set.

Supersedes the train transfer in MOTION_DIRECTION_V3.md and the discarded large-wordmark wipe. Actual reference: the main-menu → cooperation transition at 69.15–70.55 seconds in the inspected public gameplay excerpt, https://www.bilibili.com/video/BV18v4y1S7DG/. A 15fps contact sheet and individual frames at 69.27, 69.45, 69.62 and 70.00 seconds were inspected. Reference frames/video stay outside the repository and are not shipped.

The observed structure is a persistent character, patterned field, left-hand information strips and a late paper tail. A foreground forearm leads the shoulder turn; the incoming information arrives during the turn and the character settles on the right. That composition, rather than an unrelated interstitial or a list of stylistic adjectives, informs this implementation.

## Original assets and composition

The 4092-character generation brief is in prompts/atlas-archivist-motion.txt. All four actual reference images were supplied to image generation. The output was inspected before adoption. Three independent transparent poses of the same original archive character are used: rest (91,964 bytes), turn (71,476 bytes), hand (60,710 bytes), totalling 224,150 bytes. The largest connected alpha component was isolated in each sprite to remove neighbouring-cell fragments; antialiasing was retained, crops were not enlarged. scripts/art/bake-archivist.cjs reproduces the processing from the generated source sheet supplied as its argument.

The background is an independently drawn folded-pentagon pattern, not a copied game texture. Its editable source is scripts/art/archive-pattern.svg. It is baked to a 1600×1280, 118,150-byte WebP to avoid repeatedly rasterizing a moving SVG field. Character plus pattern total 342,300 bytes. They are versioned, preloaded, decoded once and retained; one-year immutable HTTP caching handles repeat visits. No health records are written to asset caches.

Desktop reserves the right side for the character and places health information to the left on opaque reading surfaces. Phone uses a separate crop: artwork is clipped to the header region, with information below it. The existing original wordmarks remain clickable navigation, not giant overlay headings. Original type and brand work from the preceding release are retained. No Atlus character, logo, font or game footage is distributed.

## Motion score, 1800ms

- Current title, field and whole information sections withdraw on opposing trajectories.
- The independent hand enters, then the enlarged turning shoulder and patterned field cross the composition.
- React commits the latest requested destination at 460ms, during the foreground handoff.
- New field, title and complete information areas enter independently, using viewport-scale travel, stagger and restrained overshoot.
- Turn/rest pose crossfade is 60ms, avoiding a prolonged double-image ghost. The rest pose resolves to the exact static portrait box.
- The lower paper tail follows after 870ms. The scene settles before the 1800ms interaction release.

anime.js 4.5.0 scopes and timeline callbacks coordinate native WAAPI transform/opacity keyframes with explicit offsets. Information is inert/aria-busy while moving; the navigation stays active and queues the latest destination. View switching does not wait for data. Existing honest loading/error states handle slow API responses. Reduced motion switches immediately. Disposed scopes and guarded callbacks prevent late commits after unmount/signout.

A WebKit issue discovered during actual pointer testing left an inert scroll subtree at its entry transform after animation completion. Every information plane now explicitly restores its rest transform and clears will-change on completion. Tests click the actual session controls, not only assert their DOM presence.

The train component, train warm-up module and train preloads are removed. Historical train files remain as source history but are not requested by the app; browser tests assert zero carriage/crowd requests. See VERIFICATION.md for measured performance, coverage and limits.
