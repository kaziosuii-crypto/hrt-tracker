// Uses a context without route interception: Playwright routing disables HTTP caching.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--ignore-certificate-errors"],
  });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto(process.env.TEST_URL || "http://localhost:3011");
  const result = await page.evaluate(async () => {
    const url = "/art/atlas-09ce5461945a/passengers-near.webp";
    const first = await fetch(url);
    await first.arrayBuffer();
    const policy = first.headers.get("cache-control");
    await fetch(url).then((r) => r.arrayBuffer());
    const entries = performance.getEntriesByName(location.origin + url);
    return {
      policy,
      transfers: entries.map((e) => ({
        transfer: e.transferSize,
        encoded: e.encodedBodySize,
      })),
    };
  });
  assert.match(result.policy, /max-age=31536000/);
  assert.match(result.policy, /immutable/);
  assert.equal(result.transfers.at(-1).transfer, 0);
  console.log(
    "Versioned art, one-year immutable policy, repeat transfer zero bytes:",
    result,
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
