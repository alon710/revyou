# Design Language Guide

## Overview

This document outlines the design language and visual system used throughout the Google Review AI Reply dashboard. The design emphasizes **clarity**, **consistency**, and **modern aesthetics** with a clean, professional appearance.

---

## Core Design Principles

### 1. **Subtle Depth**

Create visual hierarchy through gentle shadows and layering rather than heavy borders or stark contrasts.

### 2. **Soft Boundaries**

Use muted, semi-transparent borders to define spaces without creating harsh divisions.

### 3. **Smooth Interactions**

All interactive elements feature fluid transitions and multi-layered feedback states.

### 4. **Breathable Spacing**

Consistent, generous spacing creates a clean, uncluttered interface.

### 5. **Meaningful Icons**

Icons are used purposefully to enhance understanding and visual hierarchy.

---

## Color & Opacity System

### Border Opacity

```css
/* Standard borders - softer, less intrusive */
border-border/40

/* Reason: Creates gentle boundaries without harsh lines */
/* Used in: Cards, Navbars, Separators, Form inputs */
```

### Background Opacity

```css
/* Muted backgrounds for content areas */
bg-muted/50

/* Subtle accent backgrounds */
bg-accent/10

/* Primary tinted backgrounds */
bg-primary/5

/* Reason: Provides visual distinction without overwhelming */
/* Used in: Code blocks, Review text areas, AI reply sections */
```

### Shadow System

```css
/* Subtle elevation - for most cards and interactive elements */
shadow-sm

/* Hover state - adds depth on interaction */
hover:shadow-md

/* Reason: Creates depth perception and visual hierarchy */
/* Used in: Cards, Buttons, Active navigation items */
```

---

## Component Design Patterns

### Cards (DashboardCard)

#### Structure

```tsx
<DashboardCard>
  <DashboardCardHeader>
    <DashboardCardTitle icon={<Icon />}>Title Text</DashboardCardTitle>
    <DashboardCardDescription>Description text</DashboardCardDescription>
  </DashboardCardHeader>

  <DashboardCardContent>{/* Main content */}</DashboardCardContent>

  <DashboardCardFooter>{/* Actions */}</DashboardCardFooter>
</DashboardCard>
```

#### Visual Properties

- **Border**: `border-border/40` - Soft, subtle outline
- **Shadow**: `shadow-sm` - Gentle elevation
- **Hover**: `hover:shadow-md` - Increased depth on interaction
- **Corners**: `rounded-lg` - Modern, smooth corners
- **Background**: `bg-card` - Theme-aware background

#### Field Layout

```tsx
<DashboardCardField label="Field Label">
  <content or value>
</DashboardCardField>
```

**Label Styling**:

- `text-xs` - Small, unobtrusive
- `font-medium` - Readable weight
- `text-muted-foreground` - Subdued color
- `uppercase tracking-wide` - Clear hierarchy

**Value Styling**:

- `text-sm font-medium` - Emphasized content
- `leading-relaxed` - Better readability

#### Section Separators

```tsx
<DashboardCardSection withBorder={true}>
  {/* Separated content */}
</DashboardCardSection>
```

- **Border**: `border-t border-border/40` - Subtle top border
- **Spacing**: `pt-4 mt-4` - Breathing room

---

### Navigation (Navbar)

#### Container - Floating Design

The navbar uses a modern floating design that sits above the content with breathing space on all sides.

**Positioning & Width**:

```css
/* Outer wrapper - fixed positioning with margins */
fixed left-0 right-0 px-4 md:px-8

/* Inner container - width constraint matching PageContainer */
max-w-full lg:max-w-7xl mx-auto
```

**Visual Properties**:

- **Border**: `border border-border/40` - Soft full border (not just bottom)
- **Corners**: `rounded-lg` - Fully rounded for floating effect
- **Shadow**: `shadow-sm` - Subtle elevation
- **Background**: `bg-card/95 backdrop-blur-md` - Frosted glass with card color
- **Fallback**: `supports-[backdrop-filter]:bg-card/60` - Enhanced transparency with backdrop support
- **Transition**: `transition-shadow` - Smooth shadow changes on interaction

**Layout Spacing**:

- **Top margin**: `top-4` (16px from viewport top when visible)
- **Horizontal padding**: `px-4 md:px-8` (outer wrapper margins)
- **Internal padding**: `px-4 sm:px-6 lg:px-8` (content padding)
- **Height**: `h-16` (64px navbar height)
- **Required page padding**: `pt-24 md:pt-28` (accounts for navbar + breathing space)

**Auto-Hide Behavior**:

The navbar automatically hides when scrolling down and reappears when scrolling up for a cleaner reading experience.

```tsx
// Scroll threshold
currentScrollY > 100 // Only hide after scrolling past 100px

// Animation
transition-all duration-300 // Smooth 300ms transition
top-4 // Visible state
-top-24 // Hidden state (slides up)
```

**Implementation Note**: Scroll logic is centralized in `NavbarContainer`. Use `scrollSelector` prop to specify custom scroll containers (e.g., `scrollSelector="main"` for dashboard layout). Defaults to `window` scroll for landing pages.

#### Navigation Items

**Desktop Nav Items**:

```tsx
className={cn(
  "flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg",
  isActive
    ? "bg-accent text-accent-foreground shadow-sm"
    : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
)}
```

**States**:

- **Default**: `text-foreground/80` - Muted text
- **Hover**: `hover:bg-accent/50` - Subtle background + `hover:text-foreground` - Full opacity text
- **Active**: `bg-accent text-accent-foreground shadow-sm` - Clear indication with shadow

**Spacing**:

- **Gap between items**: `gap-2` - Compact, modern spacing
- **Item padding**: `px-3 py-2` - Comfortable click target

#### Mobile Menu

- **Container gap**: `gap-2` - Tight, efficient spacing
- **Border separators**: `border-border/40` - Consistent with theme
- **Section padding**: `pt-3 mt-3` - Clear separation

#### Design Rationale

**Why floating instead of full-width?**

- Creates modern, elevated appearance
- Provides breathing space around navigation
- Aligns width with page content for visual consistency
- Allows background to show through on edges

**Why auto-hide on scroll?**

- Maximizes screen real estate when reading
- Remains easily accessible (scroll up to reveal)
- Smooth transitions maintain polish
- Common modern UX pattern

**Why card background instead of background color?**

- Provides subtle differentiation from page background
- Prevents white-on-white appearance
- Maintains theme consistency (uses card color palette)
- Works in both light and dark modes

---

### Form Elements

#### Input Fields

```tsx
<DashboardCardField label="Field Name">
  <Input
    type="text"
    value={value}
    onChange={handleChange}
    placeholder="Placeholder text"
  />
</DashboardCardField>
```

**Styling Enhancements**:

- Inputs inherit theme styling
- Labels use uppercase tracking for clarity
- Helper text in `text-xs text-muted-foreground`

#### Textareas

```tsx
<Textarea
  value={value}
  onChange={handleChange}
  rows={4}
  className="resize-none"
/>
```

**Display Mode**:

```tsx
<p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
  {displayValue}
</p>
```

#### Selects

- **Trigger**: Add `shadow-sm` for consistency
- **Content**: Theme-styled automatically
- **Icon integration**: Include meaningful icons in select values

---

### Review Cards

#### Structure

```tsx
<DashboardCard>
  <DashboardCardHeader>
    {/* Reviewer name + Status badge */}
  </DashboardCardHeader>

  <DashboardCardContent>
    {/* Review text with section label */}
    {/* AI Reply with section label */}
    {/* Star rating - bottom right */}
  </DashboardCardContent>

  <DashboardCardFooter>{/* Action buttons */}</DashboardCardFooter>
</DashboardCard>
```

#### Section Labels

```tsx
<div className="flex items-center gap-2 mb-2">
  <Icon className="h-4 w-4 text-muted-foreground" />
  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
    SECTION NAME
  </span>
</div>
```

#### Content Backgrounds

**Review Text**:

```css
bg-muted/50 p-3 rounded-md
```

**AI Reply**:

```css
border border-primary/20 bg-primary/5 p-3 rounded-md
```

**Reason**: Different backgrounds help distinguish content types

---

## Typography System

### Hierarchy

#### Headings

```css
/* Card Titles */
text-lg font-semibold leading-none tracking-tight

/* Section Labels */
text-xs font-medium text-muted-foreground uppercase tracking-wide
```

#### Body Text

```css
/* Standard text */
text-sm leading-relaxed

/* Emphasized values */
text-sm font-medium

/* Descriptions */
text-sm text-muted-foreground
```

#### Technical/Code

```css
/* Code/IDs */
text-sm font-mono text-muted-foreground/80

/* Background for code */
bg-muted/50 p-2 rounded-md
```

### Line Height

- **Standard**: `leading-relaxed` - Better readability
- **Tight**: `leading-none` - Compact headers
- **Multi-line**: `whitespace-pre-wrap` - Preserve formatting

---

## Icon System

### Usage Pattern

```tsx
<Icon className="h-4 w-4 text-muted-foreground" />
```

### Icon Sizes

- **h-4 w-4** (16px): Standard icons in forms, labels, small buttons
- **h-5 w-5** (20px): Card headers, navigation items
- **h-6 w-6** (24px): Mobile menu button

### Semantic Icons

| Icon            | Usage               | Meaning                 |
| --------------- | ------------------- | ----------------------- |
| `User`          | Reviewer identity   | Person/account          |
| `Building2`     | Business identity   | Organization            |
| `MessageSquare` | Content/replies     | Communication           |
| `Star`          | Ratings/reviews     | Quality/feedback        |
| `Bell`          | Notifications       | Alerts/updates          |
| `Sparkles`      | AI features         | Intelligence/automation |
| `Code`          | Templates/technical | Development/code        |
| `Settings`      | Configuration       | Adjustments/options     |

### Icon Color

- **Default**: `text-muted-foreground` - Subtle, supporting role
- **Primary context**: `text-primary` - Important/active state
- **Active states**: Inherit from parent text color

---

## Spacing System

### Card Spacing

```css
/* Header */
p-6 pb-4

/* Content */
p-6 pt-4

/* Footer */
p-6 pt-4 border-t border-border/40
```

### Content Spacing

```css
/* Major sections */
space-y-6

/* Subsections */
space-y-4

/* Tight groupings */
space-y-2

/* Form fields */
space-y-3
```

### Gap Spacing (Flexbox)

```css
/* Navigation items */
gap-2

/* Icon + text */
gap-2 or gap-3

/* Button groups */
gap-2
```

### Navbar Clearance

When using the floating navbar, ensure proper top padding on page content:

```css
/* Dashboard layout - element scroll container */
pt-24 md:pt-28

/* Landing layout - window scroll */
pt-24 md:pt-28

/* Calculation: top margin (16px) + navbar height (64px) + breathing space (16px) = 96px (pt-24) */
/* Desktop gets extra space: 112px (pt-28) */
```

**Why this spacing?**

- Prevents navbar from overlapping content
- Provides visual breathing room
- Accounts for navbar margins and height
- Consistent across all layouts

---

## Interactive States

### Button States

```css
/* Default state */
transition-all

/* Hover */
hover:bg-accent/50 hover:text-foreground

/* Active */
bg-accent text-accent-foreground shadow-sm
```

### Link States

```css
/* Navigation links */
transition-all rounded-lg px-3 py-2

/* Hover */
hover:bg-accent/50 hover:text-foreground

/* Active page */
bg-accent text-accent-foreground shadow-sm
```

### Mobile Interactions

```css
/* Touch targets */
p-2 rounded-lg

/* States */
hover:bg-accent/50 active:bg-accent transition-all
```

---

## Rounded Corners

### Border Radius Scale

```css
/* Cards and major containers */
rounded-lg (8px)

/* Buttons and interactive elements */
rounded-lg (8px)

/* Small elements (badges, chips) */
rounded-md (6px)

/* Legacy/deprecated */
rounded-xl (avoid - use rounded-lg instead)
```

**Consistency Rule**: Use `rounded-lg` for all new components unless there's a specific design reason.

---

## Transitions

### Standard Transition

```css
transition-all
```

**Use for**: Most interactive elements (buttons, links, cards)

### Specific Transitions

```css
transition-colors /* Color-only changes */
transition-shadow /* Shadow-only changes */
```

**Use when**: Performance optimization needed

### Duration

- Default Tailwind duration (150ms) - Fast, responsive
- No custom durations needed - maintain consistency

---

## RTL (Right-to-Left) Support

### Text Direction

```tsx
/* Forms and inputs in Hebrew */
dir = "rtl";

/* Text alignment */
text - right;
```

### Layout Considerations

- Flexbox reverses naturally with RTL
- Icons typically stay on the left (visual, not textual)
- Explicit `text-right` for mobile menu items

---

## Dark Mode Considerations

All components use theme-aware colors:

- `bg-background` - Adapts to theme
- `bg-card` - Card background
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `border-border` - Border color

**Opacity modifiers work in both modes**:

- `border-border/40` - Consistent across themes
- `bg-muted/50` - Theme-aware opacity

---

## Component Examples

### Example 1: Settings Card

```tsx
<DashboardCard>
  <DashboardCardHeader>
    <DashboardCardTitle icon={<User className="h-5 w-5" />}>
      Account Information
    </DashboardCardTitle>
    <DashboardCardDescription>Your account details</DashboardCardDescription>
  </DashboardCardHeader>

  <DashboardCardContent className="space-y-4">
    <DashboardCardField label="Name" value="John Doe" />
    <DashboardCardField label="Email" value="john@example.com" />
  </DashboardCardContent>
</DashboardCard>
```

### Example 2: Review Card

```tsx
<DashboardCard>
  <DashboardCardHeader className="pb-3">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Reviewer Name</h3>
      </div>
      <Badge variant="secondary">Pending</Badge>
    </div>
  </DashboardCardHeader>

  <DashboardCardContent className="space-y-4">
    <div>
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Review
        </span>
      </div>
      <div className="rounded-md bg-muted/50 p-3">
        <p className="text-sm leading-relaxed">Review text here...</p>
      </div>
    </div>

    <div className="flex justify-end pt-2">
      <StarRating rating={5} size={18} />
    </div>
  </DashboardCardContent>

  <DashboardCardFooter>
    <Button variant="outline" size="sm">
      Edit
    </Button>
    <Button variant="default" size="sm">
      Publish
    </Button>
  </DashboardCardFooter>
</DashboardCard>
```

### Example 3: Navigation Item

```tsx
<Link
  href="/dashboard"
  className={cn(
    "flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg",
    isActive
      ? "bg-accent text-accent-foreground shadow-sm"
      : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
  )}
>
  <Icon className="h-4 w-4" />
  <span>Dashboard</span>
</Link>
```

---

## Design Checklist

When creating new components, ensure:

- [ ] Uses `border-border/40` for borders
- [ ] Uses `rounded-lg` for rounded corners
- [ ] Includes `shadow-sm` on cards/elevated elements
- [ ] Has `transition-all` on interactive elements
- [ ] Icons are `h-4 w-4` or `h-5 w-5` with `text-muted-foreground`
- [ ] Labels use `text-xs font-medium text-muted-foreground uppercase tracking-wide`
- [ ] Values use `text-sm font-medium`
- [ ] Content uses `bg-muted/50` for backgrounds
- [ ] Spacing uses `space-y-4` or `space-y-6` for sections
- [ ] Gaps use `gap-2` or `gap-3` for flex items
- [ ] Hover states include both background and text changes
- [ ] Active states include `shadow-sm`
- [ ] RTL support where needed (`dir="rtl"`)
- [ ] Theme-aware colors (no hardcoded colors)

---

## Migration Guide

### From Old Card to DashboardCard

**Before**:

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      <CardTitle>Title</CardTitle>
    </div>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label>Field</Label>
      <p className="text-sm">{value}</p>
    </div>
  </CardContent>
</Card>
```

**After**:

```tsx
<DashboardCard>
  <DashboardCardHeader>
    <DashboardCardTitle icon={<Icon className="h-5 w-5" />}>
      Title
    </DashboardCardTitle>
    <DashboardCardDescription>Description</DashboardCardDescription>
  </DashboardCardHeader>
  <DashboardCardContent className="space-y-4">
    <DashboardCardField label="Field" value={value} />
  </DashboardCardContent>
</DashboardCard>
```

### From Plain Border to Soft Border

**Before**: `border` or `border-border`
**After**: `border border-border/40`

### From Hard Corners to Smooth Corners

**Before**: `rounded-md` or `rounded-xl`
**After**: `rounded-lg`

### From No Shadow to Subtle Shadow

**Before**: No shadow class
**After**: `shadow-sm`

### From Simple Transition to Complete Transition

**Before**: `transition-colors`
**After**: `transition-all`

---

## Accessibility Notes

### Color Contrast

- Muted foreground colors maintain WCAG AA contrast ratios
- Opacity values (`/40`, `/50`) tested for readability

### Touch Targets

- Minimum touch target: `44x44px` (achieved with `px-3 py-2` on `text-sm`)
- Mobile menu items: Even larger with `px-3 py-2` on `text-sm` with icons

### Focus States

- All interactive elements inherit Tailwind's focus-visible styles
- No custom focus styles needed - browser defaults are accessible

### Screen Readers

- Icons are decorative (paired with text)
- Semantic HTML structure maintained
- ARIA labels on icon-only buttons

---

## Performance Considerations

### Shadow Optimization

- Use `shadow-sm` instead of custom shadows
- Avoid `shadow-2xl` and heavy shadows
- Limit shadow transitions to hover states only

### Opacity Performance

- Opacity values are GPU-accelerated
- Border/background opacity preferred over multiple overlays

### Transition Performance

- `transition-all` is optimized by Tailwind
- Avoid custom cubic-bezier unless necessary

---

## Version History

- **v1.1** (2025-01-25): Floating navbar pattern
  - Modern floating navbar with auto-hide on scroll
  - Centralized scroll logic in NavbarContainer
  - Width constraint matching PageContainer
  - Card background for better differentiation
  - Navbar clearance spacing guidelines
  - Design rationale documentation

- **v1.0** (2025-01-25): Initial design language established
  - DashboardCard component system
  - Navbar modernization
  - BusinessToggler update
  - ReviewCard redesign
  - Soft borders and shadows system
  - Typography and spacing standards

---

## Quick Reference

### Most Common Patterns

```css
/* Card */
rounded-lg border border-border/40 shadow-sm

/* Content Background */
bg-muted/50 p-3 rounded-md

/* Section Label */
text-xs font-medium text-muted-foreground uppercase tracking-wide

/* Interactive Element */
transition-all px-3 py-2 rounded-lg hover:bg-accent/50

/* Icon */
h-4 w-4 text-muted-foreground

/* Border Separator */
border-t border-border/40 pt-4 mt-4
```

---

## Contact & Contributions

For questions or suggestions about the design language, please refer to the component implementations in:

- `/components/ui/dashboard-card.tsx`
- `/components/dashboard/ReviewCard.tsx`
- `/components/layout/navbar/`
- `/components/dashboard/business-config/`

---

**Last Updated**: January 25, 2025
**Design System Version**: 1.1
