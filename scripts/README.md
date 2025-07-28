# Scripts Directory

This directory contains various scripts for maintaining and managing the ElPortal project. Scripts are organized by purpose and frequency of use.

## 🔧 Active Maintenance Scripts (Keep These)

### Schema Management
- `generate-schemas.mjs` - Generates TypeScript/Zod schemas from Sanity definitions
- `quick-fix-valueitem-title.ts` - Fixes common valueItem title→heading errors
- `comprehensive-schema-validation-fix.ts` - Comprehensive validation error fixer

### Navigation & Health Checks
- `check-navigation-health.ts` - Verifies navigation structure integrity
- `force-navigation-refresh.ts` - Forces CDN cache refresh for navigation

### Testing & Validation
- `test-sanity-query.ts` - Tests GROQ queries against Sanity
- `test-frontend-fetch.ts` - Tests frontend data fetching
- `validate-final.ts` - Final validation before deployment

## 📦 One-Time Migration Scripts (Can Archive)

These scripts were used for specific migrations and are no longer needed for daily operations:

### Page Creation Scripts
- `create-historiske-priser-*.ts` - Created historiske priser page
- `create-ladeboks-*.ts` - Created ladeboks page
- `deploy-*.ts` - Various deployment scripts

### Fix Scripts (Completed)
- `fix-historiske-priser-*.ts` - Fixed historiske priser issues
- `fix-ladeboks-*.ts` - Fixed ladeboks issues
- `fix-prognoser-*.ts` - Fixed prognoser issues
- `fix-elselskaber-ogimage.ts` - Fixed image issues
- `fix-featurelist-schema-issues.ts` - Fixed feature list issues

### Analysis Scripts (Completed)
- `analyze-*.ts` - Various analysis scripts
- `debug-*.ts` - Debugging scripts
- `inspect-*.ts` - Inspection scripts

## 🗑️ Scripts to Delete

These scripts are redundant or no longer relevant:

### Duplicate/Test Scripts
- `test-component-imports.cjs` - Old CommonJS test
- `test-municipalities.tsx` - TSX file in wrong location
- `sanity-validator.js` - Replaced by TypeScript version
- `verify-codes-simple.js` - Duplicate of TypeScript version

### Temporary Scripts
- `mcp-*.ts` - MCP testing scripts (move to separate test directory if needed)
- `debug-map.html` - HTML file doesn't belong in scripts

## 📋 Usage Guidelines

### Running Scripts

Most scripts can be run with:
```bash
npm run tsx scripts/[script-name].ts
```

For ESM modules:
```bash
node scripts/[script-name].mjs
```

### Before Creating New Scripts

1. Check if a similar script already exists
2. Use TypeScript for new scripts
3. Follow naming conventions:
   - `check-*.ts` - For validation/checking
   - `fix-*.ts` - For fixing issues
   - `create-*.ts` - For creating content
   - `test-*.ts` - For testing functionality

### Environment Variables

All scripts expect these environment variables:
- `SANITY_API_TOKEN` - Sanity write token
- `VITE_SANITY_PROJECT_ID` - Sanity project ID
- `VITE_SANITY_DATASET` - Sanity dataset name

## 🧹 Cleanup Plan

1. **Archive completed migrations**: Move to `scripts/archive/` directory
2. **Delete redundant files**: Remove duplicates and test files
3. **Organize by function**: Create subdirectories:
   - `scripts/schema/` - Schema-related scripts
   - `scripts/validation/` - Validation scripts
   - `scripts/utils/` - Utility scripts
   - `scripts/archive/` - Completed one-time scripts

## 🔄 Maintenance Schedule

- **Weekly**: Run `check-navigation-health.ts`
- **After schema changes**: Run `generate-schemas.mjs`
- **Before deployment**: Run `validate-final.ts`
- **When issues arise**: Use appropriate fix scripts