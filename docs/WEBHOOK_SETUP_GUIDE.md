# Sanity Webhook Setup Guide

This guide explains how to set up secure webhooks between Sanity and ElPortal to ensure real-time content updates.

## Overview

When content is updated in Sanity, a webhook triggers our API endpoint to notify the frontend. This ensures navigation and content changes are reflected immediately.

## Security Architecture

1. **Signature Validation**: All webhook requests are validated using HMAC signatures
2. **Environment Variables**: Secrets are stored in environment variables, never in code
3. **HTTPS Only**: Webhooks are only sent over HTTPS
4. **Request Validation**: Body parsing happens after signature validation

## Setup Instructions

### 1. Generate a Webhook Secret

Generate a strong, random secret for webhook validation:

```bash
# On macOS/Linux:
openssl rand -base64 32

# Or using Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Add Secret to Environment Variables

Add the generated secret to your `.env` file (create from `.env.example` if needed):

```env
SANITY_WEBHOOK_SECRET=your_generated_secret_here
```

**Important**: 
- Never commit `.env` to version control
- Ensure `.env` is in `.gitignore`
- Use different secrets for development and production

### 3. Deploy the API Endpoint

For Vercel deployment, add the environment variable:

```bash
vercel env add SANITY_WEBHOOK_SECRET
```

Then deploy:

```bash
vercel --prod
```

### 4. Configure Webhook in Sanity

1. Go to https://www.sanity.io/manage/personal/project/yxesi03x/api#webhooks
2. Click "Create webhook"
3. Configure as follows:

   - **Name**: "ElPortal Content Revalidation"
   - **URL**: `https://your-domain.vercel.app/api/revalidate`
   - **Dataset**: `production`
   - **Trigger on**: 
     - ✅ Create
     - ✅ Update
     - ✅ Delete
   - **Filter** (optional): Leave empty to trigger on all document types
   - **Projection** (optional): Leave empty to send full document
   - **Secret**: Paste the same secret you generated in step 1
   - **Headers** (optional): Leave empty

4. Click "Save"

### 5. Test the Webhook

1. Make a small change to any content in Sanity Studio
2. Publish the change
3. Check your Vercel logs for the webhook processing:

```bash
vercel logs --filter revalidate
```

You should see logs like:
```
[Revalidation] Webhook received: {
  _id: 'abc123',
  _type: 'page',
  slug: 'test-page',
  timestamp: '2024-01-26T10:30:00.000Z'
}
```

## Frontend Integration

Since ElPortal uses React with client-side routing, the webhook endpoint sets response headers that the frontend can check to trigger data refetching.

### React Query Integration (Future Enhancement)

To make the frontend react to webhook events, consider implementing:

1. **Polling Strategy**: Check a "last updated" endpoint periodically
2. **WebSocket Connection**: For real-time updates
3. **Service Worker**: Intercept responses and check revalidation headers

Example React Query setup:
```typescript
// In your query configuration
const { data } = useQuery({
  queryKey: ['navigation'],
  queryFn: fetchNavigation,
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchInterval: 30 * 1000, // Poll every 30 seconds
});
```

## Troubleshooting

### Webhook Not Triggering
- Verify the webhook is enabled in Sanity dashboard
- Check the dataset matches your content (usually 'production')
- Ensure the URL is correct and publicly accessible

### Signature Validation Failing
- Verify the secret matches exactly (no extra spaces)
- Check environment variable is loaded correctly
- Ensure you're using the raw request body for validation

### Changes Not Reflecting
- Since this is a SPA, browser cache might need clearing
- Implement proper cache invalidation in your service worker
- Consider adding cache-control headers to your API responses

## Security Best Practices

1. **Rotate Secrets Regularly**: Change webhook secrets every 90 days
2. **Monitor Failed Attempts**: Log and alert on repeated validation failures
3. **Rate Limiting**: Implement rate limiting on the webhook endpoint
4. **IP Allowlisting**: Consider restricting to Sanity's IP ranges (advanced)

## Next Steps

1. Implement frontend polling or WebSocket connection
2. Add monitoring and alerting for webhook failures
3. Create a dashboard to track webhook performance
4. Implement cache invalidation strategies