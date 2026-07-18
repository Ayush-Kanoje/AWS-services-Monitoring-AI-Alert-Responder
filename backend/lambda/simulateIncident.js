/**
 * Lambda handler: POST /simulate
 *
 * Receives an incident trigger from API Gateway, calls OpenRouter AI
 * to generate a structured incident report, persists it to DynamoDB,
 * and publishes an SNS alert.
 *
 * Environment variables required:
 *   OPENROUTER_API_KEY  - OpenRouter AI API key
 *   DYNAMODB_TABLE      - DynamoDB table name for incident records
 *   SNS_TOPIC_ARN       - SNS topic ARN for alert delivery
 */

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { generateIncidentReport } from '../services/aiService.js'
import { createIncidentRecord } from '../utils/incidentHelpers.js'

const dynamo = new DynamoDBClient({})
const sns = new SNSClient({})

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')
    const { incidentType, category } = body

    if (!incidentType || !category) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'incidentType and category are required' }),
      }
    }

    // 1. Generate AI report via OpenRouter
    const report = await generateIncidentReport({ incidentType, category })

    // 2. Build and persist the incident record
    const record = createIncidentRecord({ incidentType, category, report })
    await dynamo.send(
      new PutItemCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
          incidentId: { S: record.incidentId },
          incidentType: { S: record.incidentType },
          category: { S: record.category },
          severity: { S: record.severity },
          status: { S: record.status },
          timestamp: { S: record.timestamp },
          report: { S: JSON.stringify(record.report) },
        },
      })
    )

    // 3. Publish SNS alert
    await sns.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: `[${record.severity.toUpperCase()}] Incident: ${incidentType}`,
        Message: JSON.stringify(record, null, 2),
      })
    )

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }
  } catch (err) {
    console.error('simulateIncident error:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
