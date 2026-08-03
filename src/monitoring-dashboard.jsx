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
  Sun,
  Moon,
  X,
  Info,
  CheckCheck,
  AlertTriangle,
  Terminal,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// Import API configuration
import { API, handleApiResponse } from "./api/app";

/* ------------------------------------------------------------------ */
/*  Live API service layer                                            */
/* ------------------------------------------------------------------ */

// Fetch Real Infrastructure Status
async function fetchInfraStatus(signal) {
  const response = await fetch(API.status, { signal });
  const data = await handleApiResponse(response);
  return Array.isArray(data) ? data : (data.services ?? []);
}

function normalizeInfraServices(services) {
  const ec2 = services.find((service) => service.id === "ec2");
  const cloudwatch = services.find((service) => service.id === "cw");

  const dependencyStatus = [ec2?.status, cloudwatch?.status].reduce((worst, current) => {
    if (current === "critical") return "critical";
    if (current === "warning" && worst !== "critical") return "warning";
    return worst;
  }, "healthy");

  const dependencyDetail = [
    ec2 ? `EC2: ${ec2.detail || ec2.status}` : null,
    cloudwatch ? `CloudWatch: ${cloudwatch.detail || cloudwatch.status}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return services.map((service) => {
    const needsDerivedStatus = (service.id === "app" || service.id === "nginx") && /not yet wired to a real check/i.test(service.detail || "");

    if (!needsDerivedStatus) {
      return service;
    }

    const shouldWarn = dependencyStatus === "warning";
    const shouldCrit = dependencyStatus === "critical";

    return {
      ...service,
      status: shouldCrit ? "critical" : shouldWarn ? "warning" : ec2?.status || service.status || "healthy",
      detail: dependencyDetail
        ? `Derived from live infrastructure checks (${dependencyDetail})`
        : "Derived from live infrastructure checks",
    };
  });
}

// Fetch all incidents from backend
async function fetchIncidents(signal) {
  const response = await fetch(API.incidents, { signal });
  const data = await handleApiResponse(response);
  return Array.isArray(data) ? data : (data.incidents ?? []);
}

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
    skeleton: "bg-slate-100",
    chip: "bg-slate-100 text-slate-500",
    btnGhost: "border border-slate-200 text-slate-500 hover:bg-slate-100",
    focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
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
    skeleton: "bg-slate-800",
    chip: "bg-slate-800 text-slate-400",
    btnGhost: "border border-slate-700 text-slate-400 hover:bg-slate-800",
    focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
  },
};

function statusClasses(theme, kind) {
  const map = {
    light: {
      healthy: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      warning: "bg-amber-50 text-amber-700 ring-amber-200",
      critical: "bg-red-50 text-red-700 ring-red-200",
      analyzing: "bg-blue-50 text-blue-700 ring-blue-200",
      completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    dark: {
      healthy: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
      critical: "bg-red-500/10 text-red-400 ring-red-500/30",
      analyzing: "bg-blue-500/10 text-blue-400 ring-blue-500/30",
      completed: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
    },
  };
  return map[theme][kind];
}

function dotClass(kind) {
  if (kind === "healthy" || kind === "completed") return "bg-emerald-500";
  if (kind === "warning") return "bg-amber-500";
  if (kind === "critical") return "bg-red-500";
  if (kind === "analyzing") return "bg-blue-500 animate-pulse";
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
  const isActive = status === "warning" || status === "critical" || status === "analyzing";
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
            Cloud Monitoring Dashboard
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`hidden items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs sm:inline-flex ${T.chip}`}
          >
            Built by <span className="font-semibold">Ayush</span>
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
/*  Section 1 — Infrastructure Health                                  */
/* ------------------------------------------------------------------ */

function InfrastructureHealth({ services, loading, theme }) {
  const T = TOKENS[theme];
  return (
    <section>
      <SectionHeading eyebrow="Real-Time Monitoring" title="Infrastructure Health" theme={theme} />
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
/*  Section 2 — Incident Cards (Expandable)                            */
/* ------------------------------------------------------------------ */

function IncidentCard({ incident, expanded, onToggle, theme }) {
  const T = TOKENS[theme];
  const analysis = incident.analysis;
  const hasAnalysis = analysis && incident.status === "completed";

  return (
    <Card theme={theme} hoverable className="cursor-pointer">
      <div onClick={onToggle}>
        {/* Incident Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-mono text-xs ${T.muted}`}>
                Incident #{incident.id}
              </span>
              <StatusBadge status={incident.status} theme={theme} />
            </div>
            <h3 className={`text-lg font-semibold ${T.text}`}>{incident.type}</h3>
            <div className="mt-2 flex flex-wrap gap-3">
              <span className={`text-xs ${T.subtext}`}>
                <span className={T.muted}>Severity:</span> {incident.severity}
              </span>
              <span className={`text-xs ${T.subtext}`}>
                <span className={T.muted}>Detected:</span> {new Date(incident.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {expanded ? (
              <ChevronDown className={`h-5 w-5 ${T.muted}`} />
            ) : (
              <ChevronRight className={`h-5 w-5 ${T.muted}`} />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Analysis Section */}
      {expanded && hasAnalysis && (
        <div className={`mt-4 pt-4 border-t ${T.divider} space-y-4`}>
          {/* Root Cause */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-4 w-4 ${T.muted}`} />
              <h4 className={`text-sm font-semibold uppercase tracking-wide ${T.muted}`}>Root Cause</h4>
            </div>
            <p className={`text-sm leading-relaxed ${T.text}`}>{analysis.rootCause}</p>
          </div>

          {/* Impact */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className={`h-4 w-4 ${T.muted}`} />
              <h4 className={`text-sm font-semibold uppercase tracking-wide ${T.muted}`}>Impact</h4>
            </div>
            <p className={`text-sm leading-relaxed ${T.text}`}>{analysis.impact}</p>
          </div>

          {/* Confidence */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className={`h-4 w-4 ${T.muted}`} />
              <h4 className={`text-sm font-semibold uppercase tracking-wide ${T.muted}`}>Confidence</h4>
            </div>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                CONFIDENCE_STYLES[theme][analysis.confidence] || CONFIDENCE_STYLES[theme].Medium
              }`}
            >
              {analysis.confidence}
            </span>
          </div>

          {/* Resolution Steps */}
          <div>
            <h4 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${T.muted}`}>Resolution Steps</h4>
            <div className="space-y-3">
              {analysis.resolution.map((step, idx) => (
                <div key={idx} className={`rounded-lg border p-3 ${T.divider}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        theme === "dark" ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <span className="font-mono text-xs">{idx + 1}</span>
                    </div>
                    <p className={`flex-1 text-sm ${T.text}`}>{step.text}</p>
                  </div>
                  {step.command && <CommandBlock command={step.command} theme={theme} />}
                </div>
              ))}
            </div>
          </div>

          {/* Automation Recommendation */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bot className={`h-4 w-4 ${T.muted}`} />
              <h4 className={`text-sm font-semibold uppercase tracking-wide ${T.muted}`}>Automation Recommendation</h4>
            </div>
            <p className={`text-sm leading-relaxed ${T.text}`}>{analysis.automation}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3 — Incident List                                          */
/* ------------------------------------------------------------------ */

function IncidentList({ incidents, loading, theme }) {
  const T = TOKENS[theme];
  const [expandedId, setExpandedId] = useState(null);

  const toggleIncident = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <section>
        <SectionHeading eyebrow="Active Incidents" title="Detected Incidents" theme={theme} />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} theme={theme} className={`h-[140px] animate-pulse ${T.skeleton}`} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading eyebrow="Active Incidents" title="Detected Incidents" theme={theme}>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${T.chip}`}>
          {incidents.length} {incidents.length === 1 ? 'Incident' : 'Incidents'}
        </span>
      </SectionHeading>
      {incidents.length === 0 ? (
        <Card theme={theme}>
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className={`mb-3 h-12 w-12 ${T.muted}`} />
            <p className={`text-sm font-medium ${T.text}`}>No incidents detected</p>
            <p className={`mt-1 text-xs ${T.subtext}`}>All infrastructure components are healthy</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              expanded={expandedId === incident.id}
              onToggle={() => toggleIncident(incident.id)}
              theme={theme}
            />
          ))}
        </div>
      )}
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
/*  Main App                                                            */
/* ------------------------------------------------------------------ */

let toastCounter = 0;

function MonitoringDashboard() {
  const [theme, setTheme] = useState("light");
  const [services, setServices] = useState([]);
  const [loadingInfra, setLoadingInfra] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [toasts, setToasts] = useState([]);
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

  // Poll infrastructure health
  useEffect(() => {
    let cancelled = false;
    let wasFailing = false;
    let currentController = null;

    const checkHealth = (isInitial) => {
      if (currentController) currentController.abort();
      currentController = new AbortController();
      const { signal } = currentController;

      fetchInfraStatus(signal)
        .then((data) => {
          if (cancelled) return;
          setServices(normalizeInfraServices(data));
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
          if (err.name === "AbortError") return;
          if (isInitial) setLoadingInfra(false);
          if (!wasFailing) {
            wasFailing = true;
            addToast("warning", err.message || "Failed to fetch infrastructure status.");
          }
        });
    };

    checkHealth(true);
    const intervalId = setInterval(() => checkHealth(false), 5000);

    return () => {
      cancelled = true;
      if (currentController) currentController.abort();
      clearInterval(intervalId);
    };
  }, [addToast]);

  // Poll incidents
  useEffect(() => {
    let cancelled = false;
    let currentController = null;

    const checkIncidents = (isInitial) => {
      if (currentController) currentController.abort();
      currentController = new AbortController();
      const { signal } = currentController;

      fetchIncidents(signal)
        .then((data) => {
          if (cancelled) return;
          
          // Normalize incident data
          const normalizedIncidents = data.map(inc => ({
            id: inc.incidentId || inc.id,
            type: inc.incidentType || inc.type,
            severity: inc.severity || "Unknown",
            status: inc.status === "completed" || inc.analysis ? "completed" : "analyzing",
            timestamp: inc.timestamp || new Date().toISOString(),
            analysis: inc.analysis ? {
              rootCause: inc.analysis.rootCause || "",
              impact: inc.analysis.impact || "",
              confidence: inc.analysis.confidence || "Medium",
              resolution: Array.isArray(inc.analysis.resolution)
                ? inc.analysis.resolution.map((step) =>
                    typeof step === "string" ? { text: step } : { text: step.text || step.step || "", command: step.command }
                  )
                : [],
              automation: inc.analysis.automation || "",
            } : null,
          }));

          // Sort by timestamp (newest first)
          normalizedIncidents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          setIncidents(normalizedIncidents);
          if (isInitial) setLoadingIncidents(false);
        })
        .catch((err) => {
          if (cancelled) return;
          if (err.name === "AbortError") return;
          if (isInitial) setLoadingIncidents(false);
          console.error("Failed to fetch incidents:", err);
        });
    };

    checkIncidents(true);
    const intervalId = setInterval(() => checkIncidents(false), 7000);

    return () => {
      cancelled = true;
      if (currentController) currentController.abort();
      clearInterval(intervalId);
    };
  }, []);

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
      
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-10">
        <InfrastructureHealth services={services} loading={loadingInfra} theme={theme} />
        <IncidentList incidents={incidents} loading={loadingIncidents} theme={theme} />
      </main>
      
      <Footer theme={theme} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} theme={theme} />
    </div>
  );
}

export default MonitoringDashboard;

if (typeof window !== 'undefined') {
  if (!window.storage) {
    window.storage = {
      get: (key) => Promise.resolve({ value: localStorage.getItem(key) }),
      set: (key, value) => Promise.resolve(localStorage.setItem(key, value))
    };
  }
}
