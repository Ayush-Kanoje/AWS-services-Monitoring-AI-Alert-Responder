import { FiSun, FiMoon } from 'react-icons/fi'

/**
 * Dark / light mode toggle.
 * Theme state lives in App.jsx and is persisted to localStorage there;
 * this component is purely presentational + emits the toggle event.
 */
export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="group relative flex h-9 w-16 items-center rounded-full border border-border dark:border-border-dark
        bg-canvas dark:bg-canvas-dark px-1 transition-colors duration-200"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-surface dark:bg-raised-dark
          shadow-card dark:shadow-card-dark transition-transform duration-300 ease-out
          ${isDark ? 'translate-x-7' : 'translate-x-0'}`}
      >
        {isDark ? (
          <FiMoon className="h-3.5 w-3.5 text-signal-teal-dark" />
        ) : (
          <FiSun className="h-3.5 w-3.5 text-signal-amber" />
        )}
      </span>
    </button>
  )
}
