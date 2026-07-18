/**
 * Incident helper utilities
 *
 * Pure functions — no AWS SDK calls, easy to unit-test.
 */

import { randomUUID } from 'crypto'

/**
 * Derive a severity level from the AI report or fall back to 'medium'.
 * Normalises free-text severity strings (e.g. "High", "CRITICAL") to
 * a canonical lowercase value.
 *
 * @param {Object} report - AI-generated report object
 * @returns {'low'|'medium'|'high'|'critical'}
 */
export function normaliseSeverity(report) {
  const raw = (report?.severity || 'medium').toString().toLowerCase()
  if (raw.includes('critical')) return 'critical'
  if (raw.includes('high')) return 'high'
  if (raw.includes('low')) return 'low'
  return 'medium'
}

/**
 * Build a complete incident record ready to be persisted in DynamoDB.
 *
 * @param {{ incidentType: string, category: string, report: Object }} params
 * @returns {Object} Incident record
 */
export function createIncidentRecord({ incidentType, category, report }) {
  return {
    incidentId: randomUUID(),
    incidentType,
    category,
    severity: normaliseSeverity(report),
    status: 'open',
    timestamp: new Date().toISOString(),
    report,
  }
}
