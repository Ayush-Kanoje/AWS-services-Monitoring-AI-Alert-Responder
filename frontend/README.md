# Frontend — AI-Powered Cloud Incident Response Platform

React 18 + Vite + Tailwind CSS dashboard. Connects to the AWS backend via
`src/services/api.js` once the API Gateway endpoint is deployed.

## Stack

| Tool | Purpose |
|---|---|
| React 18 (Vite) | UI framework & build |
| Tailwind CSS | Styling |
| react-icons | Icon set |
| Recharts | Gauge charts on status cards |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build (static output → `dist/`, ready for S3):

```bash
npm run build
```

## Environment

Copy `.env.example` to `.env` and set `VITE_API_URL` to your API Gateway base URL.

```
VITE_API_URL=https://<api-id>.execute-api.<region>.amazonaws.com
```

## Project structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AIIncidentReport.jsx
│   │   ├── ArchitectureOverview.jsx
│   │   ├── ArchitecturePlaceholder.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── IncidentHistory.jsx
│   │   ├── LinuxIncidentPanel.jsx
│   │   ├── SimulationPanel.jsx
│   │   ├── StatusCards.jsx
│   │   └── ThemeToggle.jsx
│   ├── services/
│   │   └── api.js        ← API contract (placeholder until backend is live)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env.example
```

## Connecting the backend

1. Set `VITE_API_URL` in `.env`
2. Implement the three functions in `src/services/api.js`:
   - `simulateIncident({ incidentType, category })` → `POST /simulate`
   - `getIncidentHistory()` → `GET /history`
   - `getSystemHealth()` → `GET /health`
3. Wire returned data into `App.jsx` state — UI components already render
   real data when passed in as props.
