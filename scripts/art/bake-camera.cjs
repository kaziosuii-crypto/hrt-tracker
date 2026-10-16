const sharp = require("sharp"),
  fs = require("fs"),
  crypto = require("crypto");
(async () => {
  const src = process.argv[2];
  if (!src) throw Error("Pass adopted full-pose source PNG");
  const trimmed = await sharp(src).trim().png().toBuffer();
  const { data, info } = await sharp(trimmed)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // Interior generated alpha must be opaque; retain antialiasing only at the silhouette.
  for (let i = 3; i < data.length; i += 4) if (data[i] >= 245) data[i] = 255;
  const b = await sharp(data, { raw: info })
    .webp({ quality: 90, alphaQuality: 100 })
    .toBuffer();
  const h = crypto.createHash("sha256").update(b).digest("hex").slice(0, 12),
    url = "/art/atlas-camera-" + h + "/reach.webp";
  fs.mkdirSync("public/art/atlas-camera-" + h, { recursive: true });
  fs.writeFileSync("public" + url, b);
  fs.writeFileSync(
    "lib/camera-assets.js",
    `export const CAMERA_IMAGE=${JSON.stringify(url)};\nexport const CAMERA_SIZE={width:${info.width},height:${info.height}};\nexport const PALM_RECT={x:256,y:344,width:220,height:240};\nexport const CAMERA_COVER={desktop:{x:256,y:424,width:650,height:300},phone:{x:516,y:424,width:300,height:650}};\n`,
  );
  console.log({ url, bytes: b.length, width: info.width, height: info.height });
})();
