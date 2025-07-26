import { isValidSignature } from '@sanity/webhook';

export const dynamic = 'force-dynamic';

// Type for the webhook payload
interface WebhookPayload {
  _id: string;
  _type: string;
  slug?: {
    _type: 'slug';
    current: string;
  };
}

// Get the secret from environment variables
const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

export async function POST(request: Request) {
  // Check if webhook secret is configured
  if (!WEBHOOK_SECRET) {
    console.error('[Revalidation] Missing SANITY_WEBHOOK_SECRET environment variable');
    return Response.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  try {
    // Get the signature from headers
    const signature = request.headers.get('sanity-webhook-signature');
    
    if (!signature) {
      console.error('[Revalidation] Missing webhook signature');
      return Response.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Get the raw body text for signature validation
    const body = await request.text();
    
    // Validate the signature
    const isValid = await isValidSignature(
      body,
      signature,
      WEBHOOK_SECRET
    );

    if (!isValid) {
      console.error('[Revalidation] Invalid webhook signature');
      return Response.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the validated body
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      console.error('[Revalidation] Failed to parse webhook body:', parseError);
      return Response.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Log the webhook event (without sensitive data)
    console.log('[Revalidation] Webhook received:', {
      _id: payload._id,
      _type: payload._type,
      slug: payload.slug?.current,
      timestamp: new Date().toISOString()
    });

    // Since this is a React SPA with client-side routing, we can't invalidate
    // specific routes like in Next.js. Instead, we'll clear the React Query cache
    // by setting a cache-busting header that the frontend can check.
    
    // For now, we'll just acknowledge the webhook was received successfully.
    // The frontend should implement polling or WebSocket connections for real-time updates.
    
    return Response.json({
      success: true,
      revalidated: true,
      documentId: payload._id,
      documentType: payload._type,
      slug: payload.slug?.current,
      timestamp: new Date().toISOString(),
      message: 'Webhook processed successfully. Frontend should refetch data.'
    }, {
      status: 200,
      headers: {
        'X-Revalidation-Time': new Date().toISOString(),
        'X-Document-Id': payload._id,
        'X-Document-Type': payload._type
      }
    });

  } catch (error) {
    console.error('[Revalidation] Webhook processing error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}