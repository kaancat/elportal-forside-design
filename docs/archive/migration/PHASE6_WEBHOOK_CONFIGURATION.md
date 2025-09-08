# [Archived] 🔗 Phase 6: Sanity Studio Webhook Configuration Guide

## 📋 **Webhook Configuration Requirements**

### **Production Webhook URL:** 
```
https://elportal.dk/api/revalidate
```

### **Configuration Steps:**

#### **1. Access Sanity Management Console**
1. Navigate to: `https://sanity.io/manage`
2. Select project: **DinElPortal** (Project ID: `yxesi03x`)
3. Go to **API** tab
4. Scroll to **Webhooks** section

#### **2. Create New Webhook**
**Basic Configuration:**
- **Name:** `Next.js Production Revalidation`
- **URL:** `https://elportal.dk/api/revalidate`
- **Dataset:** `production`
- **HTTP Method:** `POST`
- **API Version:** `v2021-03-25` (or latest)

**Trigger Configuration:**
- ✅ **Create** - When new content is created
- ✅ **Update** - When existing content is updated  
- ✅ **Delete** - When content is deleted

**Document Types (Leave filter empty to handle all types):**
- `page` - All CMS pages
- `siteSettings` - Navigation and global settings
- `provider` - Electricity provider data
- `homePage` - Homepage content (if exists)

#### **3. Security Configuration**
**Webhook Secret:**
- Use the exact value from your `SANITY_WEBHOOK_SECRET` environment variable
- **Length:** 44 characters (already verified as secure)
- **Format:** Random alphanumeric string

**⚠️ CRITICAL:** The secret in Sanity Studio must exactly match your environment variable value.

#### **4. Advanced Configuration**
**Projection:** Leave as default `{...}` (sends full document)
**Filter:** Leave empty (handles all document types)
**Include Drafts:** ❌ No (only published content)

## 🧪 **Testing Configuration**

### **1. Test Webhook Delivery**
After configuration, test by:
1. Edit any page in Sanity Studio
2. Publish the change
3. Check webhook delivery logs in Sanity Studio
4. Verify `200 OK` response

### **2. Verify Frontend Updates**
1. Check that content updates appear on frontend immediately
2. Open incognito browser to bypass cache
3. Verify `X-Vercel-Cache: MISS` header on first load after edit

### **3. Monitor Webhook Logs**
Check Vercel function logs for:
```
[Revalidation] Webhook received: { _type: "page", slug: "example" }
[Revalidation] Cache invalidation completed: { processingTime: "45ms" }
```

## 🔍 **Troubleshooting**

### **Common Issues:**

**❌ 401 Unauthorized Response:**
- Verify webhook secret matches environment variable exactly
- Check that secret has no extra whitespace or quotes

**❌ 500 Internal Server Error:**
- Check Vercel function logs for detailed error messages
- Verify Next.js deployment is successful

**❌ Content Not Updating:**
- Confirm cache tags match between queries and revalidation
- Check that page slug format is consistent

### **Health Check Endpoint:**
```
GET https://elportal.dk/api/revalidate
```
Returns webhook configuration status and requirements.

## 📊 **Expected Webhook Performance**

**Response Time:** < 100ms typical
**Success Rate:** > 99% with enhanced error handling
**Retry Logic:** Automatic via Sanity's built-in retry mechanism
**Cache Invalidation:** Granular, affecting only relevant content

## 🎯 **Phase 6 Success Criteria**

✅ Webhook delivers successfully to production URL  
✅ HMAC signature validation passes  
✅ Cache revalidation triggers for all content types  
✅ Frontend updates appear immediately after Studio edits  
✅ Comprehensive logging shows detailed revalidation activity  

Once all criteria are met, Phase 6 is complete and ready for Phase 7.
