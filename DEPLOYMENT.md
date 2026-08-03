# Cloud-LogLens Deployment Guide

This guide documents the current deployment path for Cloud-LogLens.

## Prerequisites

- Node.js 20
- Python 3.11 for Lambda packaging
- Amazon Linux 2023 on EC2
- AWS CLI configured for the target account and region
- GitHub OIDC enabled for CI/CD

## 1. DynamoDB

Create the incidents table.

```bash
aws dynamodb create-table \
  --table-name incidents \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

## 2. SNS

Create the notification topic and subscribe the required email address.

```bash
aws sns create-topic \
  --name cloud-loglens-incidents \
  --region ap-south-1
```

Use the returned topic ARN as `SNS_TOPIC_ARN` in Lambda.

## 3. Lambda Functions

Deploy the two Lambda functions that the API invokes.

- `status-lambda`
- `incident-analysis-lambda`

Common environment variables:

| Variable | Example |
| --- | --- |
| `TABLE_NAME` | `incidents` |
| `OPENROUTER_API_KEY` | your OpenRouter key |
| `MODEL_NAME` | your model name |
| `SNS_TOPIC_ARN` | SNS topic ARN |
| `EC2_INSTANCE_ID` | monitored EC2 instance ID |

## 4. API Gateway REST

Create a REST API with Lambda proxy integration.

- `POST /analyze`
- `GET /status`

Enable CORS for the deployed frontend origin, then deploy to the `prod` stage.

## 5. EC2 And CloudWatch Agent

Use Amazon Linux 2023 and a CloudWatch Agent config that collects the logs used for incident evidence.

Example log sources:

- `/var/log/cloud-init.log`
- `/var/log/dnf.log`
- `/var/log/nginx/*`

Example agent configuration:

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/cloud-init.log",
            "log_group_name": "/aws/ec2/cloud-loglens",
            "log_stream_name": "{instance_id}/cloud-init"
          },
          {
            "file_path": "/var/log/dnf.log",
            "log_group_name": "/aws/ec2/cloud-loglens",
            "log_stream_name": "{instance_id}/dnf"
          },
          {
            "file_path": "/var/log/nginx/*",
            "log_group_name": "/aws/ec2/cloud-loglens",
            "log_stream_name": "{instance_id}/nginx"
          }
        ]
      }
    }
  }
}
```

## 6. Frontend Build

Build the static frontend with:

```bash
npm install
npm run build
```

The production output is written to `dist/`.

## 7. S3 And CloudFront

Deploy the contents of `dist/` to a private S3 bucket and serve it through CloudFront using OAC.

Suggested flow:

1. Upload the files inside `dist/` to the bucket root.
2. Keep the bucket private.
3. Attach CloudFront Origin Access Control.
4. Invalidate CloudFront after each deployment.

## 8. GitHub Actions

Use a workflow such as `cloud-loglens.yml` to automate frontend deployment.

Typical jobs:

- Build the React app
- Sync `dist/` to S3
- Invalidate the CloudFront distribution

## 9. OIDC Trust Policy

Use an IAM trust policy that allows GitHub Actions to assume the deployment role via OIDC.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

## Validation Checklist

- `/analyze` returns a structured analysis result.
- `/status` returns instance health.
- The `incidents` table receives stored incident records.
- The CloudFront URL serves the built frontend.
- CloudFront invalidation completes after each deploy.
