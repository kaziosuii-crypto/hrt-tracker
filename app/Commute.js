"use client";
import { useEffect, useRef } from "react";
import { createScope, createTimeline, waapi } from "animejs";
import { art } from "../lib/assets";
export const COMMUTE_DURATION = 2600;
export const COMMUTE_SWAP = 1420;
export default function Commute({ onCovered, onFinished, label }) {
  const root = useRef(null),
    callbacks = useRef({ onCovered, onFinished });
  callbacks.current = { onCovered, onFinished };
  useEffect(() => {
    let covered = false,
      finished = false;
    const cover = () => {
      if (!covered && !finished) {
        covered = true;
        callbacks.current.onCovered();
      }
    };
    const finish = () => {
      if (!finished) {
        finished = true;
        callbacks.current.onFinished();
      }
    };
    const scope = createScope({
      root,
      mediaQueries: { reduced: "(prefers-reduced-motion: reduce)" },
    }).add((self) => {
      if (self.matches.reduced) {
        cover();
        finish();
        return;
      }
      const native = (selector, keyframes) => {
        const node = root.current.querySelector(selector);
        const animation = waapi.animate(node, {
          transform: [keyframes[0].transform, keyframes.at(-1).transform],
          duration: COMMUTE_DURATION,
          ease: "linear",
        });
        // Anime.js owns lifecycle; explicit WAAPI offsets preserve the studied hold phases.
        animation.animations[0].effect.setKeyframes(keyframes);
        return animation;
      };
      const translate = (x) => `translate3d(${x}%,0,0)`;
      const bank = native(".commute-bank", [
        {
          transform: translate(-110),
          offset: 0,
          easing: "cubic-bezier(.215,.61,.355,1)",
        },
        { transform: translate(0), offset: 780 / 2600 },
        {
          transform: translate(0),
          offset: 1820 / 2600,
          easing: "cubic-bezier(.55,.055,.675,.19)",
        },
        { transform: translate(110), offset: 1 },
      ]);
      bank.onComplete = () => {
        cover();
        finish();
      };
      native(".train-interior", [
        { transform: "translate3d(-1%,0,0) scale(1.03)", offset: 0 },
        { transform: "translate3d(1%,0,0) scale(1.03)", offset: 1 },
      ]);
      native(".passengers-far", [
        { transform: translate(-48), offset: 0 },
        { transform: translate(-52), offset: 1 },
      ]);
      native(".passengers-mid", [
        { transform: translate(-53), offset: 0 },
        { transform: translate(-47), offset: 1 },
      ]);
      native(".passengers-near", [
        { transform: translate(-180), offset: 0 },
        {
          transform: translate(-180),
          offset: 360 / 2600,
          easing: "cubic-bezier(.455,.03,.515,.955)",
        },
        { transform: translate(-50), offset: 1360 / 2600 },
        {
          transform: translate(-50),
          offset: 1480 / 2600,
          easing: "cubic-bezier(.455,.03,.515,.955)",
        },
        { transform: translate(110), offset: 2400 / 2600 },
        { transform: translate(110), offset: 1 },
      ]);
      waapi.animate(root.current.querySelector(".transit-destination"), {
        opacity: [0, 0, 1, 1, 0, 0],
        duration: 2600,
        ease: "linear",
      });
      createTimeline().call(cover, COMMUTE_SWAP);
    });
    return () => {
      finished = true;
      scope.revert();
    };
  }, []);
  return (
    <div ref={root} className="commute" aria-hidden="true">
      <div className="commute-bank">
        <div className="commute-stage">
          <picture>
            <source
              media="(max-width:700px)"
              srcSet={art("carriage-mobile.webp")}
            />
            <img className="train-interior" src={art("carriage.webp")} alt="" />
          </picture>
          <img
            className="passengers-far"
            src={art("passengers-far.webp")}
            alt=""
          />
          <img
            className="passengers-mid"
            src={art("passengers-mid.webp")}
            alt=""
          />
          <img
            className="passengers-near"
            src={art("passengers-near.webp")}
            alt=""
          />
        </div>
        <div className="transit-destination">
          <small>ATLAS / TRANSFER</small>
          <strong>{label}</strong>
        </div>
      </div>
    </div>
  );
}
