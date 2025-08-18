import { isValidSignature } from '@sanity/webhook';
import { revalidateTag, revalidatePath } from 'next/cache';

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

    // Phase 2: Revalidate Next.js cache based on document type
    const revalidatedTags: string[] = [];
    const revalidatedPaths: string[] = [];
    
    try {
      // Determine which cache tags to revalidate based on document type
      switch (payload._type) {
        case 'homePage':
          // Revalidate homepage cache
          await revalidateTag('homepage');
          revalidatedTags.push('homepage');
          // Also revalidate the homepage path
          await revalidatePath('/');
          revalidatedPaths.push('/');
          break;
          
        case 'page':
          // Revalidate specific page cache
          if (payload.slug?.current) {
            await revalidateTag(`page:${payload.slug.current}`);
            revalidatedTags.push(`page:${payload.slug.current}`);
            // Revalidate the page path
            await revalidatePath(`/${payload.slug.current}`);
            revalidatedPaths.push(`/${payload.slug.current}`);
          }
          // Also revalidate all pages list
          await revalidateTag('pages');
          revalidatedTags.push('pages');
          // Also revalidate generic page tag
          await revalidateTag('page');
          revalidatedTags.push('page');
          break;
          
        case 'provider':
          // Revalidate providers cache
          await revalidateTag('providers');
          revalidatedTags.push('providers');
          // Revalidate pages that show providers
          await revalidatePath('/');
          await revalidatePath('/sammenlign');
          revalidatedPaths.push('/', '/sammenlign');
          break;
          
        case 'siteSettings':
          // Revalidate site settings affects all pages
          await revalidateTag('siteSettings');
          revalidatedTags.push('siteSettings');
          // Revalidate main pages
          await revalidatePath('/');
          revalidatedPaths.push('/');
          break;
          
        default:
          // For other content types, revalidate the homepage as a fallback
          await revalidateTag('homepage');
          revalidatedTags.push('homepage');
          await revalidatePath('/');
          revalidatedPaths.push('/');
          
          console.log(`[Revalidation] Unhandled document type: ${payload._type}`);
      }
      
      console.log('[Revalidation] Cache invalidated:', {
        tags: revalidatedTags,
        paths: revalidatedPaths,
        documentType: payload._type,
        documentId: payload._id,
        slug: payload.slug?.current
      });
      
    } catch (revalidateError) {
      console.error('[Revalidation] Failed to revalidate cache:', revalidateError);
      // Continue even if revalidation fails - don't fail the webhook
    }
    
    return Response.json({
      success: true,
      revalidated: true,
      documentId: payload._id,
      documentType: payload._type,
      slug: payload.slug?.current,
      timestamp: new Date().toISOString(),
      revalidatedTags,
      revalidatedPaths,
      message: 'Webhook processed and cache revalidated successfully.'
    }, {
      status: 200,
      headers: {
        'X-Revalidation-Time': new Date().toISOString(),
        'X-Document-Id': payload._id,
        'X-Document-Type': payload._type,
        'X-Revalidated-Tags': revalidatedTags.join(','),
        'X-Revalidated-Paths': revalidatedPaths.join(',')
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