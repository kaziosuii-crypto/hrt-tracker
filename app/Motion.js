"use client";
import { useEffect, useRef } from "react";
import { animate, createScope, spring } from "animejs";
export const motionReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
