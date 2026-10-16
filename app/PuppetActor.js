"use client";
import { rig } from "../lib/rig-assets";
// Shared assembled rest pose. Shoulder/elbow are nested: the hand follows the elbow,
// and the elbow follows the shoulder. No complete-pose crossfades or duplicate hands.
export default function PuppetActor({ className = "" }) {
  return (
    <svg
      className={"puppetActor " + className}
      viewBox="0 0 900 1000"
      aria-hidden="true"
    >
      <g className="rigBody" style={{ transformOrigin: "470px 610px" }}>
        <g transform="translate(470 350)">
          <g className="rigHead">
            <image
              href={rig("head")}
              x="-250"
              y="-305"
              width="400"
              height="348"
            />
          </g>
        </g>
        <g transform="translate(840 360) scale(-.89 .89)">
          <image href={rig("torso")} width="696" height="683" />
        </g>
        <g transform="translate(264 515)">
          <g className="rigShoulder">
            <image
              href={rig("upper")}
              x="-222"
              y="-35"
              width="252"
              height="253"
            />
            <g transform="translate(-187 180)">
              <g className="rigElbow" style={{ transform: "rotate(-10deg)" }}>
                <image
                  href={rig("forearm")}
                  x="-20"
                  y="-260"
                  width="266.5"
                  height="288.5"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
