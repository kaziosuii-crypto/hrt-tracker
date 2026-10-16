"use client";
import { useEffect, useRef } from "react";
import {
  animate,
  createScope,
  createTimeline,
  spring,
  stagger,
  splitText,
  svg,
  onScroll,
} from "animejs";
export const motionReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export function useHeadlineMotion(ref) {
  useEffect(() => {
    if (!ref.current) return;
    let split;
    const scope = createScope({
      root: ref,
      mediaQueries: { reduced: "(prefers-reduced-motion: reduce)" },
    }).add((self) => {
      if (self.matches.reduced) return;
      const entrance = document.querySelector(".commute") ? 360 : 0;
      const title = ref.current.querySelector("h1");
      split = splitText(title, {
        words: false,
        chars: '<span class="headlineGlyph">{value}</span>',
      });
      createTimeline()
        .add(
          split.chars,
          {
            y: [20, 0],
            rotate: [-5, 0],
            opacity: [0, 1],
            duration: 500,
            delay: stagger(31),
            ease: "out(4)",
          },
          entrance,
        )
        .add(
          ".heroEyebrow b",
          {
            x: [-16, 0],
            rotate: [-7, -3],
            opacity: [0, 1],
            duration: 430,
            ease: "out(3)",
          },
          entrance + 60,
        );
      const path = ref.current.querySelector(".chapter-rule path");
      if (path)
        animate(svg.createDrawable(path), {
          draw: ["0 0", "0 1"],
          duration: 650,
          delay: 100,
          ease: "out(3)",
        });
      return () => {
        split?.revert();
        split = null;
      };
    });
    return () => scope.revert();
  }, []);
}
export function useStageMotion(ref, identity, loaded) {
  useEffect(() => {
    if (!ref.current || !loaded) return;
    const scope = createScope({
      root: ref,
      mediaQueries: { reduced: "(prefers-reduced-motion: reduce)" },
    }).add((self) => {
      if (self.matches.reduced) return;
      const rows = Array.from(
        ref.current.querySelectorAll(
          ".weightRow,.metric,.medicine,.analyte,.intake,.facts span",
        ),
      ).slice(0, 35);
      if (rows.length)
        animate(rows, {
          y: [12, 0],
          opacity: [0.45, 1],
          duration: 440,
          delay: stagger(27, { start: 80 }),
          ease: "out(3)",
        });
      const path = ref.current.querySelector(".weightLine");
      if (path)
        animate(svg.createDrawable(path), {
          draw: ["0 0", "0 1"],
          duration: 1050,
          ease: "out(3)",
        });
      const blocks = Array.from(
        ref.current.querySelectorAll(
          ":scope > .panel,:scope > .lab,:scope > .daily,:scope > .foodDay",
        ),
      ).slice(0, 10);
      blocks.forEach((block) =>
        animate(block, {
          y: [12, 0],
          opacity: [0.8, 1],
          duration: 500,
          ease: "out(3)",
          autoplay: onScroll({
            target: block,
            enter: "bottom-=24 top",
            repeat: false,
          }),
        }),
      );
    });
    return () => scope.revert();
  }, [identity, loaded]);
}
export function NavButton({ active, current, label, onClick, children }) {
  const root = useRef(null),
    scope = useRef(null);
  useEffect(() => {
    scope.current = createScope({
      root,
      mediaQueries: { reduced: "(prefers-reduced-motion: reduce)" },
    }).add((self) => {
      if (self.matches.reduced) return;
      self.add("pose", (scale, rotate, y) =>
        animate(".navWord", {
          scale,
          rotate,
          y,
          ease: spring({ bounce: 0.25, duration: 360 }),
        }),
      );
      self.methods.pose(active ? 1.07 : 1, active ? -4 : 0, active ? -3 : 0);
    });
    return () => scope.current?.revert();
  }, [active]);
  const pose = (scale, rotate, y) =>
    scope.current?.methods.pose?.(scale, rotate, y);
  return (
    <button
      ref={root}
      className={active ? "active" : ""}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      onClick={onClick}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") pose(1.09, -3, -4);
      }}
      onPointerLeave={() =>
        pose(active ? 1.07 : 1, active ? -4 : 0, active ? -3 : 0)
      }
      onPointerDown={() => pose(0.93, 2, 3)}
      onPointerUp={() =>
        pose(active ? 1.07 : 1, active ? -4 : 0, active ? -3 : 0)
      }
    >
      {children}
    </button>
  );
}
export function MotionDetails({
  className = "",
  initialOpen = false,
  summary,
  children,
}) {
  const ref = useRef(null),
    animation = useRef(null),
    bodyAnimation = useRef(null),
    opened = useRef(initialOpen);
  useEffect(
    () => () => {
      animation.current?.revert();
      bodyAnimation.current?.revert();
    },
    [],
  );
  const toggle = (e) => {
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    animation.current?.cancel();
    const from = el.offsetHeight;
    opened.current = !opened.current;
    const toOpen = opened.current;
    if (motionReduced()) {
      el.open = toOpen;
      el.style.height = "";
      return;
    }
    el.open = true;
    el.style.height = "auto";
    const to = toOpen
      ? el.scrollHeight
      : el.querySelector("summary").offsetHeight +
        parseFloat(getComputedStyle(el).paddingTop) +
        parseFloat(getComputedStyle(el).paddingBottom);
    el.style.overflow = "hidden";
    animation.current = animate(el, {
      height: [from, to],
      duration: 420,
      ease: "out(4)",
      onComplete: () => {
        el.open = toOpen;
        el.style.height = "";
        el.style.overflow = "";
      },
    });
    bodyAnimation.current?.cancel();
    if (toOpen)
      bodyAnimation.current = animate(el.querySelector(".disclosureBody"), {
        opacity: [0.3, 1],
        y: [-7, 0],
        duration: 370,
        ease: "out(3)",
      });
  };
  return (
    <details ref={ref} className={className} open={initialOpen}>
      <summary onClick={toggle}>{summary}</summary>
      <div className="disclosureBody">{children}</div>
    </details>
  );
}
