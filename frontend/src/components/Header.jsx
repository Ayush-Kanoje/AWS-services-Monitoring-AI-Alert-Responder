import ThemeToggle from './ThemeToggle.jsx'

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="border-b border-border dark:border-border-dark bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal-teal/10 dark:bg-signal-teal-dark/10">
            <span className="h-2.5 w-2.5 rounded-full bg-signal-teal dark:bg-signal-teal-dark animate-pulseDot" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-ink dark:text-ink-dark">
              AI-Powered Cloud Incident Response Platform
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted dark:text-muted-dark">
              Simulating AI-assisted incident response for cloud infrastructure and Linux services.
            </p>
            <p className="mt-1.5 text-xs font-mono text-muted dark:text-muted-dark">
              Developed by <span className="text-ink dark:text-ink-dark">Ayush</span>
            </p>
          </div>
        </div>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
