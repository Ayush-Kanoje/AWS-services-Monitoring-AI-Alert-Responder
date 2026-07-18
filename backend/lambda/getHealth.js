/**
 * Lambda handler: GET /health
 *
 * Returns current infrastructure health metrics.
 * In production this would query CloudWatch metrics.
 * Currently returns a static healthy baseline as a placeholder.
 *
 * Environment variables required:
 *   (none for placeholder — CloudWatch integration added in v2)
 */

export const handler = async () => {
  try {
    // TODO: replace with real CloudWatch GetMetricData calls
    const health = {
      cpu: 32,
      memory: 48,
      disk: 51,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(health),
    }
  } catch (err) {
    console.error('getHealth error:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
