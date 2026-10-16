const sharp = require("sharp"),
  fs = require("fs"),
  crypto = require("crypto");
(async () => {
  const src = require("path").join(
    __dirname,
    "../public/art/atlas-09ce5461945a",
  );
  const files = new Map();
  for (const f of fs.readdirSync(src)) {
    let b = fs.readFileSync(src + "/" + f);
    if (f.startsWith("passengers-")) {
      const { data, info } = await sharp(b)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      for (let i = 3; i < data.length; i += 4)
        data[i] = Math.max(0, Math.min(255, data[i] * 4 - 510));
      b = await sharp(data, { raw: info })
        .webp({ quality: 88, alphaQuality: 100 })
        .toBuffer();
    } else if (f.startsWith("carriage")) {
      b = await sharp(b)
        .modulate({
          brightness: f.includes("mobile") ? 0.28 : 0.33,
          saturation: 0.15,
        })
        .webp({ quality: 88 })
        .toBuffer();
    }
    files.set(f, b);
  }
  const hash = crypto.createHash("sha256");
  for (const [f, b] of files) hash.update(f).update(b);
  const name = "atlas-" + hash.digest("hex").slice(0, 12);
  const dest = require("path").join(__dirname, "../public/art/") + name;
  fs.mkdirSync(dest, { recursive: true });
  for (const [f, b] of files) fs.writeFileSync(dest + "/" + f, b);
  console.log(name);
})();
