# Target Degradation PROTAC Agent

A deterministic **generic-metric screening** project with a Python API, two Python command-line evaluators, and a standalone browser interface. It is **not** a molecular docking engine, an E3 ligase/warhead optimizer, a ternary-complex simulator, or a validated predictor of PROTAC degradation efficacy.

## Browser application

The [standalone browser interface](web/index.html) evaluates two numeric metrics, an explicit critical flag, and descriptor keywords **entirely in the browser**. It has no API calls, uploads, or simulated signatures. Open the HTML file locally, or publish the web directory with the included GitHub Pages workflow.

Browser rules mirror the main Python agents pipeline:
- Primary metric > 25: elevated flag.
- Secondary metric > 12: elevated flag.
- Explicit critical flag: critical flag.
- Descriptor containing DISCORDANT, ANOMALY, MUTANT, VIOLATION, FAIL, or REJECT: elevated flag.

These thresholds are demonstration parameters, **not validated biochemical thresholds**. A routine result does not establish safety, binding, efficacy, or compliance.

## Python CLI and API

Python 3.10–3.12 are tested in CI. Python 3.9 is permitted by package metadata but is not included in CI.

~~~bash
git clone https://github.com/abusuraihsakhri/target-degradation-protac-agent.git
cd target-degradation-protac-agent
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[api,dev]"
python -m pytest -v
~~~

On Windows, activate with .venv\Scripts\activate.

The main evaluator is in agents/ and uses Pydantic v2:

~~~bash
python cli.py audit --task-id TASK-001 --target TARGET-01 --primary 28.5 --secondary 14.2 --status DISCORDANT
python cli.py batch -i sample.csv -o results.csv
python cli.py chat "What is the system status?"
python cli.py verify-audit
python cli.py serve --host 127.0.0.1 --port 8000
~~~

The installed command target-degradation-protac-agent invokes the main CLI. The legacy command target-degradation-protac-engine invokes the separate protac_designer/ evaluator, which has different secondary-threshold logic (10 rather than 12). These results are not interchangeable.

The API exposes GET /health, GET /metrics, POST /api/audit, POST /api/chat, and GET /api/audit/logs, with interactive documentation at /docs. See agents/api.py for the contract. The /metrics response is JSON, not Prometheus exposition text. Chat is deterministic mock output; no external LLM is called. The enrichment.py modules perform numeric threshold checks rather than actual molecular dynamics or GROMACS integration. simulator.py generates synthetic test traffic, not biological simulations.

## Privacy and security

- Use **synthetic or de-identified data only**. Python performs regex screening for some identifiers; this **does not guarantee HIPAA de-identification** or detect all PHI.
- The browser processes inputs without network requests. It does not perform PHI screening, cryptographic signing, or data persistence.
- Python audit records contain signed metadata and a hash of event details. Verification recomputes HMAC-SHA256 signatures and chain links. Records are held **in memory only** and are lost at restart. Event details are not independently retained for re-verification.
- Configure a strong, private AUDIT_SECRET_KEY for server use. Without it, a process-local ephemeral signing key is generated. Never embed this key in browser code.
- There is **no built-in API authentication**. Do not expose the server to untrusted networks without appropriate authentication, TLS, rate limits, and network security controls.

## Container deployment

~~~bash
export AUDIT_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_hex(32))')"
docker compose up --build
~~~

The server listens on port 8000. This is separate from browser-only static hosting.

## Testing

~~~bash
python -m pytest -v
ruff check --select E4,E7,E9,F63,F7,F82 .
node --check web/app.js
node --test tests/test_web_app.cjs
~~~

CI targets Python 3.10, 3.11 and 3.12. Static hosting does not require Python, Pyodide, or a running API.

## Technologies and limitations

Python, Pydantic v2, optional FastAPI/Uvicorn, HTML/CSS/JavaScript, pytest, Node test runner, GitHub Actions, Docker. The browser targets current evergreen browsers. PROTAC-specific mechanistic modeling, experimental validation, and production-grade API security are not implemented.

## License

[MIT](LICENSE).
