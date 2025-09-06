# Using MCP Servers via Smithery

Smithery provides a unified gateway to access thousands of MCP (Model Context Protocol) servers during development. This allows us to dynamically use any tool we need without installation or configuration.

## Setup

Ensure you have your Smithery API key in `.env` (server-side only):
```
SMITHERY_API_KEY=your_smithery_api_key_here
```

## Available Commands

### Search for MCP Servers
```bash
npm run mcp:search "query" -- --limit 20 --details
```

### Use an MCP Server
```bash
npm run mcp:use <server-id> <tool-name> -- --args '{"param": "value"}'
```

### List Server Tools
```bash
npm run mcp:use <server-id> --list
```

### Get Server Info
```bash
npm run mcp:use <server-id> --info
```

## Common Use Cases for DinElportal Development

### 1. Finding Images for Landing Pages

When creating landing pages with our Image component, use image servers to find appropriate visuals:

```bash
# Search for image servers
npm run mcp:search "image stock photos unsplash"

# Search for renewable energy images
npm run mcp:use @unsplash/mcp search -- --args '{"query": "wind turbines Denmark", "per_page": 10}'

# Search for solar panel images
npm run mcp:use @unsplash/mcp search -- --args '{"query": "solar panels residential", "orientation": "landscape"}'
```

Then use the returned URLs in our Image component:
```tsx
<Image 
  src={imageUrl}
  alt="Wind turbines in Denmark"
  className="rounded-lg"
/>
```

### 2. Analyzing Competitor Websites

Research competitor features and pricing strategies:

```bash
# Find web analysis servers
npm run mcp:search "web fetch analyze scrape"

# Analyze competitor pricing page
npm run mcp:use @smithery-ai/fetch fetch_url -- --args '{
  "url": "https://www.elpris.dk/priser",
  "prompt": "Extract pricing structure and UI patterns"
}'

# Analyze competitor features
npm run mcp:use @smithery-ai/fetch fetch_url -- --args '{
  "url": "https://www.elberegner.dk",
  "prompt": "List main features and user experience elements"
}'
```

### 3. Generating Danish SEO Content

Create SEO-optimized content for location pages:

```bash
# Find content generation servers
npm run mcp:search "content generation AI Danish"

# Generate content for a city page
npm run mcp:use @ai-writer/mcp generate -- --args '{
  "topic": "Elpriser i København",
  "language": "Danish",
  "length": 1000,
  "keywords": ["elpriser", "København", "grøn energi", "vindstød"]
}'

# Generate meta descriptions
npm run mcp:use @ai-writer/mcp generate -- --args '{
  "type": "meta_description",
  "topic": "Sammenlign elpriser i Aarhus",
  "language": "Danish"
}'
```

### 4. Market Data Analysis

Get insights about energy markets:

```bash
# Search for data analysis servers
npm run mcp:search "data analysis energy market"

# Analyze market trends
npm run mcp:use @data-analyzer/mcp analyze -- --args '{
  "topic": "Denmark electricity prices trends 2024",
  "format": "summary"
}'
```

### 5. Translation Services

Prepare for multi-language support:

```bash
# Find translation servers
npm run mcp:search "translation Danish English"

# Translate content
npm run mcp:use @translator/mcp translate -- --args '{
  "text": "Find de bedste elpriser i Danmark",
  "from": "da",
  "to": "en"
}'
```

### 6. Documentation and Learning

Get up-to-date documentation for libraries:

```bash
# Use Context7 (already available)
npm run mcp:use @upstash/context7-mcp get_docs -- --args '{
  "library": "react",
  "topic": "hooks"
}'

# Search for API documentation servers
npm run mcp:search "documentation API"
```

### 7. Memory and Storage

Store development insights and decisions:

```bash
# Find memory servers
npm run mcp:search "memory storage notes"

# Store a development insight
npm run mcp:use @mem0ai/mem0 store -- --args '{
  "key": "elportal_competitor_analysis",
  "value": "Elpris.dk uses a slider for consumption input which is very user-friendly"
}'

# Retrieve stored information
npm run mcp:use @mem0ai/mem0 retrieve -- --args '{
  "key": "elportal_competitor_analysis"
}'
```

## Integration Examples

### Example: Adding Hero Images to Landing Pages

1. Search for appropriate images:
```bash
npm run mcp:use @unsplash/mcp search -- --args '{"query": "Danish countryside wind farm", "per_page": 5}'
```

2. Review the results and pick the best image URL

3. Use in your component:
```tsx
<PageSection>
  <HeroWithImage
    title="Grøn Energi i Danmark"
    description="Find de bedste priser på vedvarende energi"
    image={{
      src: "https://images.unsplash.com/photo-xxx", // URL from MCP search
      alt: "Wind farm in Danish countryside"
    }}
  />
</PageSection>
```

### Example: Creating Location-Based SEO Pages

1. Generate content for the page:
```bash
npm run mcp:use @ai-writer/mcp generate -- --args '{
  "topic": "Elpriser i Odense - Find de bedste tilbud",
  "language": "Danish",
  "include": ["local context", "green energy benefits", "price comparison"],
  "tone": "informative and trustworthy"
}'
```

2. Find relevant images:
```bash
npm run mcp:use @unsplash/mcp search -- --args '{"query": "Odense Denmark city", "per_page": 3}'
```

3. Create the page in Sanity CMS with the generated content and images

## Tips

- **Explore Available Servers**: Regularly search for new servers as the ecosystem grows
- **Check Tool Documentation**: Use `--list` to see what parameters each tool accepts
- **Batch Operations**: Some servers support batch operations for efficiency
- **Error Handling**: Always check if a server/tool exists before using it
- **Rate Limits**: Be mindful of rate limits on popular servers

## Troubleshooting

### "Server not found"
- Check the server ID is correct (use exact ID from search results)
- Some servers may require specific access permissions

### "Tool not found"
- List available tools first: `npm run mcp:use <server> --list`
- Tool names are case-sensitive

### "Invalid arguments"
- Check the tool's input schema
- Ensure JSON is properly formatted in --args

### Authentication errors
- Verify your VITE_SMITHERY_API_KEY is set correctly
- Check if your API key has access to the requested server
