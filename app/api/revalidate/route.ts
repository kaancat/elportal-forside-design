import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';

// Runtime configuration for production-grade performance
export const runtime = 'nodejs'; // Required for Sanity webhook processing and crypto validation
export const maxDuration = 30; // Extended timeout for comprehensive revalidation
export const dynamic = 'force-dynamic';

// Enhanced TypeScript interface for webhook payload (Codex-recommended)
interface SanityWebhookPayload {
  _id: string;
  _type: 'homePage' | 'page' | 'provider' | 'siteSettings' | 'blogPost' | 'blogPageSettings';
  _rev?: string;
  _createdAt?: string;
  _updatedAt?: string;
  slug?: {
    _type: 'slug';
    current?: string;
  };
  title?: string;
  isHomepage?: boolean;
}

// Enhanced error interface for better debugging
interface RevalidationError {
  code: string;
  message: string;
  documentId?: string;
  documentType?: string;
  timestamp: string;
}

// Get the webhook secret from environment variables
const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  // 1. Security: Check if webhook secret is configured
  if (!SANITY_WEBHOOK_SECRET) {
    const error: RevalidationError = {
      code: 'MISSING_SECRET',
      message: 'Sanity webhook secret is not configured',
      timestamp: new Date().toISOString()
    };
    console.error('[Revalidation] Critical security error:', error);
    return NextResponse.json(error, { status: 500 });
  }

  try {
    // 2. Security-first approach: Get signature and body as raw text (Codex-recommended)
    const signature = request.headers.get(SIGNATURE_HEADER_NAME);
    const body = await request.text();
    
    if (!signature) {
      const error: RevalidationError = {
        code: 'MISSING_SIGNATURE',
        message: 'Webhook signature is missing',
        timestamp: new Date().toISOString()
      };
      console.error('[Revalidation] Security error:', error);
      return NextResponse.json(error, { status: 401 });
    }

    // 3. Cryptographic validation BEFORE parsing (Codex security pattern)
    if (!isValidSignature(body, signature, SANITY_WEBHOOK_SECRET)) {
      const error: RevalidationError = {
        code: 'INVALID_SIGNATURE',
        message: 'Webhook signature validation failed',
        timestamp: new Date().toISOString()
      };
      console.warn('[Revalidation] Security breach attempt:', error);
      return NextResponse.json(error, { status: 401 });
    }

    // 4. Parse the cryptographically validated body
    let payload: SanityWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      const error: RevalidationError = {
        code: 'INVALID_JSON',
        message: 'Failed to parse webhook body as JSON',
        timestamp: new Date().toISOString()
      };
      console.error('[Revalidation] Parse error:', error, parseError);
      return NextResponse.json(error, { status: 400 });
    }

    // 5. Enhanced logging with performance tracking (Codex-recommended)
    console.log('[Revalidation] Webhook received:', {
      _id: payload._id,
      _type: payload._type,
      slug: payload.slug?.current,
      title: payload.title,
      isHomepage: payload.isHomepage,
      timestamp: new Date().toISOString(),
      processing_start: startTime
    });

    // 6. Production-grade revalidation with granular cache control
    const revalidatedTags: string[] = [];
    const revalidatedPaths: string[] = [];
    
    try {
      // Enhanced revalidation logic with comprehensive coverage (Codex-optimized)
      switch (payload._type) {
        case 'homePage':
          // Homepage changes affect root page and homepage cache
          revalidateTag('homepage');
          revalidatedTags.push('homepage');
          revalidateTag('page'); // Generic page tag for lists
          revalidatedTags.push('page');
          revalidatePath('/');
          revalidatedPaths.push('/');
          console.log('[Revalidation] Homepage cache invalidated');
          break;
          
        case 'page':
          // Page changes: invalidate specific page + general page lists
          if (payload.slug?.current) {
            // Specific page cache
            revalidateTag(`page:${payload.slug.current}`);
            revalidatedTags.push(`page:${payload.slug.current}`);
            // Specific page path
            revalidatePath(`/${payload.slug.current}`);
            revalidatedPaths.push(`/${payload.slug.current}`);
            
            // Check if this is a homepage being edited
            if (payload.isHomepage) {
              revalidateTag('homepage');
              revalidatedTags.push('homepage');
              revalidatePath('/');
              revalidatedPaths.push('/');
            }
          }
          // All pages cache (for listings, navigation, etc.)
          revalidateTag('page');
          revalidatedTags.push('page');
          console.log(`[Revalidation] Page cache invalidated: ${payload.slug?.current || payload._id}`);
          break;
          
        case 'provider':
          // Provider changes affect multiple pages with provider data
          revalidateTag('providers');
          revalidatedTags.push('providers');
          // Key pages that display providers
          const providerPages = ['/', '/sammenlign', '/elpriser', '/vindstod'];
          for (const path of providerPages) {
            revalidatePath(path);
            revalidatedPaths.push(path);
          }
          console.log('[Revalidation] Provider cache invalidated');
          break;
          
        case 'siteSettings':
          // Site settings affect entire site (navigation, footer, global settings)
          revalidateTag('siteSettings');
          revalidatedTags.push('siteSettings');
          // Revalidate all key pages since navigation/footer changes
          const globalPages = ['/', '/elpriser', '/sammenlign', '/groen-energi'];
          for (const path of globalPages) {
            revalidatePath(path);
            revalidatedPaths.push(path);
          }
          console.log('[Revalidation] Site settings cache invalidated');
          break;
          
        case 'blogPost':
          // Blog post changes: invalidate specific post + blog archive
          if (payload.slug?.current) {
            // Specific blog post cache
            revalidateTag(`blogPost:${payload.slug.current}`);
            revalidatedTags.push(`blogPost:${payload.slug.current}`);
            // Specific blog post path (Blogs)
            revalidatePath(`/blogs/${payload.slug.current}`);
            revalidatedPaths.push(`/blogs/${payload.slug.current}`);
          }
          // Blog archive page (shows all posts)
          revalidateTag('blogPosts');
          revalidatedTags.push('blogPosts');
          revalidatePath('/blogs');
          revalidatedPaths.push('/blogs');
          console.log(`[Revalidation] Blog post cache invalidated: ${payload.slug?.current || payload._id}`);
          break;
          
        case 'blogPageSettings':
          // Blog page settings affect blog landing page
          revalidateTag('blogPageSettings');
          revalidatedTags.push('blogPageSettings');
          revalidatePath('/blogs');
          revalidatedPaths.push('/blogs');
          console.log('[Revalidation] Blog page settings cache invalidated');
          break;
          
        default:
          // Enhanced fallback with logging for debugging new content types
          console.warn(`[Revalidation] Unhandled document type: ${payload._type}`);
          // Conservative fallback: revalidate homepage and generic caches
          revalidateTag('homepage');
          revalidatedTags.push('homepage');
          revalidatePath('/');
          revalidatedPaths.push('/');
          console.log('[Revalidation] Fallback cache invalidation applied');
      }
      
      // 7. Enhanced performance tracking and success logging
      const processingTime = Date.now() - startTime;
      console.log('[Revalidation] Cache invalidation completed:', {
        tags: revalidatedTags,
        paths: revalidatedPaths,
        documentType: payload._type,
        documentId: payload._id,
        slug: payload.slug?.current,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString()
      });
      
    } catch (revalidateError) {
      // Enhanced error handling with structured error response (Codex pattern)
      const error: RevalidationError = {
        code: 'REVALIDATION_FAILED',
        message: 'Cache revalidation failed',
        documentId: payload._id,
        documentType: payload._type,
        timestamp: new Date().toISOString()
      };
      console.error('[Revalidation] Cache revalidation error:', error, revalidateError);
      
      // Signal to Sanity that webhook failed and should be retried (Codex resilience pattern)
      return NextResponse.json(error, { status: 500 });
    }
    
    // 8. Production-grade success response with comprehensive metadata
    const processingTime = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      revalidated: true,
      documentId: payload._id,
      documentType: payload._type,
      slug: payload.slug?.current,
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime}ms`,
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
        'X-Revalidated-Paths': revalidatedPaths.join(','),
        'X-Processing-Time': `${processingTime}ms`,
        'X-Cache-Strategy': 'granular-revalidation'
      }
    });

  } catch (error) {
    // 9. Enhanced top-level error handling with structured response
    const revalidationError: RevalidationError = {
      code: 'WEBHOOK_PROCESSING_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
    console.error('[Revalidation] Critical webhook processing error:', revalidationError, error);
    
    // Return 500 to signal Sanity to retry the webhook
    return NextResponse.json(revalidationError, { status: 500 });
  }
}

// Enhanced GET method for webhook health checking and diagnostics
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  
  // Health check endpoint for webhook monitoring
  return NextResponse.json({
    service: 'Sanity Webhook Revalidation',
    status: 'healthy',
    timestamp,
    configuration: {
      secret_configured: !!SANITY_WEBHOOK_SECRET,
      runtime: 'nodejs',
      max_duration: 30,
      supported_document_types: ['homePage', 'page', 'provider', 'siteSettings', 'blogPost', 'blogPageSettings'],
      cache_tags: ['homepage', 'page', 'siteSettings', 'providers', 'blogPosts', 'blogPageSettings'],
      webhook_url: `${request.nextUrl.origin}/api/revalidate`
    },
    instructions: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sanity-webhook-signature': 'Required - HMAC signature'
      },
      security: 'HMAC signature validation required',
      documentation: 'https://docs.sanity.io/api/webhooks'
    }
  }, {
    status: 200,
    headers: {
      'X-Health-Check': timestamp,
      'X-Service': 'webhook-revalidation'
    }
  });
}

// Handle unsupported HTTP methods
export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed. Use POST for webhooks.' }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed. Use POST for webhooks.' }, { status: 405 });
}
