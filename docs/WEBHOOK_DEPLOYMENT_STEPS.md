# Webhook Deployment Steps

## ✅ Completed Steps

1. **Webhook Secret Generated**: `zJ70YUlKWL9LiX3Z/gDeYAAqiojJMyDM8Wqd/3RUvFE=`
2. **Added to .env file**: `SANITY_WEBHOOK_SECRET` is now configured

## 🚀 Steps You Need to Complete

### 3. Deploy the API Endpoint to Vercel

First, add the webhook secret to Vercel:

```bash
# Add the environment variable to Vercel
vercel env add SANITY_WEBHOOK_SECRET production

# When prompted, paste: zJ70YUlKWL9LiX3Z/gDeYAAqiojJMyDM8Wqd/3RUvFE=
```

Then deploy:

```bash
# Deploy to production
vercel --prod
```

After deployment, note your production URL (e.g., `https://your-app.vercel.app`)

### 4. Configure Webhook in Sanity Dashboard

1. Go to: https://www.sanity.io/manage/personal/project/yxesi03x/api#webhooks
2. Click "Create webhook"
3. Fill in the form:

   - **Name**: `ElPortal Revalidation`
   - **URL**: `https://your-app.vercel.app/api/revalidate` (use your actual domain)
   - **Dataset**: `production`
   - **Trigger on**: 
     - ✅ Create
     - ✅ Update  
     - ✅ Delete
   - **Filter**: (leave empty - we want all document types)
   - **Projection**: (leave empty - send full document)
   - **Secret**: `zJ70YUlKWL9LiX3Z/gDeYAAqiojJMyDM8Wqd/3RUvFE=`
   - **HTTP Method**: POST
   - **Headers**: (leave empty)
   - **Enable webhook**: ✅ Yes

4. Click "Save"

### 5. Test with Content Changes

1. Make a small change in Sanity Studio (e.g., update a page title)
2. Publish the change
3. Check Vercel logs to confirm webhook was received:

```bash
# View recent function logs
vercel logs --filter revalidate --follow
```

You should see logs like:
```
[Revalidation] Webhook received: {
  _id: 'abc123',
  _type: 'page',
  slug: 'test-page',
  timestamp: '2024-01-26T...'
}
```

## 🔍 Verify Everything is Working

1. **Test Navigation Health**:
   ```bash
   npm run navigation:health
   ```

2. **Test Link Updates**:
   - Change a page slug in Sanity Studio
   - Publish the change
   - Refresh your site - navigation should show the new URL

3. **Test Reference Protection**:
   - Try to delete a page that's in navigation
   - You should see an error preventing deletion

## 🚨 Troubleshooting

### Webhook Not Triggering
- Check webhook is enabled in Sanity
- Verify the URL is correct (including `/api/revalidate`)
- Check Vercel function logs for errors

### Signature Validation Failing
- Ensure the secret matches exactly (no extra spaces)
- Check the webhook configuration in Sanity
- Verify environment variable is set in Vercel

### Changes Not Reflecting
- Since this is a SPA, you may need to refresh the page
- Check browser console for any errors
- Verify the frontend is fetching fresh data

## 📝 Important Notes

- Keep the webhook secret secure - never commit it to git
- The secret in this file is for your use only
- Consider rotating the secret every 90 days
- Monitor webhook performance in Sanity dashboard