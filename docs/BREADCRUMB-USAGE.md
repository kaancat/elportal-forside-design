# Breadcrumb Implementation Guide

## Overview

The breadcrumb component is now available and integrated into the GenericPage component. Here's how to use and extend it.

## Basic Usage

### In GenericPage
The breadcrumb is automatically rendered on all generic pages. It currently shows:
- "Forside" (Home) as the first item
- The current page title as the last item

### Custom Implementation
To add breadcrumbs to other pages or components:

```tsx
import { PageBreadcrumb } from '@/components/PageBreadcrumb'

// Define breadcrumb items
const breadcrumbItems = [
  { label: 'Elpriser', href: '/elpriser' },
  { label: 'Historiske priser' } // Current page (no href)
]

// Render
<PageBreadcrumb items={breadcrumbItems} />
```

## Advanced Usage

### With Parent Pages
To show a full hierarchy, you'll need to fetch parent page data from Sanity:

```tsx
// In your page component
const [parentPage, setParentPage] = useState(null)

useEffect(() => {
  // Fetch parent page from Sanity based on your content structure
  const fetchParentPage = async () => {
    if (pageData?.parentPageRef) {
      const parent = await SanityService.getPageById(pageData.parentPageRef)
      setParentPage(parent)
    }
  }
  fetchParentPage()
}, [pageData])

// Build breadcrumb items
const breadcrumbItems = []
if (parentPage) {
  breadcrumbItems.push({
    label: parentPage.title,
    href: `/${parentPage.slug}`
  })
}
breadcrumbItems.push({
  label: pageData.title
})
```

### With Complex Navigation Structure
For mega menu items, you might want to show the menu category:

```tsx
// Example for electricity price pages
const breadcrumbItems = [
  { label: 'Elpriser', href: '/elpriser' },
  { label: 'Aktuelle priser', href: '/elpriser/aktuelle-priser' },
  { label: 'DK1 Vestdanmark' }
]
```

## Styling Customization

The breadcrumb uses the shadcn/ui breadcrumb component with these default styles:
- Text color: `text-muted-foreground` (gray)
- Hover: `hover:text-foreground` (darker)
- Separator: Chevron right icon
- Font size: `text-sm`

To customize, you can:

1. Override styles in the PageBreadcrumb component
2. Pass custom className props
3. Modify the base breadcrumb styles in the UI component

## SEO Benefits

Breadcrumbs provide:
- Better navigation for users
- Improved SEO through structured navigation
- Clear page hierarchy for search engines

Consider adding structured data (JSON-LD) for breadcrumbs in the future for enhanced SEO.

## Next Steps

1. **Add to Sanity Schema**: Create a parent page reference field in your page schema
2. **Implement Hierarchy**: Fetch and display full page hierarchy
3. **Add to More Pages**: Extend breadcrumb usage beyond GenericPage
4. **Structured Data**: Add JSON-LD breadcrumb markup for SEO