# System Architecture

## Overview

The AI-Powered Cloud Incident Response Platform is a serverless AWS application
composed of six layers. The frontend is a static React SPA hosted on S3; all
dynamic work runs inside Lambda functions behind API Gateway.

## Component Map

```
React Frontend (S3)
        │  HTTPS
        ▼
API Gateway HTTP API
        │  invoke
        ▼
AWS Lambda
  ├── simulateIncident  ── POST /simulate
  ├── getHistory        ── GET  /history
  └── getHealth         ── GET  /health
        │
        ├── OpenRouter AI  (inference — report generation)
        ├── Amazon DynamoDB  (incident store)
        └── Amazon SNS       (alert delivery)
```

## Data Flow — Incident Trigger

1. User clicks a simulation button in the React UI.
2. Frontend calls `POST /simulate` with `{ incidentType, category }`.
3. API Gateway routes the request to the `simulateIncident` Lambda.
4. Lambda calls OpenRouter AI with a structured prompt.
5. OpenRouter returns a JSON report `{ rootCause, businessImpact, severity,
   commands, resolution, automation }`.
6. Lambda persists the record to DynamoDB (`PutItem`).
7. Lambda publishes an alert to SNS.
8. Lambda returns the full record to API Gateway → frontend.
9. Frontend renders the report in the `AIIncidentReport` panel and appends
   the new row to `IncidentHistory`.

## Scalability Notes

- All Lambda functions are stateless and scale automatically.
- DynamoDB uses on-demand (pay-per-request) billing mode — no capacity planning.
- SNS fan-out allows adding email, Slack, and PagerDuty subscribers without
  changing Lambda code.
