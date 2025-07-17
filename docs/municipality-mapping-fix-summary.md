# Municipality Mapping Fix Summary

## Problem Identified

The Denmark CO2 emissions map was showing grey areas because of a mismatch between:

1. **API Data**: Returns municipality names in proper Danish with special characters (København, Ærø, Sønderborg, etc.)
2. **react-denmark-map**: Expects lowercase ASCII municipality IDs (koebenhavn, aeroe, soenderborg, etc.)
3. **Mapping Logic**: Was trying to match Danish names directly against ASCII names, which failed

## Root Cause

The component was using `getMunicipalityCodeFromName(area.name)` where:
- `area.name` from react-denmark-map = "koebenhavn" (ASCII)
- But the mapping was looking for this in a structure that only knew about Danish names from the API

## Solution Implemented

### 1. Created Complete Mapping Structure (`municipalityMappingFix.ts`)
- Maps all 98 Danish municipalities with three keys:
  - `code`: Municipality code (e.g., "101")
  - `danishName`: Proper Danish name (e.g., "København")
  - `asciiName`: ASCII name for react-denmark-map (e.g., "koebenhavn")

### 2. Updated ConsumptionMap Component
- Changed from using `getMunicipalityCodeFromName` to `getMunicipalityByAsciiName`
- Now properly handles the flow: react-denmark-map (ASCII) → Code → API Data

### 3. Key Changes Made

#### Before:
```typescript
const municipalityCode = getMunicipalityCodeFromName(area.name);
// area.name = "koebenhavn" but mapping expected "København"
```

#### After:
```typescript
const mapping = getMunicipalityByAsciiName(area.name);
// area.name = "koebenhavn" correctly maps to code "101"
```

## Data Flow

1. **API returns**: `{ municipalityCode: "101", municipalityName: "København", ... }`
2. **Stored with code**: Data indexed by municipality code
3. **Map displays**: react-denmark-map uses "koebenhavn" as ID
4. **Mapping bridges**: "koebenhavn" → code "101" → find data

## Files Modified

1. `/src/utils/municipality/municipalityMappingFix.ts` - New complete mapping system
2. `/src/components/ConsumptionMap.tsx` - Updated to use new mapping functions
3. `/src/utils/municipality/municipalityNameConverter.ts` - Helper for name conversions

## Testing

Created test scripts that verify:
- All 98 municipalities are correctly mapped
- Code lookups work (101 → København → koebenhavn)
- ASCII lookups work (koebenhavn → 101)
- Danish lookups work (København → 101)
- No duplicates exist

## Result

The map should now correctly display all 98 Danish municipalities with their consumption data instead of showing grey areas.