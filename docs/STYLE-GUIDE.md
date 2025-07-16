# ElPortal Style Guide

## Design System Overview

This document outlines the design patterns, conventions, and best practices for the ElPortal project.

## Color System

### Brand Colors
- **Primary Green**: `bg-brand-green` (#84db41) - Main brand color for CTAs and highlights
- **Primary Green Hover**: `bg-brand-green-hover` (#75c837) - Hover state for primary actions
- **Primary Green Light**: `bg-brand-green-light` (#a5e96d) - Light variant for backgrounds
- **Primary Green Dark**: `bg-brand-green-dark` (#6bc52d) - Dark variant for emphasis

- **Brand Dark**: `bg-brand-dark` (#001a12) - Dark brand color for headers/footers
- **Brand Dark Light**: `bg-brand-dark-light` (#002a1f) - Lighter variant
- **Brand Dark Lighter**: `bg-brand-dark-lighter` (#003d2c) - Lightest dark variant

### System Colors
- **Background**: `bg-background` - Main page background
- **Foreground**: `text-foreground` - Default text color
- **Primary**: `bg-primary text-primary-foreground` - Primary button/action color
- **Secondary**: `bg-secondary text-secondary-foreground` - Secondary elements
- **Muted**: `bg-muted text-muted-foreground` - Subtle backgrounds and disabled states
- **Accent**: `bg-accent text-accent-foreground` - Accent elements
- **Destructive**: `bg-destructive text-destructive-foreground` - Error/danger states

## Typography

### Font Families
- **Body Text**: Inter (variable font) - `font-sans`
- **Headings**: Geist (variable font) - `font-display`

### Font Sizes (Using Tailwind defaults)
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)
- `text-5xl`: 3rem (48px)

### Font Weights
- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700

### Heading Patterns
```jsx
// H1 - Page titles
<h1 className="text-4xl md:text-5xl font-display font-bold">

// H2 - Section headings
<h2 className="text-3xl md:text-4xl font-display font-bold">

// H3 - Subsection headings
<h3 className="text-2xl md:text-3xl font-display font-semibold">

// H4 - Card/component headings
<h4 className="text-xl md:text-2xl font-display font-semibold">
```

## Spacing System

### Container Widths
- **Standard Container**: `container` - Centered with responsive padding
- **Wide Container**: Custom component for wider layouts
- **Full Bleed**: Full width sections

### Section Spacing
- **Default**: `py-16 md:py-24` - Standard vertical section padding
- **Compact**: `py-8 md:py-12` - Reduced spacing
- **Large**: `py-24 md:py-32` - Increased spacing

### Component Spacing
- **Card Padding**: `p-6` - Standard card inner padding
- **Button Padding**: `px-4 py-2` (default), `px-6 py-3` (large)
- **Form Spacing**: `space-y-4` - Vertical spacing between form elements

## Component Patterns

### Buttons
```jsx
// Primary Button
<Button className="bg-brand-green hover:bg-brand-green-hover">

// Secondary Button
<Button variant="secondary">

// Outline Button
<Button variant="outline">

// Ghost Button
<Button variant="ghost">

// Destructive Button
<Button variant="destructive">
```

### Cards
```jsx
<Card className="p-6 hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Form Elements
```jsx
// Input with Label
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter email" />
</div>

// Select
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

## Responsive Design

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach
Always design for mobile first, then add responsive modifiers:
```jsx
className="text-base md:text-lg lg:text-xl"
className="px-4 md:px-6 lg:px-8"
```

## Animation Patterns

### Transitions
- **Default**: `transition-all duration-200`
- **Fast**: `transition-all duration-150`
- **Slow**: `transition-all duration-300`

### Hover Effects
```jsx
// Scale on hover
className="hover:scale-105 transition-transform"

// Shadow on hover
className="hover:shadow-lg transition-shadow"

// Color transition
className="hover:bg-brand-green-hover transition-colors"
```

## Accessibility Guidelines

### Focus States
- Always visible focus indicators
- Use `focus:ring-2 focus:ring-offset-2 focus:ring-brand-green`

### ARIA Labels
- Add descriptive labels to interactive elements
- Use semantic HTML elements

### Color Contrast
- Ensure text meets WCAG AA standards
- Test with color blindness simulators

## Best Practices

### Do's
- ✅ Use semantic color tokens (`bg-brand-green` not `bg-[#84db41]`)
- ✅ Follow mobile-first responsive design
- ✅ Use consistent spacing patterns
- ✅ Leverage existing UI components
- ✅ Test on multiple screen sizes
- ✅ Maintain consistent hover/focus states

### Don'ts
- ❌ Don't hardcode hex colors
- ❌ Don't create one-off spacing values
- ❌ Don't override component library styles unnecessarily
- ❌ Don't forget dark mode compatibility
- ❌ Don't use pixels for font sizes (use rem)

## Component Library

We use **shadcn/ui** components with custom styling. When creating new components:

1. Start with shadcn/ui base component
2. Apply brand colors using Tailwind classes
3. Maintain consistent patterns with existing components
4. Document any custom variants

## Dark Mode

All colors should work in both light and dark modes. Use CSS variables defined in `index.css` for theme-aware colors.

## Future Enhancements

- [ ] Add more semantic color tokens for specific use cases
- [ ] Create Figma/design tool tokens file
- [ ] Add Storybook for component documentation
- [ ] Implement design token automation