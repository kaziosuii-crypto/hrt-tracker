import { test } from "node:test";
import assert from "node:assert/strict";
import {
  day,
  sessionKey,
  sessionDate,
  labFlag,
  cleanRows,
} from "../lib/records.js";
test("date-only stays local; invalid/missing dates never become insertion dates", () => {
  assert.equal(day("2026-04-01"), "2026-04-01");
  assert.equal(day("2026-02-30"), null);
  assert.equal(day(null), null);
  assert.equal(sessionDate([{ created_at: "2026-04-01" }]), null);
});
test("session identity remains distinct; identifier is never a date label", () => {
  assert.notEqual(
    sessionKey({ batch_id: "a", measured_date: "2026-04-01" }),
    sessionKey({ batch_id: "b", measured_date: "2026-04-01" }),
  );
  assert.equal(
    sessionDate([{ batch_id: "uuid", measured_date: "2026-04-01" }]),
    "2026-04-01",
  );
});
test("lab flags preserve unknown and abnormal without claiming high", () => {
  assert.equal(labFlag({}), "未判定");
  assert.equal(labFlag({ flag: "abnormal" }), "异常标记");
  assert.equal(labFlag({ result_numeric: 5, reference_high: 3 }), "偏高");
  assert.equal(labFlag({ flag: "L" }), "偏低");
});
test("malformed rows are rejected at boundary", () =>
  assert.deepEqual(cleanRows([null, {}, 2, []]), [{}]));
test("same calendar day does not merge two timed sampling events", () =>
  assert.notEqual(
    sessionKey({ measured_at: "2026-01-01T08:00:00Z" }),
    sessionKey({ measured_at: "2026-01-01T17:00:00Z" }),
  ));
