# Incident Response App - Security Documentation

## 🔒 Security-First Architecture

This application follows security best practices by keeping sensitive infrastructure details on the backend while exposing only necessary public endpoints.

## 📊 Secure Data Flow

```
┌───────────────────────────────────────────────────────────────┐
│  USER BROWSER (Public - Visible to Anyone)                    │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend React App                                          │
│  • API Gateway URL ✓                                         │
│  • Business logic (UI)                                       │
│  • NO instance IDs                                           │
│  • NO AWS credentials                                        │
│                                                               │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         │ HTTPS POST
                         │ { "incidentType": "CPU Spike" }
                         │ ✓ Only business data sent
                         │
                         ↓
┌───────────────────────────────────────────────────────────────┐
│  API GATEWAY (AWS - Public Endpoint)                         │
├───────────────────────────────────────────────────────────────┤
│  • Receives requests from frontend                           │
│  • CORS enabled for your domain                              │
│  • Rate limiting (optional)                                  │
│  • Routes to appropriate Lambda                              │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ↓
┌───────────────────────────────────────────────────────────────┐
│  LAMBDA FUNCTIONS (AWS - Private Backend)                    │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Environment Variables (Secure):                             │
│  • INSTANCE_ID = "i-0123456789abcdef0" ✓                     │
│  • AWS_REGION = "us-east-1"                                  │
│  • Other sensitive config                                    │
│                                                               │
│  Lambda Code:                                                │
│  1. Receives: { incidentType }                              │
│  2. Reads: INSTANCE_ID from env variable ✓                  │
│  3. Processes incident on correct instance                   │
│  4. Returns: Response with incident data                     │
│                                                               │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         │ Response
                         │ {
                         │   "incidentId": "ABC123",
                         │   "instanceId": "i-xxx" ← Safe for display
                         │   "incidentType": "CPU Spike"
                         │ }
                         │
                         ↓
┌───────────────────────────────────────────────────────────────┐
│  USER BROWSER                                                │
│  • Displays incident data                                    │
│  • Shows instance ID (for information only)                  │
│  • Cannot modify which instance is used                      │
└───────────────────────────────────────────────────────────────┘
```

## 🛡️ Security Principles

### 1. Separation of Concerns

**Frontend (Public)**
- Handles UI and user interactions
- Sends only business data (incident types)
- Has no control over infrastructure

**Backend (Private)**
- Controls infrastructure (which instance to use)
- Stores sensitive configuration
- Validates all requests
- Enforces security policies

### 2. Zero Trust Frontend

**Assumption:** Any data in frontend code can be seen and modified by attackers.

**Solution:** Never store or send sensitive data from frontend.

### 3. Backend Authority

**Principle:** Backend is the single source of truth for infrastructure decisions.

**Implementation:** Instance ID stored in Lambda environment variables.

## 🔐 What's Public vs Private

### ✅ Public (Safe to Expose)
- API Gateway URL
- Frontend source code
- UI components and logic
- Incident types (dropdown options)
- API response data (display purposes)

### 🔒 Private (Must Stay Secret)
- EC2 Instance ID
- AWS credentials
- Lambda execution roles
- Database connection strings
- API keys (if using authentication)
- Lambda function code

## 🚀 Quick Setup

### Frontend Configuration
```bash
# .env file
VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
# NO instance ID here!
```

### Backend Configuration (Per Lambda)
```
AWS Console → Lambda → Function → Configuration → Environment Variables

Key: INSTANCE_ID
Value: i-your-actual-instance-id
```

## 🧪 Security Testing

### Test 1: Frontend Request Inspection
```bash
1. npm run dev
2. Open browser DevTools
3. Go to Network tab
4. Click "Simulate Incident"
5. Inspect the /simulate request
```

**Expected (Secure):**
```json
POST /simulate
{
  "incidentType": "CPU Spike"
}
```

**Not Expected (Would be insecure):**
```json
POST /simulate
{
  "incidentType": "CPU Spike",
  "instanceId": "i-xxx"  // ❌ This should NOT be here
}
```

### Test 2: Source Code Inspection
```bash
1. Open browser
2. Right-click → View Page Source
3. Search for "instance" or "i-0"
```

**Expected:** No instance IDs found in source

### Test 3: Lambda Environment Variable
```bash
1. AWS Console → Lambda → Your Function
2. Configuration → Environment variables
3. Verify INSTANCE_ID is present
```

## 📚 File Structure

```
incident-response-app/
├── src/
│   ├── api/
│   │   └── app.js                    ← API config (NO instance ID)
│   ├── incident-response-dashboard.jsx  ← Main app
│   └── main.jsx
├── .env                              ← Your API URL (in .gitignore)
├── .env.example                      ← Template (no secrets)
├── .gitignore                        ← Ensures .env not committed
├── SECURITY_SETUP.md                 ← Detailed security guide
├── BEFORE_AFTER_SECURITY.md          ← Migration guide
└── README_SECURITY.md                ← This file
```

## ⚠️ Security Checklist

Before deploying to production:

- [ ] Instance ID removed from all frontend code
- [ ] Instance ID set in Lambda environment variables
- [ ] `.env` file in `.gitignore`
- [ ] No sensitive data in git history
- [ ] CORS properly configured (not just `*`)
- [ ] API Gateway authentication enabled (recommended)
- [ ] Rate limiting configured
- [ ] CloudWatch logging enabled
- [ ] Lambda execution role has minimal permissions
- [ ] Security groups properly configured
- [ ] Regular security audits scheduled

## 🆘 If Instance ID Was Exposed

If you accidentally committed instance ID to git:

1. **Immediate:**
   - Remove from all files
   - Commit the fix
   - Force push if needed (be careful!)

2. **Consider:**
   - Rotating the instance (create new one)
   - Reviewing access logs for suspicious activity
   - Enabling additional security measures

3. **Prevent:**
   - Use git hooks to prevent secrets in commits
   - Regular security training for team
   - Code review process

## 📖 Documentation

- **SECURITY_SETUP.md** - Step-by-step secure setup
- **BEFORE_AFTER_SECURITY.md** - Migration from insecure to secure
- **API_SETUP.md** - Technical API configuration details

## 🎯 Best Practices Summary

1. ✅ **DO:** Store instance ID in Lambda environment variables
2. ✅ **DO:** Only send business data from frontend
3. ✅ **DO:** Let backend control infrastructure decisions
4. ✅ **DO:** Use `.env` files for local configuration
5. ✅ **DO:** Keep `.env` in `.gitignore`

6. ❌ **DON'T:** Hardcode instance IDs in frontend
7. ❌ **DON'T:** Send infrastructure IDs from frontend
8. ❌ **DON'T:** Commit `.env` files to git
9. ❌ **DON'T:** Trust frontend for security decisions
10. ❌ **DON'T:** Expose AWS credentials anywhere

## 💡 Key Insight

> **Frontend code is always visible to users. Treat it as public.**
> **Backend code and environment variables are private. Keep secrets there.**

---

**Last Updated:** Security improvements implemented  
**Security Review:** Passed ✅  
**Next Review:** Before production deployment
