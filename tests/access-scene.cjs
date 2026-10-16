const { chromium, webkit } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const engine = process.env.HRT_ENGINE === "webkit" ? webkit : chromium;
  const b = await engine.launch(
    engine === chromium
      ? {
          executablePath: "/usr/bin/chromium",
          args: ["--no-sandbox", "--ignore-certificate-errors"],
        }
      : { headless: true },
  );
  for (const width of [390, 1440]) {
    const c = await b.newContext({
      viewport: { width, height: 900 },
      ignoreHTTPSErrors: true,
    });
    const p = await c.newPage(),
      errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(process.env.TEST_URL || "http://localhost:3024");
    await p.locator(".authPanel").waitFor();
    await p.waitForTimeout(1300);
    const scene = await p.evaluate(async () => {
      const brand = document
          .querySelector(".authBrand")
          .getBoundingClientRect(),
        head = document
          .querySelector(".authActor .rigHead")
          .getBoundingClientRect();
      return {
        width: document.documentElement.scrollWidth,
        viewport: innerWidth,
        overlap:
          brand.left < head.right &&
          brand.right > head.left &&
          brand.top < head.bottom &&
          brand.bottom > head.top,
        statuses: await Promise.all(
          [...document.querySelectorAll(".authActor image")].map(
            async (i) => (await fetch(i.getAttribute("href"))).status,
          ),
        ),
      };
    });
    assert.equal(scene.width, scene.viewport);
    assert.equal(scene.overlap, false, "brand must not cover the face");
    assert.deepEqual(scene.statuses, [200, 200, 200, 200]);
    await p.screenshot({
      path:
        "/tmp/hrt-review/access-" +
        width +
        "-" +
        (process.env.HRT_ENGINE || "chromium") +
        ".png",
      fullPage: true,
    });
    await p.route("**/auth/v1/authorize**", (r) =>
      r.fulfill({
        status: 200,
        contentType: "text/html",
        body: "OAuth boundary captured in isolated test",
      }),
    );
    const authRequest = p.waitForRequest((r) =>
      r.url().includes("/auth/v1/authorize"),
    );
    await p.getByRole("button", { name: /使用 Google 登录/ }).click();
    const request = await authRequest,
      url = new URL(request.url());
    assert.equal(url.searchParams.get("provider"), "google");
    assert.equal(
      url.searchParams.get("redirect_to"),
      new URL(process.env.TEST_URL || "http://localhost:3024").origin,
    );
    assert.deepEqual(errors, []);
    console.log(
      width,
      "access artwork, no face occlusion, no overflow, Google OAuth entry: PASS",
    );
    await c.close();
  }
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
