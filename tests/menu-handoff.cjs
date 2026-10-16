const { chromium } = require("playwright");
const { setup } = require("./browser.cjs");
const assert = require("node:assert/strict");
(async () => {
  const b = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const { page: p, errors, obsoleteAssets } = await setup(b, 390, 844);
  await p.locator(".weightHero").waitFor();
  await p.waitForTimeout(1900);
  await p.locator(".tabs button").nth(1).click();
  await p.waitForTimeout(140);
  assert.equal(
    await p.locator(".content").getAttribute("data-section"),
    "weight_trend",
  );
  assert.equal(await p.locator(".content").evaluate((e) => e.inert), true);
  await p.waitForTimeout(710);
  assert.equal(
    await p.locator(".content").getAttribute("data-section"),
    "breast_body_measurements",
  );
  assert.equal(await p.locator(".content").evaluate((e) => e.inert), true);
  await p.locator(".menuChange").waitFor({ state: "detached", timeout: 3500 });
  assert.equal(await p.locator(".content").evaluate((e) => e.inert), false);
  // Cancel the next foreground handoff by signing out before its covered swap.
  await p.locator(".tabs button").nth(2).click();
  await p.waitForTimeout(100);
  await p.getByRole("button", { name: "退出登录" }).click();
  await p.locator(".authPanel").waitFor();
  await p.waitForTimeout(2000);
  assert.equal(await p.locator(".menuChange,.app .content").count(), 0);
  assert.deepEqual(obsoleteAssets, []);
  assert.deepEqual(errors, []);
  console.log(
    "Direct handoff: covered swap, data inert until settle, no train resource requests: PASS",
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
