import { FiCpu, FiHardDrive, FiDatabase, FiCheckCircle } from 'react-icons/fi'
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

/**
 * Static placeholder values.
 * These will be replaced by services/api.js -> getSystemHealth() once the
 * backend is connected. No random generation, no auto-refresh.
 */
const METRICS = [
  { key: 'cpu', label: 'CPU Usage', value: 32, icon: FiCpu, color: '#3A6FE0', colorDark: '#5B8DEF' },
  { key: 'memory', label: 'Memory Usage', value: 48, icon: FiDatabase, color: '#0F9C8E', colorDark: '#4FD1C5' },
  { key: 'disk', label: 'Disk Usage', value: 51, icon: FiHardDrive, color: '#B8790B', colorDark: '#F2B84B' },
]

function GaugeCard({ metric }) {
  const Icon = metric.icon
  const data = [{ value: metric.value }]

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="relative h-16 w-16 shrink-0">
        <RadialBarChart
          width={64}
          height={64}
          cx={32}
          cy={32}
          innerRadius={22}
          outerRadius={30}
          barSize={6}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: 'currentColor', className: 'text-border dark:text-border-dark' }}
            dataKey="value"
            cornerRadius={4}
            fill={metric.color}
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xs font-semibold text-ink dark:text-ink-dark">{metric.value}%</span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-muted dark:text-muted-dark">
          <Icon className="h-3.5 w-3.5" />
          <p className="text-xs font-medium">{metric.label}</p>
        </div>
        <p className="mt-1 data-value text-xl font-semibold text-ink dark:text-ink-dark">{metric.value}%</p>
      </div>
    </div>
  )
}

function SystemStatusCard() {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-signal-green/10 dark:bg-signal-green-dark/10">
        <FiCheckCircle className="h-7 w-7 text-signal-green dark:text-signal-green-dark" />
      </div>
      <div>
        <div className="flex items-center gap-1.5 text-muted dark:text-muted-dark">
          <p className="text-xs font-medium">System Status</p>
        </div>
        <p className="mt-1 data-value text-xl font-semibold text-signal-green dark:text-signal-green-dark">
          Healthy
        </p>
      </div>
    </div>
  )
}

export default function StatusCards() {
  return (
    <section>
      <p className="eyebrow mb-3">Infrastructure Status</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <GaugeCard key={m.key} metric={m} />
        ))}
        <SystemStatusCard />
      </div>
    </section>
  )
}
