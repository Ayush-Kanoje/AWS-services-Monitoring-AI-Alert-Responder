import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Activity,
  Server,
  Gauge,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Send,
  Network,
  Database,
  Radio,
  Bot,
  Wrench,
  Zap,
  ChevronRight,
  Sun,
  Moon,
  X,
  Info,
  CheckCheck,
  AlertTriangle,
  MousePointerClick,
  Terminal,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";

// Import API configuration
import { API, handleApiResponse } from "./api/app";

/* ------------------------------------------------------------------ */
/*  Live API service layer                                            */
/*  These functions call the real backend via API Gateway.            */
/*  SECURITY NOTE: Instance ID is handled by backend Lambda functions */
/*  and never exposed to the frontend for security reasons.           */
/* ------------------------------------------------------------------ */


// The dropdown just needs the list of type names — the real diagnostic
// content (rootCause, resolution, severity, etc.) now comes from the
// backend via fetchAnalysis / simulateIncident, not from local mock data.
const INCIDENT_TYPES = [
  "CPU Spike",
  "Disk Full",
  "Nginx Crash",
  "HTTP 500 Errors",
  "Suspicious Login Attempts",
];

// JSON responses can't carry React components, so services are matched
// to an icon by their id on the frontend instead of trusting an "icon"
// field from the API.
const SERVICE_ICONS = {
  app: Activity,
  alb: Network,
  ec2: Server,
  nginx: Gauge,
  cw: Radio,
};

// 1. Fetch Real Infrastructure Status
async function fetchInfraStatus(signal) {
  const response = await fetch(API.status, { signal });
  const data = await handleApiResponse(response);
  // Guard against the backend wrapping the array in an object (e.g. { services: [...] })
  // or returning something unexpected — downstream code assumes an array.
  return Array.isArray(data) ? data : (data.services ?? []);
}

// 2. Trigger the Real Incident on EC2
async function simulateIncident(type) {
  const response = await fetch(API.simulate, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // SECURITY: instanceId is handled by backend Lambda from environment variables
    body: JSON.stringify({ incidentType: type }),
  });
  const data = await handleApiResponse(response);
  // Normalize the response so the rest of the app can rely on a Date
  // object for timestamp and sensible fallbacks for missing fields.
  return {
    id: data.incidentId || data.id || `INC-${Date.now().toString().slice(-6)}`,
    type: data.incidentType || data.type || type,
    server: data.instanceId || data.server || "EC2 Instance",
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    severity: data.severity || "Unknown",
    metric: data.metric || "",
  };
}

// 3. Fetch Real AI Diagnosis
async function fetchAnalysis(incidentId) {
  const response = await fetch(API.analysis, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId }),
  });
  const data = await handleApiResponse(response);
  
  // Handle nested analysis object if present
  const analysisData = data.analysis || data;
  
  // Normalize resolution steps: accept either plain strings or
  // { text, command } objects from the backend so CommandBlock never
  // receives an unexpected shape.
  const resolution = Array.isArray(analysisData.resolution)
    ? analysisData.resolution.map((step) =>
        typeof step === "string" ? { text: step } : { text: step.text || step.step || "", command: step.command }
      )
    : [];
    
  return {
    rootCause: analysisData.rootCause || "",
    impact: analysisData.impact || "",
    resolution,
    automation: analysisData.automation || "",
    confidence: analysisData.confidence || "Medium",
  };
}

/* ------------------------------------------------------------------ */
/*  Theme tokens                                                       */
/* ------------------------------------------------------------------ */

const TOKENS = {
  light: {
    page: "bg-slate-50",
    header: "bg-white/90 border-slate-200",
    card: "bg-white border-slate-200",
    cardHover: "hover:shadow-md hover:-translate-y-0.5",
    text: "text-slate-900",
    subtext: "text-slate-500",
    muted: "text-slate-400",
    divider: "border-slate-100",
    inputBg: "bg-white border-slate-200 text-slate-700 focus:ring-slate-200 focus:border-slate-400",
    skeleton: "bg-slate-100",
    chip: "bg-slate-100 text-slate-500",
    btnPrimary: "bg-slate-900 text-white hover:bg-slate-700",
    btnGhost: "border border-slate-200 text-slate-500 hover:bg-slate-100",
    rowBorder: "border-slate-50",
    tableHead: "border-slate-100 text-slate-400",
    stepDone: "text-emerald-500",
    stepPending: "border-slate-200",
    stepText: "text-slate-700",
    stepTextIdle: "text-slate-300",
    focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
  },
  dark: {
    page: "bg-slate-950",
    header: "bg-slate-950/90 border-slate-800",
    card: "bg-slate-900 border-slate-800",
    cardHover: "hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5",
    text: "text-slate-100",
    subtext: "text-slate-400",
    muted: "text-slate-500",
    divider: "border-slate-800",
    inputBg: "bg-slate-800 border-slate-700 text-slate-200 focus:ring-slate-700 focus:border-slate-500",
    skeleton: "bg-slate-800",
    chip: "bg-slate-800 text-slate-400",
    btnPrimary: "bg-slate-100 text-slate-900 hover:bg-white",
    btnGhost: "border border-slate-700 text-slate-400 hover:bg-slate-800",
    rowBorder: "border-slate-800/60",
    tableHead: "border-slate-800 text-slate-500",
    stepDone: "text-emerald-400",
    stepPending: "border-slate-700",
    stepText: "text-slate-200",
    stepTextIdle: "text-slate-600",
    focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
  },
};

function statusClasses(theme, kind) {
  const map = {
    light: {
      healthy: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      warning: "bg-amber-50 text-amber-700 ring-amber-200",
      critical: "bg-red-50 text-red-700 ring-red-200",
      processing: "bg-amber-50 text-amber-700 ring-amber-200",
      resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      neutral: "bg-slate-50 text-slate-500 ring-slate-200",
    },
    dark: {
      healthy: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
      critical: "bg-red-500/10 text-red-400 ring-red-500/30",
      processing: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
      resolved: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
      neutral: "bg-slate-800 text-slate-400 ring-slate-700",
    },
  };
  return map[theme][kind];
}

function dotClass(kind) {
  if (kind === "healthy" || kind === "resolved") return "bg-emerald-500";
  if (kind === "warning" || kind === "processing") return "bg-amber-500";
  if (kind === "critical") return "bg-red-500";
  return "bg-slate-400";
}

const CONFIDENCE_STYLES = {
  light: {
    High: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Medium: "bg-amber-50 text-amber-700 ring-amber-200",
    Low: "bg-red-50 text-red-700 ring-red-200",
  },
  dark: {
    High: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
    Medium: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
    Low: "bg-red-500/10 text-red-400 ring-red-500/30",
  },
};

/* ------------------------------------------------------------------ */
/*  Shared presentational pieces                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status, theme, label }) {
  const isActive = status === "warning" || status === "critical" || status === "processing";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition-colors duration-300 ${statusClasses(theme, status)}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass(status)} ${isActive ? "animate-pulse" : ""}`} />
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SectionHeading({ eyebrow, title, theme, children }) {
  const T = TOKENS[theme];
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        {eyebrow && (
          <p className={`mb-1 font-mono text-xs uppercase tracking-wider ${T.muted}`}>
            {eyebrow}
          </p>
        )}
        <h2 className={`text-lg font-semibold ${T.text}`}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Card({ theme, className = "", hoverable = false, children }) {
  const T = TOKENS[theme];
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-all duration-300 ${T.card} ${
        hoverable ? `${T.cardHover} duration-200` : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

function Reveal({ children, delay = 0 }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 10 + delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);
  return (
    <div
      className={`transition-all duration-500 ease-out ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {children}
    </div>
  );
}

function CommandBlock({ command, theme }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch (e) {
      // clipboard API unavailable — fail silently, button still gives feedback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [command]);

  return (
    <div
      className={`mt-2 flex items-center justify-between gap-3 rounded-lg px-3 py-2 font-mono text-xs ${
        theme === "dark" ? "bg-black/40 text-emerald-300" : "bg-slate-900 text-emerald-300"
      }`}
    >
      <code className="overflow-x-auto whitespace-pre">{command}</code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy command"
        className="flex-shrink-0 rounded p-1 text-slate-400 transition-colors duration-150 hover:text-white active:scale-90"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toast notification system                                          */
/* ------------------------------------------------------------------ */

const TOAST_ICONS = { info: Info, success: CheckCheck, warning: AlertTriangle };
const TOAST_COLORS = {
  light: {
    info: "border-slate-200 text-slate-700",
    success: "border-emerald-200 text-emerald-700",
    warning: "border-amber-200 text-amber-700",
  },
  dark: {
    info: "border-slate-700 text-slate-200",
    success: "border-emerald-500/30 text-emerald-400",
    warning: "border-amber-500/30 text-amber-400",
  },
};
const TOAST_ICON_COLOR = {
  info: "text-slate-400",
  success: "text-emerald-500",
  warning: "text-amber-500",
};

function Toast({ toast, onDismiss, theme }) {
  const [show, setShow] = useState(false);
  const Icon = TOAST_ICONS[toast.type] || Info;

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 10);
    const dismissTimer = setTimeout(() => handleDismiss(), 4500);
    return () => {
      clearTimeout(t);
      clearTimeout(dismissTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setTimeout(() => onDismiss(toast.id), 250);
  };

  const T = TOKENS[theme];

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-80 max-w-[90vw] items-start gap-3 rounded-lg border ${T.card} px-4 py-3 shadow-lg transition-all duration-300 ease-out ${
        show ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
      } ${TOAST_COLORS[theme][toast.type]}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${TOAST_ICON_COLOR[toast.type]}`} />
      <p className={`flex-1 text-sm ${T.text}`}>{toast.message}</p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className={`flex-shrink-0 rounded p-0.5 transition-colors ${T.muted} hover:${T.text}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ToastStack({ toasts, onDismiss, theme }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} theme={theme} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header / Nav                                                       */
/* ------------------------------------------------------------------ */

function Header({ theme, onToggleTheme }) {
  const T = TOKENS[theme];
  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur transition-colors duration-300 ${T.header}`}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${theme === "dark" ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-white"}`}>
            <Bot className="h-4 w-4" />
          </div>
          <span className={`text-sm font-semibold tracking-tight ${T.text}`}>
            Incident Response
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`hidden items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs sm:inline-flex ${T.chip}`}
          >
            Built by <span className="font-semibold">Ayush</span>
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] sm:hidden ${T.chip}`}
          >
            by Ayush
          </span>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${T.btnGhost} ${T.focusRing}`}
          >
            <span className={`inline-flex transition-transform duration-300 ${theme === "dark" ? "rotate-180" : "rotate-0"}`}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 1 — Hero / Introduction                                    */
/* ------------------------------------------------------------------ */

function HeroSection({ theme }) {
  const T = TOKENS[theme];
  return (
    <div className={`border-b transition-colors duration-300 ${T.card} ${T.divider}`}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-xs ${T.chip}`}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          incident-response-platform - production
        </div>
        <h1 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${T.text}`}>
          AI-Powered Cloud Incident Response Platform
        </h1>
        <p className={`mt-3 max-w-2xl text-sm leading-relaxed ${T.subtext}`}>
          This project demonstrates an AI-assisted Cloud Incident Response
          workflow. The dashboard monitors real AWS infrastructure in real
          time. When an incident is generated, it is processed through a real
          backend pipeline where AI analyzes the event, identifies the most
          likely root cause, recommends remediation steps, stores the
          incident, and supports automated incident response.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Guided Incident Workflow (signature 4-step diagram)                 */
/* ------------------------------------------------------------------ */

const WORKFLOW_STEPS = [
  {
    label: "Step 1: User",
    title: "Clicks \"Simulate Incident\"",
    detail: "You trigger a scenario (e.g. High CPU) from the dashboard.",
    icon: MousePointerClick,
  },
  {
    label: "Step 2: System",
    title: "EC2 experiences fault",
    detail: "Backend runs a controlled fault on the real EC2 instance.",
    icon: Server,
  },
  {
    label: "Step 3: AI",
    title: "Diagnoses root cause",
    detail: "AI reads CloudWatch metrics and outputs CLI remediation steps.",
    icon: Bot,
  },
  {
    label: "Step 4: User",
    title: "Follows guide & fixes",
    detail: "You run the commands yourself and resolve the issue manually.",
    icon: Wrench,
  },
];

function GuidedWorkflow({ theme }) {
  const T = TOKENS[theme];
  return (
    <section>
      <SectionHeading eyebrow="How It Works" title="The Guided Incident Workflow" theme={theme} />
      <Card theme={theme}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
          {WORKFLOW_STEPS.flatMap((step, i) => {
            const box = (
              <div
                key={`box-${step.label}`}
                className={`flex flex-1 flex-col gap-1.5 rounded-lg border px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 ${T.divider} ${
                  theme === "dark" ? "bg-slate-800/50" : "bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <step.icon className={`h-4 w-4 flex-shrink-0 ${T.muted}`} />
                  <span className={`font-mono text-[10px] uppercase tracking-wider ${T.muted}`}>
                    {step.label}
                  </span>
                </div>
                <p className={`text-sm font-medium ${T.text}`}>{step.title}</p>
                <p className={`text-xs leading-relaxed ${T.subtext}`}>{step.detail}</p>
              </div>
            );
            if (i === WORKFLOW_STEPS.length - 1) return [box];
            return [
              box,
              <div key={`arrow-${step.label}`} className="flex items-center justify-center">
                <ArrowRight className={`h-4 w-4 flex-shrink-0 rotate-90 lg:rotate-0 ${T.muted}`} />
              </div>,
            ];
          })}
        </div>
      </Card>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 2 — Infrastructure Health                                   */
/* ------------------------------------------------------------------ */

function InfrastructureHealth({ services, loading, theme }) {
  const T = TOKENS[theme];
  return (
    <section>
      <SectionHeading eyebrow="Live - AWS Monitoring" title="Infrastructure Health" theme={theme} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} theme={theme} className={`h-[110px] animate-pulse ${T.skeleton}`} />
            ))
          : services.map((svc) => {
              const Icon = SERVICE_ICONS[svc.id] || Activity;
              return (
                <Card key={svc.id} theme={theme} hoverable>
                  <div className="mb-3 flex items-center justify-between">
                    <Icon className={`h-4 w-4 ${T.muted}`} />
                    <StatusBadge status={svc.status} theme={theme} />
                  </div>
                  <p className={`text-sm font-medium ${T.text}`}>{svc.name}</p>
                  <p className={`mt-1 font-mono text-xs ${T.muted}`}>{svc.detail}</p>
                </Card>
              );
            })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3 — Incident Simulation                                     */
/* ------------------------------------------------------------------ */

function IncidentSimulation({ selected, onSelect, onSimulate, disabled, blockedByActive, theme }) {
  const T = TOKENS[theme];
  return (
    <section>
      <SectionHeading eyebrow="Manual Trigger" title="Incident Simulation" theme={theme} />
      <Card theme={theme}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            aria-label="Incident type"
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
            disabled={disabled}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 ${T.inputBg}`}
          >
            {INCIDENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onSimulate}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${T.btnPrimary} ${T.focusRing}`}
          >
            {disabled && !blockedByActive ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Simulate Incident
          </button>
        </div>
        {blockedByActive && (
          <p className={`mt-2.5 text-xs ${T.subtext}`}>
            Resolve the current incident before simulating a new one.
          </p>
        )}
      </Card>

      <Card theme={theme} className={`mt-3 ${theme === "dark" ? "bg-slate-900/60" : "bg-slate-50"}`}>
        <p className={`mb-2 text-xs font-medium uppercase tracking-wide ${T.subtext}`}>
          How Simulation Works
        </p>
        <ul className={`space-y-1.5 text-sm ${T.subtext}`}>
          <li>- Only the incident generation is simulated.</li>
          <li>- The simulated incident is sent to the real backend.</li>
          <li>- AWS services process the incident.</li>
          <li>- AI analyzes the incident.</li>
          <li>- Results appear below.</li>
        </ul>
      </Card>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4 — Simulation Progress + pipeline (signature element)      */
/* ------------------------------------------------------------------ */

const PROGRESS_STEPS = [
  { key: "generated", label: "Incident Generated" },
  { key: "sent", label: "Sending request to backend" },
  { key: "processing", label: "Processing incident" },
  { key: "ai", label: "Waiting for AI response" },
  { key: "done", label: "Incident Analysis Completed" },
];

const PIPELINE_STAGES = [
  { key: "gateway", label: "API Gateway", icon: Network },
  { key: "lambda", label: "Lambda", icon: Server },
  { key: "cloudwatch", label: "CloudWatch", icon: Radio },
  { key: "ai", label: "OpenRouter", icon: Bot },
  { key: "db", label: "DynamoDB", icon: Database },
  { key: "sns", label: "SNS", icon: Send },
];

const STAGE_FOR_STEP = [-1, 0, 1, 3, 5];

function PipelineFlow({ activeStage, theme }) {
  return (
    <div className="flex items-center overflow-x-auto py-1">
      {PIPELINE_STAGES.map((stage, i) => {
        const state =
          activeStage < 0 ? "idle" : i < activeStage ? "done" : i === activeStage ? "active" : "idle";
        const activeCls =
          theme === "dark" ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-white";
        const doneCls =
          theme === "dark" ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700";
        const idleCls = theme === "dark" ? "bg-slate-800 text-slate-500" : "bg-slate-50 text-slate-400";
        return (
          <div key={stage.key} className="flex items-center">
            <div
              className={`flex flex-col items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-300 ${
                state === "active" ? activeCls : state === "done" ? doneCls : idleCls
              }`}
            >
              <stage.icon className={`h-4 w-4 ${state === "active" ? "animate-pulse" : ""}`} />
              <span className="whitespace-nowrap font-mono text-[10px]">{stage.label}</span>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <ChevronRight
                className={`mx-1 h-4 w-4 flex-shrink-0 transition-colors duration-300 ${
                  i < activeStage ? "text-emerald-400" : theme === "dark" ? "text-slate-700" : "text-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SimulationProgress({ stepIndex, theme }) {
  if (stepIndex === null) return null;
  const T = TOKENS[theme];
  const activeStage = STAGE_FOR_STEP[Math.min(stepIndex, 3)] ?? -1;
  const pipelineStage = stepIndex >= 4 ? PIPELINE_STAGES.length : activeStage;

  return (
    <Reveal>
      <section>
        <SectionHeading eyebrow="Real Backend Pipeline" title="Simulation Progress" theme={theme} />
        <Card theme={theme}>
          <div className="mb-5 space-y-2.5">
            {PROGRESS_STEPS.map((step, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div key={step.key} className="flex items-center gap-2.5 text-sm transition-colors duration-300">
                  {done ? (
                    <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${T.stepDone}`} />
                  ) : active ? (
                    <Loader2 className={`h-4 w-4 flex-shrink-0 animate-spin ${T.subtext}`} />
                  ) : (
                    <span className={`h-4 w-4 flex-shrink-0 rounded-full border ${T.stepPending}`} />
                  )}
                  <span className={done || active ? T.stepText : T.stepTextIdle}>{step.label}</span>
                </div>
              );
            })}
          </div>
          <div className={`border-t pt-4 ${T.divider}`}>
            <p className={`mb-2 font-mono text-[11px] uppercase tracking-wider ${T.muted}`}>
              Backend request path
            </p>
            <PipelineFlow activeStage={pipelineStage} theme={theme} />
          </div>
        </Card>
      </section>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 5 — Incident Summary                                        */
/* ------------------------------------------------------------------ */

function Field({ label, value, mono, theme }) {
  const T = TOKENS[theme];
  return (
    <div>
      <p className={`mb-1 text-xs ${T.muted}`}>{label}</p>
      <p className={`text-sm ${mono ? "font-mono" : "font-medium"} ${T.text}`}>{value}</p>
    </div>
  );
}

function IncidentSummary({ incident, onResolve, theme }) {
  if (!incident) return null;
  const T = TOKENS[theme];
  const canResolve = incident.status === "processing" && incident.analysis;

  return (
    <Reveal>
      <section>
        <SectionHeading eyebrow="Active Incident" title="Incident Summary" theme={theme} />
        <Card theme={theme}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Field label="Timestamp" value={incident.timestamp.toLocaleTimeString()} mono theme={theme} />
            <Field label="Server" value={incident.server} mono theme={theme} />
            <Field label="Incident Type" value={incident.type} theme={theme} />
            <Field label="Severity" value={incident.severity} theme={theme} />
            <div>
              <p className={`mb-1 text-xs ${T.muted}`}>Status</p>
              <StatusBadge
                status={incident.status}
                theme={theme}
                label={incident.status === "resolved" ? "Resolved" : "Processing"}
              />
            </div>
          </div>

          {canResolve && (
            <div className={`mt-5 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between ${T.divider}`}>
              <p className={`text-xs ${T.subtext}`}>
                Review the AI report below, then confirm the incident is handled.
              </p>
              <button
                type="button"
                onClick={() => onResolve(incident.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${T.btnPrimary} ${T.focusRing}`}
              >
                <CheckCheck className="h-4 w-4" />
                Mark Issue Resolved
              </button>
            </div>
          )}
        </Card>
      </section>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 6 — AI Incident Analysis                                     */
/* ------------------------------------------------------------------ */

function AnalysisCard({ title, icon: Icon, children, theme, delay = 0 }) {
  const T = TOKENS[theme];
  return (
    <Reveal delay={delay}>
      <div
        className={`rounded-lg border p-4 transition-all duration-300 ${T.card} ${
          theme === "dark" ? "hover:border-slate-700" : "hover:border-slate-300"
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          <Icon className={`h-4 w-4 ${T.muted}`} />
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${T.muted}`}>{title}</h3>
        </div>
        {children}
      </div>
    </Reveal>
  );
}

function ResolutionStepCard({ step, index, theme }) {
  const T = TOKENS[theme];
  return (
    <Reveal delay={index * 50}>
      <div
        className={`rounded-lg border p-4 transition-all duration-300 ${T.card} ${
          theme === "dark" ? "hover:border-slate-700" : "hover:border-slate-300"
        }`}
      >
        <div className="mb-2 flex items-start gap-3">
          <div
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
              theme === "dark" ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1">
            <h4 className={`text-sm font-medium ${T.text}`}>Step {index + 1}</h4>
            <p className={`mt-1 text-sm leading-relaxed ${T.subtext}`}>{step.text}</p>
          </div>
        </div>
        {step.command && (
          <div className="mt-3">
            <p className={`mb-1.5 font-mono text-xs ${T.muted}`}>Linux/AWS Command</p>
            <CommandBlock command={step.command} theme={theme} />
          </div>
        )}
      </div>
    </Reveal>
  );
}

function AIIncidentAnalysis({ analysis, loading, error, incident, theme }) {
  const T = TOKENS[theme];

  // Show loading state while waiting for the API
  if (loading) {
    return (
      <Reveal>
        <section>
          <SectionHeading eyebrow="AI-Generated Report" title="AI Incident Analysis" theme={theme} />
          <Card theme={theme}>
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className={`mb-4 h-8 w-8 animate-spin ${T.muted}`} />
              <p className={`text-sm ${T.subtext}`}>Analyzing incident data...</p>
              <p className={`mt-1 font-mono text-xs ${T.muted}`}>
                AI is processing CloudWatch metrics and generating recommendations
              </p>
            </div>
          </Card>
        </section>
      </Reveal>
    );
  }

  // Show error state if the API fails
  if (error) {
    return (
      <Reveal>
        <section>
          <SectionHeading eyebrow="AI-Generated Report" title="AI Incident Analysis" theme={theme} />
          <Card theme={theme}>
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                  theme === "dark" ? "bg-red-500/10" : "bg-red-50"
                }`}
              >
                <AlertTriangle className={`h-6 w-6 ${theme === "dark" ? "text-red-400" : "text-red-600"}`} />
              </div>
              <p className={`text-sm font-medium ${T.text}`}>Analysis Failed</p>
              <p className={`mt-1 text-center text-xs ${T.subtext}`}>{error}</p>
            </div>
          </Card>
        </section>
      </Reveal>
    );
  }

  // Don't render if there's no analysis data
  if (!analysis) return null;

  return (
    <Reveal>
      <section>
        <SectionHeading eyebrow="AI-Generated Report" title="AI Incident Analysis" theme={theme} />

        {/* Header Card */}
        <Card theme={theme} className="mb-4">
          <div className={`border-b pb-4 ${T.divider}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Bot className={`h-5 w-5 ${T.muted}`} />
                <h2 className={`text-lg font-semibold ${T.text}`}>AI INCIDENT ANALYSIS</h2>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className={`mb-1 text-xs ${T.muted}`}>Incident ID</p>
              <p className={`font-mono text-sm font-medium ${T.text}`}>{incident?.id || "N/A"}</p>
            </div>
            <div>
              <p className={`mb-1 text-xs ${T.muted}`}>Status</p>
              <StatusBadge status="resolved" theme={theme} label="Completed" />
            </div>
            <div>
              <p className={`mb-1 text-xs ${T.muted}`}>Confidence</p>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                  CONFIDENCE_STYLES[theme][analysis.confidence] || CONFIDENCE_STYLES[theme].Medium
                }`}
              >
                {analysis.confidence}
              </span>
            </div>
          </div>
        </Card>

        {/* Root Cause Card */}
        <div className="mb-4">
          <AnalysisCard title="Root Cause" icon={AlertTriangle} theme={theme} delay={50}>
            <p className={`text-sm leading-relaxed ${T.text}`}>{analysis.rootCause}</p>
          </AnalysisCard>
        </div>

        {/* Impact Card */}
        <div className="mb-4">
          <AnalysisCard title="Impact" icon={ShieldAlert} theme={theme} delay={100}>
            <p className={`text-sm leading-relaxed ${T.text}`}>{analysis.impact}</p>
          </AnalysisCard>
        </div>

        {/* Resolution Steps */}
        <div className="mb-4">
          <Reveal delay={150}>
            <h3 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${T.muted}`}>
              Resolution Steps
            </h3>
          </Reveal>
          <div className="space-y-3">
            {analysis.resolution.map((step, i) => (
              <ResolutionStepCard key={i} step={step} index={i} theme={theme} />
            ))}
          </div>
        </div>

        {/* Automation Recommendation Card */}
        <div>
          <AnalysisCard title="Automation Recommendation" icon={Bot} theme={theme} delay={200}>
            <p className={`text-sm leading-relaxed ${T.text}`}>{analysis.automation}</p>
          </AnalysisCard>
        </div>

        {/* Footer Note */}
        <Reveal delay={250}>
          <div
            className={`mt-4 rounded-lg border p-3 ${T.card} ${
              theme === "dark" ? "bg-slate-900/60" : "bg-slate-50"
            }`}
          >
            <p className={`flex items-start gap-2 text-xs ${T.subtext}`}>
              <Terminal className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              Commands are provided for manual execution. Connect via SSH or Session Manager and run
              each step to resolve the incident.
            </p>
          </div>
        </Reveal>
      </section>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 7 — Recent Incident History                                  */
/* ------------------------------------------------------------------ */

function IncidentHistory({ history, theme }) {
  const T = TOKENS[theme];
  return (
    <section>
      <SectionHeading eyebrow="Stored in DynamoDB" title="Recent Incident History" theme={theme} />
      <Card theme={theme} className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className={`border-b text-left text-xs uppercase tracking-wide ${T.tableHead}`}>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Incident</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={3} className={`px-5 py-6 text-center ${T.muted}`}>
                    No incidents recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className={`border-b last:border-0 transition-colors duration-300 ${T.rowBorder}`}>
                    <td className={`px-5 py-3 font-mono text-xs ${T.muted}`}>
                      {h.timestamp.toLocaleTimeString()}
                    </td>
                    <td className={`px-5 py-3 ${T.text}`}>{h.type}</td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={h.status}
                        theme={theme}
                        label={h.status === "resolved" ? "Resolved" : "Processing"}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer({ theme }) {
  const T = TOKENS[theme];
  return (
    <footer className={`border-t py-8 transition-colors duration-300 ${T.divider}`}>
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className={`font-mono text-xs ${T.muted}`}>
          React - API Gateway - Lambda - CloudWatch - OpenRouter - DynamoDB - SNS
        </p>
        <p className={`text-xs ${T.muted}`}>Built by Ayush</p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                 */
/* ------------------------------------------------------------------ */

let toastCounter = 0;

function App() {
  const [theme, setTheme] = useState("light");
  const [services, setServices] = useState([]);
  const [loadingInfra, setLoadingInfra] = useState(true);
  const [selectedType, setSelectedType] = useState(INCIDENT_TYPES[0]);
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const timers = useRef([]);
  const infraWarned = useRef(false);

  const addToast = useCallback((type, message) => {
    toastCounter += 1;
    const id = `t-${Date.now()}-${toastCounter}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load persisted theme
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("theme");
        if (res && (res.value === "dark" || res.value === "light")) {
          setTheme(res.value);
        }
      } catch (e) {
        // no theme stored yet - keep default "light"
      }
    })();
  }, []);

  const toggleTheme = useCallback(async () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      window.storage.set("theme", next).catch(() => {});
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Tracks whether the previous poll failed, so toasts only fire on
    // healthy→failing and failing→recovered transitions, not on every
    // single 5-second poll while the backend stays down.
    let wasFailing = false;
    let currentController = null;

    const checkHealth = (isInitial) => {
      // Abort any in-flight request before starting a new one
      if (currentController) currentController.abort();
      currentController = new AbortController();
      const { signal } = currentController;

      fetchInfraStatus(signal)
        .then((data) => {
          if (cancelled) return;
          setServices(data);
          if (wasFailing) {
            wasFailing = false;
            addToast("success", "Infrastructure status connection restored.");
          }
          if (isInitial) {
            setLoadingInfra(false);
            if (!infraWarned.current) {
              const degraded = data.find((s) => s.status !== "healthy");
              if (degraded) {
                infraWarned.current = true;
                addToast("warning", `${degraded.name} reporting ${degraded.status} status.`);
              }
            }
          }
        })
        .catch((err) => {
          if (cancelled) return;
          // Ignore AbortError — these are intentional cancellations, not failures
          if (err.name === "AbortError") return;
          if (isInitial) setLoadingInfra(false);
          if (!wasFailing) {
            wasFailing = true;
            addToast("warning", err.message || "Failed to fetch infrastructure status.");
          }
        });
    };

    // Check health immediately, then poll every 5 seconds so the dashboard
    // recovers automatically once you fix the issue.
    checkHealth(true);
    const intervalId = setInterval(() => checkHealth(false), 5000);

    return () => {
      cancelled = true;
      if (currentController) currentController.abort();
      clearInterval(intervalId);
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = incidents[0] || null;
  const blockedByActive = !!current && current.status === "processing" && !running;

  const runSimulation = useCallback(async () => {
    if (running || blockedByActive) return;
    setRunning(true);
    setStepIndex(0);
    setAnalysisLoading(false);
    setAnalysisError(null);
    addToast("info", `Simulating "${selectedType}"...`);

    const advance = (idx, delay) =>
      new Promise((resolve) => {
        const t = setTimeout(() => {
          setStepIndex(idx);
          resolve();
        }, delay);
        timers.current.push(t);
      });

    try {
      // Show "sending request to backend" before the request actually goes
      // out, so the progress UI tracks the real network call instead of
      // lagging a fixed delay behind it.
      setStepIndex(1);
      const newIncident = await simulateIncident(selectedType);
      setIncidents((prev) => [{ ...newIncident, status: "processing", analysis: null }, ...prev].slice(0, 8));

      await advance(2, 700);
      await advance(3, 700);

      // Show loading state while fetching analysis
      setAnalysisLoading(true);
      
      try {
        const result = await fetchAnalysis(newIncident.id);
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === newIncident.id ? { ...inc, analysis: result } : inc))
        );
        setAnalysisLoading(false);
        
        await advance(4, 400);
        addToast("success", "AI analysis completed - review the incident report below.");
      } catch (analysisErr) {
        setAnalysisLoading(false);
        setAnalysisError(analysisErr.message || "Failed to fetch AI analysis");
        addToast("warning", "AI analysis failed - check the error details below.");
      }
    } catch (err) {
      addToast("warning", err.message || "Something went wrong triggering the incident.");
      setStepIndex(null);
      setAnalysisLoading(false);
    } finally {
      setRunning(false);
    }
  }, [running, blockedByActive, selectedType, addToast]);

  const resolveIncident = useCallback(
    (id) => {
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, status: "resolved", resolvedAt: new Date() } : inc))
      );
      addToast("success", "Incident marked as resolved.");
    },
    [addToast]
  );

  const T = TOKENS[theme];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${T.page}`}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <Reveal>
        <HeroSection theme={theme} />
      </Reveal>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-10">
        <Reveal delay={80}>
          <GuidedWorkflow theme={theme} />
        </Reveal>
        <Reveal delay={160}>
          <InfrastructureHealth services={services} loading={loadingInfra} theme={theme} />
        </Reveal>
        <Reveal delay={240}>
          <IncidentSimulation
            selected={selectedType}
            onSelect={setSelectedType}
            onSimulate={runSimulation}
            disabled={running || blockedByActive}
            blockedByActive={blockedByActive}
            theme={theme}
          />
        </Reveal>
        <SimulationProgress stepIndex={stepIndex} theme={theme} />
        <IncidentSummary incident={current} onResolve={resolveIncident} theme={theme} />
        <AIIncidentAnalysis 
          analysis={current?.analysis} 
          loading={analysisLoading}
          error={analysisError}
          incident={current}
          theme={theme} 
        />
        <Reveal delay={320}>
          <IncidentHistory history={incidents} theme={theme} />
        </Reveal>
      </main>
      <Footer theme={theme} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} theme={theme} />
    </div>
  );
}

export default App;

if (typeof window !== 'undefined') {
  // Browser environment - ensure window.storage exists for theme persistence
  if (!window.storage) {
    window.storage = {
      get: (key) => Promise.resolve({ value: localStorage.getItem(key) }),
      set: (key, value) => Promise.resolve(localStorage.setItem(key, value))
    };
  }
}