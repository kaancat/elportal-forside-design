// File: /api/electricity-prices.ts
// A simple test function to confirm the Vercel route is working.

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Ignore all complex logic.
  // Just return a simple, successful JSON object to prove the function can run.
  response.status(200).json({ 
    status: 'ok', 
    message: 'The API route is working correctly!',
    timestamp: new Date().toISOString() 
  });
}