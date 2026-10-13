/* Local, deterministic screening. No network requests or simulated signatures. */
(function (root) {
  "use strict";

  function evaluate(input) {
    const taskId = String(input.task_id || "").trim();
    const target = String(input.target_identifier || "").trim();
    const primary = Number(input.primary_metric);
    const secondary = Number(input.secondary_metric);
    const descriptor = String(input.status_descriptor || "NOMINAL").trim();
    const critical = input.is_critical_flag === true;

    if (!taskId || !target) throw new Error("Task and target identifiers are required.");
    if (input.primary_metric === "" || input.secondary_metric === "" ||
        !Number.isFinite(primary) || !Number.isFinite(secondary)) {
      throw new Error("Both metrics must be finite numeric values.");
    }
    const alerts = [];
    if (primary > 25) {
      alerts.push({
        origin_worker: "InvariantQCWorker",
        urgency: "ELEVATED_RISK",
        summary: "Primary Metric Threshold Exceeded",
        technical_details: "Primary value " + primary.toFixed(2) + " exceeds the configurable-example threshold of 25.",
        actionable_remediation: "Review the metric and threshold suitability."
      });
    }
    if (critical || secondary > 12) {
      alerts.push({
        origin_worker: "SafetyEscalationWorker",
        urgency: critical ? "CRITICAL_STAT_PANIC" : "ELEVATED_RISK",
        summary: "Safety Boundary Flag Triggered",
        technical_details: "CriticalFlag=" + critical + "; secondary value " + secondary.toFixed(2) + "; threshold 12.",
        actionable_remediation: "Review the flag or out-of-range input."
      });
    }
    if (["DISCORDANT", "ANOMALY", "MUTANT", "VIOLATION", "FAIL", "REJECT"].some(
      word => descriptor.toUpperCase().includes(word))) {
      alerts.push({
        origin_worker: "ProtocolConformanceWorker",
        urgency: "ELEVATED_RISK",
        summary: "Status Descriptor Flagged",
        technical_details: "Descriptor '" + descriptor + "' matched a screening keyword.",
        actionable_remediation: "Confirm the descriptor and underlying evidence."
      });
    }
    const criticalCount = alerts.filter(a => a.urgency === "CRITICAL_STAT_PANIC").length;
    const urgency = criticalCount ? "CRITICAL_STAT_PANIC" : alerts.length ? "ELEVATED_RISK" : "ROUTINE";
    return {
      mode: "LOCAL_DETERMINISTIC_SCREENING",
      task_id: taskId,
      target_identifier: target,
      overall_urgency: urgency,
      integrity_status: criticalCount ? "RECALIBRATION_REQUIRED" :
        alerts.length ? "DISCORDANT_ANOMALY" : "VALIDATED_OPTIMAL",
      total_alerts: alerts.length,
      critical_alerts_count: criticalCount,
      alerts: alerts,
      notice: "Rule-based screening only. No molecular modeling, clinical validation, network transmission, or cryptographic audit signature."
    };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { evaluate };

  if (typeof document !== "undefined") {
    const form = document.getElementById("audit-form");
    const output = document.getElementById("outputConsole");
    const status = document.getElementById("m-status");
    const tasks = document.getElementById("m-tasks");
    if (form && output) {
      let count = 0;
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        try {
          const result = evaluate({
            task_id: document.getElementById("task_id").value,
            target_identifier: document.getElementById("target_id").value,
            primary_metric: document.getElementById("primary_metric").value,
            secondary_metric: document.getElementById("secondary_metric").value,
            status_descriptor: document.getElementById("status_descriptor").value,
            is_critical_flag: document.getElementById("is_critical").checked
          });
          output.textContent = JSON.stringify(result, null, 2);
          count += 1;
          tasks.textContent = String(count);
          status.textContent = result.overall_urgency === "ROUTINE" ? "ROUTINE" :
            result.overall_urgency === "ELEVATED_RISK" ? "REVIEW" : "FLAGGED";
        } catch (error) {
          output.textContent = "Input error: " + error.message;
          status.textContent = "INPUT ERROR";
        }
      });
    }
  }
})(typeof window !== "undefined" ? window : globalThis);