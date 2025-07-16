# API Testing Guide

## CO2 Emissions API Test

To test the CO2 emissions API endpoint, you can use these URLs:

### Basic Test
```
http://localhost:3000/api/co2-emissions
```

### With Parameters
```
http://localhost:3000/api/co2-emissions?region=Danmark&date=2024-01-15&aggregation=hourly
```

### Test Different Regions
```
http://localhost:3000/api/co2-emissions?region=DK1&date=2024-01-15
http://localhost:3000/api/co2-emissions?region=DK2&date=2024-01-15
```

### Expected Response Structure
```json
{
  "records": [
    {
      "HourUTC": "2024-01-15T00:00:00Z",
      "HourDK": "15-01-2024, 01:00",
      "PriceArea": "Danmark",
      "CO2Emission": 156.7,
      "EmissionLevel": "low",
      "hour": "01:00"
    }
  ],
  "metadata": {
    "region": "Danmark",
    "date": "2024-01-15",
    "aggregation": "hourly"
  }
}
```

## Component Testing

1. **Deploy Sanity Changes**: Run `npm run deploy` in the sanityelpriscms directory
2. **Add Component**: In Sanity Studio, add the CO2 Emissions Chart to a page
3. **Configure**: Set title, subtitle, and gauge visibility
4. **Test**: View the page on the frontend

## Troubleshooting

### If Component Shows "Unknown Component Type"
- Check if Sanity schema is deployed
- Verify the component is imported in ContentBlocks.tsx
- Ensure the type is added to the ContentBlock union type

### If API Returns Empty Data
- Check if the date is too far in the past/future
- Verify EnergiDataService is accessible
- Check API rate limits (max 40 requests per 10 seconds)

### If Chart Doesn't Load
- Check browser console for API errors
- Verify the date format is correct
- Check if the component is handling loading states