/**
 * Lambda handler: GET /history
 *
 * Scans the DynamoDB incidents table and returns all records,
 * sorted by timestamp descending.
 *
 * Environment variables required:
 *   DYNAMODB_TABLE - DynamoDB table name for incident records
 */

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

const dynamo = new DynamoDBClient({})

export const handler = async () => {
  try {
    const result = await dynamo.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE })
    )

    const items = (result.Items || [])
      .map((item) => unmarshall(item))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }
  } catch (err) {
    console.error('getHistory error:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
