import { art } from "./assets";
const images = new Map();
let warmPromise;
export function warmArt() {
  if (warmPromise) return warmPromise;
  warmPromise = Promise.all(
    [
      "carriage.webp",
      "carriage-mobile.webp",
      "passengers-far.webp",
      "passengers-mid.webp",
      "passengers-near.webp",
    ].map(
      (file) =>
        new Promise((resolve) => {
          const img = new Image();
          images.set(file, img);
          img.onload = () => {
            (img.decode?.() || Promise.resolve()).then(
              () => resolve(true),
              () => resolve(true),
            );
          };
          img.onerror = () => resolve(false);
          img.src = art(file);
        }),
    ),
  ).then((results) => results.every(Boolean));
  return warmPromise;
}
