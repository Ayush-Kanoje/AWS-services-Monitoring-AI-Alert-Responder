import { FiGithub } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="border-t border-border dark:border-border-dark mt-10">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="text-center sm:text-left">
          <p className="font-semibold text-ink dark:text-ink-dark">AI-Powered Cloud Incident Response Platform</p>
          <p className="text-muted dark:text-muted-dark text-xs mt-0.5">Developed by Ayush</p>
        </div>

        <div className="flex items-center gap-4 text-muted dark:text-muted-dark">
          <a
            href="#"
            className="flex items-center gap-1.5 hover:text-ink dark:hover:text-ink-dark transition-colors"
            aria-label="GitHub repository"
          >
            <FiGithub className="h-4 w-4" />
            <span className="text-xs">GitHub</span>
          </a>
          <span className="font-mono text-xs">v1.0</span>
        </div>
      </div>
    </footer>
  )
}
