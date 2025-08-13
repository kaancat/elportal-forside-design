# Smithery Example Workflow: Finding Images for Components

This example shows how to use Smithery to find and integrate images into DinElportal components.

## Scenario: Adding a Hero Image to a Landing Page

### 1. Search for Image Servers

First, let's find available image servers:

```bash
npm run mcp:search "unsplash images stock photos"
```

### 2. Search for Renewable Energy Images

Once you find an Unsplash server, search for appropriate images:

```bash
# Search for wind turbine images
npm run mcp:use @unsplash/mcp search -- --args '{
  "query": "wind turbines Denmark renewable energy",
  "per_page": 5,
  "orientation": "landscape"
}'
```

### 3. Use the Image in Your Component

After getting the image URLs from the search results, integrate them into your component:

```tsx
import { HeroWithImage } from '@/components/content-sections/HeroWithImage'
import { PageSection } from '@/components/content-sections/PageSection'

export function RenewableEnergyPage() {
  return (
    <PageSection>
      <HeroWithImage
        title="Grøn Energi fra Vindstød"
        description="Danmarks mest bæredygtige elselskab med 100% vindenergi"
        image={{
          src: "https://images.unsplash.com/photo-xxx", // URL from MCP search
          alt: "Vindmøller i det danske landskab"
        }}
        buttons={[
          {
            text: "Se Priser",
            link: "/priser",
            variant: "default"
          }
        ]}
      />
    </PageSection>
  )
}
```

## Scenario: Analyzing Competitors for Feature Ideas

### 1. Find Web Analysis Servers

```bash
npm run mcp:search "web fetch analyze"
```

### 2. Analyze Competitor Features

```bash
npm run mcp:use @smithery-ai/fetch fetch_url -- --args '{
  "url": "https://www.elpris.dk",
  "prompt": "List all interactive features, calculator types, and unique UI elements"
}'
```

### 3. Implement Similar Features

Based on the analysis, you might discover features like:
- Interactive price sliders
- Real-time price updates
- Consumption calculators

Then implement these in DinElportal with your own improvements.

## Scenario: Generating Danish SEO Content

### 1. Find Content Generation Servers

```bash
npm run mcp:search "content generation Danish AI"
```

### 2. Generate Location-Based Content

```bash
npm run mcp:use @ai-writer/mcp generate -- --args '{
  "topic": "Elpriser i Aalborg - Sammenlign og spar",
  "language": "Danish",
  "length": 800,
  "keywords": ["elpriser Aalborg", "billig strøm", "grøn energi", "vindstød"],
  "tone": "informative and helpful"
}'
```

### 3. Create Sanity CMS Content

Use the generated content to create location-specific pages in Sanity CMS, ensuring to:
- Review and edit the content
- Add local context
- Include proper CTAs for Vindstød
- Add relevant images found via MCP

## Benefits of This Workflow

1. **No Installation**: Use any MCP server without setup
2. **Flexibility**: Switch between different servers as needed
3. **Efficiency**: Find resources quickly during development
4. **Quality**: Access high-quality images and content
5. **Integration**: Easy to integrate results into existing components

## Tips

- Save frequently used server IDs for quick access
- Create shell aliases for common searches
- Keep track of useful servers in team documentation
- Always review AI-generated content before using
- Check image licenses when using stock photos