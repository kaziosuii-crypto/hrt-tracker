# HRT Atlas: transit / personal archive

## Reference study (2026-10-16)
- CEDEC+KYUSHU 2017, Atlus UI production talk, reported by Famitsu: https://www.famitsu.com/news/201711/13145540.html
- Art director interview: https://personacentral.com/persona-5-interview-ui-design-sound-music/
- UI production panel: https://personacentral.com/persona-5-panel-concept-development-ui/
- Commute still inspected: https://note.com/shiro_e2rb/n/n805c20a4e654
- Contextual transition analysis: https://jiaxinwen.wordpress.com/2017/04/27/the-ui-design-of-persona-5/

Observed principles: character silhouettes establish human scale, overlapping body masses establish depth; train straps, pillars and doors establish commute without text. UI hierarchy comes from luminance and changes of composition, not indiscriminate skew. The original reference's train scene is largely restrained; energetic type is a contrasting focal layer. Do not treat all animation as a universal 300ms transition.

No Atlus images, characters, logos or typefaces are shipped. The viewed still is a research reference only. We did not extract original sprites or claim frame-accurate video analysis.

## Motion score
2100ms fixed duration. Environment appears 0–250ms, distant crowd moves left-to-right slowly, middle commuters counterflow, foreground bodies cross 300–1850ms. Page commit at 1060ms, inside foreground overlap. Caption appears after scene anticipation and exits before scene. Background camera pan only 2%; no flashing. RAF clock is independent of fetch. Last selected destination wins. A selection after cover queues a new covered commit, never a visible page jump. Reduced motion switches immediately.

## Information architecture
Weight: latest number + time-proportional trajectory + precise measurement archive. Body: batch selector → expandable body regions → paired metrics, independent cross-session metric selector. Plan: period headers → medication loadout. Lab: light dossier header → analytes → ranges and source. Daily: calendar date → full daily fields → actual intake events. Food: date → intake itinerary, meal taxonomy distinct from event count.

## Asset production
Original generated train-interior environment and independent alpha standing-crowd / foreground assets, optimized to WebP. Source generations kept outside public bundle. No video autoplay, canvas particle loop, or large DOM crowd. Mobile crop centered on interior window and hanging straps, foreground scale tuned separately.

## Actual video analysis (supersedes the initial still-only study)

Reference gameplay: https://www.bilibili.com/video/BV1NG411L7f3/
The public 30 fps recording contains the train transition around 14.5–15.8 seconds. The 14.5–16.0 second segment was extracted at every source frame and inspected as a contact sheet. The separate 221–229 second segment shows a walking-crowd transfer, which is a different scene and was not mistaken for the train interior. The earlier MakeAGIF clip was a dialogue scene and was rejected as a timing reference. YouTube access failed; the accessible gameplay recording supplied the actual evidence.

Observed train sequence: opaque standing passenger bank wipes in from the left; full crowd composition briefly occupies the screen; the entire bank wipes away to reveal the next scene. Gray shape separation and dark surroundings carry the image. There are no overlapping ghostly white contour layers. Adaptation stretches the short source sequence to 2100ms while keeping the entry/hold/exit structure and commits the React page while fully covered. Source video and extracted copyrighted research frames are kept outside the repository and never shipped.

The latest original passenger sheet is generated with a 5093-character specification plus two actual train reference images. It separates dark distant, medium-gray middle and close shoulder layers. Do not reuse the earlier white-face / dense-white-seam crowd treatment.

## Motion / typography revision — 2026-10-16

Additional primary reference: [P5R recorded menu navigation](https://www.bilibili.com/video/BV18v4y1S7DG/). The downloaded public 152.9-second excerpt was inspected as a contact sheet and at eight samples per second around 69–72 seconds (main menu → cooperation → detail). The study showed separate foreground silhouette, zigzag paper background, strong condensed lettering, and information settling after the foreground gesture. Reference frames remain outside the application; none are shipped.

Implementation uses anime.js **4.5.0**: scoped timelines for the train; spring response for navigation wordmarks; accessible `splitText` character entrances; SVG drawable strokes for chapter rules and the weight curve; scroll-triggered record entrances; reversible measured-height disclosure animation. Scopes revert on unmount. Reduced motion skips the transit and decorative entrances. Features are chosen for these interactions, rather than enabling unrelated API features.

The transfer lasts 2600 ms. Entry 0–780; foreground approach 360–1360; covered React swap 1420; foreground departure 1480–2400; bank departure 1820–2600. The bank extends 28px beyond both viewport edges: an irregular contour plus a 22px alpha feather softens the moving edge while maintaining complete opacity over the viewport at the swap. The train/personal silhouettes are retained from the accepted original assets, without regenerating or blurring the complete scene.

New local typography: Barlow Condensed heavy italic for expressive Latin headlines and hero values, Barlow Condensed bold for secondary numbers, ZCOOL KuaiLe for Chinese display labels. Body records use the system text font. These OFL fonts are subset to application text plus Latin/numeric characters; source licenses are included under `public/fonts`. The subset never includes private health text. Missing glyphs fall back to the readable system font.

All eleven existing WebP assets now live in the content-versioned `/art/atlas-09ce5461945a/` directory (about 516 KiB total actual file bytes). Asset and hashed font URLs use one-year immutable HTTP caching. `warmArt()` shares one preload/decode promise and retains images across transitions. This caches visual assets; it does not store health records in a service worker or promise offline access. Future artwork changes require a new content revision directory.
