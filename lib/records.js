// Display adapters only. Never infer clinical dates from database insertion time.
export const first = (r, keys) =>
  keys.map((k) => r?.[k]).find((v) => v != null && v !== "") ?? null;
export const numeric = (v) =>
  v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v);
export function day(v) {
  if (typeof v !== "string") return null;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T| )/);
  if (!m) return null;
  const d = new Date(m[0].slice(0, 10) + "T12:00:00Z");
  return Number.isNaN(+d) || d.toISOString().slice(0, 10) !== m[0].slice(0, 10)
    ? null
    : m[0].slice(0, 10);
}
export const recordedAt = (r) =>
  first(r, [
    "measured_at",
    "measured_date",
    "sampled_at",
    "collected_at",
    "record_date",
    "date",
    "logged_at",
    "start_date",
  ]);
export const sessionKey = (r) =>
  first(r, [
    "session_id",
    "measurement_session_id",
    "batch_id",
    "lab_session_id",
    "sample_id",
  ]) ??
  first(r, [
    "measured_at",
    "measured_date",
    "sampled_at",
    "collected_at",
    "record_date",
    "date",
  ]) ??
  "unknown";
export const sessionDate = (rows) =>
  rows.map((r) => day(recordedAt(r))).find(Boolean) ?? null;
export function labFlag(r) {
  const f = String(first(r, ["flag", "status", "abnormal_flag"]) ?? "")
      .trim()
      .toLowerCase(),
    v = numeric(r.result_numeric),
    lo = numeric(r.reference_low),
    hi = numeric(r.reference_high);
  if (/^(h|high|偏高|↑)$/.test(f)) return "偏高";
  if (/^(l|low|偏低|↓)$/.test(f)) return "偏低";
  if (/abnormal|异常|positive|阳性/.test(f)) return "异常标记";
  if (v != null && hi != null && v > hi) return "偏高";
  if (v != null && lo != null && v < lo) return "偏低";
  if (/^(normal|正常|n)$/.test(f) || (v != null && (lo != null || hi != null)))
    return "范围内";
  return "未判定";
}
export const cleanRows = (value) =>
  Array.isArray(value)
    ? value.filter((r) => r && typeof r === "object" && !Array.isArray(r))
    : [];

// Only explicit source wording is used; a future date alone does not imply a plan.
export const isPendingIntake = (r) =>
  /计划|尚未|待确认|未食用|未饮用|planned|pending/i.test(
    String(r.time_text || "") + " " + String(r.status || ""),
  );
