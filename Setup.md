markdown

# 🛠️ Complete Setup Guide

This guide provides step-by-step instructions for setting up the AI Health Monitoring System from scratch.

---

## 📖 Table of Contents

- [Prerequisites](#-prerequisites)
- [Architecture Overview](#-architecture-overview)
- [Part 1: Frontend Setup](#-part-1-frontend-setup)
- [Part 2: AWS Infrastructure Setup](#-part-2-aws-infrastructure-setup)
- [Part 3: Lambda Functions](#-part-3-lambda-functions)
- [Part 4: Testing & Verification](#-part-4-testing--verification)
- [Deployment to Production](#-deployment-to-production)
- [Troubleshooting](#-troubleshooting)
- [Cost Estimation](#-cost-estimation)

---

## 📋 Prerequisites

### Required Accounts & Tools

- ✅ **AWS Account** with administrator access
- ✅ **Node.js** version 18 or higher
- ✅ **npm** or **yarn** package manager
- ✅ **Git** for version control
- ✅ **AWS CLI** installed and configured
- ✅ **OpenRouter Account** (free tier available)
- ✅ **Email address** for SNS notifications

### Installation Check

Verify you have the required tools:

```bash
# Check Node.js version
node --version
# Should output: v18.0.0 or higher

# Check npm version
npm --version
# Should output: 9.0.0 or higher

# Check AWS CLI
aws --version
# Should output: aws-cli/2.x.x or higher

# Check Git
git --version
# Should output: git version 2.x.x or higher
AWS CLI Configuration
If not already configured, set up AWS CLI:

bash

aws configure
Provide:

AWS Access Key ID: Your access key
AWS Secret Access Key: Your secret key
Default region: ap-south-1 (Mumbai) or your preferred region
Default output format: json
🏗️ Architecture Overview
Before we begin, understand what we're building:


Frontend (React) → API Gateway → Lambda Functions → Backend Services
                                       ↓
                          CloudWatch, DynamoDB, SNS, OpenRouter
Components We'll Set Up
Frontend: React dashboard (localhost or deployed)
EC2: Instance running your application
CloudWatch: Log collection and monitoring
Lambda Functions: 2 functions (Status, Analysis)
DynamoDB: 2 tables (Incidents, Analysis)
SNS: Email notification topic
API Gateway: REST API endpoints
IAM: Roles and permissions
Estimated Setup Time: 45-60 minutes

🎨 Part 1: Frontend Setup
Step 1.1: Clone the Repository
bash

# Clone the repository
git clone https://github.com/yourusername/ai-health-monitoring.git

# Navigate to project directory
cd ai-health-monitoring

# Verify you're in the right directory
ls -la
# You should see: src/, public/, package.json, etc.
Step 1.2: Install Dependencies
bash

# Install all npm packages
npm install

# This will install:
# - React 19.2.7
# - Vite 8.1.1
# - Tailwind CSS 4.3.3
# - Lucide React 1.27.0
# - And all dev dependencies

# Wait for installation to complete (1-2 minutes)
Step 1.3: Configure Environment Variables
bash

# Copy the example environment file
cp .env.example .env

# Open .env in your text editor
nano .env
# or
code .env
Edit .env file:

env

# AWS API Gateway URL (you'll get this after setting up API Gateway)
VITE_API_BASE_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod

# DO NOT add sensitive information here!
# Instance IDs and AWS credentials belong in Lambda environment variables
Note: We'll update the VITE_API_BASE_URL later after creating the API Gateway.

Step 1.4: Start Development Server
bash

# Start Vite development server
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
Open your browser and visit http://localhost:5173

Expected Result: Dashboard loads, but shows connection errors (normal - backend not set up yet)

Step 1.5: Verify Frontend Build
bash

# Test production build
npm run build

# This creates a dist/ folder with optimized files
# You should see: Build complete. Output in dist/

# Test production preview
npm run preview

# Visit http://localhost:4173 to see production build
✅ Frontend setup complete! Now let's set up the AWS backend.

☁️ Part 2: AWS Infrastructure Setup
Step 2.1: EC2 Instance Setup
Launch EC2 Instance
Go to AWS Console → EC2 → Launch Instance

Configure Instance:

Name: health-monitoring-app
AMI: Amazon Linux 2023 or Ubuntu 22.04
Instance Type: t2.micro (free tier eligible)
Key Pair: Create new or use existing
Security Group:
Allow SSH (port 22) from your IP
Allow HTTP (port 80) from anywhere
Allow HTTPS (port 443) from anywhere
Allow custom port (e.g., 3000) if needed
Launch Instance and note the Instance ID (e.g., i-0123456789abcdef0)

Connect to EC2
bash

# SSH into your instance
ssh -i your-key.pem ec2-user@your-instance-public-ip

# Update system packages
sudo yum update -y
# or for Ubuntu:
# sudo apt update && sudo apt upgrade -y
Install CloudWatch Agent
bash

# Download CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm

# Install agent
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Create configuration file
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/config.json
Add this configuration:

json

{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/application.log",
            "log_group_name": "/aws/ec2/health-monitoring",
            "log_stream_name": "{instance_id}/application"
          },
          {
            "file_path": "/var/log/syslog",
            "log_group_name": "/aws/ec2/health-monitoring",
            "log_stream_name": "{instance_id}/system"
          }
        ]
      }
    }
  }
}
Start CloudWatch agent:

bash

# Start agent with configuration
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

# Verify agent is running
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a query \
  -m ec2 \
  -c default
Deploy Your Application (Example with Node.js)
bash

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2 for process management
npm install -g pm2

# Clone your application (example)
git clone your-app-repo
cd your-app
npm install

# Start application with PM2
pm2 start app.js --name "health-app"
pm2 save
pm2 startup

# Configure logging to /var/log/application.log
pm2 install pm2-logrotate
✅ EC2 setup complete! Logs are now being sent to CloudWatch.

Step 2.2: DynamoDB Tables Setup
Create Incidents Table
bash

# Create Incidents table
aws dynamodb create-table \
  --table-name HealthMonitoring-Incidents \
  --attribute-definitions \
    AttributeName=incidentId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=incidentId,KeyType=HASH \
  --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"timestamp-index\",
        \"KeySchema\": [{\"AttributeName\":\"timestamp\",\"KeyType\":\"HASH\"}],
        \"Projection\": {\"ProjectionType\":\"ALL\"},
        \"ProvisionedThroughput\": {\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}
      }
    ]" \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1

# Verify table creation
aws dynamodb describe-table \
  --table-name HealthMonitoring-Incidents \
  --region ap-south-1
Create Analysis Table (Optional - can use same table)
bash

# Create Analysis table
aws dynamodb create-table \
  --table-name HealthMonitoring-Analysis \
  --attribute-definitions \
    AttributeName=analysisId,AttributeType=S \
  --key-schema \
    AttributeName=analysisId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
DynamoDB Schema:

Incidents Table:


{
  "incidentId": "INC-1234567890",          // Primary Key
  "type": "CPU_SPIKE",
  "severity": "High",
  "status": "completed",                    // analyzing | completed
  "timestamp": "2024-01-15T10:30:00Z",
  "logMessage": "Original error log",
  "analysis": {
    "rootCause": "...",
    "impact": "...",
    "confidence": "High",
    "resolution": [...],
    "automation": "..."
  }
}
✅ DynamoDB tables created!

Step 2.3: SNS Topic Setup
Create SNS Topic
bash

# Create SNS topic
aws sns create-topic \
  --name HealthMonitoring-IncidentAlerts \
  --region ap-south-1

# Note the TopicArn from output:
# arn:aws:sns:ap-south-1:123456789012:HealthMonitoring-IncidentAlerts
Subscribe Email Address
bash

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:HealthMonitoring-IncidentAlerts \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region ap-south-1

# You'll receive a confirmation email
# Click the confirmation link in the email
Test SNS Topic
bash

# Send test notification
aws sns publish \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:HealthMonitoring-IncidentAlerts \
  --subject "Test Alert" \
  --message "This is a test notification from Health Monitoring System" \
  --region ap-south-1

# Check your email for the test message
✅ SNS topic configured! You should receive test email.

Step 2.4: IAM Roles Setup
Create Lambda Execution Role
bash

# Create trust policy file
cat > lambda-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create IAM role
aws iam create-role \
  --role-name HealthMonitoring-LambdaExecutionRole \
  --assume-role-policy-document file://lambda-trust-policy.json

# Note the Role ARN from output
Attach Policies to Role
bash

# Create custom policy for our Lambda functions
cat > lambda-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:GetLogEvents",
        "logs:FilterLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/HealthMonitoring-Incidents",
        "arn:aws:dynamodb:*:*:table/HealthMonitoring-Analysis"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:*:*:HealthMonitoring-IncidentAlerts"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Create policy
aws iam create-policy \
  --policy-name HealthMonitoring-LambdaPolicy \
  --policy-document file://lambda-policy.json

# Attach policy to role
aws iam attach-role-policy \
  --role-name HealthMonitoring-LambdaExecutionRole \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/HealthMonitoring-LambdaPolicy

# Attach basic Lambda execution policy
aws iam attach-role-policy \
  --role-name HealthMonitoring-LambdaExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
✅ IAM roles configured!

⚡ Part 3: Lambda Functions
Step 3.1: Get OpenRouter API Key
Go to OpenRouter.ai
Sign up for a free account
Navigate to API Keys section
Create a new API key
Copy and save the key securely
Step 3.2: Lambda Function 1 - Status Function
This function checks EC2 instance health and returns service status.

Create Lambda Function
bash

# Create deployment package directory
mkdir lambda-status
cd lambda-status

# Create lambda_function.py
nano lambda_function.py
Copy the Status Lambda code from your Lambda code files:

python

# See: lambda-functions/status-function/lambda_function.py
# (You mentioned you'll upload the Lambda code separately)
#
# This function should:
# - Check EC2 instance status
# - Return health status of 5 services
# - Handle errors gracefully
Sample Status Function Structure:

python

import json
import boto3
import os

ec2 = boto3.client('ec2')
INSTANCE_ID = os.environ['INSTANCE_ID']

def lambda_handler(event, context):
    """
    Returns current health status of monitored services
    """
    try:
        # Check EC2 status
        response = ec2.describe_instance_status(
            InstanceIds=[INSTANCE_ID],
            IncludeAllInstances=True
        )

        instance_state = 'unknown'
        if response['InstanceStatuses']:
            instance_state = response['InstanceStatuses'][0]['InstanceState']['Name']

        # Build service status array
        services = [
            {
                "id": "app",
                "name": "Application",
                "status": "healthy",
                "detail": "Running normally"
            },
            {
                "id": "alb",
                "name": "Load Balancer",
                "status": "healthy",
                "detail": "Active"
            },
            {
                "id": "ec2",
                "name": "EC2 Instance",
                "status": "healthy" if instance_state == 'running' else "critical",
                "detail": f"State: {instance_state}"
            },
            {
                "id": "nginx",
                "name": "Nginx",
                "status": "healthy",
                "detail": "80% capacity"
            },
            {
                "id": "cw",
                "name": "CloudWatch Agent",
                "status": "healthy",
                "detail": "Collecting logs"
            }
        ]

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps(services)
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Internal server error'})
        }
Package and Deploy Status Function
bash

# Create deployment package
zip -r status-function.zip lambda_function.py

# Create Lambda function
aws lambda create-function \
  --function-name HealthMonitoring-StatusFunction \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/HealthMonitoring-LambdaExecutionRole \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://status-function.zip \
  --timeout 10 \
  --memory-size 128 \
  --region ap-south-1

# Set environment variables
aws lambda update-function-configuration \
  --function-name HealthMonitoring-StatusFunction \
  --environment Variables="{
    INSTANCE_ID=i-your-instance-id,
    AWS_REGION=ap-south-1
  }" \
  --region ap-south-1
Test Status Function
bash

# Invoke function
aws lambda invoke \
  --function-name HealthMonitoring-StatusFunction \
  --region ap-south-1 \
  output.json

# Check output
cat output.json
✅ Status Lambda deployed!

Step 3.3: Lambda Function 2 - Analysis Function
This function detects incidents, calls OpenRouter AI, and stores results.

Create Analysis Function
bash

# Create deployment package directory
cd ..
mkdir lambda-analysis
cd lambda-analysis

# Create lambda_function.py
nano lambda_function.py
Copy the Analysis Lambda code from your Lambda code files:

python

# See: lambda-functions/analysis-function/lambda_function.py
# (You mentioned you'll upload the Lambda code separately)
#
# This function should:
# - Poll CloudWatch logs
# - Check for error patterns
# - Create incidents in DynamoDB
# - Call OpenRouter AI for analysis
# - Send SNS notifications
# - Return incidents with analysis
Sample Analysis Function Structure:

python

import json
import boto3
import os
import requests
from datetime import datetime
from decimal import Decimal

# AWS clients
logs = boto3.client('logs')
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

# Environment variables
OPENROUTER_API_KEY = os.environ['OPENROUTER_API_KEY']
SNS_TOPIC_ARN = os.environ['SNS_TOPIC_ARN']
DYNAMODB_TABLE = os.environ['DYNAMODB_TABLE']
LOG_GROUP_NAME = os.environ['LOG_GROUP_NAME']

table = dynamodb.Table(DYNAMODB_TABLE)

# Predefined error patterns (MVP approach)
ERROR_PATTERNS = {
    'network': ['network timeout', 'connection refused', 'connection reset', 'network unreachable'],
    'memory': ['out of memory', 'memory exceeded', 'OOM', 'memory leak'],
    'disk': ['disk full', 'no space left', 'disk space', 'storage full'],
    'cpu': ['cpu spike', 'high cpu', 'cpu usage', 'cpu throttling'],
    'crash': ['segmentation fault', 'crash', 'fatal error', 'core dumped'],
    'http': ['500 internal server error', '502 bad gateway', '503 service unavailable', 'gateway timeout']
}

def check_logs_for_patterns():
    """
    Poll CloudWatch logs and check for error patterns
    """
    # Implementation here
    pass

def analyze_with_ai(incident_type, log_message):
    """
    Call OpenRouter AI for incident analysis
    """
    # Implementation here
    pass

def send_sns_alert(incident):
    """
    Send SNS email notification
    """
    # Implementation here
    pass

def lambda_handler(event, context):
    """
    Main handler for analysis function
    """
    # Implementation here
    pass
Install Dependencies
bash

# Create requirements.txt
cat > requirements.txt << 'EOF'
requests==2.31.0
boto3==1.28.0
EOF

# Install dependencies
pip install -r requirements.txt -t .

# Package function
zip -r analysis-function.zip .
Deploy Analysis Function
bash

# Create Lambda function
aws lambda create-function \
  --function-name HealthMonitoring-AnalysisFunction \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/HealthMonitoring-LambdaExecutionRole \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://analysis-function.zip \
  --timeout 30 \
  --memory-size 256 \
  --region ap-south-1

# Set environment variables
aws lambda update-function-configuration \
  --function-name HealthMonitoring-AnalysisFunction \
  --environment Variables="{
    OPENROUTER_API_KEY=your-openrouter-api-key,
    SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:HealthMonitoring-IncidentAlerts,
    DYNAMODB_TABLE=HealthMonitoring-Incidents,
    LOG_GROUP_NAME=/aws/ec2/health-monitoring,
    AWS_REGION=ap-south-1
  }" \
  --region ap-south-1
Set Up EventBridge Schedule (Optional - for polling)
bash

# Create EventBridge rule to trigger Lambda every minute
aws events put-rule \
  --name HealthMonitoring-AnalysisSchedule \
  --schedule-expression "rate(1 minute)" \
  --region ap-south-1

# Add Lambda as target
aws events put-targets \
  --rule HealthMonitoring-AnalysisSchedule \
  --targets "Id"="1","Arn"="arn:aws:lambda:ap-south-1:YOUR_ACCOUNT_ID:function:HealthMonitoring-AnalysisFunction" \
  --region ap-south-1

# Grant EventBridge permission to invoke Lambda
aws lambda add-permission \
  --function-name HealthMonitoring-AnalysisFunction \
  --statement-id EventBridgeInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:ap-south-1:YOUR_ACCOUNT_ID:rule/HealthMonitoring-AnalysisSchedule \
  --region ap-south-1
✅ Analysis Lambda deployed!

Step 3.4: API Gateway Setup
Create HTTP API
bash

# Create API
aws apigatewayv2 create-api \
  --name HealthMonitoringAPI \
  --protocol-type HTTP \
  --cors-configuration AllowOrigins="*",AllowMethods="GET,POST,OPTIONS",AllowHeaders="*" \
  --region ap-south-1

# Note the API ID from output
export API_ID=your-api-id
Create Lambda Integrations
bash

# Integration for Status Function
aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:ap-south-1:YOUR_ACCOUNT_ID:function:HealthMonitoring-StatusFunction \
  --payload-format-version 2.0 \
  --region ap-south-1

# Note the Integration ID
export STATUS_INTEGRATION_ID=integration-id

# Integration for Analysis Function
aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:ap-south-1:YOUR_ACCOUNT_ID:function:HealthMonitoring-AnalysisFunction \
  --payload-format-version 2.0 \
  --region ap-south-1

# Note the Integration ID
export ANALYSIS_INTEGRATION_ID=integration-id
Create Routes
bash

# /status route
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "GET /status" \
  --target integrations/$STATUS_INTEGRATION_ID \
  --region ap-south-1

# /incidents route
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "GET /incidents" \
  --target integrations/$ANALYSIS_INTEGRATION_ID \
  --region ap-south-1
Grant API Gateway Permission
bash

# Allow API Gateway to invoke Status Lambda
aws lambda add-permission \
  --function-name HealthMonitoring-StatusFunction \
  --statement-id ApiGatewayInvoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-south-1:YOUR_ACCOUNT_ID:$API_ID/*/*/status" \
  --region ap-south-1

# Allow API Gateway to invoke Analysis Lambda
aws lambda add-permission \
  --function-name HealthMonitoring-AnalysisFunction \
  --statement-id ApiGatewayInvoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-south-1:YOUR_ACCOUNT_ID:$API_ID/*/*/incidents" \
  --region ap-south-1
Deploy API
bash

# Create stage and deploy
aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name prod \
  --auto-deploy \
  --region ap-south-1

# Get API endpoint
aws apigatewayv2 get-api --api-id $API_ID --region ap-south-1 --query 'ApiEndpoint' --output text
Your API URL will be:


https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod
✅ API Gateway configured!

Step 3.5: Update Frontend Configuration
Now update your frontend with the API Gateway URL:

bash

# Navigate to frontend project
cd /path/to/ai-health-monitoring

# Edit .env file
nano .env
Update with your API Gateway URL:

env

VITE_API_BASE_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod
Restart development server:

bash

npm run dev
✅ Frontend connected to backend!

✅ Part 4: Testing & Verification
Test 1: API Gateway Endpoints
bash

# Test /status endpoint
curl https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/status

# Expected: Array of service status objects

# Test /incidents endpoint
curl https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/incidents

# Expected: Array of incidents (may be empty initially)
Test 2: Generate Test Incident
bash

# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Write test error to application log
echo "[ERROR] $(date) - out of memory error detected" | sudo tee -a /var/log/application.log

# Wait 1-2 minutes for Lambda to process
Test 3: Verify Incident Detection
Check DynamoDB:
bash

aws dynamodb scan \
  --table-name HealthMonitoring-Incidents \
  --region ap-south-1
Check Email: You should receive SNS notification

Check Dashboard: Open browser, incident should appear

Test 4: Complete Flow Verification
✅ Dashboard loads without errors
✅ Service health cards show status
✅ Test incident appears in incident list
✅ Click incident card to expand
✅ AI analysis is visible
✅ Resolution steps are displayed
✅ Command copy buttons work
✅ Theme toggle works
✅ Email notification received
🚀 Deployment to Production
Frontend Deployment Options
Option 1: AWS S3 + CloudFront
bash

# Build production bundle
npm run build

# Create S3 bucket
aws s3 mb s3://health-monitoring-dashboard --region ap-south-1

# Configure bucket for static website
aws s3 website s3://health-monitoring-dashboard \
  --index-document index.html \
  --error-document index.html

# Upload files
aws s3 sync dist/ s3://health-monitoring-dashboard --acl public-read

# Create CloudFront distribution (optional, for HTTPS)
Option 2: Vercel
bash

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts, configure environment variables
Option 3: Netlify
bash

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Production deploy
netlify deploy --prod
Backend is Already Deployed!
All Lambda functions, API Gateway, and AWS resources are already in production.

🔧 Troubleshooting
Issue 1: Dashboard shows "Connection Error"
Cause: API Gateway URL not configured or incorrect

Solution:

bash

# Verify API Gateway URL
aws apigatewayv2 get-api --api-id YOUR_API_ID --query 'ApiEndpoint' --output text

# Update .env file with correct URL
# Restart dev server
npm run dev
Issue 2: No Incidents Detected
Cause: CloudWatch logs not being generated or pattern not matching

Solution:

bash

# 1. Verify logs are being written
aws logs describe-log-streams \
--log-group-name /aws/ec2/health-monitoring \
  --region ap-south-1

# 2. Check recent log events
aws logs filter-log-events \
  --log-group-name /aws/ec2/health-monitoring \
  --start-time $(date -d '10 minutes ago' +%s)000 \
  --region ap-south-1

# 3. Manually create test log with error pattern
echo "[ERROR] out of memory error" | sudo tee -a /var/log/application.log

# 4. Check Lambda execution logs
aws logs tail /aws/lambda/HealthMonitoring-AnalysisFunction --follow
Issue 3: Lambda Function Timeout
Cause: OpenRouter API slow response or Lambda timeout too short

Solution:

bash

# Increase timeout to 60 seconds
aws lambda update-function-configuration \
  --function-name HealthMonitoring-AnalysisFunction \
  --timeout 60 \
  --region ap-south-1
Issue 4: "Access Denied" Errors in Lambda
Cause: IAM role missing permissions

Solution:

bash

# Verify role policies
aws iam list-attached-role-policies \
  --role-name HealthMonitoring-LambdaExecutionRole

# Check Lambda logs for specific permission errors
aws logs tail /aws/lambda/HealthMonitoring-AnalysisFunction

# Add missing permissions to policy as needed
Issue 5: SNS Email Not Received
Cause: Email subscription not confirmed

Solution:

bash

# Check subscription status
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:HealthMonitoring-IncidentAlerts

# If status is "PendingConfirmation", check email spam folder
# Resend subscription
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:HealthMonitoring-IncidentAlerts \
  --protocol email \
  --notification-endpoint your-email@example.com
Issue 6: CORS Errors in Browser
Cause: API Gateway CORS not properly configured

Solution:

bash

# Update API CORS configuration
aws apigatewayv2 update-api \
  --api-id YOUR_API_ID \
  --cors-configuration AllowOrigins="*",AllowMethods="GET,POST,OPTIONS",AllowHeaders="Content-Type,Authorization" \
  --region ap-south-1

# Or add specific origin
aws apigatewayv2 update-api \
  --api-id YOUR_API_ID \
  --cors-configuration AllowOrigins="https://your-domain.com",AllowMethods="GET,POST,OPTIONS",AllowHeaders="*" \
  --region ap-south-1
Issue 7: OpenRouter API Errors
Cause: Invalid API key or rate limit exceeded

Solution:

bash

# 1. Verify API key is correct in Lambda environment
aws lambda get-function-configuration \
  --function-name HealthMonitoring-AnalysisFunction \
  --region ap-south-1 \
  --query 'Environment.Variables'

# 2. Test OpenRouter API key manually
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# 3. Update Lambda environment variable if needed
aws lambda update-function-configuration \
  --function-name HealthMonitoring-AnalysisFunction \
  --environment Variables="{OPENROUTER_API_KEY=new-key,...}" \
  --region ap-south-1
Issue 8: DynamoDB Item Not Found
Cause: Incident not being written to DynamoDB

Solution:

bash

# Check DynamoDB table exists
aws dynamodb describe-table \
  --table-name HealthMonitoring-Incidents \
  --region ap-south-1

# Scan table to see all items
aws dynamodb scan \
  --table-name HealthMonitoring-Incidents \
  --region ap-south-1

# Check Lambda logs for DynamoDB errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/HealthMonitoring-AnalysisFunction \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000
Issue 9: High AWS Costs
Cause: Frequent Lambda invocations or large log storage

Solution:

bash

# 1. Check Lambda invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=HealthMonitoring-AnalysisFunction \
  --start-time $(date -d '24 hours ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum

# 2. Reduce EventBridge schedule frequency
aws events put-rule \
  --name HealthMonitoring-AnalysisSchedule \
  --schedule-expression "rate(5 minutes)" \
  --region ap-south-1

# 3. Set CloudWatch log retention
aws logs put-retention-policy \
  --log-group-name /aws/lambda/HealthMonitoring-AnalysisFunction \
  --retention-in-days 7 \
  --region ap-south-1
Issue 10: Dashboard Not Updating
Cause: Polling stopped or browser cache

Solution:

bash

# 1. Clear browser cache (Ctrl+Shift+R)

# 2. Check browser console for errors (F12)

# 3. Verify API endpoints respond
curl https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/status
curl https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/incidents

# 4. Restart development server
npm run dev
💰 Cost Estimation
Monthly AWS Costs (Free Tier)
Assuming moderate usage:

Service	Usage	Free Tier	Cost After Free Tier
EC2 (t2.micro)	750 hrs/month	✅ Included	$8.50/month
Lambda	1M requests, 200ms avg	✅ Included	$0.20/1M requests
API Gateway	1M requests	✅ Included	$1.00/1M requests
DynamoDB	25GB storage, 200M reads	✅ Included	$0.25/GB
CloudWatch Logs	5GB ingestion, 5GB storage	✅ Included	$0.50/GB
SNS	1000 emails/month	✅ Included	$2.00/100k emails
Data Transfer	1GB out	✅ Included	$0.09/GB
Total Monthly Cost (within free tier): ~$0 Total Monthly Cost (after free tier): ~$15-25

Cost Optimization Tips
Use Lambda efficiently

Reduce memory allocation if possible
Optimize code execution time
Use EventBridge schedule wisely
Manage CloudWatch Logs

Set retention policies (7-30 days)
Filter logs before sending
Use log sampling for high-volume logs
DynamoDB optimization

Use on-demand billing for variable workloads
Archive old incidents to S3
Use Time-To-Live (TTL) for automatic cleanup
OpenRouter costs

Start with free tier (limited requests)
Upgrade to paid tier only when needed
Cache AI responses when possible
🔒 Security Best Practices
1. Environment Variables
Never commit sensitive data to Git:

bash

# Ensure .env is in .gitignore
echo ".env" >> .gitignore

# Use environment-specific files
.env.development
.env.production
2. AWS Secrets Manager (Optional)
For production, consider using Secrets Manager:

bash

# Store OpenRouter API key
aws secretsmanager create-secret \
  --name HealthMonitoring/OpenRouterKey \
  --secret-string "your-api-key" \
  --region ap-south-1

# Update Lambda to retrieve from Secrets Manager
# (Requires code changes in Lambda function)
3. API Gateway Authentication
Add authentication to your API:

bash

# Option 1: API Key
aws apigatewayv2 create-api-key \
  --name HealthMonitoring-APIKey \
  --enabled

# Option 2: AWS Cognito (for user authentication)
# Set up Cognito User Pool and configure API Gateway authorizer
4. EC2 Security
bash

# Update security group to restrict SSH
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32

# Enable VPC Flow Logs for monitoring
aws ec2 create-flow-logs \
  --resource-type VPC \
  --resource-ids vpc-xxxxx \
  --traffic-type ALL \
  --log-destination-type cloud-watch-logs \
  --log-group-name /aws/vpc/flowlogs
5. IAM Least Privilege
Review and minimize IAM permissions:

bash

# Use IAM Access Analyzer
aws accessanalyzer create-analyzer \
  --analyzer-name HealthMonitoring-Analyzer \
  --type ACCOUNT

# Regularly review unused permissions
📊 Monitoring & Observability
CloudWatch Dashboards
Create a custom dashboard:

bash

# Create dashboard (via AWS Console or CLI)
aws cloudwatch put-dashboard \
  --dashboard-name HealthMonitoringDashboard \
  --dashboard-body file://dashboard-config.json
Dashboard Metrics to Monitor:

Lambda invocation count and errors
API Gateway request count and latency
DynamoDB read/write capacity
EC2 CPU and memory utilization
CloudWatch log ingestion rate
CloudWatch Alarms
Set up alerts for critical issues:

bash

# Lambda error alarm
aws cloudwatch put-metric-alarm \
  --alarm-name HealthMonitoring-LambdaErrors \
  --alarm-description "Alert when Lambda errors exceed threshold" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=HealthMonitoring-AnalysisFunction

# API Gateway 5xx errors
aws cloudwatch put-metric-alarm \
  --alarm-name HealthMonitoring-APIErrors \
  --metric-name 5XXError \
  --namespace AWS/ApiGateway \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
🧪 Testing Scenarios
Scenario 1: CPU Spike Incident
bash

# SSH into EC2
ssh -i your-key.pem ec2-user@your-instance-ip

# Generate CPU spike log
echo "[ERROR] $(date) - High CPU usage detected: 95% utilization" | sudo tee -a /var/log/application.log

# Wait 1-2 minutes
# Check dashboard for new incident
Scenario 2: Memory Issue
bash

# Generate memory error
echo "[ERROR] $(date) - Out of memory error: Cannot allocate memory" | sudo tee -a /var/log/application.log

# Verify:
# 1. Email notification received
# 2. Incident appears in dashboard
# 3. AI analysis includes resolution steps
Scenario 3: Network Timeout
bash

# Generate network error
echo "[ERROR] $(date) - Connection timeout: network timeout after 30s" | sudo tee -a /var/log/application.log

# Expected:
# - Incident created with type: NETWORK
# - AI suggests network troubleshooting steps
Scenario 4: Service Crash
bash

# Generate crash log
echo "[FATAL] $(date) - Application crash: segmentation fault" | sudo tee -a /var/log/application.log

# Expected:
# - High severity incident
# - Immediate email notification
# - Restart service recommendation
📚 Additional Configuration
Custom Error Patterns
To add new error patterns, update Lambda function:

python

# In lambda-analysis/lambda_function.py
ERROR_PATTERNS = {
    'network': ['network timeout', 'connection refused', ...],
    'memory': ['out of memory', 'OOM', ...],
    'disk': ['disk full', 'no space left', ...],
    # Add your custom patterns
    'database': ['deadlock', 'connection pool', 'query timeout'],
    'api': ['rate limit', 'api error', 'unauthorized'],
}
Redeploy Lambda:

bash

cd lambda-analysis
zip -r analysis-function.zip .
aws lambda update-function-code \
  --function-name HealthMonitoring-AnalysisFunction \
  --zip-file fileb://analysis-function.zip \
  --region ap-south-1
Multiple Log Groups
To monitor multiple log groups:

python

# Update Lambda to check multiple groups
LOG_GROUPS = [
    '/aws/ec2/health-monitoring',
    '/aws/ec2/application',
    '/ecs/myapp'
]

for log_group in LOG_GROUPS:
    check_logs_for_patterns(log_group)
Custom AI Prompts
Modify AI analysis prompts in Lambda:

python

def analyze_with_ai(incident_type, log_message):
    prompt = f"""
    You are a DevOps expert analyzing a {incident_type} incident.

    Log: {log_message}

    Provide:
    1. Root cause (2-3 sentences)
    2. Impact assessment
    3. Confidence level (High/Medium/Low)
    4. 3-5 resolution steps with commands
    5. Automation recommendation

    Respond in JSON format only.
    """

    # Call OpenRouter API with custom prompt
🔄 Maintenance & Updates
Update Lambda Functions
bash

# Update code
cd lambda-analysis
nano lambda_function.py  # Make changes

# Redeploy
zip -r analysis-function.zip .
aws lambda update-function-code \
  --function-name HealthMonitoring-AnalysisFunction \
  --zip-file fileb://analysis-function.zip \
  --region ap-south-1

# Update environment variables if needed
aws lambda update-function-configuration \
  --function-name HealthMonitoring-AnalysisFunction \
  --environment Variables="{...}" \
  --region ap-south-1
Update Frontend
bash

# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Redeploy (if using S3)
aws s3 sync dist/ s3://health-monitoring-dashboard
Backup DynamoDB
bash

# Enable point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name HealthMonitoring-Incidents \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Create on-demand backup
aws dynamodb create-backup \
  --table-name HealthMonitoring-Incidents \
  --backup-name HealthMonitoring-Backup-$(date +%Y%m%d)
📖 Lambda Code Files
Status Function Code
File: 
lambda_function.py

python

# TODO: Upload your Status Lambda function code here
# The file should contain the complete implementation for:
# - Checking EC2 instance status
# - Monitoring service health
# - Returning status array
# - Error handling
Analysis Function Code
File: 
lambda_function.py

python

# TODO: Upload your Analysis Lambda function code here
# The file should contain the complete implementation for:
# - CloudWatch log polling
# - Error pattern matching
# - Incident creation in DynamoDB
# - OpenRouter AI integration
# - SNS notification sending
# - Returning incidents with analysis
Requirements File
File: 
requirements.txt


requests==2.31.0
boto3>=1.28.0
python-dateutil>=2.8.0
✅ Deployment Checklist
Use this checklist to ensure complete setup:

Infrastructure Setup
 EC2 instance launched and running
 CloudWatch agent installed and configured
 Application deployed and logging to CloudWatch
 DynamoDB tables created (Incidents, Analysis)
 SNS topic created and email subscribed
 IAM roles created with proper permissions
Lambda Functions
 Status Lambda function created and deployed
 Analysis Lambda function created and deployed
 Environment variables configured for both
 EventBridge schedule configured (if using)
 Lambda permissions granted for API Gateway
API Gateway
 HTTP API created
 Routes configured (/status, /incidents)
 CORS enabled
 API deployed to prod stage
 Lambda integrations working
Frontend
 Dependencies installed
 Environment variables configured (.env)
 API Gateway URL updated
 Development server tested
 Production build successful
 Deployed to hosting platform (if applicable)
Testing
 API endpoints responding correctly
 Test incident generated and detected
 Email notification received
 Dashboard displays incidents
 AI analysis visible
 Command copy functionality works
 Theme toggle works
Security
 .env file in .gitignore
 No sensitive data in Git
 IAM permissions follow least privilege
 Security groups properly configured
 HTTPS enabled (production)
Monitoring
 CloudWatch logs configured
 CloudWatch alarms set up
 Dashboard created (optional)
 Cost monitoring enabled
🎓 Learning Resources
AWS Documentation
Lambda Best Practices
API Gateway Developer Guide
DynamoDB Getting Started
CloudWatch Logs
React & Frontend
React Documentation
Vite Guide
Tailwind CSS Docs
OpenRouter
OpenRouter Documentation
API Reference
💬 Support
Getting Help
Check Documentation: Review this guide and README.md
AWS Support: Use AWS Support Center for infrastructure issues
GitHub Issues: Report bugs or request features
Community: Join discussions in GitHub Discussions