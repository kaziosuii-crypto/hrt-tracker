const sharp = require("sharp"),
  fs = require("fs"),
  crypto = require("crypto");
(async () => {
  const src = process.argv[2],
    files = [];
  if (!src) throw Error("Pass source sprite sheet path");
  for (const [name, left, top, width, height] of [
    ["torso", 0, 0, 720, 690],
    ["head", 750, 90, 527, 480],
    ["upper", 120, 685, 540, 530],
    ["forearm", 700, 630, 577, 602],
  ]) {
    const crop = await sharp(src)
      .extract({ left, top, width, height })
      .png()
      .toBuffer();
    const b = await sharp(crop)
      .trim()
      .webp({ quality: 90, alphaQuality: 100 })
      .toBuffer();
    files.push([name, b]);
    console.log(name, await sharp(b).metadata());
  }
  const hash = crypto.createHash("sha256");
  files.forEach(([n, b]) => hash.update(n).update(b));
  const base = "/art/atlas-rig-" + hash.digest("hex").slice(0, 12);
  fs.mkdirSync("public" + base, { recursive: true });
  for (const [n, b] of files)
    fs.writeFileSync("public" + base + "/" + n + ".webp", b);
  fs.writeFileSync(
    "lib/rig-assets.js",
    `export const RIG_BASE=${JSON.stringify(base)};\nexport const rig=name=>RIG_BASE+'/'+name+'.webp';\n`,
  );
  console.log(base);
})();
