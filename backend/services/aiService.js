/**
 * AI Service — OpenRouter integration
 *
 * Sends the incident context to OpenRouter and parses the structured
 * JSON report back. All AI logic is isolated here so the Lambda handlers
 * stay thin.
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openai/gpt-4o-mini'

/**
 * Build the system + user prompt for a given incident.
 */
function buildPrompt({ incidentType, category }) {
  return [
    {
      role: 'system',
      content: `You are an expert Site Reliability Engineer. When given an incident type and 
category, respond ONLY with a JSON object containing these exact keys:
  rootCause, businessImpact, severity, commands, resolution, automation.
No markdown fences, no prose — raw JSON only.`,
    },
    {
      role: 'user',
      content: `Incident type: ${incidentType}\nCategory: ${category}`,
    },
  ]
}

/**
 * Call OpenRouter and return the parsed incident report object.
 *
 * @param {{ incidentType: string, category: string }} params
 * @returns {Promise<Object>} Structured report
 */
export async function generateIncidentReport({ incidentType, category }) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://github.com/your-org/ai-cloud-incident-platform',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: buildPrompt({ incidentType, category }),
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Empty response from OpenRouter')
  }

  return JSON.parse(content)
}
