const { chromium, webkit } = require("playwright");
const { setup } = require("./browser.cjs");
const assert = require("node:assert/strict");
(async () => {
  const { CAMERA_IMAGE, CAMERA_COVER } = await import(
    "../lib/camera-assets.js"
  );
  for (const r of Object.values(CAMERA_COVER)) {
    const pixels = await require("sharp")(
      require("path").join(__dirname, "../public", CAMERA_IMAGE),
    )
      .extract({ left: r.x, top: r.y, width: r.width, height: r.height })
      .ensureAlpha()
      .raw()
      .toBuffer();
    for (let i = 3; i < pixels.length; i += 4)
      assert.equal(
        pixels[i],
        255,
        "covered source area must actually be opaque",
      );
  }
  const engine = process.env.HRT_ENGINE === "webkit" ? webkit : chromium;
  const browser = await engine.launch(
    engine === chromium
      ? {
          executablePath: "/usr/bin/chromium",
          args: ["--no-sandbox", "--ignore-certificate-errors"],
        }
      : { headless: true },
  );
  const {
    page: p,
    context,
    errors,
  } = await setup(
    browser,
    Number(process.env.HRT_VISUAL_WIDTH) || 390,
    process.env.HRT_VISUAL_WIDTH ? 1080 : 844,
    "no-preference",
    true,
  );
  await p.locator(".weightHero").waitFor();
  await p.waitForTimeout(1900);
  await p.screenshot({
    path: "/tmp/hrt-review/final-weight.png",
    fullPage: true,
  });
  await p.clock.pauseAt(new Date(await p.evaluate(() => Date.now() + 100)));
  await p
    .locator(".tabs button")
    .nth(1)
    .evaluate((el) => el.click());
  let previous = 0;
  for (const ms of [
    120, 280, 420, 600, 720, 800, 1000, 1300, 1700, 2050, 2400,
  ]) {
    await p.clock.runFor(ms - previous);
    previous = ms;
    // Playwright's clock drives JS timelines; align native WAAPI animations separately.
    await p.evaluate(() => {
      for (const a of document.getAnimations())
        if (a.__atlasCreatedAt != null) {
          const elapsed = Math.max(0, performance.now() - a.__atlasCreatedAt);
          if (elapsed >= a.effect.getComputedTiming().endTime) a.finish();
          else {
            a.pause();
            a.currentTime = elapsed;
          }
        }
    });
    if ([720, 800].includes(ms)) {
      const r =
        Number(process.env.HRT_VISUAL_WIDTH || 390) <= 700
          ? CAMERA_COVER.phone
          : CAMERA_COVER.desktop;
      const covered = await p.evaluate((r) => {
        const m = new DOMMatrix(
          getComputedStyle(document.querySelector(".actorLens")).transform,
        );
        const a = new DOMPoint(r.x, r.y).matrixTransform(m),
          b = new DOMPoint(r.x + r.width, r.y + r.height).matrixTransform(m);
        return {
          left: a.x,
          top: a.y,
          right: b.x,
          bottom: b.y,
          vw: innerWidth,
          vh: innerHeight,
          uniform:
            Math.abs(Math.hypot(m.a, m.b) - Math.hypot(m.c, m.d)) < 0.0001,
          section: document.querySelector(".content").dataset.section,
        };
      }, r);
      assert.ok(
        covered.uniform,
        "whole body must scale uniformly, without independently distorted limbs",
      );
      assert.ok(
        covered.left < 0 &&
          covered.top < 0 &&
          covered.right > covered.vw &&
          covered.bottom > covered.vh,
        "actual opaque artwork must cover all viewport edges",
      );
      assert.equal(
        covered.section,
        ms < 760 ? "weight_trend" : "breast_body_measurements",
      );
    }
    await p.screenshot({
      path: `/tmp/hrt-review/transit-${process.env.HRT_VISUAL_WIDTH || 390}-${process.env.HRT_ENGINE || "chromium"}-${ms}.png`,
    });
  }
  await p.clock.runFor(600);
  assert.deepEqual(errors, []);
  console.log("visual keyframes captured; runtime errors=0");
  await context.close();
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
