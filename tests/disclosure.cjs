const { chromium } = require("playwright");
const { setup } = require("./browser.cjs");
const assert = require("node:assert/strict");
(async () => {
  const b = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const { page: p, errors } = await setup(b, 390, 844);
  await p.locator(".weightHero").waitFor();
  await p.locator(".tabs button").nth(1).click();
  await p.locator(".bodyRegion").waitFor();
  await p.locator(".commute").waitFor({ state: "detached" });
  const summary = p.locator(".bodyRegion>summary").first();
  for (let i = 0; i < 7; i++) {
    await summary.evaluate((e) => e.click());
    await p.waitForTimeout(45);
  }
  await p.waitForTimeout(500);
  assert.equal(
    await p
      .locator(".bodyRegion")
      .first()
      .evaluate((e) => e.open),
    false,
  );
  await summary.click();
  await p.waitForTimeout(500);
  assert.equal(
    await p
      .locator(".bodyRegion")
      .first()
      .evaluate((e) => e.style.height),
    "",
  );
  const source = p.locator(".bodyRegion .details>summary").first();
  await source.click();
  await p.waitForTimeout(500);
  assert.equal(
    await p
      .locator(".bodyRegion .details")
      .first()
      .evaluate((e) => e.open),
    true,
  );
  await p.locator(".tabs button").nth(2).click();
  await p.waitForTimeout(2900);
  assert.deepEqual(errors, []);
  console.log(
    "Rapid disclosure reversals, nested source opening, animated unmount: PASS",
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
