# AI-Powered Cloud Incident Response Platform

A full-stack serverless application that demonstrates AI-assisted cloud incident
response. Simulated infrastructure and Linux service faults are processed by AWS
Lambda, analysed by OpenRouter AI, stored in DynamoDB, and surfaced through an
SNS alert — all visible in a real-time React dashboard.

---

## Repository structure

```
AI-Cloud-Incident-Platform/
│
├── frontend/                  React 18 + Vite + Tailwind CSS dashboard
│   ├── src/
│   │   ├── components/        UI panels (simulation, status, AI report, history…)
│   │   └── services/api.js    API contract — wired to the backend endpoints
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── backend/                   AWS Lambda functions + shared logic
│   ├── lambda/
│   │   ├── simulateIncident.js   POST /simulate — AI report + DynamoDB + SNS
│   │   ├── getHistory.js         GET  /history  — DynamoDB scan
│   │   └── getHealth.js          GET  /health   — metrics placeholder
│   ├── services/
│   │   └── aiService.js          OpenRouter AI integration
│   ├── utils/
│   │   └── incidentHelpers.js    Pure helper functions (record builder, severity)
│   └── package.json
│
├── infrastructure/
│   ├── architecture/
│   │   └── architecture.md       Component map and data-flow description
│   ├── diagrams/                 Architecture diagram images (add your exports here)
│   └── iam-policies/
│       ├── lambda-execution-policy.json   DynamoDB + SNS + CloudWatch Logs
│       └── s3-frontend-policy.json        Public-read bucket policy
│
├── documentation/
│   ├── setup-guide/
│   │   └── setup-guide.md        End-to-end AWS deployment walkthrough
│   ├── api-docs/
│   │   └── api-docs.md           REST API reference (all 3 endpoints)
│   └── screenshots/              Dashboard screenshots (add your captures here)
│
└── README.md                  ← you are here
```

---

## Architecture

```
React Frontend (S3)
      │  HTTPS
      ▼
API Gateway HTTP API
      │  invoke
      ▼
AWS Lambda
  ├── simulateIncident ──► OpenRouter AI  →  DynamoDB  →  SNS
  ├── getHistory       ──► DynamoDB
  └── getHealth        ──► (CloudWatch — planned)
```

---

## Quick start

### Frontend (local dev)

```bash
cd frontend
npm install
cp .env.example .env     # set VITE_API_URL once the backend is deployed
npm run dev              # http://localhost:5173
```

### Backend

```bash
cd backend
npm install
```

See [`documentation/setup-guide/setup-guide.md`](documentation/setup-guide/setup-guide.md)
for the full AWS deployment walkthrough.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | AWS Lambda (Node.js 20), API Gateway HTTP API |
| AI | OpenRouter (GPT-4o-mini) |
| Database | Amazon DynamoDB (on-demand) |
| Alerts | Amazon SNS |
| Hosting | Amazon S3 static website |

---

## API reference

See [`documentation/api-docs/api-docs.md`](documentation/api-docs/api-docs.md).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/simulate` | Trigger incident → AI report + persist + alert |
| `GET` | `/history` | Fetch all past incidents |
| `GET` | `/health` | Fetch infrastructure health metrics |

---

## Developed by

Ayush — [GitHub](https://github.com/your-username)
