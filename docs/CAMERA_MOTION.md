# Coherent perspective and full-screen occlusion

This supersedes the transition portion of ARTICULATED_ACTOR.md. The approved login/static-menu layout remains unchanged. The transition's independently enlarged forearm was rejected: its small frontal torso and oversized isolated arm did not share a coherent perspective. Neither rejected hand-only trial is shipped.

## Adopted artwork

The final asset is a complete original reaching character, not a detached hand or an unchanged body behind an enlarged limb. Head, chest, near shoulder, upper arm, wrist and hand were drawn together from one camera viewpoint. References supplied to generation: the existing original character, actual gameplay hand frame, a real reaching-person photograph and a normal palm photograph. The adopted brief has4049 characters: prompts/atlas-coherent-camera-pose.txt. The source is retained in the session generated_images directory. scripts/art/bake-camera.cjs reproducibly trims it, makes generated interior alpha opaque while retaining silhouette antialiasing, compresses and writes the hashed manifest. Published WebP:1229×1216,230,724 bytes.

Reference photography is research input only and is not distributed:

- https://depositphotos.com/photos/hand-grabbing-face.html (the reaching-person preview)
- https://chef.se/artiklar/dubbelt-sa-mycket-vald-pa-arbetsplatsen/ (normal palm anatomy)
- Actual gameplay source and extracted times are recorded in DIRECT_MENU_MOTION.md.

## Motion score,2100ms

A single HTML image moves with uniform transform scale/translation. No limb has an independent scale, no whole-pose ghost blend, and no giant arm is pasted on a small body.

- 0–260ms: the whole reaching pose enters; the patterned field has its own trajectory.
- 260–360ms: a brief clear establishing pose shows the hand/shoulder/body relationship.
- 360–690ms: the camera advances across the complete character drawing. Desktop and phone use different source crops.
- 690–850ms: actual opaque character artwork covers all four viewport edges. React commits the latest selected section at760ms.
- 850–1370ms: the foreground passes out to the right. The head/chest already outside the lens move farther away, avoiding a second giant face passing across the page.
- The new information composition enters behind the occlusion. The small static-menu figure appears only as the foreground clears. The paper tail follows and controls release at2100ms.

The full-cover crops include contiguous palm/arm/clothing from the same character. They are not a CSS shutter, substituted background or transparent gaps disguised by the pattern. Their entire decoded alpha area is255. The geometry maps those actual regions beyond all viewport edges with6% overscan. Tests independently check decoded alpha, uniform whole-body scale, viewport coverage and the old/new section boundary at720/800ms in Chromium and WebKit. This also prevents a future phone title crop from clipping the foreground palm.

anime.js native WAAPI handles transforms, scopes and timing. No per-frame DOM geometry reads, image download or data request gates the animation. The source is preloaded and decoded by the existing retained-image warm-up, with immutable versioned caching. Reduced motion remains immediate; signout/unmount cancels callbacks; moving data remains inert until settle. No data/API/authentication implementation changes.
