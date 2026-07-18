# API Documentation

Base URL: `https://<api-id>.execute-api.<region>.amazonaws.com`

All endpoints accept and return `application/json`.

---

## POST /simulate

Trigger an incident simulation and receive an AI-generated report.

### Request

```http
POST /simulate
Content-Type: application/json

{
  "incidentType": "cpu-spike",
  "category": "infrastructure"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `incidentType` | string | yes | Incident key: `cpu-spike`, `memory-spike`, `disk-spike`, `network-spike`, `nginx-down`, `app-crash`, `permission-denied`, `disk-warning` |
| `category` | string | yes | `infrastructure` or `linux-service` |

### Response `200 OK`

```json
{
  "incidentId": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
  "incidentType": "cpu-spike",
  "category": "infrastructure",
  "severity": "high",
  "status": "open",
  "timestamp": "2025-07-18T10:30:00.000Z",
  "report": {
    "rootCause": "Runaway process consuming 98% CPU on instance i-0abc123...",
    "businessImpact": "API response times degraded by 3x; checkout flow affected.",
    "severity": "High",
    "commands": "top -b -n1 | head -20\nkill -9 <pid>",
    "resolution": "Identify and terminate the runaway process; add CPU alarm in CloudWatch.",
    "automation": "Use Lambda + CloudWatch alarm to auto-terminate processes above 95% CPU for >5 min."
  }
}
```

### Error responses

| Status | Meaning |
|--------|---------|
| `400` | Missing `incidentType` or `category` |
| `500` | Lambda or AI service error |

---

## GET /history

Fetch all past incidents from DynamoDB, newest first.

### Request

```http
GET /history
```

### Response `200 OK`

```json
[
  {
    "incidentId": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
    "incidentType": "cpu-spike",
    "category": "infrastructure",
    "severity": "high",
    "status": "open",
    "timestamp": "2025-07-18T10:30:00.000Z"
  }
]
```

Returns an empty array `[]` when no records exist.

---

## GET /health

Fetch current infrastructure health metrics.

### Request

```http
GET /health
```

### Response `200 OK`

```json
{
  "cpu": 32,
  "memory": 48,
  "disk": 51,
  "status": "healthy",
  "timestamp": "2025-07-18T10:30:00.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `cpu` | number | CPU usage % (0–100) |
| `memory` | number | Memory usage % (0–100) |
| `disk` | number | Disk usage % (0–100) |
| `status` | string | `healthy` \| `degraded` \| `critical` |
| `timestamp` | string | ISO-8601 UTC timestamp |
