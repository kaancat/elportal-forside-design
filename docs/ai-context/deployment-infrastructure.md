# ElPortal Deployment & Infrastructure Documentation

## Overview

ElPortal uses a modern cloud-native deployment architecture leveraging Vercel for frontend hosting, Sanity.io for content management, and automated CI/CD through GitHub integration.

## Infrastructure Architecture

### Production Environment

```
┌─────────────────────┐
│    GitHub Repos     │
│  - Frontend         │
│  - Sanity CMS       │
│  - SEO Builder      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Vercel Platform    │     │  Sanity Cloud       │
│  - Edge Network     │     │  - Global CDN       │
│  - Serverless Funcs │     │  - Studio Hosting   │
│  - Auto Scaling     │     │  - API/Webhooks     │
└─────────────────────┘     └─────────────────────┘
           │                           │
           └───────────┬───────────────┘
                       ▼
              ┌─────────────────┐
              │   End Users     │
              │  - Web Visitors │
              │  - Content Team │
              └─────────────────┘
```

## Deployment Configuration

### Frontend (Vercel)

**Project Settings:**
```json
{
  "framework": "vite",
  "outputDirectory": "dist",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

**Environment Variables:**
- None required (all APIs are public)
- Optional: Analytics keys, monitoring tokens

**Serverless Functions:**
- Location: `/api/` directory
- Runtime: Node.js 18.x
- Memory: 1024 MB
- Timeout: 10 seconds

### Sanity CMS

**Deployment:**
- Studio URL: `https://dinelportal.sanity.studio`
- Dataset: `production`
- API Version: `2023-05-03`
- CDN: Enabled globally

**Access Control:**
- Public read access
- Authenticated write access
- Role-based permissions for editors

### SEO Page Generation

**Implementation:**
- Direct Sanity API integration
- No separate deployment needed
- Content creation via authenticated API calls
- Validation happens within Sanity

## CI/CD Pipeline

### Automated Deployment Flow

```yaml
# GitHub Actions Workflow (conceptual)
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    steps:
      - Checkout code
      - Install dependencies
      - Run type checking
      - Run linting
      - Run tests (when added)
      - Build production bundle
      - Deploy to Vercel
```

### Branch Strategy

- `main`: Production deployments
- `develop`: Staging environment
- `feature/*`: Preview deployments
- `hotfix/*`: Emergency fixes

### Preview Deployments

Every pull request gets:
- Unique preview URL
- Full functionality
- Isolated environment
- Automatic cleanup

## Environment Management

### Environment Types

1. **Production**
   - URL: `https://dinelportal.dk`
   - Full caching enabled
   - Error tracking active
   - Analytics enabled

2. **Preview**
   - URL: `https://[branch]-dinelportal.vercel.app`
   - Reduced caching
   - Debug mode available
   - Test data allowed

3. **Local Development**
   - URL: `http://localhost:8080`
   - No caching
   - Hot module replacement
   - Development APIs

### Configuration Management

```typescript
// Environment detection
const ENV = {
  isProd: process.env.NODE_ENV === 'production',
  isPreview: process.env.VERCEL_ENV === 'preview',
  isDev: process.env.NODE_ENV === 'development'
}
```

## Monitoring & Observability

### Current Implementation

1. **Vercel Analytics**
   - Page load performance
   - Web vitals tracking
   - Geographic distribution
   - Error rates

2. **Build Monitoring**
   - Build times
   - Bundle sizes
   - Deployment success rates
   - Function execution logs

### Planned Monitoring

1. **Application Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - User session replay
   - Custom event tracking

2. **API Monitoring**
   - Response times
   - Error rates
   - Rate limit tracking
   - Availability monitoring

## Performance Optimization

### Edge Network Strategy

1. **Static Assets**
   - Global CDN distribution
   - Immutable caching
   - Brotli compression
   - HTTP/3 support

2. **Dynamic Content**
   - Edge caching (1 hour)
   - Regional edge functions
   - Smart cache invalidation
   - Stale-while-revalidate

### Build Optimization

```javascript
// Vite optimizations
{
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/*'],
          'chart-vendor': ['recharts']
        }
      }
    }
  }
}
```

## Scaling Strategy

### Horizontal Scaling

1. **Frontend**
   - Automatic via Vercel
   - Global edge network
   - No manual intervention
   - Infinite scalability

2. **Content API**
   - Sanity handles scaling
   - Global CDN
   - Rate limiting protection
   - Webhook queuing

### Vertical Scaling

1. **Serverless Functions**
   - Increase memory allocation
   - Optimize cold starts
   - Use edge functions
   - Implement caching

## Security Infrastructure

### Security Headers

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### SSL/TLS

- Automatic HTTPS
- TLS 1.3 support
- HSTS enabled
- Certificate auto-renewal

## Disaster Recovery

### Backup Strategy

1. **Code**: Git repository (GitHub)
2. **Content**: Sanity automatic backups
3. **Configuration**: Version controlled
4. **Secrets**: Secure vault (when needed)

### Recovery Procedures

1. **Frontend Failure**
   - Rollback via Vercel dashboard
   - Previous deployment instant restore
   - Git revert if needed

2. **Content Loss**
   - Sanity point-in-time recovery
   - Export/import tools
   - Version history

## Cost Optimization

### Current Costs

1. **Vercel**: Free tier sufficient
2. **Sanity**: Free tier (10k API calls)
3. **Domain**: Annual registration
4. **APIs**: All free/public

### Scaling Costs

When scaling, monitor:
- Bandwidth usage
- Function executions
- API call volumes
- Build minutes

## Maintenance Procedures

### Regular Tasks

1. **Daily**
   - Monitor error rates
   - Check API availability

2. **Weekly**
   - Review performance metrics
   - Check security alerts

3. **Monthly**
   - Update dependencies
   - Review cost reports

4. **Quarterly**
   - Security audit
   - Performance review

### Emergency Procedures

1. **High Traffic**: Auto-scales
2. **API Outage**: Cached fallbacks
3. **Security Issue**: Immediate rollback
4. **Content Error**: Sanity revision history

## Future Infrastructure Plans

1. **Multi-Region Deployment**
   - EU and US regions
   - Geo-routing
   - Data residency compliance

2. **Enhanced Monitoring**
   - Full APM solution
   - Real user monitoring
   - Synthetic monitoring

3. **Advanced Caching**
   - Redis for API responses
   - Progressive web app
   - Offline functionality

4. **Container Strategy**
   - Docker for complex services
   - Kubernetes for orchestration
   - Service mesh for communication