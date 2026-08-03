# 🏥 AI Health Monitoring System

> **Intelligent Cloud Infrastructure Monitoring with AI-Powered Incident Response**

A real-time cloud monitoring dashboard that automatically detects infrastructure incidents and provides AI-generated resolution steps to reduce Mean Time To Recovery (MTTR) from hours to minutes.

[![React](https://img.shields.io/badge/React-19.2.7-blue.svg)](https://reactjs.org/)
[![AWS](https://img.shields.io/badge/AWS-Serverless-orange.svg)](https://aws.amazon.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.3.3-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.1.1-646cff.svg)](https://vitejs.dev/)

**Built by:** Ayush

---

## 📖 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Current MVP State](#-current-mvp-state)
- [Future Upgradation](#-future-upgradation)
- [Architecture](#-architecture)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

AI Health Monitoring System is a **serverless cloud monitoring solution** that combines real-time infrastructure health tracking with AI-powered incident analysis. When issues occur in your AWS infrastructure, the system automatically detects them, analyzes the root cause using AI, and provides actionable resolution steps—all through a beautiful, responsive dashboard.

### Key Highlights

- ⚡ **Real-Time Monitoring** - 5-second refresh intervals for instant visibility
- 🤖 **AI-Powered Analysis** - Automated root cause identification and resolution steps
- 📧 **Instant Notifications** - Email alerts via AWS SNS when incidents occur
- 🎨 **Modern UI** - Beautiful, responsive dashboard with dark/light themes
- 🔒 **Security-First** - Production-ready AWS architecture with best practices
- 💰 **Cost-Effective** - Serverless architecture minimizes operational costs
- 📊 **Historical Tracking** - Complete incident history stored in DynamoDB

---

## 🎯 The Problem

### DevOps teams face critical challenges during infrastructure incidents:

**Traditional Incident Response Timeline:**
3:00 AM: CPU spike alert fires 🚨 3:05 AM: DevOps engineer wakes up, logs into AWS Console 😴 3:15 AM: Checks CloudWatch logs, identifies memory leak 🔎 3:30 AM: Googles solution, reads documentation 📖 3:45 AM: SSHs into server, runs diagnostic commands 💻 4:00 AM: Applies fix, monitors for stability ⚙️ 4:15 AM: Incident resolved ✅

Total downtime: 75 minutes Business impact: Lost revenue, frustrated customers, exhausted team



### Critical Pain Points

1. **Slow Detection** ⏰ - Manual monitoring or delayed alerts
2. **Time-Consuming Diagnosis** 🔍 - Reading logs, checking metrics, researching issues
3. **Inconsistent Response** 🎲 - Different engineers handle incidents differently
4. **Knowledge Gaps** 📚 - Junior engineers struggle without senior support
5. **High MTTR** 📉 - Average resolution takes 30-60+ minutes

---

## 💡 The Solution

### AI Health Monitoring System provides:

✅ **Automatic Detection** - Continuously monitors infrastructure health
✅ **AI-Powered Diagnosis** - Analyzes incidents instantly using OpenRouter AI
✅ **Actionable Resolutions** - Copy-paste ready commands with execution steps
✅ **Email Notifications** - Instant alerts via AWS SNS
✅ **Beautiful Dashboard** - Real-time visualization with dark/light themes
✅ **Security-First** - Production-ready AWS architecture
✅ **Historical Tracking** - All incidents stored in DynamoDB

### With Our System:
3:00 AM: CPU spike detected automatically ⚡ 3:00 AM: AI analyzes logs, identifies root cause 🤖 3:00 AM: Dashboard updates with resolution steps 📊 3:01 AM: Engineer receives email notification 📧 3:02 AM: Engineer opens dashboard, copies commands 📋 3:03 AM: Executes fix ⚙️ 3:05 AM: System healthy ✅

Total downtime: 5 minutes MTTR reduction: 93% 🚀



---

## 🚀 Current MVP State

### ✅ What's Working Now

This MVP demonstrates the core concept with a **pattern-based incident detection system**.

#### **How It Works (Current Implementation)**
┌─────────────────────────────────────────────────────────┐ │ 1. CloudWatch Logs Monitoring │ │ └─ Lambda polls logs every minute │ │ │ │ 2. Pattern Matching (Hardcoded Keywords) │ │ └─ Checks for predefined error patterns: │ │ • "network timeout" → Network Issue │ │ • "out of memory" → Memory Issue │ │ • "disk full" → Storage Issue │ │ • "cpu spike" → CPU Issue │ │ • "crash" → Service Crash │ │ │ │ 3. Incident Creation │ │ └─ When pattern matches: │ │ ├─ Create record in DynamoDB │ │ ├─ Send SNS email notification │ │ └─ Trigger AI analysis via OpenRouter │ │ │ │ 4. AI Analysis │ │ └─ OpenRouter API generates: │ │ ├─ Root cause identification │ │ ├─ Impact assessment │ │ ├─ Resolution steps with commands │ │ └─ Automation recommendations │ │ │ │ 5. Dashboard Display │ │ └─ React app polls and displays results │ └─────────────────────────────────────────────────────────┘



#### **Current Capabilities**

✅ **Real-Time Infrastructure Health Monitoring**
- Monitors 5 critical services (Application, ALB, EC2, Nginx, CloudWatch)
- Visual status indicators (🟢 Healthy, 🟡 Warning, 🔴 Critical)
- Auto-refreshes every 5 seconds

✅ **Pattern-Based Incident Detection**
- Detects 20+ predefined error patterns
- Covers: CPU, Memory, Disk, Network, Service crashes, HTTP errors
- Automatic incident creation and logging

✅ **AI-Powered Root Cause Analysis**
- OpenRouter API integration (GPT-3.5-turbo free tier)
- Structured analysis with root cause, impact, and confidence scoring
- Step-by-step resolution instructions with executable commands

✅ **Instant Email Notifications**
- AWS SNS integration for team alerts
- Rich text emails with incident details

✅ **Modern Dashboard Experience**
- Beautiful responsive UI (mobile-friendly)
- Dark/Light theme with persistence
- Expandable incident cards
- Command copy-to-clipboard functionality

#### **Detected Incident Types (MVP)**

| Category | Detected Issues |
|----------|----------------|
| **CPU** | High CPU usage, CPU spikes, CPU throttling |
| **Memory** | Out of memory, Memory leaks, Memory exceeded |
| **Disk** | Disk full, Low disk space, No space left |
| **Network** | Connection timeout, Connection refused, Network unreachable |
| **Services** | Nginx crash, Application crash, Service unavailable |
| **HTTP** | 500 errors, 502/503 errors, Gateway timeout |

### ⚠️ Current Limitations

**Understanding the MVP Constraints:**

1. **🔍 Keyword-Based Detection**
   - Uses predefined error patterns (hardcoded keywords)
   - Cannot detect novel or unexpected issues
   - Only recognizes exact phrase matches

2. **📝 Limited Error Classification**
   - Only recognizes predefined error types
   - New error types require code updates
   - May miss emerging issues not in pattern list

3. **🧠 No Semantic Analysis**
   - Simple string matching (case-insensitive)
   - Doesn't understand context or log semantics
   - Can't distinguish between different contexts

4. **📊 No Anomaly Detection**
   - Reactive detection based on explicit errors
   - Can't predict issues before they become critical
   - No early warning system for degrading performance

### ✅ What This MVP Proves

Despite limitations, this MVP successfully demonstrates:

- ✅ End-to-end serverless architecture works
- ✅ AI integration provides useful incident analysis
- ✅ Real-time monitoring is functional and responsive
- ✅ Notifications work reliably
- ✅ User experience is polished and professional
- ✅ Security follows AWS best practices
- ✅ Cost-effective serverless approach is viable

**This foundation validates the concept and provides a solid base for intelligent features.**

---

## 🔮 Future Upgradation

### Phase 2: Intelligent Log Analysis

**Transform from pattern-matching to true AI-powered detection:**

#### 🤖 **AI-Powered Log Classification**

Replace hardcoded patterns with semantic understanding:

```python
# Current (MVP) - Pattern Matching
if "out of memory" in log_message:
    create_incident("MEMORY_ISSUE")

# Future (Phase 2) - AI Classification
analysis = ai_model.classify_log(log_message, context)
if analysis.is_error and analysis.confidence > 0.85:
    create_incident(
        category=analysis.error_type,
        severity=analysis.severity,
        context=analysis.context
    )
Capabilities:

✨ Semantic understanding of log messages
✨ Automatic error vs. info/warning classification
✨ Context-aware pattern learning
✨ Novel error detection without predefined rules
✨ Multi-language and custom log format support
📊 Advanced Metrics Correlation
Go beyond single-log analysis:

📈 Multi-Metric Analysis - Correlate CPU, memory, disk, network simultaneously
🔮 Predictive Detection - Identify issues before they become critical
📉 Trend Analysis - Spot gradual performance degradation
🎯 Cascade Detection - Identify root cause vs. downstream effects
Example:


Traditional: "Error: Connection timeout" → Alert

Intelligent:
  Step 1: CPU usage trending up (70% → 85% over 10 min)
  Step 2: Memory pressure increasing
  Step 3: Swap usage started
  Step 4: Response time degrading
  Step 5: Connection timeouts appearing

  Root Cause: Resource exhaustion
  Prediction: System will crash in ~5 minutes
  Recommendation: Scale up or restart now (before user impact)
🧠 Machine Learning Integration
Learn from historical data:

🎓 Incident History Learning - Improve accuracy based on past resolutions
🎯 Infrastructure-Specific Patterns - Adapt to your unique environment
📊 Success Rate Tracking - Confidence scoring based on resolution outcomes
🔄 Feedback Loop - Engineers mark solutions as helpful/not helpful
Data Flow:


Incident → AI suggests fix → Engineer applies → Marks as "Helpful"
                                              ↓
                                    System learns this pattern
                                              ↓
                            Next similar incident gets higher confidence
🔍 Contextual Analysis
Understand the bigger picture:

📖 Temporal Context - Analyze logs before and after errors
🔗 Cross-Service Correlation - Track incident propagation
🎯 Root Cause Isolation - Distinguish cause from symptoms
🗺️ Dependency Mapping - Visualize service relationships
Example:


Context Analysis:
├─ 5 min before: Database query performance degrading
├─ 3 min before: Connection pool exhaustion warning
├─ 1 min before: API response time increased
└─ Error: "Service unavailable"

Root Cause: Database connection pool misconfigured
Primary Fix: Increase max_connections
Secondary: Optimize slow queries
Preventive: Set up connection pool monitoring
⚡ Real-Time Communication
Move beyond polling to instant updates:

🌐 WebSocket Integration - Push updates instantly to dashboard
📺 Live Log Streaming - Watch logs in real-time
⏱️ Interactive Timeline - Visualize incident progression
🔄 Live Fix Status - Track resolution application in real-time
User Experience:


Current: Poll every 7 seconds → Check for updates
Future:  WebSocket push → Instant notification → Live updates
🎯 Enhanced AI Models
Upgrade AI capabilities:

Aspect	Current MVP	Future Phase 2
Model	GPT-3.5-turbo (free)	GPT-4, Claude-3, or fine-tuned custom
Cost	$0 (rate limited)	Paid tier ($0.002/request estimated)
Context Window	4K tokens	128K+ tokens (entire log history)
Training	Generic	Fine-tuned on infrastructure logs
Response Time	3-5 seconds	<1 second (cached patterns)
Accuracy	70-80%	90-95%
Multi-Incident	Single incident	Cross-incident correlation
Phase 3: Enterprise Features
🏢 Multi-Tenancy & Teams
Multiple organizations with isolated data
Role-based access control (Admin, Engineer, Viewer)
Tenant-specific AI training and patterns
Custom branding per organization
👥 Collaboration Tools
Incident assignment and ownership
Comments, notes, and annotations
Resolution approval workflows
On-call scheduling and escalation
Team chat integration
📈 Advanced Analytics & Reporting
MTTR trending and benchmarking
Incident frequency analysis by service/time
Service reliability reports (SLO tracking)
Cost impact analysis per incident
Custom dashboards and widgets
Exportable reports (PDF, CSV)
🔄 Auto-Remediation
Automated fix execution with approval gates
Rollback on failure detection
Multi-step remediation workflows
Dry-run mode for testing
Complete audit trail
🌍 Multi-Region Support
Global infrastructure monitoring
Cross-region incident correlation
Geo-redundant deployment
Regional failover and disaster recovery
📱 Mobile Applications
Native iOS and Android apps
Push notifications for incidents
On-call management interface
Quick incident response from mobile
Offline mode with sync
🔗 Third-Party Integrations
Incident Management: PagerDuty, Opsgenie, VictorOps
Communication: Slack, Microsoft Teams, Discord
Ticketing: Jira, ServiceNow, Linear
Monitoring: Datadog, New Relic, Grafana
Cloud Platforms: Azure, GCP (in addition to AWS)
CI/CD: GitHub Actions, GitLab CI, Jenkins
🏗️ Architecture
High-Level System Architecture

┌──────────────────────────────────────────────────────────────┐
│                      USER BROWSER                            │
│                   (Public Internet)                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   React Dashboard (Vite + Tailwind + React 19)        │ │
│  │                                                        │ │
│  │  • Real-time health monitoring (5s refresh)           │ │
│  │  • Incident list with AI analysis                     │ │
│  │  • Dark/Light theme                                   │ │
│  │  • Command copy-to-clipboard                          │ │
│  │  • Responsive design                                  │ │
│  └─────────────────────────┬──────────────────────────────┘ │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              │ HTTPS REST API
                              │ (GET /status, GET /incidents)
                              ↓
┌──────────────────────────────────────────────────────────────┐
│               AWS API GATEWAY (HTTP API)                     │
│              Region: ap-south-1 (Mumbai)                     │
│                                                              │
│  Routes:                                                     │
│  • GET  /status    → StatusFunction                         │
│  • GET  /incidents → AnalysisFunction                       │
│  • POST /analysis  → AnalysisFunction (future)              │
│                                                              │
│  Features: CORS enabled, CloudWatch logging                 │
└─────────────────────────┬────────────────────────────────────┘
                          │
             ┌────────────┴────────────┐
             │                         │
             ↓                         ↓
┌─────────────────────┐    ┌──────────────────────────┐
│ Lambda: Status      │    │ Lambda: Analysis         │
│ Runtime: Python 3.11│    │ Runtime: Python 3.11     │
│ Memory: 128 MB      │    │ Memory: 256 MB           │
│ Timeout: 10s        │    │ Timeout: 30s             │
│                     │    │                          │
│ Returns:            │    │ Tasks:                   │
│ • Service health    │    │ • Poll CloudWatch logs   │
│   status array      │    │ • Pattern matching       │
│                     │    │ • Create incidents       │
│                     │    │ • Call OpenRouter AI     │
│                     │    │ • Store in DynamoDB      │
│                     │    │ • Send SNS alerts        │
└──────┬──────────────┘    └───────┬──────────────────┘
       │                           │
       ↓                           ↓
┌──────────┐              ┌─────────────────┐
│   EC2    │              │   CloudWatch    │
│ Instance │              │      Logs       │
│          │              │                 │
│ Monitors │              │  Log Groups:    │
│ 5 services│◄────────────┤  • /aws/ec2/app │
└──────────┘              │                 │
                          │  Pattern Check: │
                          │  • "error"      │
                          │  • "timeout"    │
                          │  • "crash"      │
                          └────────┬────────┘
                                   │
                                   ↓
                          ┌─────────────────┐
                          │    DynamoDB     │
                          │                 │
                          │  Tables:        │
                          │  • Incidents    │
                          │  • Analysis     │
                          └─────────────────┘
                                   │
                                   ↓
                          ┌─────────────────┐
                          │   SNS Topic     │
                          │                 │
                          │  Subscribers:   │
                          │  • Email alerts │
                          └─────────────────┘
                                   │
                                   ↓
                          ┌─────────────────┐
                          │  OpenRouter AI  │
                          │                 │
                          │  Model:         │
                          │  GPT-3.5-turbo  │
                          │  (Free tier)    │
                          └─────────────────┘
Data Flow
1. Incident Detection Flow

EC2 generates logs → CloudWatch captures → Lambda polls logs
                                              ↓
                                    Pattern matched?
                                              ↓
                                     Create incident
                                              ↓
                             Store in DynamoDB (status: analyzing)
                                              ↓
                                    Send SNS email alert
                                              ↓
                                    Call OpenRouter AI
                                              ↓
                                    Get analysis response
                                              ↓
                            Update DynamoDB (status: completed)
2. Dashboard Polling Flow

User opens dashboard → React mounts → Start polling

Poll /status (every 5s)          Poll /incidents (every 7s)
        ↓                                    ↓
   API Gateway                          API Gateway
        ↓                                    ↓
  Status Lambda                       Analysis Lambda
        ↓                                    ↓
 Check EC2 health                      Query DynamoDB
        ↓                                    ↓
Return service status              Return incidents with analysis
        ↓                                    ↓
  Update dashboard                    Display incident cards
AWS Resources
Service	Configuration	Purpose
EC2	t2.micro (1 vCPU, 1GB RAM)	Application hosting
Lambda (Status)	Python 3.11, 128MB, 10s	Health checks
Lambda (Analysis)	Python 3.11, 256MB, 30s	Incident detection & AI
API Gateway	HTTP API, CORS enabled	REST endpoints
DynamoDB	On-demand, 2 tables	Incident storage
CloudWatch	Log groups	Log aggregation
SNS	Email protocol	Notifications
IAM	Execution roles	Security
✨ Features
🖥️ Dashboard Features
Real-Time Monitoring

📊 5 service health cards with status indicators
🟢🟡🔴 Visual status (Healthy/Warning/Critical)
⚡ Auto-refresh every 5 seconds
🎨 Smooth animations and transitions
Incident Management

📋 List view of all detected incidents
🔽 Expandable cards for detailed analysis
🏷️ Status badges (Analyzing/Completed)
⏰ Human-readable timestamps
🎯 Severity indicators
AI Analysis Display

🎯 Root cause identification
💥 Impact assessment
📊 Confidence score badges
📝 Numbered resolution steps
💻 Command blocks with copy buttons
✅ Visual copy confirmation
🤖 Automation recommendations
User Experience

🌓 Dark/Light theme toggle
💾 Theme persistence across sessions
📱 Fully responsive (mobile-friendly)
🔔 Toast notifications
♿ Accessibility (ARIA, keyboard nav)
🎭 Reduced motion support
🔧 Backend Features
Incident Detection

👀 CloudWatch log monitoring
🔍 20+ predefined error patterns
📝 Automatic incident creation
⏱️ Timestamp tracking
AI Integration

🤖 OpenRouter API (GPT-3.5-turbo)
💬 Structured prompt engineering
📊 JSON response parsing
🔄 Error handling and retry logic
Data Persistence

💾 DynamoDB storage
📈 Historical incident tracking
🔍 Optimized queries
🔄 Real-time status updates
Notifications

📧 SNS email alerts
👥 Multiple subscribers
🎯 Rich email formatting
🛠️ Technology Stack
Frontend
Technology	Version	Purpose
React	19.2.7	UI framework
Vite	8.1.1	Build tool & dev server
Tailwind CSS	4.3.3	Utility-first styling
Lucide React	1.27.0	Icon library
Oxlint	1.71.0	Fast linter
Backend (AWS)
Service	Purpose
Lambda	Serverless compute
API Gateway	RESTful API
DynamoDB	NoSQL database
CloudWatch	Logging & metrics
SNS	Push notifications
EC2	Application hosting
IAM	Security & permissions
AI Integration
Service	Model	Status
OpenRouter	GPT-3.5-turbo	Free tier (MVP)
Future	GPT-4, Claude	Planned upgrade
📸 Screenshots
Add your screenshots here

Dashboard - Light Theme

Dashboard - Dark Theme
External image blocked for security
/docs/screenshots/dashboard-dark.png
Show this image
Incident Analysis View
External image blocked for security
/docs/screenshots/incident-analysis.png
Show this image
Infrastructure Health Monitoring
External image blocked for security
/docs/screenshots/health-monitoring.png
Show this image
Mobile Responsive View
External image blocked for security
/docs/screenshots/mobile-view.png
Show this image
🚀 Quick Start
Prerequisites
Node.js 18+ and npm
AWS Account
Git
Frontend Setup (5 minutes)
bash

# 1. Clone repository
git clone https://github.com/yourusername/ai-health-monitoring.git
cd ai-health-monitoring

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your API Gateway URL

# 4. Start development server
npm run dev

# 5. Open browser
# Visit http://localhost:5173
