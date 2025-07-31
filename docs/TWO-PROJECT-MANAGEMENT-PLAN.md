# ElPortal Two-Project Management Plan

## Executive Summary

This document provides a comprehensive strategy for managing the ElPortal ecosystem, which consists of two interconnected projects:
1. **elportal-forside-design** - Frontend React application
2. **sanityelpriscms** - Sanity CMS content backend

The plan ensures efficient development, seamless integration, and coordinated deployments while maintaining project independence.

## 1. Project Architecture Overview

### 1.1 Project Relationships
```
┌─────────────────────────────────────────────────────────────────┐
│                        ElPortal Ecosystem                        │
├─────────────────────────┬───────────────────────────────────────┤
│   Frontend (React)      │        Backend (Sanity CMS)           │
├─────────────────────────┼───────────────────────────────────────┤
│ • User Interface        │ • Content Management                  │
│ • Real-time Data        │ • Schema Definitions                  │
│ • SEO Rendering         │ • Provider Database                   │
│ • API Integration       │ • Page Builder                        │
│ • Interactive Tools     │ • Asset Management                    │
└─────────────────────────┴───────────────────────────────────────┘
```

### 1.2 Key Integration Points
- **Content API**: Frontend fetches content via GROQ queries
- **Type Definitions**: Shared TypeScript interfaces
- **Schema Validation**: Zod schemas generated from Sanity
- **SEO Generation**: Direct API content creation
- **Asset Pipeline**: Images and icons served from Sanity

## 2. Development Workflow Management

### 2.1 Synchronized Development Process

#### Daily Development Setup
```bash
# Terminal 1: Sanity Studio
cd ~/Desktop/projects/sanityelpriscms
npm run dev  # http://localhost:3333

# Terminal 2: Frontend Application
cd ~/Desktop/projects/elportal-forside-design
npm run dev  # http://localhost:8080

# Terminal 3: Type Watching (if schema changes)
cd ~/Desktop/projects/elportal-forside-design
npm run generate:types -- --watch
```

#### Schema Change Workflow
1. **Modify Schema** in sanityelpriscms
2. **Deploy to Sanity** via `sanity deploy`
3. **Generate Types** in frontend via `npm run generate:types`
4. **Update Components** to match new schema
5. **Test Integration** end-to-end

### 2.2 Branch Strategy

#### Coordinated Branching
```
Feature Development:
├── sanityelpriscms/feature/add-new-component
└── elportal-forside-design/feature/add-new-component

Hotfixes:
├── sanityelpriscms/hotfix/fix-schema-validation
└── elportal-forside-design/hotfix/fix-schema-validation
```

#### Branch Naming Convention
- **Feature**: `feature/[ticket-id]-brief-description`
- **Bugfix**: `bugfix/[ticket-id]-brief-description`
- **Hotfix**: `hotfix/[ticket-id]-brief-description`
- **Release**: `release/v[major].[minor].[patch]`

### 2.3 Code Review Process

#### Cross-Project Reviews
1. **Schema Changes**: Review both Sanity schema AND frontend type usage
2. **Component Changes**: Verify Sanity content structure compatibility
3. **API Changes**: Check both data source AND consumer
4. **Performance**: Consider impact on both projects

#### Review Checklist
- [ ] Schema changes deployed to Sanity?
- [ ] Types regenerated in frontend?
- [ ] Both ContentBlocks.tsx AND SafeContentBlocks.tsx updated?
- [ ] GROQ queries updated for new fields?
- [ ] Breaking changes documented?
- [ ] Migration scripts provided if needed?

## 3. Content Block Management

### 3.1 Adding New Content Blocks (Critical Process)

#### Step-by-Step Process
```
1. Sanity CMS (sanityelpriscms):
   ├── Create schema in schemaTypes/
   ├── Export in schemaTypes/index.ts
   ├── Add to contentBlocks in page.ts
   └── Add to contentBlocks in homePage.ts

2. Frontend (elportal-forside-design):
   ├── Run type generation
   ├── Add TypeScript interface
   ├── Update ContentBlock union
   ├── Add GROQ fragments (both queries!)
   ├── Add to ContentBlocks.tsx
   ├── Add to SafeContentBlocks.tsx
   └── Create React component
```

#### Validation Points
- Sanity Studio preview working?
- Types compile without errors?
- Component renders on both homepage and pages?
- No console errors in development?
- Content editable in Sanity Studio?

### 3.2 Schema Validation Strategy

#### Pre-deployment Validation
```typescript
// Always validate before Sanity API calls
import { PageSchema } from '@/lib/sanity-schemas.zod';

const validateContent = (content: unknown) => {
  try {
    return PageSchema.parse(content);
  } catch (error) {
    console.error('Validation failed:', error);
    // Handle or fix validation errors
  }
};
```

#### Common Validation Errors
- `hero` uses `headline/subheadline` NOT `title/subtitle`
- `valueItem` uses `heading` NOT `title`
- PageSection restrictions on allowed content types
- Missing required fields or wrong field types

## 4. API Integration Management

### 4.1 External API Coordination

#### EnergiDataService Integration
```
Rate Limits:
├── 40 requests / 10 seconds per IP
├── Cached for 1 hour via Vercel Edge
└── Fallback to cached data on failure
```

#### API Error Handling
1. **Primary**: Try live API
2. **Fallback**: Use cached data
3. **Ultimate Fallback**: Show informative error state
4. **Monitoring**: Log all failures for analysis

### 4.2 Sanity API Management

#### Query Optimization
```typescript
// Efficient GROQ queries with projections
const query = `*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  sections[]{
    ...,
    _type == "reference" => @->{
      _type,
      _id,
      ...
    }
  }
}`;
```

#### Content Versioning
- Track schema versions in both projects
- Document breaking changes
- Provide migration paths
- Test with production data

## 5. Deployment Coordination

### 5.1 Deployment Strategy

#### Independent Deployments
```
Normal Flow:
1. Deploy Sanity changes (instant)
2. Deploy Frontend (2-3 minutes)

Coordinated Release:
1. Deploy Sanity (tagged release)
2. Verify in Studio
3. Deploy Frontend (matching tag)
4. Smoke test integration
```

#### Deployment Checklist
- [ ] Schema changes backward compatible?
- [ ] Content migration completed?
- [ ] Environment variables updated?
- [ ] API endpoints verified?
- [ ] Rollback plan prepared?

### 5.2 Environment Management

#### Environment Variables
```
Frontend (.env):
├── VITE_SANITY_PROJECT_ID
├── VITE_SANITY_DATASET
├── VITE_SANITY_API_TOKEN (for writes)
└── VITE_PUBLIC_URL

Sanity (sanity.cli.ts):
├── Project ID
├── Dataset name
└── API version
```

#### Environment Sync
- Development: Both use development dataset
- Staging: Coordinated staging environment
- Production: Synchronized production releases

## 6. Testing Strategy

### 6.1 Cross-Project Testing

#### Integration Test Suite
```typescript
describe('Content Integration', () => {
  test('Homepage loads with all content blocks', async () => {
    // Test both ContentBlocks and SafeContentBlocks
  });
  
  test('Dynamic pages render correctly', async () => {
    // Test page-specific content blocks
  });
  
  test('API data updates in real-time', async () => {
    // Test live data integration
  });
});
```

#### End-to-End Testing
1. Create content in Sanity
2. Verify preview in Studio
3. Check frontend rendering
4. Test interactive features
5. Validate SEO output

### 6.2 Performance Testing

#### Metrics to Monitor
- Sanity query response time
- Frontend bundle size
- Time to interactive (TTI)
- API response caching effectiveness
- Image optimization performance

## 7. Monitoring and Maintenance

### 7.1 Monitoring Setup

#### Key Metrics
```
Frontend Monitoring:
├── Page load times
├── API call failures
├── JavaScript errors
├── User interactions
└── Conversion rates

CMS Monitoring:
├── Content publish times
├── Query performance
├── Asset delivery speed
├── Editor experience
└── API usage limits
```

#### Alert Configuration
- API failures > 5% → Immediate alert
- Page load time > 3s → Investigation
- Build failures → Block deployment
- Content sync issues → Editor notification

### 7.2 Regular Maintenance

#### Weekly Tasks
- Review error logs from both projects
- Check API rate limit usage
- Verify content sync status
- Update dependencies (security patches)

#### Monthly Tasks
- Performance audit
- Dependency updates
- Schema documentation review
- Clean up unused content

#### Quarterly Tasks
- Architecture review
- Security audit
- Scalability assessment
- Team knowledge sharing

## 8. Team Collaboration

### 8.1 Communication Protocols

#### Schema Changes
```
1. Announce in #dev-channel
2. Document in CHANGELOG
3. Create migration guide
4. Schedule pair programming
5. Update team wiki
```

#### Cross-Team Responsibilities
- **Frontend Team**: Component development, API integration
- **Content Team**: Schema design, content structure
- **DevOps**: Deployment, monitoring, performance
- **QA**: Integration testing, user acceptance

### 8.2 Knowledge Management

#### Documentation Requirements
- README files in both projects
- API documentation
- Schema field descriptions
- Component usage examples
- Troubleshooting guides

#### Onboarding New Developers
1. Architecture overview session
2. Local setup walkthrough
3. Schema and type system training
4. Deployment process review
5. Pair programming on first feature

## 9. Troubleshooting Guide

### 9.1 Common Issues

#### "Unknown content block type" Error
- Check SafeContentBlocks.tsx includes the block
- Verify GROQ query includes the fields
- Ensure types are regenerated

#### Content Not Updating
- Clear Sanity CDN cache
- Check API token permissions
- Verify dataset is correct
- Review GROQ query projections

#### Type Mismatches
- Regenerate types from Sanity
- Check for schema deployment
- Verify field naming conventions
- Update TypeScript interfaces

### 9.2 Emergency Procedures

#### Production Hotfix Process
1. Create hotfix branches in both repos
2. Apply minimal fix
3. Test in staging environment
4. Deploy Sanity first
5. Deploy Frontend immediately after
6. Monitor for 30 minutes
7. Merge back to main

#### Rollback Procedure
- Frontend: Vercel instant rollback
- Sanity: Restore from dataset backup
- Coordinate timing for consistency

## 10. Future Improvements

### 10.1 Technical Enhancements
- Shared type package (npm)
- Automated schema validation
- CI/CD pipeline improvements
- Monorepo consideration
- GraphQL API layer

### 10.2 Process Improvements
- Automated testing suite
- Visual regression testing
- Performance budgets
- Automated dependency updates
- Schema version management

## Appendix A: Quick Reference

### Essential Commands
```bash
# Frontend
npm run dev                  # Start development
npm run build               # Production build
npm run generate:types      # Update Sanity types
npm run preview            # Preview production build

# Sanity
npm run dev                # Start studio
sanity deploy             # Deploy to production
sanity manage             # Open project settings
sanity graphql deploy     # Deploy GraphQL API
```

### Key Files to Know
```
Frontend:
├── src/components/ContentBlocks.tsx
├── src/components/SafeContentBlocks.tsx
├── src/types/sanity.ts
├── src/lib/sanity.ts
└── .env

Sanity:
├── schemaTypes/
├── sanity.config.ts
├── sanity.cli.ts
└── static/
```

### Contact Points
- **Frontend Issues**: Check ContentBlocks first
- **Content Issues**: Verify schema structure
- **Integration Issues**: Check GROQ queries
- **Performance Issues**: Review caching strategy

---

*This management plan is a living document. Update it as processes evolve and lessons are learned.*