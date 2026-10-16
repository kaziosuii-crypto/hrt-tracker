"use client";
import { figure } from "../lib/figure-assets";
export function ArchivePattern({ className = "" }) {
  return (
    <img
      className={className}
      src="/art/atlas-actor-e6a55eadab49/pattern-v1.webp"
      alt=""
      aria-hidden="true"
    />
  );
}
const titles = {
  weight_trend: "PROGRESS REPORT",
  breast_body_measurements: "WEEKLY SCAN",
  medication_history: "PLAN / LOADOUT",
  lab_history: "LAB DOSSIER",
  daily_overview: "DAILY SHEET",
  food_history: "INTAKE LOG",
};
export function SceneField({ section }) {
  return (
    <div className="sceneField atlasStage" aria-hidden="true">
      <ArchivePattern className="atlasPattern" />
      <img
        className="scenePortrait"
        src={figure("rest")}
        alt=""
        width="700"
        height="700"
      />
      <div className="sceneRibbon">
        <b>{titles[section]}</b>
        <span>HRT ATLAS / PERSONAL ARCHIVE</span>
      </div>
    </div>
  );
}
