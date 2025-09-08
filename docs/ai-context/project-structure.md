# DinElportal Forside Design - Project Structure

This document provides the complete technology stack and file tree structure for the DinElportal Forside Design project. **AI agents MUST read this file to understand the project organization before making any changes.**

> Migration Update (Next.js)
>
> The project now runs on Next.js (App Router). Any Vite references below are historical. Use this section as the source of truth for stack and layout; the legacy tree further down remains for reference only.

## Technology Stack (Current)

### Frontend Technologies
- **TypeScript** with **npm**
- **React 19**
- **Next.js 15 (App Router)**
- **Tailwind CSS**
- **shadcn/ui** (Radix UI based)
- **TanStack Query**

### Content Management
- **Sanity CMS 3.x** - Headless CMS for content management
- **@sanity/client 6.15.7** - JavaScript client for Sanity
- **@portabletext/react 3.2.1** - Portable Text renderer for React
- **@sanity/image-url 1.1.0** - Image URL generation for Sanity assets

### UI Component Libraries
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React 0.454.0** - Beautiful & consistent icon pack
- **React Hook Form 7.53.2** - Performant forms with easy validation
- **Zod 3.23.8** - TypeScript-first schema validation
- **Framer Motion 11.15.0** - Animation library for React

### Development & Quality Tools
- **ESLint 9.11.1** - Code quality and linting for TypeScript/React
- **TypeScript ESLint** - TypeScript-specific linting rules
- **PostCSS 8.4.47** - CSS processing with Tailwind
- **Autoprefixer 10.4.20** - Vendor prefix automation

### API Integration & Data Sources
- **EnergiDataService API** - Real-time electricity prices, production data, and forecasts
- **Sanity Content API** - Headless CMS for content management
- **AI Integration** - Direct content generation for SEO pages via Sanity API

### Future Technologies
- **Supabase** - Backend services integration (already configured MCP)
- **Additional animations** - Enhanced user interactions with Framer Motion
- **Analytics Integration** - User behavior tracking and insights
- **Authentication System** - User accounts and personalization

## Complete System Architecture

The DinElportal ecosystem consists of two interconnected projects:

1. **elportal-forside-design** (This Project)
   - Frontend web application
   - React/TypeScript/Vite
   - Displays content and real-time data
   - Direct Sanity API integration for SEO page generation

2. **sanityelpriscms**
   - Sanity CMS backend
   - 23 content schemas
   - Content management and page builder
   - Receives content via authenticated API for SEO pages

## File Tree (Current, abbreviated)

```
elportal-forside-design/
├── .claude/                   # AI assistant config (keep)
│   ├── commands/             # Orchestration templates
│   ├── hooks/                # Automation scripts
│   └── settings.local.json   # Local settings
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── api/                  # Route handlers (server)
├── src/                      # Libraries and components
│   ├── components/           # UI & page blocks
│   ├── lib/                  # Shared libraries (Sanity, env, utils)
│   ├── hooks/                # Custom hooks
│   ├── services/             # Client-side services
│   └── types/                # TS types
├── public/                   # Static assets
├── docs/                     # Documentation
├── package.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.mjs
└── vercel.json
```

## Key Directories

### `/src/components/`
Contains all React components organized by feature:
- UI components (buttons, cards, forms)
- Layout components (header, footer, navigation)
- Feature components (hero sections, testimonials, etc.)

### `/src/services/`
API integration layer:
- `sanityClient.ts` - Sanity CMS client configuration
- API utilities and data fetching logic

### `/src/types/`
TypeScript type definitions:
- Component prop types
- API response types
- Sanity schema types

### `/docs/ai-context/`
AI agent documentation:
- Project structure (this file)
- Development guidelines
- Architecture decisions

## Component Architecture

### Content Blocks System (DUAL RENDERER ARCHITECTURE)
The frontend uses a dynamic content rendering system with TWO renderers:
- `ContentBlocks.tsx` - Standard router for regular pages
- `SafeContentBlocks.tsx` - Error-boundary wrapped router used by homepage and critical pages
- 15+ different block types supported (hero, calculator, charts, etc.)
- Each block type maps to a specific React component
- Full TypeScript support with discriminated unions
- **CRITICAL**: New content blocks MUST be added to BOTH renderers

### Key Interactive Components
1. **Price Calculator** - Dynamic electricity price estimation
2. **Live Price Graph** - Real-time spot price visualization
3. **Provider Comparison** - Transparent price comparison with Vindstød featured
4. **Renewable Energy Forecast** - Green energy production predictions

### Data Flow Architecture
1. **Static Content**: Sanity CMS → Frontend components
2. **Dynamic Data**: EnergiDataService API → Serverless functions → Frontend
3. **SEO Content**: AI → Direct Sanity API → Frontend
- **[Platform]** - Target platform expansion
- **[Service]** - Planned service integrations

## Complete Project Structure Template

```
[PROJECT-NAME]/
├── README.md                           # Project overview and setup
├── CLAUDE.md                           # Master AI context file
├── [BUILD-FILE]                        # Build configuration (Makefile, package.json, etc.)
├── .gitignore                          # Git ignore patterns
├── .[IDE-CONFIG]/                      # IDE workspace configuration
│   ├── settings.[ext]                  # IDE settings
│   ├── extensions.[ext]                # Recommended extensions
│   └── launch.[ext]                    # Debug configurations
├── [BACKEND-DIR]/                      # Backend application
│   ├── CONTEXT.md                      # Backend-specific AI context
│   ├── src/                            # Source code
│   │   ├── config/                     # Configuration management
│   │   │   └── settings.[ext]          # Application settings
│   │   ├── core/                       # Core business logic
│   │   │   ├── CONTEXT.md              # Core logic patterns
│   │   │   ├── services/               # Business services
│   │   │   │   ├── [service1].[ext]    # Service implementations
│   │   │   │   └── [service2].[ext]
│   │   │   ├── models/                 # Data models
│   │   │   │   ├── [model1].[ext]      # Model definitions
│   │   │   │   └── [model2].[ext]
│   │   │   └── utils/                  # Utility functions
│   │   │       ├── logging.[ext]       # Structured logging
│   │   │       ├── validation.[ext]    # Input validation
│   │   │       └── helpers.[ext]       # Helper functions
│   │   ├── api/                        # API layer
│   │   │   ├── CONTEXT.md              # API patterns and conventions
│   │   │   ├── routes/                 # API route definitions
│   │   │   │   ├── [resource1].[ext]   # Resource-specific routes
│   │   │   │   └── [resource2].[ext]
│   │   │   ├── middleware/             # API middleware
│   │   │   │   ├── auth.[ext]          # Authentication middleware
│   │   │   │   ├── logging.[ext]       # Request logging
│   │   │   │   └── validation.[ext]    # Request validation
│   │   │   └── schemas/                # Request/response schemas
│   │   │       ├── [schema1].[ext]     # Data schemas
│   │   │       └── [schema2].[ext]
│   │   └── integrations/               # External service integrations
│   │       ├── CONTEXT.md              # Integration patterns
│   │       ├── [service1]/             # Service-specific integration
│   │       │   ├── client.[ext]        # API client
│   │       │   ├── models.[ext]        # Integration models
│   │       │   └── handlers.[ext]      # Response handlers
│   │       └── [service2]/
│   ├── tests/                          # Test suite
│   │   ├── unit/                       # Unit tests
│   │   ├── integration/                # Integration tests
│   │   └── fixtures/                   # Test fixtures and data
│   ├── [PACKAGE-FILE]                  # Package configuration
│   └── [ENV-FILE]                      # Environment configuration
├── [FRONTEND-DIR]/                     # Frontend application (if applicable)
│   ├── CONTEXT.md                      # Frontend-specific AI context
│   ├── src/                            # Source code
│   │   ├── components/                 # UI components
│   │   │   ├── CONTEXT.md              # Component patterns
│   │   │   ├── common/                 # Shared components
│   │   │   └── [feature]/              # Feature-specific components
│   │   ├── pages/                      # Page components/routes
│   │   │   ├── [page1].[ext]           # Page implementations
│   │   │   └── [page2].[ext]
│   │   ├── stores/                     # State management
│   │   │   ├── CONTEXT.md              # State management patterns
│   │   │   ├── [store1].[ext]          # Store implementations
│   │   │   └── [store2].[ext]
│   │   ├── api/                        # API client layer
│   │   │   ├── CONTEXT.md              # Client patterns
│   │   │   ├── client.[ext]            # HTTP client setup
│   │   │   └── endpoints/              # API endpoint definitions
│   │   ├── utils/                      # Utility functions
│   │   │   ├── logging.[ext]           # Client-side logging
│   │   │   ├── validation.[ext]        # Form validation
│   │   │   └── helpers.[ext]           # Helper functions
│   │   └── assets/                     # Static assets
│   ├── tests/                          # Frontend tests
│   ├── [BUILD-CONFIG]                  # Build configuration
│   └── [PACKAGE-FILE]                  # Package configuration
├── docs/                               # Documentation
│   ├── ai-context/                     # AI-specific documentation
│   │   ├── project-structure.md        # This file
│   │   ├── docs-overview.md            # Documentation architecture
│   │   ├── system-integration.md       # Integration patterns
│   │   ├── deployment-infrastructure.md # Infrastructure docs
│   │   └── handoff.md                  # Task management
│   ├── api/                            # API documentation
│   ├── deployment/                     # Deployment guides
│   └── development/                    # Development guides
├── scripts/                            # Automation scripts
│   ├── setup.[ext]                     # Environment setup
│   ├── deploy.[ext]                    # Deployment scripts
│   └── maintenance/                    # Maintenance scripts
├── [INFRASTRUCTURE-DIR]/               # Infrastructure as code (if applicable)
│   ├── [PROVIDER]/                     # Cloud provider configurations
│   ├── docker/                         # Container configurations
│   └── monitoring/                     # Monitoring and alerting
└── [CONFIG-FILES]                      # Root-level configuration files
```


---

*This template provides a comprehensive foundation for documenting project structure. Adapt it based on your specific technology stack, architecture decisions, and organizational requirements.*
