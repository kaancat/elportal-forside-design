// /api/health.ts

// The modern Web API signature for Vercel Functions
export function GET(request: Request) {
  // Use the standard Response.json() helper to return a JSON response
  return Response.json(
    { status: 'ok', signature: 'modern-web-api' },
    { status: 200 }
  );
} 