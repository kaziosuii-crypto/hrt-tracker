const { chromium, webkit } = require("playwright");
const { setup } = require("./browser.cjs");
const assert = require("node:assert/strict");
(async () => {
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
  for (const ms of [120, 280, 480, 650, 900, 1150, 1450, 1680, 2000]) {
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
