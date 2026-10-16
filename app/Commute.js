"use client";
import { useEffect, useRef } from "react";
import { createScope, createTimeline } from "animejs";
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
      if (!covered) {
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
      createTimeline({ onComplete: finish })
        .add(
          ".commute-bank",
          { x: ["-110%", "0%"], duration: 780, ease: "out(3)" },
          0,
        )
        .add(".commute-bank", { x: "110%", duration: 780, ease: "in(3)" }, 1820)
        .add(
          ".train-interior",
          { x: ["-1%", "1%"], scale: 1.03, duration: 2600, ease: "linear" },
          0,
        )
        .add(
          ".passengers-far",
          { x: ["-48%", "-52%"], duration: 2600, ease: "linear" },
          0,
        )
        .add(
          ".passengers-mid",
          { x: ["-53%", "-47%"], duration: 2600, ease: "linear" },
          0,
        )
        .add(
          ".passengers-near",
          { x: ["-180%", "-50%"], duration: 1000, ease: "inOut(2)" },
          360,
        )
        .add(
          ".passengers-near",
          { x: "110%", duration: 920, ease: "inOut(2)" },
          1480,
        )
        .add(
          ".transit-destination",
          { opacity: [0, 1], y: [7, 0], duration: 280, ease: "out(3)" },
          850,
        )
        .add(
          ".transit-destination",
          { opacity: 0, duration: 220, ease: "in(2)" },
          1700,
        )
        .call(cover, COMMUTE_SWAP);
    });
    return () => {
      finished = true;
      scope.revert();
    };
  }, []);
  return (
    <div ref={root} className="commute" aria-hidden="true">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="atlas-solid-ink" colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0 0 1 1" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <div className="commute-bank">
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
        <div className="transit-destination">
          <small>ATLAS / TRANSFER</small>
          <strong>{label}</strong>
        </div>
      </div>
    </div>
  );
}
