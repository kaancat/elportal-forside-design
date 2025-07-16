# CO2 Emissions Component Documentation

## Overview

The CO2 Emissions Chart component visualizes real-time CO2 intensity data from electricity consumption in Denmark. It provides users with insights to make environmentally conscious decisions about their electricity usage.

## Features

### Visual Elements
1. **Area Chart**: Shows hourly CO2 emissions throughout the day
   - Gradient fill with color indicating emission levels
   - Reference lines at key thresholds (100, 200, 300 g/kWh)
   - Interactive tooltips with detailed information

2. **Emission Gauge** (optional): Circular gauge showing current emission level
   - Color-coded based on intensity
   - Real-time value display
   - Clear emission level label

3. **Statistics Panel**: Daily emission statistics
   - Average emissions
   - Minimum (best time)
   - Maximum (worst time)

### Interactive Controls
- **Date Picker**: Select any historical date
- **Region Selector**: Choose between Danmark (combined), DK1 (West), or DK2 (East)

### Color Coding
- **Very Low** (< 100 g/kWh): Green (#16a34a) - Best time to use electricity
- **Low** (100-200 g/kWh): Lime (#84cc16) - Good time
- **Moderate** (200-300 g/kWh): Yellow (#eab308) - Average
- **High** (300-400 g/kWh): Orange (#f97316) - Consider delaying usage
- **Very High** (> 400 g/kWh): Red (#dc2626) - Worst time

## Technical Implementation

### API Endpoint
- **URL**: `/api/co2-emissions`
- **Parameters**:
  - `region`: 'Danmark', 'DK1', or 'DK2'
  - `date`: YYYY-MM-DD format
  - `aggregation`: 'hourly' or '5min'
- **Data Source**: EnergiDataService CO2Emis dataset

### Component Props
```typescript
interface CO2EmissionsChartProps {
  block: {
    _type: 'co2EmissionsChart';
    title?: string;
    subtitle?: string;
    showGauge?: boolean;
  };
}
```

### Sanity CMS Integration
Add the CO2 emissions chart to any page through Sanity Studio:
1. Navigate to a page or homepage
2. Add a new content block
3. Select "CO2 Emissions Chart"
4. Configure:
   - Title (default: "CO₂-udledning fra elforbrug")
   - Subtitle (optional description)
   - Show Gauge toggle

## Usage Recommendations

### For End Users
- **Green periods**: Run dishwashers, washing machines, and charge EVs
- **Red periods**: Minimize electricity usage when possible
- **Planning**: Check tomorrow's forecast to plan energy-intensive activities

### For Content Editors
- Place after price charts to provide environmental context
- Consider adding on pages about sustainability or green energy
- Use the gauge feature for prominent homepage placement

## Performance Considerations
- Data is cached for 5 minutes to reduce API calls
- Hourly aggregation reduces data payload
- Chart renders efficiently with React.memo optimization

## Future Enhancements
- Historical comparison charts
- Push notifications for low emission periods
- Integration with smart home devices
- Monthly/yearly emission trends
- Carbon footprint calculator based on usage patterns

## Related Components
- **LivePriceGraph**: Shows electricity prices (pairs well with CO2 data)
- **RenewableEnergyForecast**: Displays renewable energy production
- **MonthlyProductionChart**: Shows energy sources breakdown