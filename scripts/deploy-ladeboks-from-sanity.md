# Deployment Instructions for Ladeboks Page

## Steps to Deploy from sanityelpriscms

### 1. Deploy the Sanity Schemas

From the `sanityelpriscms` project directory, run:

```bash
# Deploy the updated schemas
sanity deploy
```

This will deploy the new charging box schemas:
- `chargingBoxProduct` - For individual charging box products
- `chargingBoxShowcase` - For displaying products in a grid

### 2. Copy and Run the Content Deployment Script

Copy the deployment script to sanityelpriscms:

```bash
# From sanityelpriscms directory
cp ../elportal-forside-design/scripts/create-ladeboks-page-validated.ts .
```

### 3. Install Required Dependencies

If not already installed in sanityelpriscms:

```bash
npm install dotenv
```

### 4. Run the Deployment Script

Execute the script to create the charging box products and page:

```bash
npx tsx create-ladeboks-page-validated.ts
```

This will create:
- 3 charging box products (DEFA Power, Easee Up, Zaptec Go)
- The Ladeboks page with all content sections

### 5. Verify in Sanity Studio

1. Open Sanity Studio
2. Check that the charging box products appear
3. Verify the Ladeboks page is created at `/ladeboks`

### 6. Add Images (Manual Step)

In Sanity Studio:
1. Add product images to each charging box product
2. Add a hero image to the Ladeboks page (electric car charging)

## Notes

- The SANITY_API_TOKEN must be in the sanityelpriscms/.env file
- All Sanity operations must be run from the sanityelpriscms directory
- The schemas have already been added to the schema index