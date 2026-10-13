"""Regression checks for audit integrity, privacy, and CLI exit codes."""
import pytest

from agents.base import AuditTrail, AuditLogger, SecurityException
from agents.models import SystemTaskPayload
from agents.supervisor import SystemSupervisor
from cli import main


def test_audit_trail_recomputes_hmac():
    trail = AuditTrail(secret_key="unit-test-only-key")
    trail.log("tester", "unit", "START", {"status": "ok"})
    trail.log("tester", "unit", "STOP", {"status": "ok"})
    assert trail.verify_integrity()
    trail.logs[0]["payload_hash"] = "f" * 64
    assert not trail.verify_integrity()


def test_audit_trail_rejects_modified_signature():
    trail = AuditTrail(secret_key="unit-test-only-key")
    trail.log("tester", "unit", "EVALUATE", {"status": "ok"})
    trail.logs[0]["current_hash"] = "0" * 64
    assert not trail.verify_integrity()


def test_audit_log_snapshot_cannot_mutate_source():
    trail = AuditTrail(secret_key="unit-test-only-key")
    trail.log("tester", "unit", "EVALUATE", {"status": "ok"})
    snapshot = trail.get_trail()
    snapshot[0]["current_hash"] = "forged"
    assert trail.verify_integrity()


def test_nested_metadata_is_checked_for_identifiers():
    supervisor = SystemSupervisor()
    payload = SystemTaskPayload(
        task_id="CASE-1", target_identifier="TARGET-1",
        primary_metric=10, attributes={"note": {"identifier": "MRN-123456"}}
    )
    with pytest.raises(SecurityException):
        supervisor.process_task(payload)


def test_verify_audit_command_failure_code(monkeypatch):
    monkeypatch.setattr(AuditLogger, "verify_integrity", staticmethod(lambda: False))
    assert main(["verify-audit"]) == 1


def test_sensitive_metadata_api_returns_client_error():
    from fastapi.testclient import TestClient
    from agents.api import app
    client = TestClient(app)
    result = client.post("/api/audit", json={
        "task_id": "CASE-1", "target_identifier": "TARGET-1",
        "primary_metric": 10, "attributes": {"note": "MRN-123456"}
    })
    assert result.status_code == 422
    assert "MRN-123456" not in result.text
