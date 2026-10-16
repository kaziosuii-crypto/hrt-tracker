const { chromium, webkit } = require("playwright");
const fs = require("fs");
const assert = require("node:assert/strict");
const records = JSON.parse(
  fs.readFileSync(
    process.env.HRT_TEST_RECORDS ||
      require("path").join(__dirname, "fixtures.json"),
    "utf8",
  ),
);
const authStorage = process.env.HRT_AUTH_STORAGE || "sb-test-auth-token";
const base = process.env.TEST_URL || "http://localhost:3000";
const session = {
  access_token: "test-browser-token",
  refresh_token: "test-refresh",
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  expires_in: 3600,
  token_type: "bearer",
  user: {
    id: "browser-fixture",
    email: "test@example.invalid",
    aud: "authenticated",
    role: "authenticated",
  },
};
async function setup(
  browser,
  width,
  height,
  reducedMotion = "no-preference",
  clock = false,
) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion,
    ignoreHTTPSErrors: true,
  });
  await context.addInitScript(
    ({ s, key }) => localStorage.setItem(key, JSON.stringify(s)),
    { s: session, key: authStorage },
  );
  await context.route("**/auth/v1/**", (r) => r.fulfill({ json: session }));
  await context.route("**/api/data?*", async (r) => {
    const view = new URL(r.request().url()).searchParams.get("view");
    await new Promise((ok) => setTimeout(ok, 50 + Math.random() * 200));
    await r.fulfill({ json: records[view] || [] });
  });
  const page = await context.newPage();
  if (clock) {
    await page.clock.install();
    await page.addInitScript(() => {
      const original = Element.prototype.animate;
      Element.prototype.animate = function (...args) {
        const animation = original.apply(this, args);
        animation.__atlasCreatedAt = performance.now();
        return animation;
      };
    });
  }
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.locator(".tabs").waitFor();
  return { page, context, errors };
}
async function main() {
  const browser = await (
    process.env.HRT_ENGINE === "webkit" ? webkit : chromium
  ).launch(
    process.env.HRT_ENGINE === "webkit"
      ? { headless: true }
      : {
          executablePath: "/usr/bin/chromium",
          headless: true,
          args: ["--no-sandbox", "--ignore-certificate-errors"],
        },
  );
  fs.mkdirSync("/tmp/hrt-review", { recursive: true });
  for (const [width, height] of [
    [390, 844],
    [430, 932],
    [1440, 1000],
  ]) {
    const { page: p, context, errors } = await setup(browser, width, height);
    const names = ["体重", "身体", "HRT", "化验", "每日", "饮食"];
    for (let i = 0; i < 6; i++) {
      await p.locator(".tabs button").nth(i).click();
      await p.waitForTimeout(3450);
      await p.screenshot({
        path: `/tmp/hrt-review/${width}-${i}.png`,
        fullPage: true,
      });
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        "horizontal overflow " + names[i],
      );
      if (i === 1) {
        for (let j = 0; j < (await p.locator(".chips button").count()); j++) {
          await p.locator(".chips button").nth(j).click();
        }
        await p.locator("select").selectOption({ index: 1 });
      }
      if (i > 1) {
        const head = p
          .locator(".plan>button,.labHead,.daily>button,.foodDay>button")
          .first();
        await head.click();
        await head.click();
      }
    }
    // Mixed rapid requests before and after cover; last selection must win.
    for (let round = 0; round < 8; round++) {
      for (let i = 0; i < 6; i++) {
        await p
          .locator(".tabs button")
          .nth(i)
          .evaluate((el) => el.click());
        await p.waitForTimeout(40 + round * 7);
      }
    }
    await p
      .locator(".tabs button")
      .nth(5)
      .evaluate((el) => el.click());
    await p.locator(".commute").waitFor({ state: "detached", timeout: 8500 });
    assert.equal(
      await p.locator(".tabs button[aria-current=page] b").textContent(),
      "饮食",
    );
    assert.equal(await p.locator(".commute").count(), 0);
    assert.deepEqual(errors, []);
    await p.locator("input").fill("不存在的检索值");
    assert.equal(await p.locator(".empty").count(), 1);
    await p.locator("input").fill("");
    const download = p.waitForEvent("download");
    await p.getByRole("button", { name: "导出 Excel" }).click();
    assert.ok((await download).suggestedFilename().endsWith(".xlsx"));
    await p
      .locator(".tabs button")
      .nth(0)
      .evaluate((el) => el.click());
    await p.waitForTimeout(1000);
    await p.screenshot({ path: `/tmp/hrt-review/${width}-cover.png` });
    await p.waitForTimeout(1200);
    console.log(
      width,
      "six pages, sessions, expand, 48 rapid selections, search, export: PASS",
    );
    await context.close();
  }
  const { page: p, context } = await setup(browser, 390, 844, "reduce");
  await p.locator(".tabs button").nth(3).click();
  assert.equal(await p.locator(".commute").count(), 0);
  assert.equal(
    await p.locator(".tabs button[aria-current=page] b").textContent(),
    "化验",
  );
  await context.close();
  await browser.close();
  console.log("Reduced motion: PASS");
}
module.exports = { setup, session, authStorage };
if (require.main === module)
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
