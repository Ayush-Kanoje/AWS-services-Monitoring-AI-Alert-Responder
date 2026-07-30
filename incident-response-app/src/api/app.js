// Replace with your actual API Gateway URL from AWS
// Example format: https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
// You can also use environment variables (create .env file):
// VITE_API_BASE_URL=https://your-api-url.amazonaws.com/prod
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://au9j7xooxa.execute-api.ap-south-1.amazonaws.com/prod";

// API endpoints for the three Lambda functions
export const API = {
    simulate: `${BASE_URL}/simulate`,
    analysis: `${BASE_URL}/analysis`,
    status: `${BASE_URL}/status`
};

// Helper function to handle API responses
export async function handleApiResponse(response) {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
    }
    return response.json();
}