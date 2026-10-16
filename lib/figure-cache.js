import { figure } from "./figure-assets";
const images = [];
let promise;
export function warmFigures() {
  if (promise) return promise;
  promise = Promise.all(
    ["rest", "turn", "hand", "pattern-v1"].map(
      (name) =>
        new Promise((resolve) => {
          const img = new Image();
          images.push(img);
          img.onload = () => {
            (img.decode?.() || Promise.resolve()).then(
              () => resolve(true),
              () => resolve(true),
            );
          };
          img.onerror = () => resolve(false);
          img.src = figure(name);
        }),
    ),
  ).then((values) => values.every(Boolean));
  return promise;
}
