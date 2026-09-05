# Target Degradation Protac Agent

> **Domain:** Computational Biology & AI Drug Discovery
> **Reference Guidelines & Standards:** `wwPDB, IUPAC & CLSI Computational Guidelines`

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-3776AB.svg?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg?logo=fastapi&logoColor=white)
![Audit Trail](https://img.shields.io/badge/Audit-HMAC--SHA256_Tamper--Evident-brightgreen.svg)
![Zero-PHI Guard](https://img.shields.io/badge/Guard-Zero--PHI_Outbound-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)

</div>

---

## 📖 What It Does

**Target Degradation Protac Agent** is an advanced analytical and computational platform implementing PROTAC E3 ligase (CRBN/VHL) warhead linker & ternary complex stability analysis. It provides a multi-worker evaluation pipeline for computational biology metrics with cryptographic audit trails and PHI outbound protection.

---

## ⚙️ Key Capabilities & Algorithmic Modules

- **Deterministic Calculation Engine**: Strict compliance with standard reference formulations and thresholds.
- **Risk & Urgency Classification**: Multi-tier categorization with automated clinical/operational action recommendations.
- **Validation & Guardrails**: Rigorous input bounds checking and anomaly detection.
- **Multi-Worker Evaluation Pipeline**: InvariantQC, Safety Escalation, and Protocol Conformance workers.
- **Enrichment Suite**: Molecular dynamics simulation integration, PPI inhibitor design, and testing modules.
- **PROTAC Designer Sub-Module**: E3 ligase binder, linker conformation, and ternary complex stability agents.

---

## 🏗️ Project Structure

```
target-degradation-protac-agent/
├── agents/                    # Core agent modules
│   ├── __init__.py           # Package initialization
│   ├── api.py                # FastAPI REST endpoints
│   ├── base.py               # Security, PHI guard, HMAC audit trail
│   ├── learning.py           # Bayesian calibration engine
│   ├── llm_factory.py        # LLM provider factory
│   ├── metrics.py            # Prometheus metrics exporter
│   ├── models.py             # Pydantic data models
│   ├── streamer.py           # WebSocket telemetry broadcaster
│   ├── supervisor.py         # Master orchestrator
│   └── workers.py            # Specialized evaluation workers
├── protac_designer/           # PROTAC Designer sub-module
│   ├── __init__.py
│   ├── agents.py             # E3 ligase, linker, ternary complex agents
│   ├── cli.py                # PROTAC Designer CLI
│   ├── engine.py             # Core algorithmic engine
│   ├── models.py             # Data models
│   └── server.py             # FastAPI server factory
├── tests/                     # Test suite
│   ├── test_enrichment.py
│   ├── test_protac_designer.py
│   └── test_target_degradation_protac_agent.py
├── web/                       # Operations console (HTML)
├── cli.py                     # Main CLI entry point
├── simulator.py               # High-throughput simulation
├── enrichment.py              # Enrichment feature implementations
├── benchmark_dataset.json     # Golden benchmark test cases
├── sample.csv                 # Sample batch input
├── sample_payload.json        # Sample API payload
├── openapi_spec.json          # OpenAPI 3.1 specification
├── Dockerfile                 # Container build
├── docker-compose.yml         # Container orchestration
└── pyproject.toml             # Project configuration
```

---

## 💻 Installation

```bash
# Clone the repository
git clone https://github.com/abusuraihsakhri/target-degradation-protac-agent.git
cd target-degradation-protac-agent

# Install dependencies
pip install fastapi uvicorn pydantic pytest

# For development
pip install -e .
```

---

## 💻 CLI Quickstart & Usage

### 1. Single Task Evaluation
```bash
python cli.py audit --task-id TASK-001 --target TARGET-01 --primary 28.5 --secondary 14.2 --critical --status DISCORDANT
```

### 2. Batch Processing
```bash
python cli.py batch -i sample.csv -o results.csv
```

### 3. Supervisory Chat
```bash
python cli.py chat "What is the system status?"
```

### 4. Verify Audit Trail
```bash
python cli.py verify-audit
```

### 5. Launch REST API Server
```bash
python cli.py serve --host 127.0.0.1 --port 8000
```

### 6. Run High-Throughput Simulation
```bash
python simulator.py 1000
```

### Parameter Reference
- `--task-id`: Unique task identifier (required)
- `--target`: Target entity identifier (required)
- `--primary`: Primary metric value (float, required)
- `--secondary`: Secondary metric value (float, optional)
- `--critical`: Emergency escalation flag (boolean)
- `--status`: Status descriptor (e.g., NOMINAL, DISCORDANT, ANOMALY)

---

## 🛡️ Security & Enterprise Architecture

* **Zero-PHI Outbound Interceptor:** Active regex inspection blocking SSNs, MRNs, phone numbers, email addresses, and patient identifiers.
* **Tamper-Evident HMAC-SHA256 Audit Trail:** Chained, cryptographically signed logs for every evaluation and state transition.
* **Input Validation:** Pydantic models enforce finite metric values and non-empty identifiers.
* **Batch Error Handling:** Graceful handling of file errors and malformed records with detailed error reporting.
* **Configurable Audit Key:** `AUDIT_SECRET_KEY` environment variable controls HMAC signing (ephemeral key generated if unset).

### Environment Variables

| Variable | Description | Default |
|:---------|:------------|:--------|
| `AUDIT_SECRET_KEY` | HMAC signing key for audit trail | Ephemeral (random per session) |
| `MODEL_PROVIDER` | LLM provider selection | `mock` |

---

## 🧪 Testing & Verification

Run the automated test suite:

```bash
pytest -v
```

Execute high-throughput batch simulation benchmarks:

```bash
python simulator.py --tasks 1000 --concurrency 8
```

### Test Coverage

- **PHI Guard Enforcement**: Validates zero-PHI outbound protection
- **Worker Evaluation**: Tests all specialized workers (QC, Safety, Conformance)
- **Supervisor Consensus**: Validates multi-worker consensus and audit trail
- **Enrichment Suite**: Tests molecular dynamics and PPI inhibitor modules
- **PROTAC Designer**: Tests E3 ligase, linker, and ternary complex agents
- **CLI Integration**: Tests all CLI commands
- **Input Validation**: Tests metric validation (NaN, infinity rejection)

---

## 🐳 Container Deployment

```bash
# Build and run with Docker Compose
AUDIT_SECRET_KEY=your-secret-key docker-compose up --build

# Or with Docker directly
docker build -t target-degradation-protac-agent .
docker run -p 8000:8000 -e AUDIT_SECRET_KEY=your-secret-key target-degradation-protac-agent
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/health` | Health check and system metadata |
| GET | `/metrics` | Prometheus operational metrics |
| POST | `/api/audit` | Submit task for evaluation |
| POST | `/api/chat` | Supervisory conversational query |
| GET | `/api/audit/logs` | Retrieve and verify audit trail |

---

## 📜 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
