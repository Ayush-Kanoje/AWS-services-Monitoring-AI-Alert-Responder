import { FiServer, FiXOctagon, FiLock, FiAlertTriangle } from 'react-icons/fi'

const INCIDENTS = [
  { key: 'nginx-down', label: 'Nginx Service Down', icon: FiServer },
  { key: 'app-crash', label: 'Backend Application Crash', icon: FiXOctagon },
  { key: 'permission-denied', label: 'Permission Denied', icon: FiLock },
  { key: 'disk-warning', label: 'Disk Warning', icon: FiAlertTriangle },
]

/**
 * Real Linux service incidents.
 * Buttons call a placeholder handler only — no backend implementation.
 */
export default function LinuxIncidentPanel({ onTrigger }) {
  return (
    <div className="card p-5 sm:p-6">
      <p className="eyebrow">Real Linux Service Incidents</p>
      <p className="mt-1 text-sm text-muted dark:text-muted-dark">
        Trigger a real Linux service fault to test the AI diagnostic flow.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {INCIDENTS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTrigger(key, 'linux-service')}
            className="flex flex-col items-start gap-2 rounded-lg border border-border dark:border-border-dark
              bg-canvas dark:bg-canvas-dark px-3.5 py-3 text-left transition-colors duration-150
              hover:border-signal-amber dark:hover:border-signal-amber-dark hover:bg-signal-amber/5 dark:hover:bg-signal-amber-dark/5"
          >
            <Icon className="h-4 w-4 text-signal-amber dark:text-signal-amber-dark" />
            <span className="text-sm font-medium text-ink dark:text-ink-dark">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
