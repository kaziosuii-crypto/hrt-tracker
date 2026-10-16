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
    // The train is still covering the page at mount. Start the composition as it clears.
    const lead = document.querySelector(".commute") ? 500 : 80;
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
            node.style.willChange = "auto";
          },
        });
        native.push(a);
      };
      move(
        root.querySelector(".sceneField"),
        at(d.field, 1.15),
        lead,
        1150,
        0.04,
      );
      move(
        root.querySelector(".hero"),
        at([d.entry[0] * 0.65, -65, d.entry[2]]),
        lead + 40,
        820,
        0.14,
      );
      move(
        root.querySelector(".weightHero"),
        at(d.entry, 0.94),
        lead + 70,
        1000,
        0.18,
      );
      move(
        root.querySelector(".trajectory"),
        at(d.paper, 1.025),
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
          at([i % 2 ? 60 : -60, 100 + i * 12, i % 2 ? 1.5 : -1.5]),
          lead + 170 + i * 65,
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
      native.push(
        waapi.animate(root, {
          transform: [rest, "translate3d(0,-35px,0) scale(.975)"],
          duration: 420,
          ease: "inOut(3)",
        }),
      );
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
export function SceneField({ section }) {
  const index = Object.keys(directions).indexOf(section) + 1;
  return (
    <div className={"sceneField field" + index} aria-hidden="true">
      <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern
            id="atlas-dot-field"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4" cy="4" r="2.4" fill="currentColor" />
          </pattern>
        </defs>
        <path
          className="fieldInk"
          d="M740 -80L1100 80 1030 690 870 540 940 330 720 260 820 110Z"
        />
        <path
          className="fieldPaper"
          d="M870 50L1030 110 990 490 950 430 1005 170 825 115Z"
        />
        <path
          className="fieldDots"
          d="M640 70H1000V370L720 210Z"
          fill="url(#atlas-dot-field)"
        />
        <text x="700" y="530" className="fieldNumber">
          {String(index).padStart(2, "0")}
        </text>
        <path className="fieldSlash" d="M-40 640L700 570 350 650Z" />
      </svg>
    </div>
  );
}
