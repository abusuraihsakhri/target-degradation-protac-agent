"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { evaluate } = require("../web/app.js");

const make = overrides => ({
  task_id: "TASK-01",
  target_identifier: "TARGET-01",
  primary_metric: 12,
  secondary_metric: 5,
  status_descriptor: "NOMINAL",
  is_critical_flag: false,
  ...overrides
});

test("nominal screening", () => {
  const result = evaluate(make());
  assert.equal(result.overall_urgency, "ROUTINE");
  assert.equal(result.total_alerts, 0);
  assert.equal(result.integrity_status, "VALIDATED_OPTIMAL");
  assert.equal(Object.hasOwn(result, "audit_hash"), false);
});
test("primary threshold and descriptor", () => {
  const result = evaluate(make({primary_metric: 30, status_descriptor: "DISCORDANT"}));
  assert.equal(result.total_alerts, 2);
  assert.equal(result.overall_urgency, "ELEVATED_RISK");
});
test("secondary threshold", () => {
  const result = evaluate(make({secondary_metric: 13}));
  assert.equal(result.total_alerts, 1);
  assert.equal(result.overall_urgency, "ELEVATED_RISK");
});
test("explicit critical condition", () => {
  const result = evaluate(make({is_critical_flag: true}));
  assert.equal(result.overall_urgency, "CRITICAL_STAT_PANIC");
  assert.equal(result.critical_alerts_count, 1);
});
test("rejected identifiers and nonfinite values", () => {
  assert.throws(() => evaluate(make({task_id:"   "})), /required/);
  assert.throws(() => evaluate(make({primary_metric:""})), /finite/);
  assert.throws(() => evaluate(make({secondary_metric:"not a number"})), /finite/);
});

test("browser form updates real DOM outputs without network", () => {
  const vm = require("node:vm");
  const fs = require("node:fs");
  const path = require("node:path");
  const elements = {
    "audit-form": {addEventListener(name, cb) {this[name] = cb;}},
    "outputConsole": {textContent: ""},
    "m-status": {textContent: "READY"},
    "m-tasks": {textContent: "0"},
    task_id: {value: "CASE"},
    target_id: {value: "TARGET"},
    primary_metric: {value: "30"},
    secondary_metric: {value: "5"},
    status_descriptor: {value: "NOMINAL"},
    is_critical: {checked: false}
  };
  const document = {getElementById(id) {return elements[id] || null;}};
  const source = fs.readFileSync(path.join(__dirname, "../web/app.js"), "utf8");
  vm.runInNewContext(source, {document, window: {}});
  assert.equal(typeof elements["audit-form"].submit, "function");
  elements["audit-form"].submit({preventDefault() {}});
  const result = JSON.parse(elements.outputConsole.textContent);
  assert.equal(result.overall_urgency, "ELEVATED_RISK");
  assert.equal(elements["m-tasks"].textContent, "1");
  assert.equal(elements["m-status"].textContent, "REVIEW");
});
