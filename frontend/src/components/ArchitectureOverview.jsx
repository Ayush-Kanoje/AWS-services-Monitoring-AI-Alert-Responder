import { FiLayout, FiShare2, FiCpu, FiZap, FiDatabase, FiBell } from 'react-icons/fi'

/**
 * Visual-only representation of the intended AWS architecture.
 * No live data, no backend calls — this is a static diagram.
 */
const STAGES = [
  {
    label: 'React Frontend',
    detail: 'Amazon S3',
    protocol: 'static hosting',
    icon: FiLayout,
  },
  {
    label: 'API Gateway',
    detail: 'HTTP API',
    protocol: 'https',
    icon: FiShare2,
  },
  {
    label: 'AWS Lambda',
    detail: 'Incident handler',
    protocol: 'invoke',
    icon: FiCpu,
  },
  {
    label: 'OpenRouter AI',
    detail: 'Report generation',
    protocol: 'inference',
    icon: FiZap,
  },
  {
    label: 'Amazon DynamoDB',
    detail: 'Incident store',
    protocol: 'putItem',
    icon: FiDatabase,
  },
  {
    label: 'Amazon SNS',
    detail: 'Alert delivery',
    protocol: 'publish',
    icon: FiBell,
  },
]

function Connector({ vertical }) {
  return (
    <div
      className={
        vertical
          ? 'relative w-px flex-1 min-h-[28px] bg-border dark:bg-border-dark mx-auto'
          : 'relative h-px flex-1 min-w-[24px] bg-border dark:bg-border-dark'
      }
    >
      <span
        className={
          vertical
            ? 'absolute left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-signal-teal-dark animate-flowDotV'
            : 'absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-signal-teal-dark animate-flowDotH'
        }
      />
    </div>
  )
}

function StageNode({ stage }) {
  const Icon = stage.icon
  return (
    <div className="flex flex-col items-center text-center gap-2 w-28 sm:w-32 shrink-0">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border dark:border-border-dark bg-canvas dark:bg-canvas-dark">
        <Icon className="h-5 w-5 text-signal-teal dark:text-signal-teal-dark" />
      </div>
      <div>
        <p className="text-xs font-semibold text-ink dark:text-ink-dark leading-tight">{stage.label}</p>
        <p className="text-[11px] text-muted dark:text-muted-dark leading-tight">{stage.detail}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-signal-teal dark:text-signal-teal-dark">
          {stage.protocol}
        </p>
      </div>
    </div>
  )
}

export default function ArchitectureOverview() {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="eyebrow">Architecture Overview</p>
          <p className="mt-1 text-sm text-muted dark:text-muted-dark">
            Visual representation only — no live backend connection.
          </p>
        </div>
      </div>

      {/* Desktop / tablet: horizontal pipeline */}
      <div className="hidden sm:flex items-center overflow-x-auto pb-1">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-center flex-1 min-w-0">
            <StageNode stage={stage} />
            {i < STAGES.length - 1 && <Connector />}
          </div>
        ))}
      </div>

      {/* Mobile: vertical pipeline */}
      <div className="flex sm:hidden flex-col items-center">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex flex-col items-center w-full">
            <StageNode stage={stage} />
            {i < STAGES.length - 1 && (
              <div className="h-7 flex justify-center">
                <Connector vertical />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
