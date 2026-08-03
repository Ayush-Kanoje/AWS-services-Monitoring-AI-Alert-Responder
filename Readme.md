# Cloud-LogLens

> Evidence-driven AI incident analysis for cloud operations.

Cloud-LogLens is a React dashboard backed by AWS services that helps engineers collect incident evidence, run AI analysis, store outcomes in DynamoDB, and notify responders with SNS email alerts. The frontend is hosted on S3 behind CloudFront, while the API is exposed through API Gateway REST and Lambda.

## What This Project Does

Cloud-LogLens focuses on correlating the right logs, metrics, and incident context before asking OpenRouter to produce a structured diagnosis. The result is a JSON analysis with root cause, impact, confidence, resolution steps, and automation guidance.

## Services Used And Why

| Service | Why it is used |
| --- | --- |
| React + Vite | Fast dashboard UI and local development |
| S3 | Private static hosting for the built frontend |
| CloudFront | HTTPS delivery with Origin Access Control |
| API Gateway REST | Public API surface for incident analysis and status |
| Lambda | Evidence collection, AI orchestration, and response formatting |
| DynamoDB | Incident persistence and analysis history |
| CloudWatch | Log and metric evidence source for analysis |
| SNS | Email notifications for incident updates |
| OpenRouter | LLM provider for structured incident analysis |
| EC2 | Source of operational telemetry and log evidence |

## Current Architecture

### How It Works

1. An incident is created in DynamoDB through the API.
2. Lambda collects the relevant CloudWatch metrics and logs for that incident.
3. Structured evidence is sent to OpenRouter for analysis.
4. The model returns JSON with `rootCause`, `impact`, `confidence`, and `resolution`.
5. Results are saved back to DynamoDB and an SNS email is sent.
6. The React dashboard reads the API response and renders the incident details.

### System Flow

```mermaid
flowchart LR
    U[Users] --> CF[CloudFront]
    CF --> S3[S3 Static Site]
    U --> API[API Gateway REST\n(/status GET, /analyze POST)]
    API --> L[Lambda]
    L --> D[DynamoDB\nincidents]
    L --> CW[CloudWatch]
    L --> OR[OpenRouter]
    L --> SNS[SNS Email]
    EC2[EC2 + CloudWatch Agent] --> CW
```

## Build Evolution

The frontend and deployment path evolved through a few attempts before landing on the current setup:

1. SSH/SCP deployment was tried first, but key handling and manual uploads made it brittle.
2. S3 + SSM was then attempted, but OIDC and role-assumption issues blocked a reliable workflow.
3. The final setup uses S3 + CloudFront for the frontend, while EC2 remains the monitoring source.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `TABLE_NAME` | DynamoDB table used for incidents |
| `OPENROUTER_API_KEY` | API key for OpenRouter requests |
| `MODEL_NAME` | LLM model identifier |
| `SNS_TOPIC_ARN` | SNS topic for incident notifications |
| `AWS_ROLE_ARN` | IAM role used by CI/CD or deployments |
| `EC2_INSTANCE_ID` | Target instance for health/status checks |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution invalidation target |

## API Documentation

| Endpoint | Method | Body | Response |
| --- | --- | --- | --- |
| `/analyze` | POST | `{ "incidentId": "..." }` | Structured analysis result |
| `/status` | GET | None | Instance and service health |

## Evidence Sources

Cloud-LogLens uses structured evidence gathering rather than hardcoded pattern matching. The Lambda resolves incident context from the incident type, then pulls the relevant CloudWatch metrics and log streams before sending the collected evidence to OpenRouter.

The exact `LOG_GROUP_MAP` and `METRIC_MAP` live in the Lambda source, where they define which log groups and metrics are queried for each incident category.

## Screenshots

Add the actual dashboard screenshots here once they are exported from the current build.

- Light theme dashboard
- Dark theme dashboard
- Expanded incident analysis view
- Mobile responsive view

## Quick Start

1. Install dependencies with `npm install`.
2. Build the frontend with `npm run build`.
3. Update the API endpoint in `src/api/app.js` if needed.
4. Run the app locally with `npm run dev`.

## Security Notes

- Port 22 is not opened for normal access.
- EC2 access is handled through SSM.
- The S3 bucket is private and exposed only through CloudFront Origin Access Control.
- Sensitive values stay in Lambda or deployment environment variables, not in the frontend bundle.

## Cost Estimate

Typical ongoing costs come from API Gateway REST, Lambda, DynamoDB on-demand, S3, CloudFront, SNS, CloudWatch ingestion, and EC2 hosting for the monitored instance. For low traffic and small log volume, the stack is designed to stay in the low monthly range.

## Related Docs

- [Deployment Guide](DEPLOYMENT.md)
- [Legacy Setup Archive](ARCHIVE-legacy-setup.md)
