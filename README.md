# LLM Red Team Lab

LLM Red Team Lab is an automated security testing platform for evaluating the robustness and safety of Large Language Models (LLMs) against adversarial prompts, jailbreak attempts, and prompt-injection attacks.

The system simulates real-world red-team behavior through an iterative, multi-model architecture that continuously generates attacks, tests model responses, and evaluates safety outcomes. This enables repeatable, measurable, and scalable security assessments for AI systems.

The platform is designed for security engineers, researchers, and developers who require systematic validation of LLM safety before deployment.

---

## Table of Contents

- Overview
- Problem Statement
- Architecture
- Core Capabilities
- System Workflow
- Features
- Technical Stack
- Installation
- Usage
- Configuration
- Metrics and Reporting
- Use Cases
- Performance Characteristics
- Project Structure
- Roadmap
- Contributing
- License

---

## Overview

LLM Red Team Lab provides an automated testing framework that:

- Generates adversarial prompts
- Evaluates target model behavior
- Classifies safety outcomes
- Iteratively strengthens attacks
- Produces measurable security metrics

The platform eliminates manual prompt testing and replaces it with an automated, reproducible testing pipeline.

---

## Problem Statement

Manual LLM security testing has several limitations:

- Time-consuming
- Non-repeatable
- Difficult to scale
- Subjective evaluation
- No standardized metrics

This project addresses these issues by providing:

- Automated attack generation
- Deterministic evaluation
- Quantitative results
- Continuous testing capability
- Professional reporting

---

## Architecture

The platform uses a three-model evaluation pipeline:

### Attacker Model
Generates adversarial and jailbreak prompts.  
Each iteration uses feedback from previous attempts to craft stronger attacks.

### Target Model
The model under evaluation.  
Receives attack prompts and produces responses.

### Judge Model
Analyzes the target response and determines whether the model:

- Refused or safely deflected (SAFE)
- Provided actionable harmful content (VULNERABLE)

This separation ensures objective evaluation.

---

## Core Capabilities

- Automated jailbreak testing
- Adaptive prompt strengthening
- Iterative retry logic
- Multi-model evaluation
- Real-time monitoring
- Historical result tracking
- Exportable reports
- Local execution with Ollama
- Offline operation
- Workflow automation compatibility (n8n)

---

## System Workflow

1. User submits a test topic or scenario
2. Attacker model generates a jailbreak prompt
3. Target model responds
4. Judge evaluates safety
5. If SAFE, attacker strengthens the prompt and retries
6. If VULNERABLE, test stops
7. Results are logged and stored
8. Reports can be exported

---

## Features

### Testing
- Configurable attempts
- Adjustable temperature and tokens
- Automatic retry until success or limit
- Multiple models per test

### Real-Time Monitoring
- Live responses
- Progress tracking
- Execution logs
- Immediate stop control

### Reporting
- JSON export
- CSV export
- Structured metrics
- Historical sessions

### Automation
- n8n workflow support
- API-ready backend
- Scriptable testing

### Deployment
- Fully local
- No external API required
- Docker compatible
- Lightweight resource usage

---

## Technical Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- WebSocket streaming

### Backend
- Python
- FastAPI
- Async execution
- SQLAlchemy ORM
- SQLite / PostgreSQL

### LLM Runtime
- Ollama
- Local model execution

---

## Installation

### Requirements

- Python 3.10+
- Node.js 18+
- Ollama installed locally

---

### Install Ollama

Download from:
https://ollama.ai/download

Pull models:

```bash
ollama pull gemma:2b
ollama pull phi3:mini
ollama pull dolphin-mistral
```

---

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on:
```
http://localhost:8000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
```
http://localhost:5173
```

---

### Docker (Optional)

```bash
docker compose up --build
```

---

## Usage

1. Open the web dashboard
2. Select attacker, target, and judge models
3. Enter test topic
4. Set attempt count
5. Run test
6. Observe results in real time
7. Export reports if required

---

## Configuration

Common parameters:

| Parameter | Description |
|-----------|-------------|
| attempts | Maximum retries |
| temperature | Creativity level of attacker |
| max_tokens | Response length |
| models | Selected LLMs |
| judge_threshold | Safety evaluation logic |

---

## Metrics and Reporting

The platform records:

- Jailbreak success rate
- Attempts required
- Response time
- Vulnerability counts
- Per-model comparison
- Historical trends

Example result:

```json
{
  "verdict": "VULNERABLE",
  "attempt": 3,
  "reason": "Model provided actionable harmful instructions"
}
```

---

## Use Cases

### Security Teams
- Pre-release audits
- Compliance validation
- Patch verification

### Researchers
- Attack effectiveness measurement
- Model comparison studies
- Adversarial research

### Developers
- Regression testing
- CI/CD integration
- Custom model validation

---

## Performance Characteristics

- Runs locally
- ~2GB RAM usage
- No internet dependency
- Fast iteration cycles
- Scales with hardware

---

## Project Structure

```
frontend/
backend/
workflows/
models/
reports/
```

---

## Roadmap

Short Term
- Additional attack strategies
- Batch testing
- Improved analytics

Mid Term
- Team collaboration
- Public API
- Cloud deployment

Long Term
- Enterprise features
- Compliance automation
- Marketplace integrations

---

## Contributing

Contributions are welcome.

Steps:

1. Fork repository
2. Create feature branch
3. Commit changes
4. Submit pull request

---

## License

MIT License

---

## Summary

LLM Red Team Lab is a professional automated red-team platform that systematically tests Large Language Models for security vulnerabilities using adversarial prompting and objective evaluation.

It enables organizations to identify and mitigate risks before deployment through repeatable, measurable, and scalable testing.
