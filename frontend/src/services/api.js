/**
 * API service layer
 * -----------------------------------------------------------------------
 * This file defines the contract between the frontend and the future AWS
 * backend (API Gateway HTTP API -> Lambda -> OpenRouter AI -> DynamoDB -> SNS).
 *
 * NOTHING in this file is implemented yet. Every function is a placeholder
 * that documents the expected request/response shape so the UI components
 * can be wired up once the real endpoints exist.
 *
 * Base URL is read from an environment variable so it can be configured
 * per-environment (local dev, staging, production) without code changes.
 */

const API_URL = import.meta.env.VITE_API_URL

/**
 * Trigger an incident simulation on the backend.
 *
 * Backend endpoint (future): POST /simulate
 *
 * @param {Object} payload
 * @param {string} payload.incidentType - e.g. "cpu-spike", "nginx-down"
 * @param {string} payload.category - "infrastructure" | "linux-service"
 * @returns {Promise<Object>} AI-generated incident report (root cause,
 *   business impact, severity, recommended commands, resolution, automation)
 */
export async function simulateIncident(payload) {
  // TODO: connect to POST {API_URL}/simulate once the backend is live.
  console.warn('simulateIncident() is a placeholder. No backend is connected yet.', payload)
  return null
}

/**
 * Fetch past incidents recorded in DynamoDB.
 *
 * Backend endpoint (future): GET /history
 *
 * @returns {Promise<Array<Object>>} List of incident records
 *   { incidentId, incidentType, severity, status, timestamp }
 */
export async function getIncidentHistory() {
  // TODO: connect to GET {API_URL}/history once the backend is live.
  console.warn('getIncidentHistory() is a placeholder. No backend is connected yet.')
  return []
}

/**
 * Fetch current infrastructure health metrics.
 *
 * Backend endpoint (future): GET /health
 *
 * @returns {Promise<Object>} { cpu, memory, disk, status }
 */
export async function getSystemHealth() {
  // TODO: connect to GET {API_URL}/health once the backend is live.
  console.warn('getSystemHealth() is a placeholder. No backend is connected yet.')
  return null
}

export { API_URL }
