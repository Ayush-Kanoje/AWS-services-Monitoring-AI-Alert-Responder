# 🔒 Security-First Setup Guide

## ✅ Secure Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND (Browser - Public)                             │
│ ✓ Only API Gateway URL                                  │
│ ✗ NO instance ID                                        │
│ ✗ NO AWS credentials                                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓ POST { incidentType: "CPU Spike" }
                         │
┌────────────────────────┴────────────────────────────────┐
│ API GATEWAY (AWS)                                       │
│ ✓ Public endpoint                                       │
│ ✓ CORS enabled                                          │
│ ✓ Rate limiting (optional)                              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌────────────────────────┴────────────────────────────────┐
│ LAMBDA FUNCTIONS (Backend - Secure)                    │
│ ✓ Instance ID from environment variable                │
│ ✓ AWS credentials from execution role                  │
│ ✓ Private business logic                               │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Setup (5 Minutes)

### Step 1: Configure Frontend (Public)

**Option A: Using .env file (Recommended)**

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env`:
   ```env
   VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
   ```

**Option B: Direct configuration**

Edit `src/api/app.js`:
```javascript
const BASE_URL = "https://your-api-id.execute-api.us-east-1.amazonaws.com/prod";
```

### Step 2: Configure Backend (Secure)

For **EACH** Lambda function, set environment variable:

1. AWS Console → Lambda → Function Name
2. Configuration → Environment variables → Edit
3. Add:
   - **Key:** `INSTANCE_ID`
   - **Value:** `i-your-actual-instance-id`
4. Click "Save"

**Repeat for:**
- ✅ statusLambda
- ✅ simulateLambda
- ✅ analysisLambda

### Step 3: Update Lambda Code to Use Environment Variable

Ensure your Lambda functions read from environment variables:

**Python Example:**
```python
import os
import json

# Read instance ID from secure environment variable
INSTANCE_ID = os.environ.get('INSTANCE_ID')

def lambda_handler(event, context):
    # Parse incoming request
    body = json.loads(event.get('body', '{}'))
    incident_type = body.get('incidentType')
    
    # Use instance ID from backend (never from frontend)
    response = {
        'incidentId': generate_id(),
        'incidentType': incident_type,
        'instanceId': INSTANCE_ID,  # Secure: from backend
        'timestamp': get_timestamp(),
        'severity': determine_severity(incident_type)
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(response)
    }
```

### Step 4: Test Security

1. Start dev server: `npm run dev`
2. Open browser DevTools → Network tab
3. Click "Simulate Incident"
4. Inspect the `/simulate` request payload:

**✅ Should see:**
```json
{
  "incidentType": "CPU Spike"
}
```

**❌ Should NOT see:**
```json
{
  "incidentType": "CPU Spike",
  "instanceId": "i-xxxxx"  // ← This would be a security issue
}
```

5. Check Lambda response - it CAN include instance ID (for display only):

**✅ Backend response is safe:**
```json
{
  "incidentId": "ABC123",
  "instanceId": "i-xxxxx",  // ← OK: coming from secure backend
  "incidentType": "CPU Spike"
}
```

## 🛡️ Security Checklist

### Frontend Security
- [ ] No instance ID in `src/api/app.js`
- [ ] No AWS credentials in code
- [ ] `.env` file is in `.gitignore`
- [ ] Only API Gateway URL is configured
- [ ] No sensitive data in localStorage/sessionStorage

### Backend Security
- [ ] Instance ID in Lambda environment variables
- [ ] Each Lambda has the environment variable set
- [ ] Lambda execution role has minimal required permissions
- [ ] Lambda functions validate incoming requests
- [ ] Proper error handling (don't leak sensitive info)

### API Gateway Security
- [ ] CORS enabled with appropriate origins
- [ ] Rate limiting configured (recommended)
- [ ] CloudWatch logging enabled
- [ ] API keys or authentication enabled (for production)

### Infrastructure Security
- [ ] EC2 instance in private subnet (if applicable)
- [ ] Security groups properly configured
- [ ] IAM roles follow least privilege principle
- [ ] CloudTrail enabled for audit logging

## 🔍 Security Verification

### What Users CAN See
✅ API Gateway URL (safe to be public)  
✅ Frontend code (React components, UI logic)  
✅ API response data (instance ID in responses is OK for display)  
✅ Network requests in DevTools  

### What Users CANNOT Access
🔒 Backend Lambda code  
🔒 Lambda environment variables  
🔒 EC2 instance directly  
🔒 AWS credentials  
🔒 Ability to target different instances  

## ⚠️ Common Security Mistakes to Avoid

### ❌ DON'T DO THIS:
```javascript
// ❌ WRONG: Instance ID in frontend
const INSTANCE_ID = "i-0123456789abcdef0";
fetch('/simulate', {
  body: JSON.stringify({ 
    incidentType: type,
    instanceId: INSTANCE_ID  // ❌ Security risk!
  })
});
```

### ✅ DO THIS INSTEAD:
```javascript
// ✅ CORRECT: Only send incident type
fetch('/simulate', {
  body: JSON.stringify({ 
    incidentType: type
    // Instance ID handled by backend
  })
});
```

## 🚨 Incident Response

### If Instance ID Was Accidentally Exposed

1. **Immediate Actions:**
   - Remove instance ID from frontend code
   - Clear git history if committed
   - Rotate API Gateway endpoint (if compromised)
   - Review CloudTrail logs for suspicious access

2. **Update Security Groups:**
   - Ensure EC2 instance only accepts traffic from expected sources
   - Restrict SSH/RDP access to known IPs
   - Enable AWS GuardDuty for threat detection

3. **Add Additional Protections:**
   - Enable API Gateway authentication
   - Implement request validation in Lambda
   - Add rate limiting
   - Enable AWS WAF

## 📚 Additional Resources

- [AWS Lambda Security Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/lambda-security.html)
- [API Gateway Security Best Practices](https://docs.aws.amazon.com/apigateway/latest/developerguide/security-best-practices.html)
- [EC2 Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html)

## 🎯 Production Recommendations

Before going to production:

1. **Enable Authentication:**
   - AWS Cognito User Pools
   - API Keys with usage plans
   - IAM authentication

2. **Add Monitoring:**
   - CloudWatch alarms for unusual activity
   - SNS notifications for security events
   - X-Ray for distributed tracing

3. **Implement Rate Limiting:**
   - API Gateway usage plans
   - Lambda reserved concurrency
   - WAF rate-based rules

4. **Regular Security Audits:**
   - Review IAM permissions quarterly
   - Update dependencies regularly
   - Scan for vulnerabilities
   - Review CloudTrail logs

## ✅ Your Setup is Secure When:

- ✅ Frontend only knows the API Gateway URL
- ✅ Instance ID lives only in Lambda environment variables
- ✅ Browser DevTools shows no sensitive data in requests
- ✅ Lambda functions validate and sanitize inputs
- ✅ CloudWatch logs show expected behavior only
- ✅ Security groups restrict access appropriately
- ✅ All team members understand the security model

---

**Remember:** Frontend code is always visible. Never trust client-side validation. Always validate and authorize on the backend.
