"use client";
import { useLayoutEffect, useRef } from "react";
import { createScope, createTimeline, waapi } from "animejs";
import { figure } from "../lib/figure-assets";
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
      for (const name of [".actorTurn", ".actorRest"]) {
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
      native(".actorHand", "transform", [
        {
          transform: "translate3d(85vw,80vh,0) rotate(34deg) scale(.72)",
          offset: 0,
          easing: "cubic-bezier(.25,.6,.2,1)",
        },
        {
          transform: "translate3d(-12vw,-12vh,0) rotate(-16deg) scale(1.2)",
          offset: 300 / MENU_DURATION,
          easing: "cubic-bezier(.55,0,.5,1)",
        },
        {
          transform: "translate3d(-110vw,-100vh,0) rotate(-56deg) scale(1.7)",
          offset: 760 / MENU_DURATION,
        },
        {
          transform: "translate3d(-110vw,-100vh,0) rotate(-56deg) scale(1.7)",
          offset: 1,
        },
      ]);
      native(".actorTurn", "transform", [
        {
          transform: "translate3d(65vw,38vh,0) rotate(15deg) scale(1.2)",
          offset: 0,
          easing: "cubic-bezier(.3,.6,.2,1)",
        },
        {
          transform: "translate3d(-40vw,-6vh,0) rotate(-18deg) scale(2.9)",
          offset: 400 / MENU_DURATION,
        },
        {
          transform: "translate3d(-33vw,-3vh,0) rotate(-14deg) scale(2.55)",
          offset: 540 / MENU_DURATION,
          easing: "cubic-bezier(.2,.7,.2,1)",
        },
        {
          transform: "translate3d(-5vw,2vh,0) rotate(-5deg) scale(1.15)",
          offset: 1000 / MENU_DURATION,
        },
        { transform: "translate3d(0,0,0) rotate(0deg) scale(1)", offset: 1 },
      ]);
      native(".actorTurn", "opacity", [
        { opacity: 0, offset: 0 },
        { opacity: 1, offset: 140 / MENU_DURATION },
        { opacity: 1, offset: 850 / MENU_DURATION },
        { opacity: 0, offset: 910 / MENU_DURATION },
        { opacity: 0, offset: 1 },
      ]);
      native(".actorRest", "transform", [
        {
          transform: "translate3d(-24vw,4vh,0) rotate(-13deg) scale(1.65)",
          offset: 0,
        },
        {
          transform: "translate3d(-24vw,4vh,0) rotate(-13deg) scale(1.65)",
          offset: 780 / MENU_DURATION,
          easing: "cubic-bezier(.18,1.08,.3,1)",
        },
        {
          transform: "translate3d(0,0,0) rotate(0deg) scale(1)",
          offset: 1480 / MENU_DURATION,
        },
        { transform: "translate3d(0,0,0) rotate(0deg) scale(1)", offset: 1 },
      ]);
      native(".actorRest", "opacity", [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: 850 / MENU_DURATION },
        { opacity: 1, offset: 910 / MENU_DURATION },
        { opacity: 1, offset: 1 },
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
      <img className="actorTurn" src={figure("turn")} alt="" />
      <img className="actorRest" src={figure("rest")} alt="" />
      <img className="actorHand" src={figure("hand")} alt="" />
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
