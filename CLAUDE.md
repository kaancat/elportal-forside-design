# ElPortal - AI Context (claude-master)

## 1. Project Overview
- **Vision:** Denmark's most trusted electricity price comparison platform, empowering consumers with real-time data and transparent pricing
- **Business Goal:** Position Vindstød A/S as the recommended provider while maintaining fairness and transparency
- **Current Phase:** Production-ready with active development of new features
- **Architecture:** Three-project ecosystem - Frontend (React), CMS (Sanity), SEO Tools (AI-powered)
- **Development Strategy:** Component-driven, headless CMS, real-time data integration, programmatic SEO

## 2. Three-Project Architecture

### elportal-forside-design (This Project - Frontend)
- **Tech Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Purpose:** User-facing web application
- **Key Features:** Real-time price graphs, interactive calculator, provider comparison
- **Deployment:** Vercel with edge functions

### sanityelpriscms (Content Backend)
- **Tech Stack:** Sanity Studio v3 with 23 custom schemas
- **Purpose:** Headless CMS for all content management
- **Key Features:** Modular page builder, provider management, content validation
- **Access:** https://dinelportal.sanity.studio

### SEO-Page-Builder (Content Automation)
- **Tech Stack:** Next.js + TypeScript + OpenRouter AI
- **Purpose:** Generate SEO-optimized content at scale
- **Key Features:** AI content generation, NDJSON export, bulk operations
- **Integration:** Creates content for Sanity import

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

### Content Block System (CRITICAL: Two Renderers!)
- **ContentBlocks.tsx**: Central router for 15+ content types (used by regular pages)
- **SafeContentBlocks.tsx**: Error-boundary wrapped renderer (used by homepage and critical pages)
- **Dynamic Rendering**: Maps Sanity schemas to React components
- **Type Safety**: Full TypeScript with discriminated unions
- **IMPORTANT**: When adding new content blocks, you MUST update BOTH ContentBlocks.tsx AND SafeContentBlocks.tsx

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

ElPortal follows a three-project architecture with shared types and business logic. For the complete tech stack and file tree structure, see [docs/ai-context/project-structure.md](/docs/ai-context/project-structure.md).

## 3. Coding Standards & AI Instructions

### General Instructions
- Your most important job is to manage your own context. Always read any relevant files BEFORE planning changes.
- When updating documentation, keep updates concise and on point to prevent bloat.
- Write code following KISS, YAGNI, and DRY principles.
- When in doubt follow proven best practices for implementation.
- Do not commit to git without user approval.
- Do not run any servers, rather tell the user to run servers for testing.
- Always consider industry standard libraries/frameworks first over custom implementations.
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


## 4. Multi-Agent Workflows & Context Injection

### Automatic Context Injection for Sub-Agents
When using the Task tool to spawn sub-agents, the core project context (CLAUDE.md, project-structure.md, docs-overview.md) is automatically injected into their prompts via the subagent-context-injector hook. This ensures all sub-agents have immediate access to essential project documentation without the need of manual specification in each Task prompt.


## 5. MCP Server Integrations

### Gemini Consultation Server
**When to use:**
- Complex coding problems requiring deep analysis or multiple approaches
- Code reviews and architecture discussions
- Debugging complex issues across multiple files
- Performance optimization and refactoring guidance
- Detailed explanations of complex implementations
- Highly security relevant tasks

**Automatic Context Injection:**
- The kit's `gemini-context-injector.sh` hook automatically includes two key files for new sessions:
  - `/docs/ai-context/project-structure.md` - Complete project structure and tech stack
  - `/MCP-ASSISTANT-RULES.md` - Your project-specific coding standards and guidelines
- This ensures Gemini always has comprehensive understanding of your technology stack, architecture, and project standards

**Usage patterns:**
```python
# New consultation session (project structure auto-attached by hooks)
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



## 6. ElPortal-Specific Patterns

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

## 7. Technical Debt & Known Issues

### High Priority
- **TypeScript strict mode disabled** - Gradual migration needed
- **No shared types package** - Types duplicated across projects
- **No test coverage** - Critical for reliability

### Medium Priority
- **Direct Sanity queries** - Should use React Query
- **No error boundaries** - Add for better UX
- **Missing lazy loading** - For performance

### Future Considerations
- **User authentication** - For personalized features
- **PWA capabilities** - Offline functionality
- **Historical data analysis** - Trends and predictions
- **Smart energy recommendations** - Based on real-time data

## 8. Post-Task Completion Protocol
After completing any coding task, follow this checklist:

### 1. Type Safety & Quality Checks
Run the appropriate commands based on what was modified:
- **Frontend**: Run `npm run build` (includes tsc)
- **Sanity**: Deploy to studio and test
- **SEO Builder**: Validate generated NDJSON

### 2. Verification
- Ensure all type checks pass before considering the task complete
- Test Vindstød ranking is maintained
- Verify real-time data updates work
- Check responsive design on mobile