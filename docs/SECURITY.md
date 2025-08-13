# 🔒 DinElportal Security Guidelines

## Environment Variables

### ✅ Security Rules

1. **VITE_ Prefix = Public**
   - These variables are bundled into client-side code
   - ONLY use for non-sensitive configuration
   - Examples: Project IDs, dataset names, API versions

2. **No Prefix = Private**
   - These stay server-side only
   - Use for ALL sensitive data
   - Examples: API tokens, secrets, passwords

### ⚠️ NEVER Do This:
```bash
# ❌ WRONG - Exposes token to browser!
VITE_SANITY_API_TOKEN=sk_xxx
VITE_SMITHERY_API_KEY=xxx
VITE_ELOVERBLIK_TOKEN=xxx
```

### ✅ ALWAYS Do This:
```bash
# ✅ CORRECT - Stays server-side
SANITY_API_TOKEN=sk_xxx
SMITHERY_API_KEY=xxx
ELOVERBLIK_API_TOKEN=xxx

# ✅ CORRECT - Public config only
VITE_SANITY_PROJECT_ID=yxesi03x
VITE_SANITY_DATASET=production
```

## API Security Architecture

### Client → Server → External API

All sensitive operations MUST go through server-side API routes:

```
[Browser] → [/api/sanity/*] → [Sanity API]
          ↑                  ↓
     (No tokens)      (With server token)
```

### Secure API Routes

#### Sanity Operations
- `/api/sanity/create-page` - Create new pages
- `/api/sanity/update-content` - Update existing content
- All mutations require server-side `SANITY_API_TOKEN`

#### Smithery MCP Gateway
- `/api/smithery/search` - Search for MCP servers
- `/api/smithery/use-tool` - Execute MCP tools
- All operations use server-side `SMITHERY_API_KEY`

#### Eloverblik Integration
- `/api/eloverblik/auth` - OAuth authentication
- `/api/eloverblik/consumption` - Fetch user data
- All operations use server-side `ELOVERBLIK_API_TOKEN`

## Vercel Deployment

### Environment Variable Setup

1. **Add variables in Vercel Dashboard**
2. **Mark sensitive variables as "Sensitive"**
3. **Never expose tokens in logs or errors**

### Sensitive Variables (Hide with ••••••••):
- `SANITY_API_TOKEN`
- `SMITHERY_API_KEY`
- `ELOVERBLIK_API_TOKEN`
- `SANITY_WEBHOOK_SECRET`

### Public Variables (Visible):
- `VITE_SANITY_PROJECT_ID`
- `VITE_SANITY_DATASET`
- `VITE_SANITY_API_VERSION`

## Token Rotation

### When to Rotate
- After any suspected exposure
- Every 90 days as best practice
- After team member changes
- After security incidents

### How to Rotate
1. Generate new token in service dashboard
2. Update in Vercel environment variables
3. Deploy to apply changes
4. Revoke old token
5. Verify functionality

## Data Privacy

### Eloverblik Data
- **Never store** consumption data
- **Always fetch** on-demand
- **Session-based** authentication only
- **Auto-expire** after 30 minutes

### User Data Principles
- Minimize data collection
- No persistent storage of sensitive data
- Clear session data on logout
- Use secure HTTPS only

## Security Checklist

Before each deployment:

- [ ] No VITE_ prefixed secrets in .env
- [ ] All API tokens server-side only
- [ ] Sensitive Vercel vars marked as "Sensitive"
- [ ] No hardcoded tokens in code
- [ ] No tokens in console.log statements
- [ ] API routes validate input
- [ ] Error messages don't leak sensitive info
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Sessions expire appropriately

## Incident Response

If a token is exposed:

1. **Immediately** rotate the token
2. **Revoke** the old token
3. **Audit** logs for unauthorized use
4. **Update** all environments
5. **Document** the incident
6. **Review** security practices

## Contact

Security concerns? Contact the development team immediately.
Do not post security issues publicly.