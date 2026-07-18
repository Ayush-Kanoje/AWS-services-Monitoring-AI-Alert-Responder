# Setup Guide

Complete walkthrough for deploying the AI-Powered Cloud Incident Response Platform
from scratch on AWS.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x + | Frontend build & Lambda runtime |
| AWS CLI | 2.x | Deploying AWS resources |
| npm | 10.x + | Package management |

You also need an [OpenRouter](https://openrouter.ai) account and API key.

---

## 1. Clone the repository

```bash
git clone https://github.com/your-org/AI-Cloud-Incident-Platform.git
cd AI-Cloud-Incident-Platform
```

---

## 2. Frontend — local development

```bash
cd frontend
npm install
cp .env.example .env          # fill in VITE_API_URL later
npm run dev                   # http://localhost:5173
```

---

## 3. AWS infrastructure

### 3a. DynamoDB table

```bash
aws dynamodb create-table \
  --table-name incidents \
  --attribute-definitions AttributeName=incidentId,AttributeType=S \
  --key-schema AttributeName=incidentId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### 3b. SNS topic

```bash
aws sns create-topic --name incident-alerts
# Note the returned TopicArn
```

### 3c. Lambda IAM role

1. Create a role with the trust policy for `lambda.amazonaws.com`.
2. Attach `infrastructure/iam-policies/lambda-execution-policy.json` as
   an inline policy.

### 3d. Deploy Lambda functions

```bash
cd backend
npm install

# Package and deploy each handler (example for simulateIncident)
zip -r simulateIncident.zip lambda/simulateIncident.js services/ utils/ node_modules/

aws lambda create-function \
  --function-name simulateIncident \
  --runtime nodejs20.x \
  --role arn:aws:iam::<account-id>:role/incident-lambda-role \
  --handler lambda/simulateIncident.handler \
  --zip-file fileb://simulateIncident.zip \
  --environment "Variables={
    OPENROUTER_API_KEY=<your-key>,
    DYNAMODB_TABLE=incidents,
    SNS_TOPIC_ARN=<your-topic-arn>
  }"
```

Repeat for `getHistory` and `getHealth` (no env vars needed for getHealth).

### 3e. API Gateway HTTP API

Create an HTTP API with three routes:

| Method | Path | Lambda integration |
|--------|------|--------------------|
| POST | /simulate | simulateIncident |
| GET | /history | getHistory |
| GET | /health | getHealth |

Enable CORS for your S3 frontend origin.

---

## 4. Frontend — production build & S3 deploy

```bash
cd frontend
# Set VITE_API_URL in .env to the API Gateway invoke URL
npm run build

# Create S3 bucket and deploy
aws s3 mb s3://ai-cloud-incident-platform-frontend
aws s3 website s3://ai-cloud-incident-platform-frontend \
  --index-document index.html --error-document index.html
aws s3 cp dist/ s3://ai-cloud-incident-platform-frontend/ --recursive

# Apply the public-read bucket policy
aws s3api put-bucket-policy \
  --bucket ai-cloud-incident-platform-frontend \
  --policy file://infrastructure/iam-policies/s3-frontend-policy.json
```

The app is now live at:
`http://ai-cloud-incident-platform-frontend.s3-website-<region>.amazonaws.com`

---

## 5. Verify end-to-end

1. Open the S3 website URL.
2. Click any simulation button.
3. The AI Incident Report panel should populate within ~3 seconds.
4. The Incident History table should show a new row.
5. Check your SNS subscription (email/Slack) for the alert.
