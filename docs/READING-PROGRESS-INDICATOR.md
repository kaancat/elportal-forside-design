# Reading Progress Indicator

## Overview
A DR-inspired reading progress indicator that shows users how far they've scrolled through article content. The red progress bar appears at the top of the page (below navigation) and tracks reading progress from the start of the content to when the footer comes into view.

## Features
- **Smooth tracking**: Real-time progress updates with throttled scroll events
- **Smart boundaries**: Starts after hero/navigation, ends when footer appears
- **Mobile optimized**: 4px height on mobile (3px on desktop)
- **Performance focused**: Uses requestAnimationFrame and GPU-accelerated animations
- **Accessible**: Full ARIA support and screen reader announcements
- **Sanity controlled**: Toggle per page via Sanity Studio

## How to Enable

### In Sanity Studio
1. Open any page document in Sanity Studio
2. Find the "Show Reading Progress" toggle field (below "Is Homepage")
3. Toggle it ON for pages where you want the progress indicator
4. Publish the changes

### Best Use Cases
- Long-form articles and guides
- Tutorial pages
- Documentation pages
- Blog posts
- FAQ pages with extensive content

### When NOT to Use
- Homepage (usually has diverse content sections)
- Short pages (less than 1.5 viewport heights)
- Landing pages with hero-focused content
- Gallery or portfolio pages

## Technical Implementation

### Components
- **`ReadingProgress.tsx`**: Core component that handles scroll tracking and rendering
- **`ReadingProgressContext.tsx`**: React Context for passing state between pages and layout
- **`Layout.tsx`**: Renders the progress indicator when enabled

### How It Works
1. Page components (Index/GenericPage) read `showReadingProgress` from Sanity
2. They update the context using `setShowReadingProgress(true/false)`
3. Layout component reads from context and conditionally renders the indicator
4. ReadingProgress component calculates scroll position relative to content boundaries

### Performance Optimizations
- Passive scroll event listeners
- RequestAnimationFrame throttling (16ms for 60fps)
- CSS transforms for GPU acceleration
- No React re-renders during scroll (uses refs)
- Automatic hiding on short pages

## Styling

### Default Appearance
```css
- Position: Fixed below navigation (top: 64px)
- Height: 3px (desktop) / 4px (mobile)
- Color: Yellow (#facc15 / bg-yellow-400)
- Background track: rgba(0,0,0,0.1)
- Z-index: 40 (below nav's 50)
- Smooth width transitions
```

### Customization
To change the appearance, modify these props in `ReadingProgress.tsx`:
```tsx
<ReadingProgress 
  color="bg-brand-green"  // Change color
  height={5}              // Change thickness
  showPercentage={true}   // Show percentage number
/>
```

## Edge Cases Handled

### Content Detection
- Skips hero sections (progress starts after hero)
- Handles pages with no footer gracefully
- Works with dynamic content loading
- Recalculates on window resize

### Mobile Considerations
- Thicker bar for better visibility (4px)
- Touch-optimized scroll tracking
- Respects mobile safe areas
- Hidden on very short mobile pages

### Navigation Scenarios
- Persists during smooth scrolling
- Resets on route changes
- Handles browser back/forward correctly
- Cleans up on unmount

## Testing

### Local Testing
1. Open `/test-reading-progress.html` in browser
2. Toggle the indicator on/off
3. Try with percentage display
4. Test on different viewport sizes

### Production Testing
1. Enable on a test page in Sanity Studio
2. Verify it appears on the published page
3. Check mobile responsiveness
4. Test with actual content lengths

## Accessibility

### ARIA Attributes
- `role="progressbar"`
- `aria-label="Reading progress"`
- `aria-valuenow={percentage}`
- `aria-valuemin={0}`
- `aria-valuemax={100}`

### Screen Reader Support
- Announces progress at 0%, 25%, 50%, 75%, 100%
- Hidden decorative elements with `aria-hidden`
- Semantic HTML structure

### Keyboard Navigation
- Doesn't interfere with keyboard scrolling
- No focus traps or accessibility barriers
- Works with Page Up/Down and Space bar scrolling

## Browser Support
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation on older browsers

## Troubleshooting

### Indicator Not Showing
1. Check if `showReadingProgress` is enabled in Sanity
2. Verify page has enough content (>1.5 viewport heights)
3. Check browser console for errors
4. Ensure navigation is sticky (required for positioning)

### Performance Issues
1. Check if other scroll listeners are conflicting
2. Verify requestAnimationFrame is working
3. Look for CSS animation conflicts
4. Test with Chrome DevTools Performance tab

### Incorrect Progress
1. Check if footer detection is working
2. Verify hero section is being skipped correctly
3. Look for dynamic content affecting calculations
4. Test with different content layouts

## Future Enhancements
- [ ] Add reading time estimate
- [ ] Show chapter/section progress
- [ ] Add milestone notifications
- [ ] Support for multi-page articles
- [ ] Analytics integration for scroll depth tracking