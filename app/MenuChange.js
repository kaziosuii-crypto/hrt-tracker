"use client";
import { useLayoutEffect, useRef } from "react";
import { createScope, createTimeline, waapi } from "animejs";
import PuppetActor from "./PuppetActor";
import { ArchivePattern } from "./StageArt";
import {
  CAMERA_IMAGE,
  CAMERA_SIZE,
  PALM_RECT,
  CAMERA_COVER,
} from "../lib/camera-assets";
export const MENU_DURATION = 2100;
export const MENU_SWAP = 760;

// A complete, coherent perspective drawing moves towards the lens as one object.
// The hand never scales independently of its shoulder/chest/head.
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
        sr = document.querySelector(".content").getBoundingClientRect();
      Object.assign(root.current.querySelector(".actorPuppet").style, {
        left: sr.left + field.offsetLeft + portrait.offsetLeft + "px",
        top: sr.top + field.offsetTop + portrait.offsetTop + "px",
        width: portrait.offsetWidth + "px",
        height: portrait.offsetHeight + "px",
        ...(innerWidth <= 700
          ? {
              clipPath: `inset(0 0 ${Math.max(0, portrait.offsetHeight - 175)}px 0)`,
            }
          : {}),
      });
    }
    const scope = createScope({ root }).add(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }
      const native = (selector, property, frames, done) => {
        const a = waapi.animate(root.current.querySelector(selector), {
          [property]: [frames[0][property], frames.at(-1)[property]],
          duration: MENU_DURATION,
          ease: "linear",
          ...(done ? { onComplete: done } : {}),
        });
        a.animations[0].effect.setKeyframes(frames);
        return a;
      };
      const t = (ms) => ms / MENU_DURATION,
        phone = innerWidth <= 700;
      const base = Math.min(
        (innerHeight * 0.82) / CAMERA_SIZE.height,
        (innerWidth * (phone ? 1.15 : 0.72)) / CAMERA_SIZE.width,
      );
      const cx = PALM_RECT.x + PALM_RECT.width / 2;
      const bx = innerWidth * (phone ? 0.18 : 0.59) - cx * base,
        by = phone
          ? innerHeight * 0.12
          : (innerHeight - CAMERA_SIZE.height * base) / 2;
      // This source rectangle is fully opaque in the actual adopted WebP.
      // Uniform zoom maps it beyond all four viewport edges; the page swaps inside that interval.
      const coveredRect = phone ? CAMERA_COVER.phone : CAMERA_COVER.desktop;
      const zoom =
        Math.max(
          innerWidth / coveredRect.width,
          innerHeight / coveredRect.height,
        ) * 1.06;
      const coverX = coveredRect.x + coveredRect.width / 2;
      const coverY = coveredRect.y + coveredRect.height / 2;
      const full = `translate3d(${innerWidth / 2 - coverX * zoom}px,${innerHeight / 2 - coverY * zoom}px,0) scale(${zoom}) rotate(0deg)`;
      const fit = `translate3d(${bx}px,${by}px,0) scale(${base}) rotate(0deg)`;
      native(".actorLens", "transform", [
        {
          transform: `translate3d(${innerWidth * 1.05}px,${by + 60}px,0) scale(${base * 0.96}) rotate(-7deg)`,
          offset: 0,
          easing: "cubic-bezier(.18,.8,.2,1)",
        },
        { transform: fit, offset: t(260) },
        { transform: fit, offset: t(360), easing: "cubic-bezier(.62,0,.2,1)" },
        { transform: full, offset: t(690) },
        {
          transform: full,
          offset: t(850),
          easing: "cubic-bezier(.45,0,.35,1)",
        },
        {
          transform: `translate3d(${innerWidth + 60}px,${-innerHeight * 0.18}px,0) scale(${zoom * 0.72}) rotate(0deg)`,
          offset: t(1370),
        },
        {
          transform: `translate3d(${innerWidth + 60}px,${-innerHeight * 0.18}px,0) scale(${zoom * 0.72}) rotate(0deg)`,
          offset: 1,
        },
      ]);
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
            offset: t(340),
          },
          {
            transform: "translate3d(0,0,0) rotate(0deg) scale(1.05)",
            offset: t(900),
            easing: "cubic-bezier(.2,.7,.2,1)",
          },
          {
            transform: "translate3d(105vw,-8vh,0) rotate(8deg) scale(1)",
            offset: t(1420),
          },
          {
            transform: "translate3d(105vw,-8vh,0) rotate(8deg) scale(1)",
            offset: 1,
          },
        ],
        finish,
      );
      native(".actorPuppet", "transform", [
        { transform: "translate3d(70vw,4vh,0) rotate(8deg)", offset: 0 },
        {
          transform: "translate3d(70vw,4vh,0) rotate(8deg)",
          offset: t(1000),
          easing: "cubic-bezier(.18,1.04,.3,1)",
        },
        { transform: "translate3d(0,0,0) rotate(0deg)", offset: t(1830) },
        { transform: "translate3d(0,0,0) rotate(0deg)", offset: 1 },
      ]);
      native(".actorPuppet", "opacity", [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: t(1000) },
        { opacity: 1, offset: t(1260) },
        { opacity: 1, offset: 1 },
      ]);
      native(".actorPaperTail", "transform", [
        { transform: "translate3d(-120vw,35vh,0) rotate(-18deg)", offset: 0 },
        {
          transform: "translate3d(-120vw,35vh,0) rotate(-18deg)",
          offset: t(1140),
          easing: "cubic-bezier(.2,.75,.2,1)",
        },
        {
          transform: "translate3d(-7vw,10vh,0) rotate(-5deg)",
          offset: t(1600),
          easing: "cubic-bezier(.45,0,.4,1)",
        },
        { transform: "translate3d(120vw,0,0) rotate(8deg)", offset: t(1980) },
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
      <ArchivePattern className="actorPattern" />
      <div className="actorPuppet">
        <PuppetActor />
      </div>
      <img
        className="actorLens"
        src={CAMERA_IMAGE}
        width={CAMERA_SIZE.width}
        height={CAMERA_SIZE.height}
        alt=""
      />
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
