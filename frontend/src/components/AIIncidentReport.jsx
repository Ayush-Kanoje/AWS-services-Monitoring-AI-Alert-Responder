import { FiTarget, FiTrendingUp, FiAlertOctagon, FiTerminal, FiTool, FiZap } from 'react-icons/fi'

const SECTIONS = [
  { key: 'rootCause', label: 'Root Cause', icon: FiTarget },
  { key: 'businessImpact', label: 'Business Impact', icon: FiTrendingUp },
  { key: 'severity', label: 'Severity', icon: FiAlertOctagon },
  { key: 'commands', label: 'Recommended Linux Commands', icon: FiTerminal },
  { key: 'resolution', label: 'Recommended Resolution', icon: FiTool },
  { key: 'automation', label: 'Automation Recommendation', icon: FiZap },
]

/**
 * Large report panel. Every section shows a waiting state until the
 * backend (Lambda + OpenRouter AI) returns a real report. No AI text
 * is generated on the client.
 */
export default function AIIncidentReport({ report }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow">AI Incident Report</p>
        {!report && (
          <span className="flex items-center gap-1.5 text-xs font-mono text-muted dark:text-muted-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-muted dark:bg-muted-dark" />
            idle
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="rounded-lg border border-border dark:border-border-dark bg-canvas dark:bg-canvas-dark p-4"
          >
            <div className="flex items-center gap-2 text-muted dark:text-muted-dark">
              <Icon className="h-3.5 w-3.5" />
              <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
            </div>
            <p
              className={
                report?.[key]
                  ? 'mt-2 text-sm text-ink dark:text-ink-dark font-mono'
                  : 'mt-2 text-sm italic text-muted dark:text-muted-dark'
              }
            >
              {report?.[key] || 'Waiting for incident...'}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
