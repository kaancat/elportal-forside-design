# BrowserBase Setup with Smithery

## Current Status

BrowserBase is now configured in two ways:
1. **Smithery Profile** - Configured with credentials but has protocol issues
2. **Claude Code Direct** - Added directly using the Smithery-provided URL ✅

## Available Tools

BrowserBase provides powerful browser automation capabilities through Stagehand:

### Session Management
- `browserbase_session_create` - Create a single browser session
- `browserbase_session_close` - Close the current session
- `multi_browserbase_stagehand_session_*` - For parallel browser operations

### Browser Actions
- `browserbase_stagehand_navigate` - Navigate to URLs
- `browserbase_stagehand_act` - Perform actions (click, type, etc.)
- `browserbase_stagehand_observe` - Find interactive elements
- `browserbase_stagehand_extract` - Extract data from pages
- `browserbase_screenshot` - Take screenshots

## Usage

### Using the BrowserBase CLI tool
```bash
# List available tools
npm run mcp:browserbase tools

# Take a screenshot
npm run mcp:screenshot <url>

# Analyze SEO
npm run mcp:analyze <url>
```

### Using with general MCP tool
```bash
# List BrowserBase tools
npm run mcp:use -- @browserbasehq/mcp-browserbase --list -p curved-bonobo-oHOM72

# Create a session
npm run mcp:use -- @browserbasehq/mcp-browserbase browserbase_session_create -p curved-bonobo-oHOM72
```

## Technical Details

Your BrowserBase configuration:
- Profile ID: `curved-bonobo-oHOM72`
- Server: `@browserbasehq/mcp-browserbase`
- Gateway URL: `https://server.smithery.ai/@browserbasehq/mcp-browserbase/mcp`

The profile includes your BrowserBase API credentials, which Smithery manages securely.

## Setup Complete

BrowserBase has been successfully added to Claude Code using the command:
```bash
claude mcp add --transport http browserbase "https://server.smithery.ai/@browserbasehq/mcp-browserbase/mcp?api_key=41f12404-fbac-4b00-9e3b-c67cec398a46&profile=curved-bonobo-oHOM72"
```

The server is now available as `browserbase` in Claude Code's MCP configuration and shows as "✓ Connected" when running `claude mcp list`.

## Known Issues

When using BrowserBase through the programmatic Smithery gateway (our scripts), there's a protocol mismatch. However, BrowserBase works correctly when added directly to Claude Code as we've done now.

This means:
- ✅ I (Claude) can use BrowserBase for browser automation tasks
- ❌ The npm scripts (`mcp:browserbase`, `mcp:screenshot`, etc.) won't work due to the protocol issue
- ✅ You can still use other MCP servers through the Smithery gateway scripts