"use client";

import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
const safeUrl = (value) => {
  const url = String(value || "").trim();
  return /^\/(?!\/)/.test(url) || /^https:\/\//i.test(url) ? url : "";
};
const dateLabel = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return "";
  const [y, m, d] = String(value).split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
};

function buildPhoto(label, url, food) {
  const link = document.createElement("a");
  link.className = "mealPhoto";
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer noopener";
  link.setAttribute("aria-label", `${food || "餐食"}${label}照片，点击查看原图`);

  const image = document.createElement("img");
  image.src = url;
  image.alt = `${food || "餐食"}${label}照片`;
  image.loading = "lazy";
  image.decoding = "async";

  const badge = document.createElement("span");
  badge.textContent = label;

  link.append(image, badge);
  return link;
}

export default function MealPhotoEnhancer() {
  const rowsRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    let disposed = false;

    const apply = () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        if (disposed || !rowsRef.current.length) return;

        document.querySelectorAll(".foodDay").forEach((dayNode) => {
          const day = clean(dayNode.querySelector(":scope > button > b")?.textContent);
          dayNode.querySelectorAll(".intake").forEach((card) => {
            if (card.querySelector("[data-meal-photos]")) return;

            const title = clean(card.querySelector(":scope > b")?.textContent);
            const time = clean(card.querySelector(":scope > time")?.textContent);
            const row = rowsRef.current.find((candidate) => {
              const expectedTitle = clean(`${candidate.meal_type || "摄入事件"} · ${candidate.food || "内容未记录"}`);
              const expectedTime = clean(candidate.time_text || "时间未记录");
              return (
                dateLabel(candidate.record_date) === day &&
                expectedTitle === title &&
                expectedTime === time
              );
            });
            if (!row) return;

            const before = safeUrl(row.photo_before_url);
            const after = safeUrl(row.photo_after_url);
            if (!before && !after) return;

            const gallery = document.createElement("div");
            gallery.className = "mealPhotos";
            gallery.dataset.mealPhotos = "true";
            gallery.setAttribute("role", "group");
            gallery.setAttribute("aria-label", "餐前餐后照片");
            if (before) gallery.append(buildPhoto("餐前", before, row.food));
            if (after) gallery.append(buildPhoto("餐后", after, row.food));
            card.querySelector(".details")?.before(gallery) || card.append(gallery);
          });
        });
      });
    };

    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token || disposed) return;

      const response = await fetch("/api/meal-photos", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      if (!response.ok || disposed) return;
      const rows = await response.json();
      if (!Array.isArray(rows)) return;
      rowsRef.current = rows;
      apply();
    };

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });

    const onFocus = () => load();
    const onRefresh = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("atlas:meal-photos-refresh", onRefresh);

    const { data: authListener } = supabase.auth.onAuthStateChange(() => load());
    load();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("atlas:meal-photos-refresh", onRefresh);
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <style>{`
      .mealPhotos {
        grid-column: 2 / -1;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 220px));
        gap: 10px;
        margin: 4px 0 2px;
      }
      .mealPhoto {
        position: relative;
        display: block;
        min-width: 0;
        overflow: hidden;
        border: 1px solid #ffffff26;
        background: #15171a;
        text-decoration: none;
      }
      .mealPhoto img {
        display: block;
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        transition: transform .2s ease, opacity .2s ease;
      }
      .mealPhoto:hover img { transform: scale(1.025); }
      .mealPhoto span {
        position: absolute;
        left: 8px;
        bottom: 8px;
        padding: 5px 8px;
        background: #111d;
        color: #f3eee4;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .16em;
        border-left: 3px solid #ed2634;
      }
      @media (max-width: 700px) {
        .mealPhotos {
          grid-column: 1 / -1;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 7px;
        }
        .mealPhoto span { font-size: 8px; }
      }
    `}</style>
  );
}
