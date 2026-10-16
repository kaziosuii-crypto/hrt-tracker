const { chromium } = require("playwright");
const { setup, session, authStorage } = require("./browser.cjs");
const assert = require("node:assert/strict");
async function main() {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--ignore-certificate-errors"],
  });
  const { page: p, context, errors } = await setup(browser, 390, 844);
  await p.locator(".weightHero").waitFor();
  let count = 0;
  await context.route("**/api/data?view=weight_trend", async (r) => {
    const current = ++count;
    await new Promise((ok) => setTimeout(ok, current === 1 ? 900 : 70));
    await r
      .fulfill({
        json: [
          { measured_date: "2026-01-01", weight_kg: current === 1 ? 111 : 72 },
        ],
      })
      .catch(() => {});
  });
  await p.getByRole("button", { name: "刷新", exact: true }).click();
  await p.waitForTimeout(30);
  await p.getByRole("button", { name: "刷新", exact: true }).click();
  await p.waitForTimeout(1100);
  assert.equal(await p.locator(".weightHero>strong").textContent(), "72kg");
  await p.evaluate(
    ({ s, key }) => {
      const c = new BroadcastChannel(key);
      c.postMessage({
        event: "TOKEN_REFRESHED",
        session: { ...s, access_token: "test-refreshed-token" },
      });
      setTimeout(() => c.close(), 100);
    },
    { s: session, key: authStorage },
  );
  await p.waitForTimeout(300);
  assert.equal(await p.locator(".weightHero>strong").textContent(), "72kg");
  await context.route("**/api/data?view=weight_trend", async (r) => {
    await new Promise((ok) => setTimeout(ok, 900));
    await r
      .fulfill({ json: [{ measured_date: "2026-01-01", weight_kg: 999 }] })
      .catch(() => {});
  });
  await p.getByRole("button", { name: "刷新", exact: true }).click();
  await p.getByRole("button", { name: "退出登录" }).click();
  await p.locator(".authPanel").waitFor();
  await p.waitForTimeout(1000);
  assert.equal(await p.locator(".app .tabs").count(), 0);
  assert.deepEqual(errors, []);
  await context.close();
  const slow = await setup(browser, 390, 844);
  await slow.context.route("**/api/data?view=lab_history", async (r) => {
    await new Promise((ok) => setTimeout(ok, 4500));
    await r.fulfill({ json: { wrong: "shape" } }).catch(() => {});
  });
  await slow.page.waitForTimeout(300);
  await slow.page.locator(".tabs button").nth(3).click();
  await slow.page.waitForTimeout(3000);
  assert.equal(await slow.page.locator(".commute").count(), 0);
  await slow.page.getByRole("button", { name: "刷新", exact: true }).click();
  await slow.page.waitForTimeout(4700);
  assert.ok((await slow.page.locator(".empty").textContent()).includes("格式"));
  assert.deepEqual(slow.errors, []);
  await slow.context.close();
  await browser.close();
  console.log(
    "stale refresh, token refresh cache, signout/unmount, slow network, invalid shape: PASS",
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
