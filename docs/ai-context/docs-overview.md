# Documentation Architecture

This project uses a **3-tier documentation system** that organizes knowledge by stability and scope, enabling efficient AI context loading and scalable development.

## How the 3-Tier System Works

**Tier 1 (Foundation)**: Stable, system-wide documentation that rarely changes - architectural principles, technology decisions, cross-component patterns, and core development protocols.

**Tier 2 (Component)**: Architectural charters for major components - high-level design principles, integration patterns, and component-wide conventions without feature-specific details.

**Tier 3 (Feature-Specific)**: Granular documentation co-located with code - specific implementation patterns, technical details, and local architectural decisions that evolve with features.

This hierarchy allows AI agents to load targeted context efficiently while maintaining a stable foundation of core knowledge.

## Documentation Principles
- **Co-location**: Documentation lives near relevant code
- **Smart Extension**: New documentation files created automatically when warranted
- **AI-First**: Optimized for efficient AI context loading and machine-readable patterns

## Tier 1: Foundational Documentation (System-Wide)

- **[Master Context](/CLAUDE.md)** - *Essential for every session.* Two-project architecture, business logic, coding standards, and known issues
- **[Project Structure](/docs/ai-context/project-structure.md)** - *REQUIRED reading.* Complete ElPortal ecosystem overview, tech stack, and file organization
- **[System Integration](/docs/ai-context/system-integration.md)** - *For cross-project work.* API patterns, data flow, Sanity-Frontend integration
- **[Deployment Infrastructure](/docs/ai-context/deployment-infrastructure.md)** - *Infrastructure patterns.* Vercel deployment, Sanity hosting, CI/CD, and monitoring
- **[Task Management](/docs/ai-context/handoff.md)** - *Session continuity.* Current status, technical debt, and prioritized improvements
- **[API Reference](/docs/ai-context/EnergiDataServiceAPI.md)** - *External API docs.* EnergiDataService endpoints, rate limits, and examples
- **[Sanity Icon Troubleshooting](/docs/SANITY_ICON_TROUBLESHOOTING.md)** - *Plugin integration guide.* SchemaError fixes, icon picker setup, and common pitfalls
- **[Direct SEO Page Generation](/docs/SEO_PAGE_GENERATION.md)** - *Direct API approach.* Creating SEO pages via Sanity API, content patterns, and validation

### Development Tools
- **[Using MCP Servers](/docs/development/using-mcp-servers.md)** - *Development efficiency.* Smithery gateway for accessing MCP servers, image search, competitor analysis, content generation
- **[Smithery Example Workflow](/docs/development/smithery-example-workflow.md)** - *Practical examples.* Finding images, analyzing competitors, generating content via MCP servers

## Tier 2: Component-Level Documentation

### ElPortal Architecture
- **[Component Architecture](/docs/CONTEXT-tier2-component.md)** - *Complete system.* Frontend, Sanity CMS, API integration patterns, and business logic implementation

### Key Components Covered
- **Frontend Application** - React component architecture, state patterns, content blocks
- **Sanity CMS** - 23 schemas, content modeling, editorial workflows  
- **SEO Generation** - Direct AI-to-Sanity content creation, validation
- **API Layer** - Serverless functions, EnergiDataService integration, caching
- **Business Logic** - Price calculations, provider ranking algorithms

## Tier 3: Feature-Specific Documentation

See `/docs/CONTEXT-tier3-feature.md` for detailed feature documentation:

### Key Features Documented
- **[Price Calculator](/docs/CONTEXT-tier3-feature.md#price-calculator-implementation-patterns)** - Interactive electricity cost estimation with validation
- **[Live Price Graph](/docs/CONTEXT-tier3-feature.md#live-price-graph-implementation)** - Real-time spot price visualization with caching
- **[Provider Comparison](/docs/CONTEXT-tier3-feature.md#provider-comparison-table)** - Transparent ranking with Vindstød priority
- **[EnergiDataService API](/docs/CONTEXT-tier3-feature.md#energidataservice-integration)** - External API integration with rate limiting
- **[Content Generation](/docs/CONTEXT-tier3-feature.md#content-generation)** - AI-powered SEO content creation
- **[Performance Optimization](/docs/CONTEXT-tier3-feature.md#performance--optimization-details)** - Caching, memoization, and optimization strategies

### Implementation Details
Each feature documentation includes:
- Business requirements
- Technical implementation
- Data flow
- Error handling
- Testing considerations



## Adding New Documentation

### New Component
1. Create `/new-component/CONTEXT.md` (Tier 2)
2. Add entry to this file under appropriate section
3. Create feature-specific Tier 3 docs as features develop

### New Feature
1. Create `/component/src/feature/CONTEXT.md` (Tier 3)
2. Reference parent component patterns
3. Add entry to this file under component's features

### Deprecating Documentation
1. Remove obsolete CONTEXT.md files
2. Update this mapping document
3. Check for broken references in other docs

---

*This documentation architecture template should be customized to match your project's actual structure and components. Add or remove sections based on your architecture.*