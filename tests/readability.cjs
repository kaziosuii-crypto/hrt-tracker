const { chromium } = require("playwright");
const { setup } = require("./browser.cjs");
const assert = require("node:assert/strict");
(async () => {
  const b = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  for (const width of [390, 1920]) {
    const { page: p, errors } = await setup(b, width, 1000);
    await p.locator(".weightHero").waitFor();
    await p.waitForTimeout(2000);
    const number = await p.locator(".weightHero>strong").evaluate((e) => {
      const s = getComputedStyle(e);
      return {
        spacing: s.letterSpacing,
        weight: s.fontWeight,
        font: s.fontFamily,
      };
    });
    assert.ok(
      parseFloat(number.spacing) >= 0,
      "weight digits must not overlap",
    );
    assert.match(number.font, /Atlas Numbers/);
    for (let i of [3, 4, 5]) {
      await p.locator(".tabs button").nth(i).click();
      await p.waitForTimeout(3500);
      const bad = await p.evaluate(() => {
        const lum = (c) => {
          const a = c
            .match(/[\d.]+/g)
            .slice(0, 3)
            .map((x) => {
              let v = +x / 255;
              return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
            });
          return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        };
        const out = [];
        for (const e of document.querySelectorAll(
          ".analyte>span>b,.analyte>span>strong,.facts b,.intake>b,.intake>strong",
        )) {
          if (!e.getClientRects().length) continue;
          let parent = e,
            bg;
          while (parent) {
            bg = getComputedStyle(parent).backgroundColor;
            if (bg !== "rgba(0, 0, 0, 0)") break;
            parent = parent.parentElement;
          }
          let fg = getComputedStyle(e).color;
          const a = lum(fg),
            b = lum(bg || "rgb(8,9,10)"),
            ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          if (ratio < 4.5) out.push({ selector: e.className, contrast: ratio });
        }
        return out;
      });
      assert.deepEqual(bad, [], "data value contrast");
    }
    assert.deepEqual(errors, []);
    console.log(
      width,
      "number separation and visible lab/daily/intake text contrast: PASS",
    );
    await p.context().close();
  }
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
