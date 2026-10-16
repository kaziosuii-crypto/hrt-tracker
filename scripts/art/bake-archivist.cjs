const fs = require("fs"),
  sharp = require("sharp"),
  crypto = require("crypto");
(async () => {
  const source = process.argv[2];
  if (!source)
    throw new Error("Usage: node scripts/art/bake-archivist.cjs SOURCE.png");
  let files = [];
  for (const [index, name] of ["rest", "turn", "hand"].entries()) {
    const region = await sharp(source)
      .extract({ left: index * 724, top: 0, width: 724, height: 724 })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { data, info } = region,
      n = info.width * info.height,
      labels = new Int32Array(n),
      queue = new Int32Array(n);
    let serial = 0,
      largest = 0,
      biggest = 0;
    for (let start = 0; start < n; start++) {
      if (labels[start] || data[start * 4 + 3] < 24) continue;
      serial++;
      let head = 0,
        tail = 0;
      queue[tail++] = start;
      labels[start] = serial;
      while (head < tail) {
        const p = queue[head++],
          x = p % info.width,
          y = (p / info.width) | 0;
        for (const q of [
          x > 0 ? p - 1 : -1,
          x < info.width - 1 ? p + 1 : -1,
          y > 0 ? p - info.width : -1,
          y < info.height - 1 ? p + info.width : -1,
        ])
          if (q >= 0 && !labels[q] && data[q * 4 + 3] >= 24) {
            labels[q] = serial;
            queue[tail++] = q;
          }
      }
      if (tail > biggest) {
        biggest = tail;
        largest = serial;
      }
    }
    for (let p = 0; p < n; p++) {
      if (labels[p] === largest) continue;
      let near = false;
      const x = p % info.width,
        y = (p / info.width) | 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          let xx = x + dx,
            yy = y + dy;
          if (
            xx >= 0 &&
            xx < info.width &&
            yy >= 0 &&
            yy < info.height &&
            labels[yy * info.width + xx] === largest
          )
            near = true;
        }
      if (!near) data[p * 4 + 3] = 0;
    }
    const isolated = await sharp(data, { raw: info }).png().toBuffer();
    const cropped = await sharp(isolated).trim().toBuffer();
    const b = await sharp(cropped)
      .resize({ height: 900, withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 100 })
      .toBuffer();
    files.push([name, b]);
  }
  let hash = crypto.createHash("sha256");
  files.forEach(([n, b]) => hash.update(n).update(b));
  const base = "/art/atlas-actor-" + hash.digest("hex").slice(0, 12);
  fs.mkdirSync("public" + base, { recursive: true });
  for (let [n, b] of files) {
    fs.writeFileSync("public" + base + "/" + n + ".webp", b);
    console.log(n, b.length);
  }
  fs.writeFileSync(
    "lib/figure-assets.js",
    `export const FIGURE_BASE=${JSON.stringify(base)};\nexport const figure=(name)=>FIGURE_BASE+'/'+name+'.webp';\n`,
  );
  console.log(base);
})();
