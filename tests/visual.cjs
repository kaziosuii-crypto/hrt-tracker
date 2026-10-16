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
  const { page: p, context, errors } = await setup(browser, 390, 844);
  await p.locator(".weightHero").waitFor();
  await p.waitForTimeout(400);
  await p.screenshot({
    path: "/tmp/hrt-review/final-weight.png",
    fullPage: true,
  });
  await p.locator(".tabs button").nth(1).click();
  await p.waitForTimeout(250); // Freeze every CSS layer to inspect exact choreography without screenshot timing drift.
  for (const ms of [450, 700, 1000, 1060, 1200, 1550, 1850]) {
    await p.evaluate((ms) => {
      for (const a of document.getAnimations()) {
        if (a.effect?.target?.closest(".commute")) {
          a.pause();
          a.currentTime = ms;
        }
      }
    }, ms);
    await p.screenshot({
      path: `/tmp/hrt-review/transit-${process.env.HRT_ENGINE || "chromium"}-${ms}.png`,
    });
  }
  await p.evaluate(() => {
    for (const a of document.getAnimations()) a.play();
  });
  await p.waitForTimeout(2300);
  assert.deepEqual(errors, []);
  console.log("visual keyframes captured; runtime errors=0");
  await context.close();
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
