"use client";
import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  Download,
  FileHeart,
  FileText,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  Utensils,
  Weight,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import Commute from "./Commute";
import {
  useSceneDirection,
  useTerminalDirection,
  SceneField,
} from "./Direction";
import { NavButton, MotionDetails } from "./Motion";
import { warmArt } from "../lib/art-cache";
import {
  recordedAt,
  sessionKey,
  sessionDate,
  labFlag,
  cleanRows,
  isPendingIntake,
  day as validDay,
} from "../lib/records";
const tabs = [
  ["weight_trend", "体重", "PROGRESS REPORT", Weight],
  ["breast_body_measurements", "身体", "WEEKLY SCAN", Activity],
  ["medication_history", "HRT", "PLAN / LOADOUT", FileHeart],
  ["lab_history", "化验", "LAB DOSSIER", FileText],
  ["daily_overview", "每日", "DAILY SHEET", CalendarDays],
  ["food_history", "饮食", "INTAKE LOG", Utensils],
];
const meals = ["早餐", "午餐", "晚餐"],
  labels = {
    weight_kg: "体重",
    bmi: "BMI",
    body_fat_pct: "体脂率",
    measured_at: "测量时间",
    measured_date: "测量日期",
    record_date: "日期",
    category: "类别",
    metric: "指标",
    side: "侧别",
    adopted_value: "采用值",
    raw_value: "原始值",
    unit: "单位",
    start_date: "开始日期",
    end_date: "结束日期",
    medication: "药物",
    formulation: "剂型",
    prescribed_dose_frequency: "剂量 / 频率",
    test_name: "检验项目",
    result_numeric: "数值",
    result_text: "结果",
    reference_low: "参考下限",
    reference_high: "参考上限",
    flag: "状态",
    meal_type: "类型",
    food: "食物",
    time_text: "时间",
    estimated_kcal: "热量",
    sleep_hours: "睡眠",
    steps: "步数",
    source: "来源",
    confidence: "可信度",
    estimated_kcal_total: "估算总热量 / kcal",
    water_zero_drink_ml: "饮水 / 无糖饮料 ml",
    sugary_drink_ml: "含糖饮料 ml",
    bedtime_text: "入睡",
    wake_time_text: "起床",
    activity: "活动",
    course_load: "课程负荷",
    notes: "备注",
    morning_weight_kg: "晨重 kg",
    binge_event: "暴食事件",
    hunger_0_10: "饥饿感 / 10",
    mood_energy_0_10: "精力 / 10",
  };
const first = (r, ks) => {
  for (const k of ks) if (r?.[k] != null && r[k] !== "") return r[k];
  return null;
};
const n = (x) =>
  x == null || x === "" || !Number.isFinite(Number(x)) ? null : Number(x);
const day = validDay;
const dt = (r) => first(r, ["measured_date"]) || recordedAt(r);
const date = (x) => {
  if (!x) return "日期未记录";
  let s = String(x);
  if (/^\d{4}-\d\d-\d\d$/.test(s)) {
    let a = s.split("-");
    return a[0] + "年" + Number(a[1]) + "月" + Number(a[2]) + "日";
  }
  let d = new Date(x);
  return Number.isNaN(+d)
    ? "日期未记录"
    : new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
};
function group(rows, key) {
  let m = new Map();
  (rows || []).forEach((r) => {
    let k = String(key(r) ?? "unknown");
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  });
  return m;
}
const batch = sessionKey;
function Details({ r }) {
  return (
    <MotionDetails className="details" summary="来源 / 原始记录">
      <dl>
        {Object.entries(r || {})
          .filter(([k, v]) => v != null && typeof v !== "object")
          .map(([k, v]) => (
            <div key={k}>
              <dt>{labels[k] || k}</dt>
              <dd>{String(v)}</dd>
            </div>
          ))}
      </dl>
    </MotionDetails>
  );
}
function Head({ i, title, desc }) {
  const ref = useRef(null);

  const t = tabs[i];
  return (
    <header
      ref={ref}
      className={"hero hero" + i}
      data-chapter={String(i + 1).padStart(2, "0")}
    >
      <div className="heroEyebrow">
        <span>HRT ATLAS / {String(i + 1).padStart(2, "0")}</span>
        <b>{t[2]}</b>
      </div>
      <svg className="chapter-rule" viewBox="0 0 600 20" aria-hidden="true">
        <path d="M2 14 L580 4 L568 15" />
      </svg>
      <div className="heroCopy">
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
    </header>
  );
}
function Empty({ children = "暂无记录" }) {
  return (
    <div className="empty">
      <small>ARCHIVE / 00</small>
      <b>{children}</b>
      <span>只呈现真实记录，不补造日期或事件。</span>
    </div>
  );
}
function WeightPage({ rows }) {
  const a = rows
      .filter(
        (r) =>
          day(first(r, ["measured_at", "measured_date"])) &&
          n(r.weight_kg) != null,
      )
      .sort((x, y) => String(dt(x)).localeCompare(String(dt(y)))),
    [focus, F] = useState(null),
    last = a.at(-1),
    start = a[0],
    prev = a.at(-2),
    active = a[focus] || last;
  if (!last)
    return (
      <>
        <Head i={0} title="纵向进度" desc="每次真实称重是一枚坐标。" />
        <Empty>没有带实际测量日期的称重</Empty>
      </>
    );
  const vals = a.map((r) => n(r.weight_kg)),
    lo = Math.floor(Math.min(...vals) - 1),
    hi = Math.ceil(Math.max(...vals) + 1),
    times = a.map((r) => Date.parse(day(dt(r)) + "T12:00:00Z")),
    min = times[0],
    max = times.at(-1),
    pts = a.map((r, i) => [
      56 + (max === min ? 320 : ((times[i] - min) / (max - min)) * 640),
      240 - ((n(r.weight_kg) - lo) / (hi - lo)) * 200,
    ]),
    path = pts.map((p, i) => (i ? "L" : "M") + p.join(" ")).join(" "),
    delta = (r, p) =>
      p
        ? (n(r.weight_kg) - n(p.weight_kg) > 0 ? "+" : "") +
          (n(r.weight_kg) - n(p.weight_kg)).toFixed(1) +
          " kg"
        : "起点";
  return (
    <>
      <Head
        i={0}
        title="体重进度报告"
        desc="每一次真实测量，连接成长期轨迹。"
      />
      <div className="weightLayout">
        <section className="weightHero">
          <small className="latestStamp">
            LATEST <span>/ {date(dt(last))}</span>
          </small>
          <strong>
            {last.weight_kg}
            <i>kg</i>
          </strong>
          <div className="stats">
            <span>
              较上次<b>{delta(last, prev)}</b>
            </span>
            <span>
              累计变化<b>{delta(last, start)}</b>
            </span>
            <span>
              记录起点<b>{start.weight_kg} kg</b>
            </span>
          </div>
          <div className="extras">
            {["bmi", "body_fat_pct", "source", "confidence"]
              .filter((k) => last[k] != null)
              .map((k) => (
                <span key={k}>
                  {labels[k] || k}{" "}
                  <b>
                    {String(last[k])}
                    {k === "body_fat_pct" ? "%" : ""}
                  </b>
                </span>
              ))}
          </div>
        </section>
        <section className="panel trajectory">
          <div className="sect">
            <b>
              TRAJECTORY <i>/ KG</i>
            </b>
            <small>{a.length} 次真实测量</small>
          </div>
          <div className="chartScroll">
            <svg
              viewBox="0 0 760 280"
              style={{ minWidth: Math.min(1600, Math.max(320, a.length * 12)) }}
              className="chart"
              role="img"
              aria-label="体重趋势，横坐标为实际日期，纵坐标为公斤"
            >
              {[0, 1, 2].map((i) => {
                let y = 40 + i * 100;
                return (
                  <g key={i}>
                    <path
                      d={"M56 " + y + "H716"}
                      stroke="#ffffff38"
                      strokeWidth="1.5"
                    />
                    <text x="8" y={y + 4} fill="#f3eee4" fontSize="17">
                      {(hi - (i * (hi - lo)) / 2).toFixed(1)}
                    </text>
                  </g>
                );
              })}
              <path
                className="weightLine"
                d={path}
                fill="none"
                stroke="#f0474e"
                strokeWidth="6"
              />
              {pts.map((p, i) => (
                <g
                  key={i}
                  onClick={() => F(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") F(i);
                  }}
                  tabIndex="0"
                  role="button"
                  aria-label={date(dt(a[i])) + " " + a[i].weight_kg + "公斤"}
                >
                  <circle cx={p[0]} cy={p[1]} r="16" fill="transparent" />
                  <circle
                    cx={p[0]}
                    cy={p[1]}
                    r={active === a[i] ? 8 : 5}
                    fill={active === a[i] ? "#fff" : "#ed2634"}
                  />
                </g>
              ))}
              <text x="56" y="270" fill="#f3eee4" fontSize="17">
                {day(dt(start))}
              </text>
              <text
                x="716"
                y="270"
                textAnchor="end"
                fill="#f3eee4"
                fontSize="17"
              >
                {day(dt(last))}
              </text>
            </svg>
          </div>
          <div className="chartFocus" aria-live="polite">
            <span>{date(dt(active))}</span>
            <b>{active.weight_kg} kg</b>
            <small>触摸节点查看记录</small>
          </div>
        </section>
      </div>
      <section className="panel">
        <h2>
          MEASUREMENT ARCHIVE <span>测量记录</span>
        </h2>
        {a
          .slice()
          .reverse()
          .map((r, i) => (
            <article className="weightRow" key={r.id || i}>
              <small>{date(dt(r))}</small>
              <b>{r.weight_kg} kg</b>
              <i>{delta(r, a[a.length - i - 2])}</i>
              <Details r={r} />
            </article>
          ))}
      </section>
    </>
  );
}
function BodyPage({ rows }) {
  let sessions = Array.from(group(rows, batch).entries()).sort((a, b) =>
      String(sessionDate(b[1]) || "").localeCompare(
        String(sessionDate(a[1]) || ""),
      ),
    ),
    [sel, setSel] = useState(null),
    [metric, setMetric] = useState("");
  useEffect(() => {
    if (sessions.length && !sessions.some(([k]) => k === sel))
      setSel(sessions[0][0]);
  }, [rows]);
  let cur = sessions.find(([k]) => k === sel),
    rs = cur?.[1] || [],
    cats = Array.from(group(rs, (r) => r.category || "其他").entries()),
    metrics = [...new Set(rows.map((r) => r.metric).filter(Boolean))];
  return (
    <>
      <Head
        i={1}
        title="每周身体测量"
        desc="先选测量 Session，再查看同一周完整指标与左右侧数据。"
      />
      <section className="panel">
        <div className="sect">
          <b>MEASUREMENT SESSIONS</b>
          <small>{sessions.length} 批</small>
        </div>
        <div className="chips">
          {sessions.map(([k, x], i) => (
            <button
              className={sel === k ? "on" : ""}
              key={k}
              onClick={() => setSel(k)}
            >
              <small>SESSION {sessions.length - i}</small>
              <b>{k === "unknown" ? "日期未记录" : date(sessionDate(x))}</b>
              <i>{x.length} 项</i>
            </button>
          ))}
        </div>
      </section>
      {cur ? (
        <>
          <h2 className="session" key={sel}>
            {sel === "unknown" ? "日期未记录的测量" : date(sessionDate(rs))}
          </h2>
          <label className="select">
            跨周趋势
            <select value={metric} onChange={(e) => setMetric(e.target.value)}>
              <option value="">选择一个指标</option>
              {metrics.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          {metric && (
            <div className="trend">
              {sessions
                .slice()
                .reverse()
                .flatMap(([k, x]) =>
                  x
                    .filter((r) => r.metric === metric)
                    .map((r) => (
                      <span key={k + String(r.side)}>
                        {k === "unknown" ? "日期未记录" : date(sessionDate(x))}{" "}
                        · {r.side || "整体"}
                        <b>
                          {r.adopted_value ?? r.raw_value} {r.unit || ""}
                        </b>
                      </span>
                    )),
                )}
            </div>
          )}
          {cats.map(([cat, x], ci) => (
            <MotionDetails
              className="panel bodyRegion"
              key={sel + cat}
              initialOpen={ci === 0}
              summary={
                <>
                  <b>{cat}</b>
                  <span>{new Set(x.map((r) => r.metric)).size} 个指标</span>
                  <ChevronDown size={18} />
                </>
              }
            >
              <div className="metrics" key={sel}>
                {Array.from(group(x, (r) => r.metric || "未命名指标")).map(
                  ([m, ys]) => {
                    let l = ys.find((r) => r.side === "L"),
                      r = ys.find((r) => r.side === "R"),
                      o = ys.find((r) => !["L", "R"].includes(r.side)) || ys[0];
                    return (
                      <article className="metric" key={m}>
                        <b>{m}</b>
                        {l || r ? (
                          <div className="pair">
                            <span>
                              左侧
                              <strong>
                                {l?.adopted_value ?? l?.raw_value ?? "—"}{" "}
                                {l?.unit || ""}
                              </strong>
                            </span>
                            <span>
                              右侧
                              <strong>
                                {r?.adopted_value ?? r?.raw_value ?? "—"}{" "}
                                {r?.unit || ""}
                              </strong>
                            </span>
                          </div>
                        ) : (
                          <strong>
                            {o.adopted_value ?? o.raw_value ?? "—"}{" "}
                            {o.unit || ""}
                          </strong>
                        )}
                        <Details r={o} />
                      </article>
                    );
                  },
                )}
              </div>
            </MotionDetails>
          ))}
        </>
      ) : (
        <Empty>还没有测量 Session</Empty>
      )}
    </>
  );
}
function HrtPage({ rows }) {
  let gs = Array.from(
      group(
        rows,
        (r) =>
          first(r, ["period_id", "plan_id", "stage_id"]) ||
          (r.start_date || r.end_date
            ? String(r.start_date || "") + "|" + String(r.end_date || "")
            : "__undated__"),
      ).entries(),
    ).sort((a, b) =>
      String(b[1][0]?.start_date || "").localeCompare(
        String(a[1][0]?.start_date || ""),
      ),
    ),
    [open, setOpen] = useState(null);
  return (
    <>
      <Head
        i={2}
        title="用药方案阶段"
        desc="按真实起止日期展示方案变化；不把用药复制成每日记录。"
      />
      {rows.some((r) => !r.start_date && !r.end_date) && (
        <p className="dataNotice">
          部分用药没有起止日期，不能据此确认当前方案或合并为同一阶段。以下保留原记录与不确定性。
        </p>
      )}
      {gs.length ? (
        gs.map(([k, x], i) => (
          <section className="plan" key={k} style={{ position: "relative" }}>
            <button
              aria-expanded={open === k || (open === null && i === 0)}
              onClick={() =>
                setOpen(
                  open === k || (open === null && i === 0) ? "__closed__" : k,
                )
              }
            >
              <small>{k === "__undated__" ? "UNDATED" : "PERIOD"}</small>
              <b>
                {k === "__undated__" ? (
                  "用药日期待核实"
                ) : (
                  <>
                    {x[0].start_date || "开始日期未记录"} →{" "}
                    {x[0].end_date || "未记录结束日期"}
                  </>
                )}
              </b>
              <i>
                {k === "__undated__"
                  ? x.length + " 条独立记录 · 不表示同时使用"
                  : x.length + " 种药物"}
              </i>
              <ChevronDown />
            </button>
            {(open === k || (open === null && i === 0)) &&
              x.map((r, j) => (
                <article className="medicine" key={r.id || j}>
                  <b>{String(j + 1).padStart(2, "0")}</b>
                  <span>
                    <strong>{r.medication || "药物未注明"}</strong>
                    <small>
                      {r.formulation || "剂型未注明"} ·{" "}
                      {r.prescribed_dose_frequency || "频率未注明"}
                    </small>
                  </span>
                  <Details r={r} />
                </article>
              ))}
          </section>
        ))
      ) : (
        <Empty>没有用药阶段记录</Empty>
      )}
    </>
  );
}
const flag = labFlag;
function LabPage({ rows }) {
  let gs = Array.from(group(rows, batch).entries()).sort((a, b) =>
      String(sessionDate(b[1]) || "").localeCompare(
        String(sessionDate(a[1]) || ""),
      ),
    ),
    [open, setOpen] = useState(null);
  return (
    <>
      <Head
        i={3}
        title="检验档案"
        desc="一次采血 / 检查为一个 Session，批次内 analytes 一起查看。"
      />
      {gs.length ? (
        gs.map(([k, x], i) => (
          <section className="lab" key={k}>
            <button
              className="labHead"
              aria-expanded={open === k || (open === null && i === 0)}
              onClick={() =>
                setOpen(
                  open === k || (open === null && i === 0) ? "__closed__" : k,
                )
              }
            >
              <strong>LAB {gs.length - i}</strong>
              <span>
                <b>{k === "unknown" ? "日期未记录" : date(sessionDate(x))}</b>
                <small>
                  {x.length} 个项目 ·{" "}
                  {
                    x.filter((r) =>
                      ["偏高", "偏低", "异常标记"].includes(flag(r)),
                    ).length
                  }{" "}
                  项标记
                </small>
              </span>
              <ChevronDown />
            </button>
            {(open === k || (open === null && i === 0)) &&
              x.map((r, j) => (
                <article
                  className={
                    "analyte " +
                    (["偏高", "偏低", "异常标记"].includes(flag(r))
                      ? "alert"
                      : "")
                  }
                  key={r.id || j}
                >
                  <span>
                    <b>{r.test_name || r.analyte || "未命名项目"}</b>
                    <strong>
                      {r.result_numeric ?? r.result_text ?? "—"} {r.unit || ""}
                    </strong>
                    <i>{flag(r)}</i>
                  </span>
                  <small>
                    参考范围 {r.reference_low ?? "—"} –{" "}
                    {r.reference_high ?? "—"} {r.unit || ""}
                  </small>
                  {n(r.reference_low) != null &&
                    n(r.reference_high) > n(r.reference_low) &&
                    n(r.result_numeric) != null && (
                      <div className="range" aria-label="参考范围内的相对位置">
                        <span
                          style={{
                            left:
                              Math.max(
                                0,
                                Math.min(
                                  100,
                                  ((n(r.result_numeric) - n(r.reference_low)) /
                                    (n(r.reference_high) -
                                      n(r.reference_low))) *
                                    100,
                                ),
                              ) + "%",
                          }}
                        />
                      </div>
                    )}
                  <Details r={r} />
                </article>
              ))}
          </section>
        ))
      ) : (
        <Empty>没有化验 Session</Empty>
      )}
    </>
  );
}
function FoodPage({ rows }) {
  let ordered = rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      const time = (r) =>
        /^\d{1,2}:\d{2}/.test(r.time_text || "")
          ? Number(r.time_text.split(":")[0]) * 60 +
            Number(r.time_text.split(":")[1])
          : Infinity;
      return time(a.r) - time(b.r) || a.i - b.i;
    })
    .map((x) => x.r);
  let days = Array.from(
      group(ordered, (r) => day(dt(r)) || "unknown").entries(),
    ).sort((a, b) =>
      String(sessionDate(b[1]) || "").localeCompare(
        String(sessionDate(a[1]) || ""),
      ),
    ),
    [open, setOpen] = useState(null);
  return (
    <>
      <Head
        i={5}
        title="每日摄入日志"
        desc="日期是第一层；一餐、一份加餐、一次饮料各是一条事件。"
      />
      {days.length ? (
        days.map(([k, x], i) => (
          <section className="foodDay" key={k}>
            <button
              aria-expanded={open === k || (open === null && i === 0)}
              onClick={() =>
                setOpen(
                  open === k || (open === null && i === 0) ? "__closed__" : k,
                )
              }
            >
              <b>{k === "unknown" ? "—" : date(sessionDate(x))}</b>
              <span>
                {
                  x.filter(
                    (r) => !isPendingIntake(r) && meals.includes(r.meal_type),
                  ).length
                }{" "}
                正餐 / {x.filter((r) => !isPendingIntake(r)).length} 次摄入
                {x.some(isPendingIntake) && (
                  <> · {x.filter(isPendingIntake).length} 项计划待确认</>
                )}
              </span>
              <ChevronDown />
            </button>
            {(open === k || (open === null && i === 0)) &&
              x.map((r, j) => (
                <article
                  className={
                    "intake " +
                    (/^\d{1,2}:\d{2}/.test(r.time_text || "")
                      ? "timed"
                      : "untimed")
                  }
                  key={r.id || j}
                >
                  <time>{r.time_text || "时间未记录"}</time>
                  <small>
                    {isPendingIntake(r)
                      ? "PLANNED / 待确认"
                      : meals.includes(r.meal_type)
                        ? "MAIN MEAL"
                        : "INTAKE EVENT"}
                  </small>
                  <b>
                    {r.meal_type || "摄入事件"} · {r.food || "内容未记录"}
                  </b>
                  <strong>
                    {r.estimated_kcal == null
                      ? "—"
                      : r.estimated_kcal + " kcal"}
                  </strong>
                  <Details r={r} />
                </article>
              ))}
          </section>
        ))
      ) : (
        <Empty>还没有摄入记录</Empty>
      )}
    </>
  );
}
function DailyPage({ rows, foods, foodReady }) {
  let by = group(foods, (r) => day(dt(r)) || "unknown"),
    [open, setOpen] = useState(null),
    sorted = (rows || [])
      .slice()
      .sort((a, b) => String(dt(b) || "").localeCompare(String(dt(a) || "")));
  return (
    <>
      <Head
        i={4}
        title="每日记录单"
        desc="一天一张。展开可见完整汇总和当天摄入事件。"
      />
      {sorted.length ? (
        sorted.map((r, i) => {
          let k = day(first(r, ["record_date", "date"])) || r.id || String(i),
            events = day(first(r, ["record_date", "date"]))
              ? (by.get(day(first(r, ["record_date", "date"]))) || []).filter(
                  (e) => !isPendingIntake(e),
                )
              : [],
            mc = events.filter((x) => meals.includes(x.meal_type)).length;
          return (
            <section className="daily" key={k}>
              <button
                aria-expanded={open === k || (open === null && i === 0)}
                onClick={() =>
                  setOpen(
                    open === k || (open === null && i === 0) ? "__closed__" : k,
                  )
                }
              >
                <strong>{day(dt(r))?.slice(-2) || "—"}</strong>
                <span>
                  <small>DAILY SHEET / {sorted.length - i}</small>
                  <b>{date(first(r, ["record_date", "date"]))}</b>
                </span>
                <i>
                  {r.sleep_hours ?? "—"}h 睡眠 · {r.steps ?? "—"} 步 ·{" "}
                  {r.estimated_kcal_total ?? "—"} kcal · {foodReady ? mc : "—"}{" "}
                  正餐 / {foodReady ? events.length : "—"} 摄入
                </i>
                <ChevronDown />
              </button>
              {(open === k || (open === null && i === 0)) && (
                <div className="dailyBody">
                  <div className="facts">
                    {Object.entries(r)
                      .filter(
                        ([a, b]) =>
                          b != null &&
                          typeof b !== "object" &&
                          !["meals", "intake_events"].includes(a),
                      )
                      .map(([a, b]) => (
                        <span key={a}>
                          <small>{labels[a] || a}</small>
                          <b>{String(b)}</b>
                        </span>
                      ))}
                  </div>
                  <h3>
                    摄入明细 · {foodReady ? mc : "—"} 正餐 /{" "}
                    {foodReady ? events.length : "—"} 事件
                  </h3>
                  {!foodReady && <p>摄入明细尚未读取成功，计数暂不显示。</p>}
                  {events.map((e, j) => (
                    <p className="event" key={e.id || j}>
                      {e.time_text || "时间未记录"}　{e.meal_type}　{e.food}　
                      {e.estimated_kcal ?? "—"} kcal
                    </p>
                  ))}
                </div>
              )}
            </section>
          );
        })
      ) : (
        <Empty>还没有 Daily Sheet</Empty>
      )}
    </>
  );
}
class DataBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <section className="empty" role="alert">
        <b>这组记录暂时无法显示</b>
        <span>
          数据格式未能通过页面检查，原始记录没有修改。你仍可切换栏目。
        </span>
        <button
          onClick={() => {
            this.setState({ failed: false });
            this.props.retry();
          }}
        >
          重新读取
        </button>
      </section>
    ) : (
      this.props.children
    );
  }
}
function Content({ id, data, rows, foods, retry }) {
  if (data[id]?.loading && !data[id]?.loaded)
    return <div className="empty">正在读取记录…</div>;
  if (data[id]?.error)
    return (
      <div className="empty">
        <b>读取失败</b>
        <span>{data[id].error}</span>
        <button onClick={retry}>重试</button>
      </div>
    );
  switch (id) {
    case "weight_trend":
      return <WeightPage rows={rows} />;
    case "breast_body_measurements":
      return <BodyPage rows={rows} />;
    case "medication_history":
      return <HrtPage rows={rows} />;
    case "lab_history":
      return <LabPage rows={rows} />;
    case "daily_overview":
      return (
        <DailyPage
          rows={rows}
          foods={foods}
          foodReady={data.food_history?.loaded}
        />
      );
    case "food_history":
      return <FoodPage rows={rows} />;
  }
}
export default function Home() {
  const stage = useRef(null),
    terminal = useRef(null);

  const [user, U] = useState(null),
    [token, T] = useState(null),
    [ready, R] = useState(false),
    [id, I] = useState("weight_trend"),
    [data, D] = useState({}),
    [query, Q] = useState(""),
    [anim, A] = useState(false),
    [target, Z] = useState(null),
    [actionError, setActionError] = useState(""),
    [transitionRun, setTransitionRun] = useState(0);
  const ctr = useRef(new Map()),
    seq = useRef(new Map()),
    cache = useRef(data),
    generation = useRef(0),
    dest = useRef(null),
    authEvent = useRef(false),
    identity = useRef(null),
    access = useRef(null),
    selected = useRef(id),
    assetsReady = useRef(false),
    swapped = useRef(false),
    animating = useRef(false);
  selected.current = id;
  useEffect(() => {
    cache.current = data;
  }, [data]);
  useEffect(() => {
    let alive = true;
    const apply = (s) => {
      if (!alive) return;
      const uid = s?.user?.id || null;
      if (identity.current !== uid) {
        generation.current++;
        cache.current = {};
        ctr.current.forEach((c) => c.abort());
        ctr.current.clear();
        seq.current.clear();
        D({});
        identity.current = uid;
        animating.current = false;
        swapped.current = false;
        dest.current = null;
        A(false);
        Z(null);
      }
      if (access.current !== s?.access_token) {
        generation.current++;
        ctr.current.forEach((c) => c.abort());
        ctr.current.clear();
        access.current = s?.access_token || null;
      }
      U(s?.user || null);
      T(s?.access_token || null);
      R(true);
    };
    supabase.auth
      .getSession()
      .then((x) => {
        if (!x.error && !authEvent.current) apply(x.data.session);
        else if (x.error && alive) R(true);
      })
      .catch(() => alive && R(true));
    let { data: s } = supabase.auth.onAuthStateChange((_, x) => {
      authEvent.current = true;
      apply(x);
    });
    return () => {
      alive = false;
      generation.current++;
      s.subscription.unsubscribe();
      ctr.current.forEach((c) => c.abort());
    };
  }, []);
  const load = useCallback(async (v, t, force = false) => {
    if (!t || (!force && (cache.current[v]?.loaded || ctr.current.has(v))))
      return;
    ctr.current.get(v)?.abort();
    let c = new AbortController(),
      q = (seq.current.get(v) || 0) + 1;
    ctr.current.set(v, c);
    seq.current.set(v, q);
    let g = generation.current;
    D((d) => ({ ...d, [v]: { ...(d[v] || {}), loading: true, error: null } }));
    let get = async (name) => {
      let r = await fetch("/api/data?view=" + name, {
          headers: { Authorization: "Bearer " + t },
          cache: "no-store",
          signal: c.signal,
        }),
        b = await r.json();
      if (!r.ok) throw Error(b.error || "HTTP " + r.status);
      if (!Array.isArray(b)) throw Error("返回的数据格式错误");
      return b;
    };
    try {
      let rows = cleanRows(await get(v));
      if (generation.current !== g || seq.current.get(v) !== q) return;
      D((d) => {
        const next = { ...d, [v]: { rows, loaded: true, loading: false } };
        cache.current = next;
        return next;
      });
    } catch (e) {
      if (
        e.name === "AbortError" ||
        generation.current !== g ||
        seq.current.get(v) !== q
      )
        return;
      D((d) => ({
        ...d,
        [v]: {
          ...(d[v] || {}),
          loading: false,
          error: e.message || "读取失败",
        },
      }));
    } finally {
      if (ctr.current.get(v) === c) ctr.current.delete(v);
    }
  }, []);
  useEffect(() => {
    if (token) {
      load(id, token);
      for (const [view] of tabs) load(view, token);
    }
  }, [id, token, load]);
  useEffect(() => {
    let active = true;
    warmArt().then((ready) => {
      if (active) assetsReady.current = ready;
    });
    return () => {
      active = false;
    };
  }, []);
  useTerminalDirection(terminal, !!user);
  useSceneDirection(stage, id, !!data[id]?.loaded);
  const choose = (v) => {
    load(v, token);
    if (animating.current) {
      dest.current = v;
      Z(v);
      return;
    }
    if (v === selected.current) return;
    if (
      !assetsReady.current ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      I(v);
      Q("");
      return;
    }
    window.dispatchEvent(new Event("atlas:depart"));
    dest.current = v;
    swapped.current = false;
    animating.current = true;
    Z(v);
    A(true);
  };
  const covered = () => {
    swapped.current = true;
    if (dest.current) {
      I(dest.current);
      Q("");
    }
  };
  const finished = () => {
    // A late selection gets its own covered commit, never a visible page jump.
    if (dest.current && dest.current !== selected.current) {
      swapped.current = false;
      setTransitionRun((run) => run + 1);
      return;
    }
    animating.current = false;
    swapped.current = false;
    A(false);
    Z(null);
    dest.current = null;
  };
  const retry = () => load(target || id, token, true),
    rows = cleanRows(data[id]?.rows),
    shown = useMemo(() => {
      if (!query.trim()) return rows;
      const matches = (r) =>
        JSON.stringify(r).toLowerCase().includes(query.trim().toLowerCase());
      if (["breast_body_measurements", "lab_history"].includes(id)) {
        const keys = new Set(rows.filter(matches).map(batch));
        return rows.filter((r) => keys.has(batch(r)));
      }
      return rows.filter(matches);
    }, [rows, query, id]),
    foods = data.food_history?.rows || [],
    t = tabs.find((x) => x[0] === id) || tabs[0],
    Icon = t[3];
  if (!ready)
    return (
      <main className="authWait">
        <b>HRT ATLAS</b>
        <i />
      </main>
    );
  if (!user)
    return (
      <main className="auth">
        <section className="authArtwork">
          <small>PRIVATE HEALTH ARCHIVE</small>
          <b>
            HRT
            <br />
            ATLAS
          </b>
          <i>LONGITUDINAL / PERSONAL / YOURS</i>
        </section>
        <section className="authPanel">
          <h2>私人健康数据终端</h2>
          <p>登录后查看你的个人记录</p>
          <button
            onClick={async () => {
              try {
                setActionError("");
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: window.location.origin },
                });
                if (error) throw error;
              } catch {
                setActionError("无法打开 Google 登录，请检查网络后重试。");
              }
            }}
          >
            <LogIn size={17} /> 使用 Google 登录
          </button>
          {actionError && <p role="alert">{actionError}</p>}
        </section>
      </main>
    );
  const exportX = async () => {
    if (!rows.length) return;
    try {
      setActionError("");
      const XLSX = await import("xlsx");
      let wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), id);
      XLSX.writeFile(wb, "hrt-atlas-" + id + ".xlsx");
    } catch {
      setActionError("导出未完成，请重试。");
    }
  };
  return (
    <main ref={terminal} className="app">
      <header className="top">
        <div className="brand">
          <img
            className="brandLogo"
            src="/art/atlas-04988e4d9db3/brand-7c320ba9ea.webp"
            alt="HRT Atlas"
            width="275"
            height="78"
          />
        </div>
        <span className="user">
          {user.email || "已登录"}{" "}
          <button
            onClick={async () => {
              try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
              } catch {
                setActionError("退出未完成，请重试。");
              }
            }}
            aria-label="退出登录"
          >
            <LogOut size={16} />
          </button>
        </span>
      </header>
      <nav className="tabs">
        {tabs.map(([v, name, en, Ico], index) => (
          <NavButton
            key={v}
            label={name}
            active={v === (target || id)}
            current={v === id}
            onClick={() => choose(v)}
          >
            <img
              className="navWord"
              src={"/art/atlas-04988e4d9db3/title-" + index + ".webp"}
              alt=""
            />
            <span className="navLabel">
              <Ico size={15} />
              <b>{name}</b>
            </span>
          </NavButton>
        ))}
      </nav>
      <div className="toolbar">
        <span>
          ARCHIVE <i>/</i> {t[2]}
        </span>
        <label>
          <span className="searchTag">FIND</span>
          <Search size={19} />
          <input
            value={query}
            onChange={(e) => Q(e.target.value)}
            aria-label="搜索当前记录"
            placeholder="搜索当前记录"
          />
        </label>
        <button onClick={retry} aria-label="刷新">
          <RefreshCw size={16} />
        </button>
        <button onClick={exportX} aria-label="导出 Excel">
          <Download size={16} />
        </button>
      </div>
      {actionError && (
        <p className="dataNotice" role="alert">
          {actionError}
        </p>
      )}
      <section ref={stage} className="content" key={id} data-section={id}>
        <SceneField section={id} />
        <DataBoundary key={id} retry={retry}>
          <Content
            id={id}
            data={data}
            rows={shown}
            foods={foods}
            retry={retry}
          />
        </DataBoundary>
      </section>
      <footer>HRT ATLAS / 数据保持原始粒度 · 页面只负责整理呈现</footer>
      {anim && (
        <Commute
          key={transitionRun}
          onCovered={covered}
          onFinished={finished}
          label={(tabs.find((x) => x[0] === target) || t)[2]}
        />
      )}
    </main>
  );
}
