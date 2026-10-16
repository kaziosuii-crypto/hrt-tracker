"use client";
import { useEffect, useRef } from "react";
export const COMMUTE_DURATION = 2100;
export const COMMUTE_SWAP = 1060;
export default function Commute({ onCovered, onFinished, label }) {
  const callbacks = useRef({ onCovered, onFinished });
  callbacks.current = { onCovered, onFinished };
  useEffect(() => {
    let active = true,
      swapped = false,
      frame;
    const start = performance.now();
    const tick = (now) => {
      if (!active) return;
      const elapsed = now - start;
      if (elapsed >= COMMUTE_SWAP && !swapped) {
        swapped = true;
        callbacks.current.onCovered();
      }
      if (elapsed >= COMMUTE_DURATION) {
        callbacks.current.onFinished();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div className="commute" aria-hidden="true">
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
            srcSet="/art/carriage-mobile.webp"
          />
          <img className="train-interior" src="/art/carriage.webp" alt="" />
        </picture>
        <img className="passengers-far" src="/art/passengers-far.webp" alt="" />
        <img className="passengers-mid" src="/art/passengers-mid.webp" alt="" />
        <img
          className="passengers-near"
          src="/art/passengers-near.webp"
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
