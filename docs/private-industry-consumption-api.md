# Private Industry Consumption API

## Overview

The Private Industry Consumption API provides access to Danish electricity consumption data by municipality, housing category, and heating category. This API is designed for real-time map visualization and consumption analysis, with built-in caching strategies and data aggregation capabilities.

## Base URL

```
/api/private-industry-consumption
```

## Query Parameters

| Parameter | Type | Description | Default | Example |
|-----------|------|-------------|---------|---------|
| `municipality` | string | Municipality number (e.g., "101" for Copenhagen) | - | `101` |
| `start` | string | Start date in YYYY-MM-DD format | Last 24 hours | `2024-01-01` |
| `end` | string | End date in YYYY-MM-DD format | Current time | `2024-01-31` |
| `housing` | string | Housing category filter | - | `Erhverv` |
| `heating` | string | Heating category filter | - | `Elvarme eller varmepumpe` |
| `aggregate` | string | Aggregation type: `daily`, `monthly`, `municipality` | `municipality` | `municipality` |
| `limit` | number | Maximum records to return (max: 10000) | 1000 | `5000` |
| `offset` | number | Pagination offset | 0 | `1000` |

## Response Format

```typescript
interface ConsumptionResponse {
  data: ConsumptionRecord[] | AggregatedConsumption[];
  totalRecords: number;
  aggregationType: 'none' | 'daily' | 'monthly' | 'municipality';
  period: {
    start: string;
    end: string;
  };
  filters: {
    municipality?: string;
    municipalityName?: string;
    housingCategory?: string;
    heatingCategory?: string;
  };
  availableCategories: {
    housing: string[];
    heating: string[];
  };
}
```

## Data Types

### ConsumptionRecord (Raw Data)
```typescript
interface ConsumptionRecord {
  HourUTC: string;           // ISO timestamp (UTC)
  HourDK: string;            // ISO timestamp (Danish time)
  MunicipalityNo: string;    // Municipality code
  MunicipalityName: string;  // Municipality name (Danish)
  HousingCategory: string;   // Housing type
  HeatingCategory: string;   // Heating type
  ConsumptionkWh: number;    // Consumption in kWh
}
```

### AggregatedConsumption (Aggregated Data)
```typescript
interface AggregatedConsumption {
  municipalityNo: string;
  municipalityName: string;
  totalConsumption: number;
  averageConsumption: number;
  housingBreakdown: Record<string, number>;
  heatingBreakdown: Record<string, number>;
  recordCount: number;
}
```

## Housing Categories

| Danish | English | Description |
|--------|---------|-------------|
| `Erhverv` | Business | Commercial/industrial buildings |
| `Etageejendom` | Apartment Buildings | Multi-story residential buildings |
| `Fritidshuse` | Holiday Homes | Vacation/summer houses |
| `Parcel- og rækkehuse` | Detached & Row Houses | Single-family homes |
| `Andet` | Other | Aggregated data for privacy (<20 units) |

## Heating Categories

| Danish | English | Description |
|--------|---------|-------------|
| `Elvarme eller varmepumpe` | Electric/Heat Pump | Electric heating systems |
| `Erhverv` | Business | Commercial heating systems |
| `Andet` | Other | Aggregated data for privacy (<20 units) |

## Usage Examples

### Get Municipality Map Data
```javascript
// Fetch all municipalities for map visualization
const response = await fetch('/api/private-industry-consumption?aggregate=municipality&limit=1000');
const data = await response.json();

// Response includes aggregated consumption by municipality
data.data.forEach(municipality => {
  console.log(`${municipality.municipalityName}: ${municipality.totalConsumption} kWh`);
});
```

### Get Time Series Data
```javascript
// Fetch daily consumption for Copenhagen
const response = await fetch('/api/private-industry-consumption?municipality=101&aggregate=daily&start=2024-01-01&end=2024-01-31');
const data = await response.json();

// Response includes daily totals
data.data.forEach(day => {
  console.log(`${day.date}: ${day.totalConsumption} kWh`);
});
```

### Filter by Housing Type
```javascript
// Fetch business consumption only
const response = await fetch('/api/private-industry-consumption?housing=Erhverv&aggregate=municipality');
const data = await response.json();

// Response includes only business consumption
```

### Get Raw Hourly Data
```javascript
// Fetch raw hourly data for specific municipality
const response = await fetch('/api/private-industry-consumption?municipality=101&start=2024-01-01&end=2024-01-02');
const data = await response.json();

// Response includes hourly records
data.data.forEach(record => {
  console.log(`${record.HourDK}: ${record.ConsumptionkWh} kWh (${record.HousingCategory})`);
});
```

## Caching Strategy

The API implements intelligent caching based on data type:

- **Municipality aggregated data**: 30 minutes cache (`s-maxage=1800`)
- **Daily/Monthly aggregated data**: 1 hour cache (`s-maxage=3600`)
- **Raw hourly data**: 15 minutes cache (`s-maxage=900`)

All responses include `stale-while-revalidate` headers for optimal user experience.

## Error Handling

| Status Code | Description | Response |
|-------------|-------------|----------|
| 200 | Success | Data response |
| 400 | Bad Request | Invalid parameters |
| 404 | Not Found | No data available |
| 500 | Internal Server Error | Server error |

Error responses include:
```json
{
  "error": "Error message",
  "message": "Detailed error information"
}
```

## Data Privacy

The API respects data privacy constraints from EnergiDataService:
- Consumption data for fewer than 20 units is aggregated into "Andet" (Other)
- Personal consumption data is not exposed
- All data is aggregated and anonymized

## Rate Limits

The API follows EnergiDataService rate limits:
- 40 requests per 10 seconds per IP
- Implement client-side caching to minimize API calls
- Use appropriate query parameters to reduce data volume

## Performance Considerations

### For Map Visualization
- Use `aggregate=municipality` for overview maps
- Set appropriate `limit` based on viewport
- Cache results client-side with React Query

### For Time Series
- Use `aggregate=daily` or `aggregate=monthly` for trends
- Limit date ranges to necessary periods
- Consider pagination for large datasets

### For Real-time Updates
- Use WebSocket connections for live data (future enhancement)
- Implement optimistic updates in UI
- Use stale-while-revalidate caching strategy

## Integration with React

### Using the Custom Hook
```typescript
import { useMapConsumptionData } from '../hooks/useConsumptionData';

function ConsumptionMap() {
  const { data, isLoading, error } = useMapConsumptionData({
    start: '2024-01-01',
    end: '2024-01-31'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(municipality => (
        <div key={municipality.municipalityNo}>
          {municipality.municipalityName}: {municipality.totalConsumption} kWh
        </div>
      ))}
    </div>
  );
}
```

### Filtering Categories
```typescript
import { useConsumptionCategories } from '../hooks/useConsumptionData';

function CategoryFilter() {
  const { housingCategories, heatingCategories } = useConsumptionCategories();

  return (
    <div>
      <select>
        {housingCategories.map(category => (
          <option key={category} value={category}>
            {translateHousingCategory(category)}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live data
2. **Geographical Boundaries**: Municipality polygon data for precise mapping
3. **Population Data**: Consumption per capita calculations
4. **Weather Correlation**: Integration with weather data
5. **Predictive Analytics**: Consumption forecasting
6. **Export Functionality**: CSV/Excel export capabilities
7. **Advanced Filtering**: More granular time filters
8. **Comparative Analysis**: Year-over-year comparisons

## Technical Architecture

### Data Flow
1. Client requests data via API endpoint
2. Server validates parameters and builds EnergiDataService query
3. Data is fetched from EnergiDataService with appropriate filters
4. Raw data is processed and enriched (municipality names, translations)
5. Aggregation is performed based on request parameters
6. Response is cached at CDN level (Vercel Edge)
7. Client receives processed data optimized for visualization

### Database Schema (Future)
For improved performance, consider caching frequent queries:
```sql
CREATE TABLE consumption_cache (
  id SERIAL PRIMARY KEY,
  municipality_no VARCHAR(10),
  date DATE,
  housing_category VARCHAR(50),
  heating_category VARCHAR(50),
  total_consumption DECIMAL(10,2),
  record_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

This API provides a robust foundation for electricity consumption analysis and visualization while maintaining high performance and data privacy standards.