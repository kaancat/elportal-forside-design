# Elpriser Page Validation Errors Fix Guide

## Overview
The elpriser page (https://elportal-forside-design.vercel.app/elpriser) has several validation errors in Sanity Studio that need to be fixed manually.

## Page Information
- **Page ID**: `1BrgDwXdqxJ08rMIoYfLjP`
- **Title**: "Elpriser 2025 - Find det billigste elselskab"
- **Sanity Studio URL**: https://dinelportal.sanity.studio

## Validation Errors to Fix

### 1. Remove Deprecated Fields
**Problem**: The page has deprecated fields that are no longer in the schema.

**Fix**:
1. In Sanity Studio, navigate to Pages > "Elpriser 2025 - Find det billigste elselskab"
2. Find and delete these fields:
   - `ogImage` field (currently null)
   - `seo` field (contains description, keywords, ogImage, title - all deprecated)

### 2. Hero With Calculator Block
**Status**: ✅ This block appears to be working correctly

The Hero With Calculator block has the correct data:
- Title: "Elpriser 2025 - Find det billigste elselskab i dit område"
- Subtitle: "Sammenlign elpriser fra alle danske elselskaber..."
- Stats: Present and correct

### 3. Value Proposition Box
**Problem**: The Value Proposition block is missing required fields (heading, subheading) and the items are missing their heading and description fields.

**Fix**:
1. Find the "Value Proposition" block (titled "Hvorfor bruge DinElPortal?")
2. Add these top-level fields:
   - **Heading**: "Din komplette løsning til elmarkedet"
   - **Subheading**: "Vi gør det nemt at spare penge på din elregning med fuld gennemsigtighed"

3. Update each Value Item:

**Item 1** (Icon: piggy-bank)
- **Heading**: "Spar op til 3.000 kr. årligt"
- **Description**: "Find det billigste elselskab og reducer din elregning markant uden at gå på kompromis med kvaliteten."

**Item 2** (Icon: leaf)
- **Heading**: "100% grøn strøm"
- **Description**: "Alle vores anbefalede leverandører tilbyder kun certificeret grøn strøm fra vindkraft og andre vedvarende energikilder."

**Item 3** (Icon: clock)
- **Heading**: "Skift på 5 minutter"
- **Description**: "Det er hurtigt og nemt at skifte elleverandør. Vi guider dig gennem hele processen, så du sparer tid og penge."

**Item 4** (Icon: shield-check)
- **Heading**: "Uvildig rådgivning"
- **Description**: "Vi viser alle leverandører på markedet og giver dig et komplet overblik, så du kan træffe det bedste valg."

**Item 5** (Icon: trending-up)
- **Heading**: "Følg elpriserne live"
- **Description**: "Se de aktuelle elpriser time for time og planlæg dit forbrug, når strømmen er billigst."

**Item 6** (Icon: users)
- **Heading**: "Over 50.000 brugere"
- **Description**: "Tusindvis af danskere har allerede sparet penge ved at bruge DinElPortal til at finde deres elleverandør."

## Alternative: Using JSON View

If you prefer to use Sanity's JSON view:

1. In Sanity Studio, open the page document
2. Switch to the JSON view (usually accessible via the three-dot menu)
3. Find the valueProposition block with `_key: "value-prop-1"`
4. Replace it with the JSON structure provided in the `generate-elpriser-fix-json.ts` output

## Verification

After making these changes:
1. Save the document in Sanity Studio
2. Check that all validation errors are resolved
3. Visit the frontend page to ensure everything displays correctly
4. The page should no longer show any validation errors

## Scripts Created

- `scripts/check-elpriser-page-data.ts` - Checks current page data
- `scripts/generate-elpriser-fix-json.ts` - Generates fix instructions and JSON
- `scripts/fix-elpriser-validation-errors.ts` - Attempted automated fix (requires API token with update permissions)