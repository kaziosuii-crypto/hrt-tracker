const { chromium } = require("playwright");
const { setup } = require("./browser.cjs");
(async () => {
  const b = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--ignore-certificate-errors"],
  });
  for (const [w, h] of process.env.HRT_PROFILE_DESKTOP
    ? [[1920, 1080]]
    : [
        [390, 844],
        [1920, 1080],
      ]) {
    const { page: p, context, errors } = await setup(b, w, h);
    await p.locator(".weightHero").waitFor();
    await p.waitForTimeout(2200);
    if (process.env.HRT_PROFILE_CSS)
      await p.addStyleTag({ content: process.env.HRT_PROFILE_CSS });
    const cdp = await context.newCDPSession(p);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp.send("Performance.enable");
    const start = (await cdp.send("Performance.getMetrics")).metrics;
    await p.evaluate(() => {
      window.samples = [];
      window.longTasks = [];
      window.obs = new PerformanceObserver((l) =>
        window.longTasks.push(...l.getEntries().map((e) => e.duration)),
      );
      window.obs.observe({ type: "longtask", buffered: false });
      let start = performance.now();
      function tick(t) {
        window.samples.push(t);
        if (t - start < 3200) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      document.querySelectorAll(".tabs button")[1].click();
    });
    await p.waitForTimeout(3400);
    const result = await p.evaluate(() => {
      let a = window.samples
        .slice(1)
        .map((v, i) => v - window.samples[i])
        .sort((a, b) => a - b);
      return {
        frames: a.length + 1,
        p50: a[Math.floor(a.length * 0.5)],
        p95: a[Math.floor(a.length * 0.95)],
        over34: a.filter((n) => n > 34).length,
        longTasks: window.longTasks,
        finished: !document.querySelector(".commute"),
      };
    });
    const end = (await cdp.send("Performance.getMetrics")).metrics;
    const delta = (name) =>
      end.find((x) => x.name === name).value -
      start.find((x) => x.name === name).value;
    console.log(
      JSON.stringify({
        width: w,
        ...result,
        taskSeconds: delta("TaskDuration"),
        layoutSeconds: delta("LayoutDuration"),
        errors,
      }),
    );
    await context.close();
  }
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
