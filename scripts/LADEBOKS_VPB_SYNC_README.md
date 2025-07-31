# Ladeboks Value Proposition Box Sync

## Issue
The Value Proposition Box (VPB) on the ladeboks page shows content on the frontend but appears empty in Sanity Studio. This is because the content is stored in deprecated fields (`items` instead of `valueItems`).

## Solution
The `sync-ladeboks-value-proposition.ts` script:
1. Checks the current state of VPB blocks on the ladeboks page
2. Identifies blocks using deprecated fields
3. Migrates content to the correct `valueItems` field
4. Preserves existing content while ensuring proper schema compliance

## Setup
1. Create a `.env` file in the project root with your Sanity API token:
```
SANITY_API_TOKEN=your_sanity_write_token_here
```

## Running the Script
```bash
cd /Users/kaancatalkaya/Desktop/projects/elportal-forside-design
npm run tsx scripts/sync-ladeboks-value-proposition.ts
```

## Expected Outcome
The script will:
- Show current VPB block status
- Migrate content from deprecated fields to `valueItems`
- Display the synced content
- Verify the update was successful

## Value Items Content
The script will ensure these value items are present:
1. **Spar op til 60%** - Få de laveste priser på opladning hjemme med vores dynamiske eltariffer
2. **Smart styring** - Lad automatisk, når strømmen er billigst og grønnest
3. **Fuld kontrol** - Styr og overvåg din opladning direkte fra din telefon
4. **Miljøvenlig kørsel** - Prioritér grøn strøm og reducer dit CO2-aftryk

## Note on Icons
Icons need to be added manually in Sanity Studio using the icon.manager field for each value item.

## Schema Reference
- Field name: `valueItems` (NOT `items`)
- Type: Array of `valueItem` objects
- Each valueItem has:
  - `heading` (string, required)
  - `description` (string, required)
  - `icon` (icon.manager, optional)

## Verification
After running the script, you can verify the sync worked by:
1. Checking Sanity Studio - the VPB should now show content
2. Refreshing the frontend - content should still display correctly
3. Running the script again - it should report "No updates needed"