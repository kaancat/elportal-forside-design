# Navigation Validation Error Fix Guide

## Problem
The navigation menu in Sanity Studio shows validation errors: "Item of type object not valid for this list". This is because the navigation items are missing their `_type` field.

## Root Cause
When navigation items were created or imported, they were missing the required `_type` field that tells Sanity whether an item is a "link" or "megaMenu".

## Quick Fix Option (If you have write access)

If you have a Sanity API token with write permissions, you can run this command:
```bash
npx tsx scripts/fix-navigation-validation.ts
```

## Manual Fix Instructions

### Step 1: Access Sanity Studio
1. Go to https://dinelportal.sanity.studio
2. Navigate to "Site Settings"

### Step 2: Identify the Problem
In the "Header Navigation" section, you'll see validation errors on the navigation items.

### Step 3: Fix Each Navigation Item

You have two options:

#### Option A: Quick Fix (Recommended)
1. For each navigation item showing an error:
   - Click on the item to expand it
   - Look for a dropdown that says "Type" or shows as empty
   - Select "Link" for regular links or "Mega Menu" for dropdown menus
   - Save the document

#### Option B: Complete Rebuild
If Option A doesn't work, you'll need to delete and recreate:

1. **Delete all navigation items** in the Header Navigation section
2. **Re-add them with the correct structure:**

   **Regular Links (Elpriser, Elselskaber, Ladeboks):**
   - Click "Add item"
   - Choose "Link" from the dropdown
   - Set Link Type to "Internal Page"
   - Select the appropriate page
   - Add the title

   **Mega Menu (Bliv klogere på, Bliv klogere):**
   - Click "Add item"
   - Choose "Mega Menu" from the dropdown
   - Add the menu title
   - Add columns and menu items

   **Button Link (Sammenlign Priser):**
   - Click "Add item"
   - Choose "Link" from the dropdown
   - Set Link Type to "Internal Page"
   - Select "Om os" page
   - Check the "Is Button" checkbox

### Step 4: Fix Mega Menu Items
For the mega menu items that show issues:
1. Each menu item needs a proper "link" object
2. Instead of having separate "internalLink" or "externalLink" fields, they should have a "link" field that contains the link configuration

### Step 5: Verify the Fix
1. Save the Site Settings document
2. Check that all validation errors are gone
3. Refresh the frontend to ensure navigation works correctly

## Expected Structure

Here's what the correct navigation structure should look like:

```
Header Navigation:
├── Elpriser (Link - Internal to "Elpriser 2025" page)
├── Elselskaber (Link - Internal to "Danmarks Store Guide" page)
├── Ladeboks (Link - Internal to "Ladeboks til Elbil" page)
├── Bliv klogere på (Mega Menu with 3 columns)
│   ├── Priser
│   ├── Guides
│   └── Værktøjer
├── Sammenlign Priser (Link - Internal to "Om os" page, marked as button)
└── Bliv klogere (Mega Menu with 3 columns)
    ├── Elpriser & Prognoser
    ├── Guides & Tips
    └── Om elmarkedet
```

## Prevention
To prevent this issue in the future:
1. Always use the Sanity Studio UI to create navigation items
2. Don't import navigation data without proper type fields
3. When creating scripts to modify navigation, ensure all required fields are included

## Need More Help?
If you continue to have issues:
1. Check the browser console for specific error messages
2. Try creating a single test navigation item to ensure the schema is working
3. Contact your development team with the specific error messages