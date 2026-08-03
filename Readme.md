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

1. The user opens the dashboard through CloudFront.
2. CloudFront serves the React build from S3.
3. The dashboard calls the API Gateway REST endpoints for status and incidents.
4. When an incident needs analysis, the incident ID is sent to the Lambda analysis route.
5. Lambda collects the matching CloudWatch metrics and logs for that incident.
6. Structured evidence is sent to OpenRouter for analysis.
7. The model returns JSON with `rootCause`, `impact`, `confidence`, and `resolution`.
8. Results are saved back to DynamoDB and an SNS email is sent.
9. The dashboard refreshes and renders the incident details.

### System Flow

```mermaid
flowchart TB
    U[User Browser] --> CF[CloudFront]
    CF --> S3[S3 Static Site\nReact App]
    U --> API[API Gateway REST]
    API --> L1[Lambda: Status]
    API --> L2[Lambda: Analysis]
    L1 --> EC2[EC2 Instance]
    L1 --> CW[CloudWatch]
    L2 --> D[DynamoDB\nincidents]
    L2 --> CW
    L2 --> OR[OpenRouter]
    L2 --> SNS[SNS Email]
    EC2 --> CW
```

## Complete Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as React Dashboard
    participant CDN as CloudFront
    participant Bucket as S3
    participant API as API Gateway REST
    participant Status as Status Lambda
    participant Analysis as Analysis Lambda
    participant DB as DynamoDB
    participant Logs as CloudWatch
    participant LLM as OpenRouter
    participant Notify as SNS

    User->>Browser: Open dashboard
    Browser->>CDN: Request app bundle
    CDN->>Bucket: Fetch static assets
    Bucket-->>CDN: React build
    CDN-->>Browser: Serve UI
    Browser->>API: GET status
    API->>Status: Invoke status check
    Status-->>API: Service health JSON
    API-->>Browser: Render service cards
    Browser->>API: GET incidents
    API->>Analysis: Read stored incidents
    Analysis->>DB: Load incident history
    DB-->>Analysis: Incident records
    Analysis-->>API: Incident list
    API-->>Browser: Render incidents
    User->>Browser: Select incident for analysis
    Browser->>API: POST analysis request with incidentId
    API->>Analysis: Invoke analysis Lambda
    Analysis->>Logs: Pull relevant evidence
    Analysis->>LLM: Send structured context
    LLM-->>Analysis: JSON diagnosis
    Analysis->>DB: Save analysis result
    Analysis->>Notify: Publish alert
    Notify-->>User: Email notification
    Analysis-->>API: Analysis response
    API-->>Browser: Display root cause and resolution
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
| `/analysis` | POST | `{ "incidentId": "..." }` | Structured analysis result |
| `/incidents` | GET | None | Incident history |
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
