import { FiCpu, FiDatabase, FiHardDrive, FiWifi } from 'react-icons/fi'

const INCIDENTS = [
  { key: 'cpu-spike', label: 'CPU Spike', icon: FiCpu },
  { key: 'memory-spike', label: 'Memory Spike', icon: FiDatabase },
  { key: 'disk-spike', label: 'Disk Spike', icon: FiHardDrive },
  { key: 'network-spike', label: 'Network Spike', icon: FiWifi },
]

/**
 * Simulated infrastructure incidents.
 * Buttons call a placeholder handler only — no fake AI text or values
 * are generated client-side. The backend will own that logic.
 */
export default function SimulationPanel({ onTrigger }) {
  return (
    <div className="card p-5 sm:p-6">
      <p className="eyebrow">Simulated Infrastructure Incidents</p>
      <p className="mt-1 text-sm text-muted dark:text-muted-dark">
        Trigger a synthetic infrastructure event to test the response pipeline.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {INCIDENTS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTrigger(key, 'infrastructure')}
            className="flex flex-col items-start gap-2 rounded-lg border border-border dark:border-border-dark
              bg-canvas dark:bg-canvas-dark px-3.5 py-3 text-left transition-colors duration-150
              hover:border-signal-teal dark:hover:border-signal-teal-dark hover:bg-signal-teal/5 dark:hover:bg-signal-teal-dark/5"
          >
            <Icon className="h-4 w-4 text-signal-blue dark:text-signal-blue-dark" />
            <span className="text-sm font-medium text-ink dark:text-ink-dark">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
