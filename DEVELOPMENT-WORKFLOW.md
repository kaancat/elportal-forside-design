# ElPortal Development Workflow

## Quick Start

```bash
# 1. Sync projects (run daily)
./scripts/sync-projects.sh

# 2. Start both development servers
# Terminal 1 - CMS
cd /Users/kaancatalkaya/Desktop/projects/sanityelpriscms
npm run dev

# Terminal 2 - Frontend
cd /Users/kaancatalkaya/Desktop/projects/elportal-forside-design
npm run dev
```

## Common Development Tasks

### 1. Adding a New Content Block

#### Step 1: Create Sanity Schema
```typescript
// In sanityelpriscms/schemaTypes/myNewBlock.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'myNewBlock',
  title: 'My New Block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    // Add more fields
  ]
})
```

#### Step 2: Export Schema
```typescript
// In sanityelpriscms/schemaTypes/index.ts
export { default as myNewBlock } from './myNewBlock'
```

#### Step 3: Deploy Sanity
```bash
cd sanityelpriscms
npm run deploy
```

#### Step 4: Create React Component
```typescript
// In elportal-forside-design/src/components/MyNewBlock.tsx
interface MyNewBlockProps {
  block: {
    _type: 'myNewBlock'
    title: string
    // Other fields
  }
}

export function MyNewBlock({ block }: MyNewBlockProps) {
  return (
    <div>
      <h2>{block.title}</h2>
      {/* Render other content */}
    </div>
  )
}
```

#### Step 5: Add to BOTH Renderers
```typescript
// In ContentBlocks.tsx
case 'myNewBlock':
  return <MyNewBlock block={block} />

// In SafeContentBlocks.tsx (same addition)
case 'myNewBlock':
  return <MyNewBlock block={block} />
```

#### Step 6: Update GROQ Queries
```typescript
// Add to contentBlocks projection in queries
`contentBlocks[]{
  ...,
  _type == "myNewBlock" => {
    _type,
    _key,
    title,
    // Other fields
  }
}`
```

### 2. Creating SEO Pages

#### Option 1: Using AI Agent
```bash
npm run ai -- --agent seo-page-creator
# Follow prompts to create comprehensive SEO pages
```

#### Option 2: Direct Script
```javascript
// Create a script in frontend/scripts/
const pageContent = {
  _id: `page.my-seo-page`,
  _type: 'page',
  title: 'Page Title',
  slug: { current: 'my-seo-page' },
  contentBlocks: [
    // Add content blocks
  ]
}

// Validate first!
node scripts/validate-sanity-content.js
```

### 3. Updating Provider Information

1. **Open Sanity Studio**: http://localhost:3333
2. **Navigate to Providers**
3. **Edit provider details**
4. **Important**: Vindstød ranking is handled in frontend code

### 4. Managing Icons

Icons use the `sanity-plugin-icon-manager`. Always use the icon picker in Sanity Studio:

```javascript
// Correct icon format
{
  _type: 'icon.manager',
  icon: 'streamline-regular:wind-turbine-wind-power',
  metadata: {
    iconName: 'wind-turbine-wind-power',
    collectionId: 'streamline-regular',
    collectionName: 'Streamline Regular',
    // ... other metadata
  }
}
```

### 5. Testing Changes

#### Frontend Testing
```bash
# Type checking
npm run typecheck

# Build test
npm run build

# Format check
npm run format:check
```

#### Content Validation
```bash
# Validate content structure
node scripts/validate-sanity-content.js

# Check schema sync
./scripts/sync-projects.sh
```

## Debugging Common Issues

### "Field X should be Y" Errors

Check the schema reference:
- `hero`: uses `headline/subheadline` NOT `title/subtitle`
- `valueItem`: uses `heading` NOT `title`
- `featureItem`: uses `title` NOT `name`

### Content Not Rendering

1. Check if component is in BOTH ContentBlocks.tsx AND SafeContentBlocks.tsx
2. Verify GROQ query includes the fields
3. Check browser console for errors
4. Verify content is published in Sanity

### Type Errors After Schema Changes

```bash
# Regenerate types
cd elportal-forside-design
npm run generate:types
```

### Icon Display Issues

- Icons must be icon.manager objects, not strings
- Use the icon picker in Sanity Studio
- Check if icon component handles the metadata correctly

## Git Workflow

### Branch Naming
- `feature/add-[component-name]`
- `fix/[issue-description]`
- `seo/[page-name]`

### Commit Messages
```
feat: Add new price comparison component
fix: Correct hero field validation
seo: Create comprehensive elpriser page
docs: Update development workflow
```

### Pre-commit Checklist
1. [ ] Run sync script
2. [ ] TypeScript passes
3. [ ] Content validates
4. [ ] Vindstød ranking maintained
5. [ ] No console errors

## Deployment Process

### 1. Deploy CMS Changes First
```bash
cd sanityelpriscms
npm run deploy
# Wait for deployment to complete
```

### 2. Deploy Frontend
```bash
cd elportal-forside-design
npm run build
# Verify build succeeds
git push origin main
# Vercel auto-deploys
```

### 3. Post-Deployment
- Check production site
- Verify new content renders
- Test interactive components
- Monitor error tracking

## Emergency Procedures

### Rollback Sanity Schema
```bash
cd sanityelpriscms
git checkout HEAD~1 -- schemaTypes/
npm run deploy
```

### Rollback Frontend
- Use Vercel dashboard to instant rollback
- Or revert commit and push

### Content Recovery
- Sanity maintains revision history
- Use Studio to restore previous versions

## Performance Monitoring

### Key Metrics to Watch
- Lighthouse scores (aim for 90+)
- Core Web Vitals
- API response times
- Build times

### Regular Maintenance
- Weekly: Check for unused content types
- Monthly: Audit page load performance
- Quarterly: Review and optimize queries