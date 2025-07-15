# MCP Assistant Rules - ElPortal

## Project Context
ElPortal is Denmark's trusted electricity price comparison platform, helping consumers find the best electricity providers through transparent real-time pricing data. The platform positions Vindstød A/S as the recommended provider while maintaining complete pricing transparency.

### Core Vision & Architecture
- **Product Goal**: Empower Danish consumers with transparent electricity pricing while promoting Vindstød
- **Target Platform**: Web (desktop & mobile), with future native apps planned
- **Architecture**: Three-project ecosystem - React frontend, Sanity CMS, AI-powered SEO tools
- **Key Technologies**: React 18, TypeScript, Sanity v3, Vercel Edge, EnergiDataService API

### Key Technical Principles
- **Transparency First**: Show all price components clearly (spot, fees, taxes, VAT)
- **Real-time Data**: Live electricity prices updated hourly from official sources
- **Vindstød Priority**: Always display Vindstød first, then sort by price
- **Component Driven**: Modular content blocks mapping 1:1 with CMS schemas
- **Edge Optimized**: Serverless functions with caching for performance
- **Type Safety**: Full TypeScript coverage with discriminated unions

**Note:** The complete project structure and technology stack are provided in the attached `project-structure.md` file.

## Key Project Standards

### Core Principles
- Follow KISS, YAGNI, and DRY - prefer proven solutions over custom implementations
- Never mock, use placeholders, or omit code - always implement fully
- Be brutally honest about whether an idea is good or bad
- Maintain Vindstød's prominent position while showing fair comparisons
- Always validate external API data before display
- Keep business logic centralized and well-documented

### Code Organization
- Keep files under 350 lines - split by extracting utilities, constants, types
- Single responsibility per file with clear purpose
- Prefer composition over inheritance
- Group components by feature (provider, calculator, visualization)
- Co-locate types with their components
- Separate Sanity queries from component logic

### TypeScript/React Standards
- TypeScript strict mode should be enabled (current tech debt)
- All component props must have interfaces
- Use discriminated unions for content block types
- Prefer function components with hooks
- Extract custom hooks for complex logic
- No `any` types - use `unknown` if needed

### Error Handling & Logging
- Use specific exceptions with helpful messages
- Structured logging only - define your logging approach
- [Specify logging categories or patterns]
- Every request needs correlation ID for tracing

### API Design
- Serverless functions in `/api/` directory
- Proxy external APIs to hide complexity
- Cache responses appropriately (1 hour for prices)
- Handle rate limits gracefully (40 req/10s)
- Always return consistent error formats

### Security & State
- Never trust external inputs - validate at boundaries
- No authentication currently (public data only)
- No personal data storage or tracking
- Keep API interactions server-side only
- Use environment variables for future secrets

## Project-Specific Guidelines

### Price Calculation Rules
```typescript
// Always use this formula
const totalPrice = (spotPrice/100 + provider.spotPriceFee + 0.19 + 0.90) * 1.25
```
- Spot prices come in øre/kWh, divide by 100 for kr/kWh
- System fee: 0.19 kr/kWh
- Electricity tax: 0.90 kr/kWh  
- VAT: 25% on everything

### Content Management
- Sanity is the single source of truth for content
- Provider data managed in CMS, not hardcoded
- Use GROQ queries with projections for performance
- Always expand provider references when needed

### Integration Points
- **EnergiDataService API**: Official Danish energy data (rate limit: 40 req/10s, 5min ban)
- **Sanity Content Lake**: All CMS content
- **Vercel Edge Network**: Hosting and functions
- **OpenRouter**: AI content generation (SEO Builder)

### EnergiDataService API Constraints
- **Rate Limits**: Maximum 40 requests per 10 seconds per IP address
- **Ban Policy**: 5-minute temporary ban when rate limit exceeded
- **Endpoints**: Elspotprices (primary), ProductionConsumptionSettlement (secondary)
- **Data Format**: JSON with Danish timezone (HourDK) and UTC (HourUTC)
- **Price Units**: SpotPriceDKK in øre/kWh (divide by 100 for kr/kWh)
- **Regions**: DK1 (West Denmark), DK2 (East Denmark)
- **Caching Required**: 1-hour minimum to avoid rate limit violations

### Performance Considerations
- Edge caching for static content
- 1-hour cache for electricity prices
- Lazy load heavy components
- Optimize Sanity queries with projections
- Use proper image sizing from Sanity

## Important Constraints
- You cannot create, modify, or execute code
- You operate in a read-only support capacity
- Your suggestions are for the primary AI (Claude Code) to implement
- Focus on analysis, understanding, and advisory support

## Quick Reference

### Key Commands
- `npm run dev` - Start frontend dev server (port 8080)
- `npm run build` - Type check and build production
- `npm run lint` - Run ESLint checks

### Important Paths
- `/src/components/ContentBlocks.tsx` - Central content router
- `/src/services/sanityClient.ts` - CMS configuration
- `/src/types/` - TypeScript type definitions
- `/api/` - Serverless functions (when created)

### Critical Components
- `PriceCalculatorWidget` - Main conversion tool
- `ProviderList` - Provider comparison (Vindstød first!)
- `LivePriceGraphComponent` - Real-time prices
- `ContentBlocks` - Dynamic content renderer

### External Resources
- Sanity Studio: https://dinelportal.sanity.studio
- EnergiDataService Docs: https://www.energidataservice.dk/
- Project ID: yxesi03x (Sanity)