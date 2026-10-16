# Access scene and articulated actor — 2026-10-16

The access/static-menu rig remains in use. Its transition implementation is superseded by CAMERA_MOTION.md: the foreground is now a complete coherently drawn perspective pose.

This focused follow-up replaces the blank login artwork and the ambiguous enlarged-hand/whole-pose crossfade. It keeps the established six-menu data layouts and grain contract.

## Original asset iteration

The 4183-character first brief in prompts/atlas-articulated-actor.txt used the existing original archive character and actual gameplay hand/settle frames as image-generation references. First output was assembled in-browser, rejected because the generator had painted visible hollow sleeve ends, then edited with the complete brief, the first generated image, the original character and the gameplay settle frame. The second output seals the sleeve ends and removes the independent neck stub. No game character, game image, or game texture is published.

The adopted transparent sheet is split into four independently optimized WebPs: torso69,562 bytes, head57,240, upper arm31,054, forearm/hand42,844. Total200,700 bytes. The previous original pattern adds118,150 bytes; current character+pattern total318,850 bytes. scripts/art/bake-puppet.cjs takes the generated source path and recreates the versioned files and manifest. Original generation outputs stay in the session's generated_images directory; rejected derivatives are not published.

## Actual joint rig

PuppetActor.js shares a single assembled rest pose between login, static menu art and transition. The head rotates about the neck; the forearm is nested under the shoulder and elbow, so its motion inherits the arm rather than drifting as an unrelated image. The only hands are the fixed folder hand and the moving forearm hand. The clothing parts overlap their attachment zones. No full-pose crossfade and no giant standalone palm remain.

The 1800ms anime.js/native WAAPI score separates a 200–280ms anticipation, shoulder motion, delayed elbow response, head counterrotation, overshoot and settle. The whole actor moves as a restrained camera composition, with a mobile/desktop fit calculation. The background and complete information sections retain their existing independent movement. React commits the queued destination at460ms. The incoming static portrait stays hidden until the moving rig lands, avoiding double heads and ghost limbs. On phone, a short end-of-motion crop resolves to the175px static title-art region before interaction is released; it does not disappear as a whole-body jump.

## Access scene

Login uses the original assembled character, pattern, complete brand image, an asymmetric ARCHIVE composition and a visibly actionable Google button. It removes the obsolete gray placeholder and pseudo-element logo crop. Logo placement was revised after screenshot inspection because the initial placement covered the face. Desktop art and information enter on independent paths; reduced motion has immediate presentation. Focus, touch-down and error states remain readable. The OAuth handler/provider/redirect destination are unchanged.

## Verification boundaries

Browser tests cover actual image responses, no face/logo intersection, viewport width, the real client-generated Supabase Google authorization request and its redirect_to value. The external authorization page is intercepted in the isolated test; real Google consent is not performed. Existing authenticated browser tests use browser-only fixtures, never a production auth bypass. Full production-build Chromium/WebKit viewports cover six menus, sessions, expansion, search/export, rapid48-selection sequences and reduced motion. Entity/data adapters, Supabase schema and API are unchanged.
