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
  } = await setup(browser, 390, 844, "no-preference", true);
  await p.locator(".weightHero").waitFor();
  await p.waitForTimeout(400);
  await p.screenshot({
    path: "/tmp/hrt-review/final-weight.png",
    fullPage: true,
  });
  await p.clock.pauseAt(new Date());
  await p
    .locator(".tabs button")
    .nth(1)
    .evaluate((el) => el.click());
  let previous = 0;
  for (const ms of [450, 700, 1000, 1420, 1700, 2100, 2500]) {
    await p.clock.runFor(ms - previous);
    previous = ms;
    await p.screenshot({
      path: `/tmp/hrt-review/transit-${process.env.HRT_ENGINE || "chromium"}-${ms}.png`,
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
