# Prognoser Page Hero Image Guide

## Image Requirements
- **Dimensions**: 1920x1080 or larger (16:9 ratio preferred)
- **Theme**: Dark, professional, analytics/forecasting focused
- **Style**: Modern, clean, technology-oriented

## Recommended Unsplash Searches

### Option 1: Analytics Dashboard
Search term: "analytics dashboard dark"
- Look for: Dark mode dashboards with charts and graphs
- Ideal: Images showing energy or electricity data visualization
- Example artists: Luke Chesser, Carlos Muza

### Option 2: Data Visualization
Search term: "data visualization energy"
- Look for: Abstract data visualizations in blue/green tones
- Ideal: Charts showing trends or forecasts
- Example artists: Markus Spiske, Stephen Dawson

### Option 3: Forecasting Technology
Search term: "forecasting charts technology"
- Look for: Professional chart displays or monitoring screens
- Ideal: Multiple monitors showing data trends
- Example artists: Chris Liverani, Nicholas Cappello

### Option 4: Energy Grid
Search term: "electricity grid monitoring"
- Look for: Control room or monitoring station views
- Ideal: Danish or European energy context
- Example artists: American Public Power Association

## Top Specific Image Recommendations

1. **Dashboard Analytics**
   - URL: https://unsplash.com/photos/dark-themed-analytics-dashboard
   - Perfect for: Showing real-time data monitoring
   - Colors: Dark background with blue/green accents

2. **Energy Monitoring**
   - URL: https://unsplash.com/photos/energy-control-room
   - Perfect for: Professional energy management context
   - Colors: Dark with bright monitoring screens

3. **Data Forecast Charts**
   - URL: https://unsplash.com/photos/financial-forecast-charts
   - Perfect for: Emphasizing prediction and forecasting
   - Colors: Dark background with colorful charts

## Upload Instructions

1. **Download Image**
   - Choose high resolution (minimum 1920x1080)
   - Download in JPG format for optimal performance
   - Rename to something descriptive: `prognoser-hero-forecasting.jpg`

2. **Upload to Sanity**
   - Go to https://dinelportal.sanity.studio
   - Navigate to Media → Images
   - Click "Upload" and select your image
   - Add metadata:
     - Title: "Prognoser Hero - Forecasting Dashboard"
     - Alt text: "Elprognose og forecasting dashboard med real-time data"
     - Description: "Hero image for prognoser page showing analytics"

3. **Get Asset ID**
   - After upload, click on the image
   - Copy the asset ID (format: `image-abc123def-1920x1080-jpg`)
   - Note: The ID includes dimensions and format

4. **Update Script**
   - Open `fix-prognoser-page-comprehensive.ts`
   - Find the line with `_ref: 'image-placeholder-1920x1080-jpg'`
   - Replace with your actual asset ID

## Alternative: Create Custom Image

If you can't find the perfect image, consider creating one:

1. **Use Canva or Figma**
   - Create 1920x1080 canvas
   - Dark background (#0a0a0a or #111827)
   - Add chart mockups or graph elements
   - Include Danish text: "Elprognoser" or "Forecasting"
   - Use brand colors (blue/green accents)

2. **Include Elements**
   - Line charts showing price trends
   - Bar graphs for hourly predictions
   - DK1/DK2 zone indicators
   - Time stamps in Danish format

3. **Export Settings**
   - Format: JPG
   - Quality: High (90-100%)
   - Dimensions: 1920x1080

## Color Palette for Custom Images
- Primary Dark: #0a0a0a
- Secondary Dark: #111827
- Accent Blue: #3b82f6
- Accent Green: #10b981
- Chart Lines: #60a5fa, #34d399
- Text: #f3f4f6

## Final Checklist
- [ ] Image is at least 1920x1080
- [ ] Dark theme matches site design
- [ ] Shows forecasting/analytics concept
- [ ] Uploaded to Sanity with proper metadata
- [ ] Asset ID copied correctly
- [ ] Script updated with actual asset ID
- [ ] Test page renders correctly