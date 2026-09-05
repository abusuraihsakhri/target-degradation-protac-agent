"""
Automated Pytest Test Suite for Target Degradation Protac Agent.
Domain: AI Drug Discovery, Structural Biology & Wet-Lab Robotics
Standard: wwPDB / IUPAC / OpenSMILES / ISAC Standards
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from agents.base import PHIGuard, AuditLogger, SecurityException
from agents.models import SystemTaskPayload, UrgencyLevel, SystemIntegrityStatus
from agents.workers import InvariantQCWorker, SafetyEscalationWorker, ProtocolConformanceWorker
from agents.supervisor import SystemSupervisor
from cli import main


def test_phi_guard_enforcement():
    with pytest.raises(SecurityException):
        PHIGuard.assert_no_phi("Patient MRN-994827 blood culture positive for Staphylococcus")

    # Clean text passes
    PHIGuard.assert_no_phi("Analytical assay specimen KEY-001 optimal")


def test_specialized_workers():
    # Worker 1: QC Invariant
    p1 = SystemTaskPayload(task_id="T1", target_identifier="KEY-01", primary_metric=35.0)
    alerts1 = InvariantQCWorker.evaluate(p1)
    assert len(alerts1) == 1
    assert alerts1[0].urgency == UrgencyLevel.ELEVATED

    # Worker 2: Safety
    p2 = SystemTaskPayload(task_id="T2", target_identifier="KEY-02", primary_metric=10.0, is_critical_flag=True)
    alerts2 = SafetyEscalationWorker.evaluate(p2)
    assert len(alerts2) == 1
    assert alerts2[0].urgency == UrgencyLevel.CRITICAL_STAT

    # Worker 3: Protocol Conformance
    p3 = SystemTaskPayload(task_id="T3", target_identifier="KEY-03", primary_metric=10.0, status_descriptor="DISCORDANT_ANOMALY")
    alerts3 = ProtocolConformanceWorker.evaluate(p3)
    assert len(alerts3) == 1


def test_supervisor_consensus_and_audit():
    supervisor = SystemSupervisor(model_provider="mock")
    payload = SystemTaskPayload(
        task_id="TASK-PROD-01",
        target_identifier="KEY-PROD-01",
        primary_metric=12.0,
        secondary_metric=4.0,
        status_descriptor="NOMINAL"
    )
    dossier = supervisor.process_task(payload)
    assert dossier.overall_urgency == UrgencyLevel.ROUTINE
    assert dossier.integrity_status == SystemIntegrityStatus.VALIDATED
    assert dossier.audit_hash != ""

    # Verify cryptographic audit trail
    assert AuditLogger.verify_integrity() is True

    # CLI tests
    assert main(["audit", "--task-id", "CLI-TEST-01"]) == 0
    assert main(["chat", "Explain", "specifications"]) == 0
    assert main(["verify-audit"]) == 0


def test_input_validation_rejects_nan():
    """Metric values must be finite - NaN should be rejected."""
    with pytest.raises(ValueError, match="finite"):
        SystemTaskPayload(task_id="T1", target_identifier="KEY-01", primary_metric=float("nan"))


def test_input_validation_rejects_infinity():
    """Metric values must be finite - infinity should be rejected."""
    with pytest.raises(ValueError, match="finite"):
        SystemTaskPayload(task_id="T1", target_identifier="KEY-01", primary_metric=float("inf"))


def test_input_validation_rejects_empty_identifiers():
    """Identifier fields must be non-empty."""
    with pytest.raises(ValueError, match="non-empty"):
        SystemTaskPayload(task_id="", target_identifier="KEY-01", primary_metric=10.0)

    with pytest.raises(ValueError, match="non-empty"):
        SystemTaskPayload(task_id="T1", target_identifier="", primary_metric=10.0)


def test_batch_file_not_found():
    """Batch command should return error code for missing file."""
    result = main(["batch", "-i", "nonexistent_file.csv"])
    assert result == 1


def test_batch_with_malformed_data(tmp_path):
    """Batch command should skip malformed rows and continue processing."""
    import csv
    input_file = tmp_path / "test_input.csv"
    output_file = tmp_path / "test_output.csv"

    with open(input_file, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["task_id", "target_identifier", "primary_metric", "secondary_metric"])
        writer.writerow(["T1", "KEY-01", "10.0", "5.0"])  # Valid row
        writer.writerow(["T2", "KEY-02", "invalid", "5.0"])  # Invalid metric

    result = main(["batch", "-i", str(input_file), "-o", str(output_file)])
    assert result == 0
    assert output_file.exists()
