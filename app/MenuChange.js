"use client";
import { useLayoutEffect, useRef } from "react";
import { createScope, createTimeline, waapi } from "animejs";
import PuppetActor from "./PuppetActor";
import { ArchivePattern } from "./StageArt";
export const MENU_DURATION = 1800;
export const MENU_SWAP = 460;

// Studied reference: forearm -> shoulder/turn -> left information -> right portrait -> paper tail.
export default function MenuChange({ onCovered, onFinished }) {
  const root = useRef(null),
    callbacks = useRef({ onCovered, onFinished });
  callbacks.current = { onCovered, onFinished };
  useLayoutEffect(() => {
    let disposed = false,
      covered = false,
      finished = false;
    const cover = () => {
      if (!disposed && !covered) {
        covered = true;
        callbacks.current.onCovered();
      }
    };
    const finish = () => {
      if (!disposed && !finished) {
        cover();
        finished = true;
        callbacks.current.onFinished();
      }
    };
    const portrait = document.querySelector(".scenePortrait");
    if (portrait) {
      const field = portrait.offsetParent,
        stage = document.querySelector(".content"),
        sr = stage.getBoundingClientRect();
      const r = {
        left: sr.left + field.offsetLeft + portrait.offsetLeft,
        top: sr.top + field.offsetTop + portrait.offsetTop,
        width: portrait.offsetWidth,
        height: portrait.offsetHeight,
      };
      for (const name of [".actorPuppet"]) {
        const el = root.current.querySelector(name);
        Object.assign(el.style, {
          left: r.left + "px",
          top: r.top + "px",
          width: r.width + "px",
          height: r.height + "px",
        });
      }
    }
    const scope = createScope({ root }).add(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }
      const native = (selector, property, frames, done) => {
        const node = root.current.querySelector(selector);
        const a = waapi.animate(node, {
          [property]: [frames[0][property], frames.at(-1)[property]],
          duration: MENU_DURATION,
          ease: "linear",
          ...(done ? { onComplete: done } : {}),
        });
        a.animations[0].effect.setKeyframes(frames);
        return a;
      };
      native(
        ".actorPattern",
        "transform",
        [
          {
            transform: "translate3d(105vw,-20vh,0) rotate(18deg) scale(1.2)",
            offset: 0,
            easing: "cubic-bezier(.45,0,.25,1)",
          },
          {
            transform: "translate3d(0,0,0) rotate(0deg) scale(1.05)",
            offset: 340 / MENU_DURATION,
          },
          {
            transform: "translate3d(0,0,0) rotate(0deg) scale(1.05)",
            offset: 530 / MENU_DURATION,
            easing: "cubic-bezier(.2,.7,.2,1)",
          },
          {
            transform: "translate3d(105vw,-8vh,0) rotate(8deg) scale(1)",
            offset: 1120 / MENU_DURATION,
          },
          {
            transform: "translate3d(105vw,-8vh,0) rotate(8deg) scale(1)",
            offset: 1,
          },
        ],
        finish,
      );
      const actor = root.current.querySelector(".actorPuppet");
      const box = actor.getBoundingClientRect();
      const phone = innerWidth <= 700;
      const scale = Math.min(
        phone ? 1.38 : 1.12,
        (innerHeight * 0.82) / box.height,
      );
      const x = (phone ? innerWidth * 0.08 : innerWidth * 0.55) - box.left;
      const y = Math.max(10, (innerHeight - box.height * scale) / 2) - box.top;
      native(".actorPuppet", "transform", [
        {
          transform: `translate3d(${x + innerWidth * 0.4}px,${y + 70}px,0) scale(${scale * 0.94})`,
          offset: 0,
          easing: "cubic-bezier(.2,.8,.2,1)",
        },
        {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`,
          offset: 300 / MENU_DURATION,
        },
        {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`,
          offset: 840 / MENU_DURATION,
          easing: "cubic-bezier(.2,.8,.25,1)",
        },
        {
          transform: "translate3d(0,0,0) scale(1)",
          offset: 1560 / MENU_DURATION,
        },
        { transform: "translate3d(0,0,0) scale(1)", offset: 1 },
      ]);
      if (phone) {
        const bottom = Math.max(0, box.height - 175);
        native(".actorPuppet", "clipPath", [
          { clipPath: "inset(0px 0px 0px 0px)", offset: 0 },
          {
            clipPath: "inset(0px 0px 0px 0px)",
            offset: 1340 / MENU_DURATION,
            easing: "cubic-bezier(.2,.8,.3,1)",
          },
          {
            clipPath: `inset(0px 0px ${bottom}px 0px)`,
            offset: 1680 / MENU_DURATION,
          },
          { clipPath: `inset(0px 0px ${bottom}px 0px)`, offset: 1 },
        ]);
      }
      const joint = (selector, angles) =>
        native(
          selector,
          "transform",
          angles.map(([ms, angle]) => ({
            transform: `rotate(${angle}deg)`,
            offset: ms / MENU_DURATION,
            easing: "cubic-bezier(.3,.05,.25,1)",
          })),
        );
      joint(".rigShoulder", [
        [0, 0],
        [200, -12],
        [580, 18],
        [980, -5],
        [1420, 0],
        [1800, 0],
      ]);
      joint(".rigElbow", [
        [0, -10],
        [240, -27],
        [650, 13],
        [1080, -14],
        [1480, -10],
        [1800, -10],
      ]);
      joint(".rigHead", [
        [0, 0],
        [250, 4],
        [720, -5],
        [1300, 1],
        [1550, 0],
        [1800, 0],
      ]);
      joint(".rigBody", [
        [0, 3],
        [280, -3],
        [720, 2],
        [1450, 0],
        [1800, 0],
      ]);
      native(".actorPaperTail", "transform", [
        { transform: "translate3d(-120vw,35vh,0) rotate(-18deg)", offset: 0 },
        {
          transform: "translate3d(-120vw,35vh,0) rotate(-18deg)",
          offset: 870 / MENU_DURATION,
          easing: "cubic-bezier(.2,.75,.2,1)",
        },
        {
          transform: "translate3d(-7vw,10vh,0) rotate(-5deg)",
          offset: 1260 / MENU_DURATION,
          easing: "cubic-bezier(.45,0,.4,1)",
        },
        {
          transform: "translate3d(120vw,0,0) rotate(8deg)",
          offset: 1700 / MENU_DURATION,
        },
        { transform: "translate3d(120vw,0,0) rotate(8deg)", offset: 1 },
      ]);
      createTimeline().call(cover, MENU_SWAP);
    });
    return () => {
      disposed = true;
      scope.revert();
    };
  }, []);
  return (
    <div className="menuChange actorChange" ref={root} aria-hidden="true">
      <ArchivePattern id="atlas-moving-fold" className="actorPattern" />
      <div className="actorPuppet">
        <PuppetActor />
      </div>
      <svg
        className="actorPaperTail"
        viewBox="0 0 1400 230"
        preserveAspectRatio="none"
      >
        <path
          fill="#eee9df"
          d="M-30 155Q520 250 1430 5L1430 70Q700 280 -30 210Z"
        />
        <path fill="#ef1539" d="M200 205L1130 55 1020 138 400 228Z" />
      </svg>
    </div>
  );
}
