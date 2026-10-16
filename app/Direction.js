"use client";
import { useLayoutEffect } from "react";
import { createScope, waapi, spring, svg, animate } from "animejs";

// Direction follows the studied foreground / graphic field / information handoff.
// Transforms run through anime.js's native WAAPI renderer; no per-frame layout reads.
const directions = {
  weight_trend: {
    entry: [-180, 70, -3],
    paper: [260, 55, 5],
    field: [-280, -120, -9],
  },
  breast_body_measurements: {
    entry: [0, 150, 2],
    paper: [150, -100, -4],
    field: [280, 90, 8],
  },
  medication_history: {
    entry: [-220, 0, -4],
    paper: [250, 80, 3],
    field: [-340, 80, -12],
  },
  lab_history: {
    entry: [160, -80, 3],
    paper: [-180, 120, -3],
    field: [280, -80, 10],
  },
  daily_overview: {
    entry: [0, 170, -3],
    paper: [-180, -70, 4],
    field: [-300, 100, -8],
  },
  food_history: {
    entry: [200, 70, 3],
    paper: [-230, 0, -3],
    field: [320, 80, 12],
  },
};
export { SceneField } from "./StageArt";

const at = ([x, y, r], scale = 1) =>
  `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${scale})`;
const rest = "translate3d(0,0,0) rotate(0deg) scale(1)";
const noMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export function useSceneDirection(ref, identity, loaded) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !loaded || noMotion()) return;
    const native = [];
    const d = directions[identity] || directions.weight_trend;
    // The foreground is handing off directly to this new menu composition.
    const switching = !!document.querySelector(".menuChange");
    const lead = switching ? 60 : 80;
    const width = Math.min(innerWidth, 1680),
      height = Math.min(innerHeight, 1000);
    const distance = (v) =>
      switching
        ? [
            Math.sign(v[0] || 1) * width * 0.65,
            Math.sign(v[1] || 1) * height * 0.32,
            v[2] * 2,
          ]
        : v;
    const scope = createScope({ root: ref }).add(() => {
      const move = (node, from, delay, duration = 880, bounce = 0.13) => {
        if (!node) return;
        node.style.willChange = "transform";
        const a = waapi.animate(node, {
          transform: [from, rest],
          delay,
          duration,
          ease: `cubic-bezier(.18,${1 + bounce},.25,1)`,
          onComplete: () => {
            // WebKit can commit a stale underlying transform for an inert scroll subtree.
            // The composition has a defined rest pose; finalize it explicitly after cancellation.
            node.style.transform = "none";
            node.style.willChange = "auto";
          },
        });
        native.push(a);
      };
      move(
        root.querySelector(".sceneField"),
        at(distance(d.field), 1.2),
        lead,
        1150,
        0.04,
      );
      move(
        root.querySelector(".hero"),
        at(
          switching
            ? [-width * 0.5, -height * 0.12, -8]
            : [d.entry[0] * 0.65, -65, d.entry[2]],
        ),
        lead + 40,
        820,
        0.14,
      );
      move(
        root.querySelector(".weightHero"),
        at(distance(d.entry), 0.94),
        lead + 70,
        1000,
        0.18,
      );
      move(
        root.querySelector(".trajectory"),
        at(distance(d.paper), 1.025),
        lead + 150,
        1100,
        0.1,
      );
      const sections = Array.from(
        root.querySelectorAll(
          ":scope>.panel,:scope>.plan,:scope>.lab,:scope>.daily,:scope>.foodDay",
        ),
      ).slice(0, 8);
      sections.forEach((el, i) =>
        move(
          el,
          at(
            switching
              ? [
                  i % 2 ? width * 0.6 : -width * 0.6,
                  height * 0.2,
                  i % 2 ? 5 : -5,
                ]
              : [i % 2 ? 60 : -60, 100 + i * 12, i % 2 ? 1.5 : -1.5],
          ),
          lead + 170 + Math.min(i * 65, 180),
          900,
          0.1,
        ),
      );
      const path = root.querySelector(".weightLine");
      if (path)
        animate(svg.createDrawable(path), {
          draw: ["0 0", "0 1"],
          duration: 1150,
          delay: lead + 300,
          ease: "out(3)",
        });
    });
    const leave = () => {
      const groups = [
        [root.querySelector(".sceneField"), width * 0.55, -height * 0.2, 12],
        [root.querySelector(".hero"), -width * 0.65, -height * 0.15, -10],
        [root.querySelector(".weightHero"), -width * 0.8, height * 0.25, -8],
        [root.querySelector(".trajectory"), width * 0.85, -height * 0.2, 8],
        ...Array.from(
          root.querySelectorAll(
            ":scope>.panel,:scope>.plan,:scope>.lab,:scope>.daily,:scope>.foodDay",
          ),
        )
          .slice(0, 8)
          .map((el, i) => [
            el,
            (i % 2 ? 1 : -1) * width * 1.25,
            height * 0.4,
            (i % 2 ? 1 : -1) * 7,
          ]),
      ];
      groups.forEach(([node, x, y, r], i) => {
        if (node)
          native.push(
            waapi.animate(node, {
              transform: [
                getComputedStyle(node).transform === "none"
                  ? rest
                  : getComputedStyle(node).transform,
                at([x, y, r], 0.94),
              ],
              duration: 440,
              delay: Math.min(i * 12, 50),
              ease: "in(3)",
            }),
          );
      });
    };
    window.addEventListener("atlas:depart", leave);
    return () => {
      window.removeEventListener("atlas:depart", leave);
      native.forEach((a) => a.revert());
      scope.revert();
    };
  }, [identity, loaded]);
}
export function useTerminalDirection(ref, enabled) {
  useLayoutEffect(() => {
    if (!enabled || !ref.current || noMotion()) return;
    const animations = [];
    const run = () => {
      const root = ref.current;
      if (!root) return;
      const brand = root.querySelector(".brand");
      if (brand)
        animations.push(
          waapi.animate(brand, {
            transform: [
              "translate3d(-85px,-25px,0) rotate(-7deg) scale(.88)",
              rest,
            ],
            duration: 1100,
            ease: spring({ bounce: 0.15, duration: 1100 }),
          }),
        );
      const buttons = root.querySelectorAll(".tabs button");
      buttons.forEach((el, i) =>
        animations.push(
          waapi.animate(el, {
            transform: [
              `translate3d(${i % 2 ? -45 : 45}px,${70 + i * 8}px,0) rotate(${i % 2 ? 5 : -5}deg)`,
              rest,
            ],
            duration: 950,
            delay: 120 + i * 60,
            ease: spring({ bounce: 0.16, duration: 950 }),
          }),
        ),
      );
    };
    run();
    return () => animations.forEach((a) => a.revert());
  }, [enabled]);
}
