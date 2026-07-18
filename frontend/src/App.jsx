import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import ArchitectureOverview from './components/ArchitectureOverview.jsx'
import StatusCards from './components/StatusCards.jsx'
import SimulationPanel from './components/SimulationPanel.jsx'
import LinuxIncidentPanel from './components/LinuxIncidentPanel.jsx'
import AIIncidentReport from './components/AIIncidentReport.jsx'
import IncidentHistory from './components/IncidentHistory.jsx'
import ArchitecturePlaceholder from './components/ArchitecturePlaceholder.jsx'
import Footer from './components/Footer.jsx'
import { simulateIncident } from './services/api.js'

export default function App() {
  // Dark mode is the default. Preference is persisted to localStorage.
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  // No AI report or incident history is generated on the client.
  // These stay empty/null until the backend is connected.
  const [report] = useState(null)
  const [incidents] = useState([])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  // Placeholder handler only — does not generate fake AI text or fake
  // incident data. Once the backend exists, this will await
  // simulateIncident() and update report/incidents from the response.
  const handleTrigger = (incidentType, category) => {
    simulateIncident({ incidentType, category })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="mx-auto max-w-6xl w-full px-5 sm:px-8 py-8 flex flex-col gap-6">
        <ArchitectureOverview />
        <StatusCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimulationPanel onTrigger={handleTrigger} />
          <LinuxIncidentPanel onTrigger={handleTrigger} />
        </div>

        <AIIncidentReport report={report} />
        <IncidentHistory incidents={incidents} />
        <ArchitecturePlaceholder />
      </main>

      <Footer />
    </div>
  )
}
