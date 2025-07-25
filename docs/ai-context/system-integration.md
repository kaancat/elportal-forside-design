# ElPortal System Integration Documentation

## Overview

ElPortal operates as a sophisticated two-project ecosystem designed for Danish electricity price comparison. The system integrates the frontend application and Sanity CMS with external data sources to deliver real-time pricing information and SEO-optimized content.

## System Architecture

### Two-Project Ecosystem

```
┌─────────────────────────┐     ┌─────────────────────────┐
│  Frontend Application   │     │    Sanity CMS           │
│  - React/TypeScript     │◀────│  - Content Storage      │
│  - Real-time Updates    │     │  - 23 Schema Types      │
│  - Interactive Charts   │     │  - Page Builder         │
│  - SEO Page Generation  │────▶│  - API Content Creation │
└─────────────────────────┘     └─────────────────────────┘
                    │                       ▲
                    │                       │
                    ▼                       │
┌─────────────────────────┐                 │
│   External APIs         │                 │
│  - EnergiDataService    │                 │
│  - Electricity Prices   │                 │
│  - Production Data      │                 │
└─────────────────────────┘                 │
                                           │
┌─────────────────────────┐                 │
│   AI Content Generation │─────────────────┘
│  - Direct Sanity API    │
│  - Danish SEO Content   │
└─────────────────────────┘
```

## API Integration Patterns

### 1. Sanity Content API
- **Protocol**: HTTPS REST with GROQ queries
- **Authentication**: Public read, authenticated write
- **Caching**: CDN-enabled with real-time updates
- **Key Patterns**:
  ```typescript
  // Fetching homepage with all content blocks
  *[_type == "homePage"][0]{
    ...,
    sections[]{
      ...,
      _type == "provider" => @->{...}
    }
  }
  ```

### 2. EnergiDataService Integration
- **Endpoints Used**:
  - `/dataset/Elspotprices` - Hourly electricity prices
  - `/dataset/ProductionConsumptionSettlement` - Production data
  - `/dataset/Forecasts_Hour` - Renewable energy forecasts
  - `/dataset/DatahubPricelist` - Provider price lists
- **Rate Limits**: 40 requests per 10 seconds per IP
- **Caching Strategy**: 1-hour edge cache for price data

### 3. OpenRouter AI Integration
- **Purpose**: SEO content generation
- **Models**: Claude 3 Opus/Sonnet
- **Validation**: Multi-stage with auto-fix
- **Output**: NDJSON for Sanity import

## Data Flow Patterns

### Content Creation Flow
```
1. User Input (SEO Builder) 
   ↓
2. AI Generation (OpenRouter)
   ↓
3. Validation & Auto-fix
   ↓
4. NDJSON Generation
   ↓
5. Sanity Import
   ↓
6. Frontend Display
```

### Real-time Data Flow
```
1. User Interaction
   ↓
2. Vercel Serverless Function
   ↓
3. EnergiDataService API
   ↓
4. Data Transformation
   ↓
5. Frontend Update
```

## Cross-Project Communication

### Shared Resources
1. **Type Definitions**: Currently duplicated, should be unified
2. **Provider Data**: Managed in Sanity, referenced everywhere
3. **Theme/Styling**: Consistent Tailwind configuration
4. **Business Logic**: Price calculations shared via documentation

### Integration Points
1. **Sanity Schemas ↔ Frontend Components**: 1:1 mapping
2. **SEO Builder ↔ Sanity**: NDJSON import format
3. **Frontend ↔ APIs**: Serverless function proxy layer

## Development Workflows

### Local Development Setup
```bash
# Terminal 1: Sanity Studio
cd sanityelpriscms
npm run dev  # http://localhost:3333

# Terminal 2: Frontend
cd elportal-forside-design
npm run dev  # http://localhost:8080

# Terminal 3: SEO Builder (when needed)
# Direct API approach - no separate project needed
npm run dev  # http://localhost:3000
```

### Cross-Project Dependencies
- Frontend depends on Sanity schemas
- SEO Builder depends on schema manifest
- All projects independent for deployment

## Testing Strategy

### Integration Testing
1. **Content Flow**: SEO Builder → Sanity → Frontend
2. **Data Updates**: API changes reflect immediately
3. **Schema Changes**: Update manifest and types
4. **Provider Management**: Consistent sorting/display

### End-to-End Testing
- User journey from content creation to display
- Price calculator accuracy verification
- Real-time data update validation
- SEO content quality assurance

## Performance Optimization

### Caching Layers
1. **Sanity CDN**: Global content delivery
2. **Vercel Edge**: Function results caching
3. **React Query**: Client-side cache (planned)
4. **Static Generation**: For SEO pages

### Optimization Strategies
- Lazy loading for heavy components
- Image optimization via Sanity
- API response caching
- Bundle size optimization

## Error Handling

### Graceful Degradation
- Empty states for failed API calls
- Fallback content from cache
- User-friendly error messages
- Automatic retry mechanisms

### Monitoring Points
- API response times
- Content sync status
- Build success rates
- User interaction errors

## Security Considerations

### Current Implementation
- Public read-only content
- No user authentication
- No personal data storage
- HTTPS everywhere

### API Security
- Rate limiting protection
- No API keys in frontend
- Serverless function proxy
- Input validation

## Future Integration Plans

### Planned Enhancements
1. **User Authentication**: For personalized experiences
2. **Analytics Integration**: Usage tracking and insights
3. **Payment Processing**: For provider switching
4. **Email Notifications**: Price alerts and updates
5. **Mobile Apps**: Native iOS/Android applications

### Scalability Considerations
- Microservices architecture ready
- Database sharding capability
- Multi-region deployment
- Horizontal scaling support

## Maintenance Guidelines

### Regular Tasks
1. **Weekly**: Check API compatibility
2. **Monthly**: Review error logs
3. **Quarterly**: Update dependencies
4. **Yearly**: Architecture review

### Change Management
- Schema changes require manifest updates
- API changes need type updates
- New features need documentation
- Breaking changes need migration plans

## Critical Integration Lessons

### Dual Content Renderer System
The frontend uses TWO content block renderers:
- **ContentBlocks.tsx**: Used by regular pages via `getPageBySlug()`
- **SafeContentBlocks.tsx**: Used by homepage via `getHomePage()` with error boundaries

**When adding new content blocks, you MUST:**
1. Add schema to Sanity CMS (`/sanityelpriscms/schemaTypes/`)
2. Export schema in index.ts
3. Add to contentBlocks arrays in BOTH page.ts AND homePage.ts
4. Add TypeScript interface to `/src/types/sanity.ts`
5. Update ContentBlock union type
6. Add GROQ fragments to BOTH getHomePage() AND getPageBySlug()
7. Add component imports and cases to BOTH ContentBlocks.tsx AND SafeContentBlocks.tsx
8. Create the React component

**Common Error**: "Unknown content block type" usually means the block is missing from SafeContentBlocks.tsx