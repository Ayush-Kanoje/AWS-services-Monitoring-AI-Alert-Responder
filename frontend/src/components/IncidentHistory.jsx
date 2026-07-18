const COLUMNS = ['Incident ID', 'Incident Type', 'Severity', 'Status', 'Timestamp']

/**
 * Responsive incident history table.
 * `incidents` will eventually be populated from DynamoDB via
 * services/api.js -> getIncidentHistory(). Empty by default.
 */
export default function IncidentHistory({ incidents = [] }) {
  return (
    <section className="card p-5 sm:p-6">
      <p className="eyebrow">Incident History</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-border dark:border-border-dark">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="pb-2.5 pr-4 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="py-8 text-center text-sm text-muted dark:text-muted-dark">
                  No incidents available.
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr
                  key={incident.incidentId}
                  className="border-b border-border dark:border-border-dark last:border-0"
                >
                  <td className="py-2.5 pr-4 font-mono text-xs text-ink dark:text-ink-dark">
                    {incident.incidentId}
                  </td>
                  <td className="py-2.5 pr-4 text-ink dark:text-ink-dark">{incident.incidentType}</td>
                  <td className="py-2.5 pr-4 text-ink dark:text-ink-dark">{incident.severity}</td>
                  <td className="py-2.5 pr-4 text-ink dark:text-ink-dark">{incident.status}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted dark:text-muted-dark">
                    {incident.timestamp}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
