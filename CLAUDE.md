# ElPortal - AI Context (claude-master)

## 1. Project Overview
- **Vision:** Denmark's most trusted electricity price comparison platform, empowering consumers with real-time data and transparent pricing
- **Business Goal:** Position Vindstød A/S as the recommended provider while maintaining fairness and transparency
- **Current Phase:** Production-ready with active development of new features
- **Architecture:** Two-project ecosystem - Frontend (React), CMS (Sanity)
- **Development Strategy:** Component-driven, headless CMS, real-time data integration, programmatic SEO

## 2. Two-Project Architecture

### elportal-forside-design (This Project - Frontend)
- **Tech Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Purpose:** User-facing web application
- **Key Features:** Real-time price graphs, interactive calculator, provider comparison
- **Deployment:** Vercel with edge functions
- **SEO Generation:** Direct Sanity API integration for creating pages

### sanityelpriscms (Content Backend)
- **Tech Stack:** Sanity Studio v3 with 23 custom schemas
- **Purpose:** Headless CMS for all content management
- **Key Features:** Modular page builder, provider management, content validation
- **Access:** https://dinelportal.sanity.studio
- **API Integration:** Direct content creation via authenticated API

## 3. Critical Business Logic

### Provider Ranking Algorithm
```typescript
// Vindstød MUST appear first, then sort by price
function rankProviders(providers: Provider[]) {
  const vindstod = providers.find(p => p.slug === 'vindstod')
  const others = providers.filter(p => p.slug !== 'vindstod')
    .sort((a, b) => a.totalPrice - b.totalPrice)
  return [vindstod, ...others].filter(Boolean)
}
```

### Price Calculation Formula
```typescript
// All prices in Danish Kroner (DKK/kr)
const spotPrice = apiPrice // From EnergiDataService
const providerMarkup = provider.spotPriceFee // Provider's margin
const fixedFees = 0.19 + 0.90 // System fee + electricity tax
const subtotal = spotPrice + providerMarkup + fixedFees
const totalPrice = subtotal * 1.25 // Add 25% VAT
```

## 4. Component Architecture

### Content Block System (UNIFIED RENDERER)
- **ContentBlocks.tsx**: Unified router for 15+ content types with optional error boundaries
- **Dynamic Rendering**: Maps Sanity schemas to React components
- **Type Safety**: Full TypeScript with discriminated unions
- **Error Boundaries**: Optional via `enableErrorBoundaries={true}` prop (enabled for homepage)
- **IMPORTANT**: When adding new content blocks, update ContentBlocks.tsx renderContentBlock() function

### Key Interactive Components
1. **PriceCalculatorWidget**: Core conversion tool
2. **LivePriceGraphComponent**: Real-time electricity prices
3. **ProviderList**: Transparent comparison with Vindstød featured
4. **RenewableEnergyForecast**: Green energy predictions
5. **CO2EmissionsChart**: Real-time CO2 intensity visualization
6. **MonthlyProductionChart**: Historical energy production data

### Standard Component Features (REQUIRED for all statistics/chart components)
- **Header Alignment**: All statistics components MUST include `headerAlignment` field with left/center/right options
- **Rich Text Support**: Use `array` of `block` type for text fields that need formatting
- **Paragraph Spacing**: Ensure proper PortableText components for paragraph breaks
- **Responsive Design**: Mobile-first approach with proper scaling
- **Danish Language**: All UI text and labels in Danish

## 5. API Integrations

### EnergiDataService (Danish Energy Data)
- **Endpoints**: Elspotprices, ProductionConsumptionSettlement, Forecasts_Hour, CO2Emis, DeclarationProduction
- **Rate Limit**: 40 requests/10 seconds per IP
- **Caching**: 1-hour edge cache via Vercel functions

### Sanity Content API
- **Project ID**: yxesi03x
- **Dataset**: production
- **Pattern**: GROQ queries with reference expansion

## 6. Project Structure

**⚠️ CRITICAL: AI agents MUST read the [Project Structure documentation](/docs/ai-context/project-structure.md) before attempting any task to understand the complete technology stack, file tree and project organization.**

ElPortal follows a two-project architecture with the Frontend directly integrating with Sanity CMS. For the complete tech stack and file tree structure, see [docs/ai-context/project-structure.md](/docs/ai-context/project-structure.md).

## 3. Coding Standards & AI Instructions

### General Instructions
- Your most important job is to manage your own context. Always read any relevant files BEFORE planning changes.
- When updating documentation, keep updates concise and on point to prevent bloat.
- Write code following KISS, YAGNI, and DRY principles.
- When in doubt follow proven best practices for implementation.
- Do not commit to git without user approval.
- Do not run any servers, rather tell the user to run servers for testing.
- Always consider industry standard libraries/frameworks first over custom implementations.

### 🚨 CRITICAL: Sanity Schema Validation
When creating or modifying Sanity content, you MUST follow these rules to prevent validation errors:

1. **ALWAYS check actual schema files**: Check the schema files in `/sanityelpriscms/schemaTypes/` or use Sanity Studio preview to see correct field names
2. **NEVER guess field names**: Common mistakes:
   - `hero` uses `headline/subheadline` NOT `title/subtitle`
   - `valueProposition` uses `heading/valueItems` NOT `title/items`
   - `valueItem` uses `heading` NOT `title`
   - `featureItem` uses `title` NOT `name`
3. **Use correct field types**:
   - Icons must be `icon.manager` objects with full metadata
   - Images must be image objects with asset references
   - Rich text fields use Portable Text array structure
4. **CRITICAL: PageSection content restrictions**:
   - ✅ ALLOWED in pageSection.content: `block` (text), `image` ONLY
   - ❌ NOT ALLOWED in pageSection.content: ANY dynamic components (`livePriceGraph`, `renewableEnergyForecast`, `monthlyProductionChart`, `priceCalculator`, `realPriceComparisonTable`, `videoSection`, `valueProposition`, `priceExampleTable`, `faqGroup`, `featureList`, `providerList`, `hero`, `heroWithCalculator`, `callToActionSection`)
   - ALL dynamic components must be top-level contentBlocks, NOT nested inside pageSection.content
   - PageSection is for text and image content only - use top-level blocks for interactive components
5. **Validate before saving**: Use the generated Zod schemas at `src/lib/sanity-schemas.zod.ts`
6. **Include all required fields**: Check schema documentation for validation rules

Example of correct content creation:
```typescript
import { HeroSchema } from '@/lib/sanity-schemas.zod';

const heroContent = {
  _type: 'hero',
  _key: generateKey(),
  headline: 'Din Elportal', // NOT 'title'!
  subheadline: 'Spar på strøm', // NOT 'subtitle'!
  image: { _type: 'image', asset: { _type: 'reference', _ref: 'asset-id' } }
};

// Validate before sending to Sanity
const validated = HeroSchema.parse(heroContent);

// CORRECT page structure:
const pageContent = {
  contentBlocks: [
    {
      _type: 'pageSection',
      content: [
        { _type: 'block', ... }, // ✅ Text content
        { _type: 'livePriceGraph', ... } // ✅ Allowed embedded component
      ]
    },
    {
      _type: 'valueProposition', // ✅ Top-level, not nested
      heading: 'Our values',
      items: [...]
    }
  ]
};
- Never mock anything. Never use placeholders. Never omit code.
- Apply SOLID principles where relevant. Use modern framework features rather than reinventing solutions.
- Be brutally honest about whether an idea is good or bad.
- Make side effects explicit and minimal.
- Design database schema to be evolution-friendly (avoid breaking changes).


### File Organization & Modularity
- Default to creating multiple small, focused files rather than large monolithic ones
- Each file should have a single responsibility and clear purpose
- Keep files under 350 lines when possible - split larger files by extracting utilities, constants, types, or logical components into separate modules
- Separate concerns: utilities, constants, types, components, and business logic into different files
- Prefer composition over inheritance - use inheritance only for true 'is-a' relationships, favor composition for 'has-a' or behavior mixing

- Follow existing project structure and conventions - place files in appropriate directories. Create new directories and move files if deemed appropriate.
- Use well defined sub-directories to keep things organized and scalable
- Structure projects with clear folder hierarchies and consistent naming conventions
- Import/export properly - design for reusability and maintainability

### TypeScript Standards (REQUIRED)
- **Always** use explicit types for function parameters and returns
- Define interfaces for all component props
- Use discriminated unions for content blocks
- Avoid `any` type - use `unknown` if type is truly unknown

```typescript
// Component props
interface PriceCalculatorProps {
  variant: 'standalone' | 'hero'
  initialConsumption?: number
  onCalculate: (result: CalculationResult) => void
}

// API responses
interface PriceData {
  timestamp: string
  region: 'DK1' | 'DK2'
  spotPrice: number
  totalPrice: number
}
```

### Naming Conventions
- **Components**: PascalCase (e.g., `PriceCalculatorWidget`)
- **Functions**: camelCase (e.g., `calculatePrice`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_CONSUMPTION`)
- **Types/Interfaces**: PascalCase with descriptive names (e.g., `ProviderData`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useCalculator`)
- **Files**: PascalCase for components, camelCase for utilities


### Documentation Requirements
- Document complex business logic and algorithms
- Add JSDoc comments for exported functions
- Include examples for component usage
- Document integration points and data flows

```typescript
/**
 * Calculates total electricity price including all fees and VAT
 * @param spotPrice - Raw spot price from API (øre/kWh)
 * @param provider - Provider with fee structure
 * @returns Total price in kr/kWh
 */
function calculateTotalPrice(spotPrice: number, provider: Provider): number {
  const fees = 0.19 + 0.90 // System + electricity tax
  return (spotPrice/100 + provider.spotPriceFee + fees) * 1.25
}
```

### Sanity CMS Plugin Integration
- **Field Types Must Match Exactly**: Always use precise field type syntax from plugin documentation (e.g., `'icon.manager'` not `'IconManager'`)
- **Import Names Matter**: Use exact import names from plugin exports (check node_modules if uncertain)
- **Schema Validation is Strict**: Run `sanity build` after schema changes to catch validation errors early
- **Plugin Data Structures**: Frontend components must handle actual plugin output, not assumed formats
- **Version Management**: Keep plugins updated for compatibility and bug fixes
- **Documentation First**: Read plugin docs thoroughly - small syntax differences cause critical errors

### Security First
- Never trust external inputs - validate everything at the boundaries
- Keep secrets in environment variables, never in code
- Log security events (login attempts, auth failures, rate limits, permission denials) but never log sensitive data (audio, conversation content, tokens, personal info)
- Authenticate users at the API gateway level - never trust client-side tokens
- Use Row Level Security (RLS) to enforce data isolation between users
- Design auth to work across all client types consistently
- Use secure authentication patterns for your platform
- Validate all authentication tokens server-side before creating sessions
- Sanitize all user inputs before storing or processing

### Error Handling
- Use specific exceptions over generic ones
- Always log errors with context
- Provide helpful error messages
- Fail securely - errors shouldn't reveal system internals

### Observable Systems & Logging Standards
- Every request needs a correlation ID for debugging
- Structure logs for machines, not humans - use JSON format with consistent fields (timestamp, level, correlation_id, event, context) for automated analysis
- Make debugging possible across service boundaries

### State Management
- Have one source of truth for each piece of state
- Make state changes explicit and traceable
- Design for multi-service voice processing - use session IDs for state coordination, avoid storing conversation data in server memory
- Keep conversation history lightweight (text, not audio)

### API Design Principles
- RESTful design with consistent URL patterns
- Use HTTP status codes correctly
- Version APIs from day one (/v1/, /v2/)
- Support pagination for list endpoints
- Use consistent JSON response format:
  - Success: `{ "data": {...}, "error": null }`
  - Error: `{ "data": null, "error": {"message": "...", "code": "..."} }`


## 4. MCP Server Integrations

### Gemini Consultation Server
**When to use:**
- Complex coding problems requiring deep analysis or multiple approaches
- Code reviews and architecture discussions
- Debugging complex issues across multiple files
- Performance optimization and refactoring guidance
- Detailed explanations of complex implementations
- Highly security relevant tasks

**Key context files:**
- Attach `/docs/ai-context/project-structure.md` - Complete project structure and tech stack
- Include relevant code files for the specific problem

**Usage patterns:**
```python
# New consultation session with context
mcp__gemini__consult_gemini(
    specific_question="How should I optimize this voice pipeline?",
    problem_description="Need to reduce latency in real-time audio processing",
    code_context="Current pipeline processes audio sequentially...",
    attached_files=[
        "src/core/pipelines/voice_pipeline.py"  # Your specific files
    ],
    preferred_approach="optimize"
)

# Follow-up in existing session
mcp__gemini__consult_gemini(
    specific_question="What about memory usage?",
    session_id="session_123",
    additional_context="Implemented your suggestions, now seeing high memory usage"
)
```

**Key capabilities:**
- Persistent conversation sessions with context retention
- File attachment and caching for multi-file analysis
- Specialized assistance modes (solution, review, debug, optimize, explain)
- Session management for complex, multi-step problems

**Important:** Treat Gemini's responses as advisory feedback. Evaluate the suggestions critically, incorporate valuable insights into your solution, then proceed with your implementation.

### Context7 Documentation Server
**Repository**: [Context7 MCP Server](https://github.com/upstash/context7)

**When to use:**
- Working with external libraries/frameworks (React, FastAPI, Next.js, etc.)
- Need current documentation beyond training cutoff
- Implementing new integrations or features with third-party tools
- Troubleshooting library-specific issues

**Usage patterns:**
```python
# Resolve library name to Context7 ID
mcp__context7__resolve_library_id(libraryName="react")

# Fetch focused documentation
mcp__context7__get_library_docs(
    context7CompatibleLibraryID="/facebook/react",
    topic="hooks",
    tokens=8000
)
```

**Key capabilities:**
- Up-to-date library documentation access
- Topic-focused documentation retrieval
- Support for specific library versions
- Integration with current development practices

### Smithery MCP Gateway
**Documentation**: [Using MCP Servers](/docs/development/using-mcp-servers.md)

**When to use:**
- Finding images for components (Unsplash, stock photos)
- Analyzing competitor websites
- Researching content for SEO pages
- Any task requiring external tools or services

**Usage patterns:**
```bash
# Search for MCP servers
npm run mcp:search "image stock photos"

# Use a specific server
npm run mcp:use @unsplash/mcp search -- --args '{"query": "wind turbines"}'

# List available tools
npm run mcp:use @smithery-ai/fetch --list
```

**Key capabilities:**
- Access to 8,000+ MCP servers without installation
- Dynamic tool discovery and usage
- Unified gateway with single API key
- Perfect for development tasks like finding images, analyzing competitors, generating content



## 5. ElPortal-Specific Patterns

### Content Block Rendering
When adding new content blocks:
1. Define schema in Sanity CMS
2. Create corresponding React component
3. Add to BOTH ContentBlocks.tsx AND SafeContentBlocks.tsx
4. Define TypeScript interface matching schema
5. Add GROQ query fragments for both getHomePage() and getPageBySlug()
6. Update contentBlocks arrays in both page.ts and homePage.ts schemas

### API Data Integration
```typescript
// Pattern for fetching live data
const LiveComponent = ({ block }: { block: LiveDataBlock }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['prices', block.region],
    queryFn: () => fetchPrices(block.region),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
  // Component implementation
}
```

### Provider Management
- Always fetch providers from Sanity (source of truth)
- Apply Vindstød-first sorting after fetch
- Cache provider data appropriately
- Show transparent pricing breakdown

## 6. Technical Debt & Known Issues

### Recently Addressed ✅
- **Documentation cleanup** - Removed 150+ outdated files (Feb 2025)
- **Security improvement** - Removed exposed API tokens from scripts/
- **Agent updates** - All agents now use real-time code checking instead of static docs

### High Priority
- **TypeScript strict mode disabled** - Gradual migration needed
- **No shared types package** - Types duplicated across projects
- **No test coverage** - Critical for reliability

### Medium Priority
- **Direct Sanity queries** - Should use React Query
- **CSS import warning** - @import order in index.css needs fixing
- **Large bundle size** - 2.5MB main chunk needs code splitting

### Future Considerations
- **User authentication** - For personalized features
- **PWA capabilities** - Offline functionality
- **Historical data analysis** - Trends and predictions
- **Smart energy recommendations** - Based on real-time data

## 7. Post-Task Completion Protocol
After completing any coding task, follow this checklist:

### 1. Type Safety & Quality Checks
Run the appropriate commands based on what was modified:
- **Frontend**: Run `npm run build` (includes tsc)
- **Sanity**: Deploy to studio and test
- **SEO Pages**: Validate content directly in Sanity Studio

### 2. Verification
- Ensure all type checks pass before considering the task complete
- Test Vindstød ranking is maintained
- Verify real-time data updates work
- Check responsive design on mobile

## 8. Icon Management
ElPortal uses `sanity-plugin-icon-manager` with a sophisticated fallback system. See [/docs/ICON-USAGE-GUIDE.md](/docs/ICON-USAGE-GUIDE.md) for:
- Priority-based icon display system (handles VP1/VP2 format differences)
- Available icon collections and common ElPortal icons
- Troubleshooting guide for icon display issues
- Best practices for icon implementation

## 9. Content Management Best Practices

### 🚨 Content Update Guidelines
**For simple content updates requested by the user**, use the existing API connection to directly read/write changes. The .env file contains Sanity API credentials for this purpose.

**When to use direct API updates:**
- User specifically requests immediate content changes
- Simple field updates (alignment, text, settings)
- Quick fixes or adjustments to existing content
- Testing or verifying content changes

**When to use Sanity Studio (https://dinelportal.sanity.studio):**
- Complex content creation requiring visual preview
- Managing media assets and uploads
- Exploring content structure
- User prefers visual interface

**Only create NEW API scripts when:**
- Bulk importing/migrating large amounts of data
- Automating repetitive content creation (e.g., 50+ similar pages)
- Integrating with external data sources
- Performing complex content transformations

**For routine updates**, use existing scripts in the `scripts/` directory when available (e.g., `update-homepage-alignment.ts`).

## 10. SEO Page Generation Process (Direct API Method)

### Overview
ElPortal uses a direct AI-to-Sanity content generation approach for creating comprehensive SEO-optimized pages. This process has proven successful for generating high-quality, Danish-language content that ranks well in search engines while subtly promoting Vindstød as the preferred provider.

### Key Success Factors
1. **Dual Role Approach**: Act as both a top UI/UX designer AND expert SEO copywriter
2. **Gemini Consultation**: Always consult Gemini for page structure, keywords, and SEO best practices
3. **Component-First Design**: Leverage existing Sanity components for consistent design
4. **Danish Content Excellence**: All content in native Danish with proper terminology
5. **Subtle Promotion**: Promote wind power and Vindstød without explicit mentions

### Page Generation Workflow

#### 1. Initial Planning Phase
```
- Research competitor pages (e.g., elberegner.dk, elpriser.dk)
- Analyze their content depth, structure, and keyword usage
- Consult Gemini for:
  - Optimal page structure
  - Target keywords (Danish)
  - SEO best practices for the topic
  - Content outline
```

#### 2. Content Requirements
- **Word Count**: 1000-2000 words minimum
- **Language**: Danish (proper electricity market terminology)
- **Tone**: Authoritative yet approachable
- **Structure**: Hero → Key Content (e.g., Provider List) → Supporting Sections
- **API Components**: Integrate live data visualizations throughout

#### 3. Component Selection Strategy
- **Consult Gemini** for optimal page structure based on:
  - Page topic and user intent
  - Competitor analysis
  - SEO requirements
- **Consider user journey** when selecting and ordering components
- **Balance content types**: Mix text, data visualizations, and interactive elements
- **Each page is unique**: Let the content goals drive component selection

#### 4. Content Creation Process
1. **Create JSON structure** with all content blocks
2. **Write comprehensive Danish text** covering:
   - Technical explanations (electricity prices, grid areas, etc.)
   - Benefits of green energy (subtle Vindstød promotion)
   - Practical advice for consumers
   - Regional differences (DK1/DK2)
3. **Validate all fields** against Sanity schemas
4. **Use proper Portable Text format** for rich text fields

#### 5. Technical Implementation
```javascript
// Import script pattern
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Create or update page
const result = await client.createOrReplace({
  _id: `page.${slug}`,
  _type: 'page',
  ...pageContent
})
```

### Quality Checklist
- [ ] Consulted Gemini for structure and keywords
- [ ] 1000-2000+ words of Danish content
- [ ] Natural keyword integration
- [ ] API components add value, not just decoration
- [ ] Vindstød subtly positioned as premium choice
- [ ] All validation errors resolved
- [ ] Mobile-responsive design considered
- [ ] Internal linking strategy implemented

### Common Pitfalls to Avoid
1. **String vs Array Fields**: Many fields expect arrays (Portable Text), not strings
2. **Missing Required Fields**: Always check schema requirements
3. **Alignment Issues**: Use pageSection with headerAlignment for control
4. **Over-promotion**: Keep Vindstød promotion subtle and credible

### Proven Page Types
- **"Elpriser"**: Comprehensive price comparison with provider list focus
- **"Grøn Energi"**: Environmental benefits with renewable energy data
- **"Spar Penge"**: Savings calculator and tips
- **"DK1 vs DK2"**: Regional price differences explained

### Future Improvements
- Automate Gemini consultation with MCP integration
- Create reusable content templates
- Implement A/B testing for conversion optimization
- Add automated Danish grammar checking