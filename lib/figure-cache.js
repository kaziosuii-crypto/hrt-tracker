import { rig } from "./rig-assets";
import { figure } from "./figure-assets";
const images = [];
let promise;
export function warmFigures() {
  if (promise) return promise;
  promise = Promise.all(
    [
      ...["torso", "head", "upper", "forearm"].map(rig),
      figure("pattern-v1"),
    ].map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          images.push(img);
          img.onload = () =>
            (img.decode?.() || Promise.resolve()).then(
              () => resolve(true),
              () => resolve(true),
            );
          img.onerror = () => resolve(false);
          img.src = src;
        }),
    ),
  ).then((values) => values.every(Boolean));
  return promise;
}
