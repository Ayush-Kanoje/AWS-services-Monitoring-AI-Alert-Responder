// Replace with your actual API Gateway URL from AWS
// Example format: https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
// You can also use environment variables (create .env file):
// VITE_API_BASE_URL=https://your-api-url.amazonaws.com/prod
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://lnnlsbd9p0.execute-api.ap-south-1.amazonaws.com/prod";

// API endpoints for the Lambda functions
export const API = {
    status: `${BASE_URL}/status`,
    incidents: `${BASE_URL}/incidents`,
    analysis: `${BASE_URL}/analysis`
};

// Helper function to handle API responses
export async function handleApiResponse(response) {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
    }
    return response.json();
}