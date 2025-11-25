# AscendoreCRM Frontend - Design Guide

## Visual Design System

### Color Palette

#### Primary Colors
```
Primary Blue: #0ea5e9 (rgb(14, 165, 233))
- Used for: Primary buttons, active nav items, links, brand elements
- Hover: #0284c7 (slightly darker)

Primary Foreground: #f0f9ff (very light blue)
- Used for: Text on primary colored backgrounds
```

#### Secondary Colors
```
Secondary Gray: #f8fafc (very light gray)
- Used for: Subtle backgrounds, cards, secondary buttons
- Darker variant: #e2e8f0

Secondary Foreground: #334155 (dark gray)
- Used for: Text on secondary backgrounds
```

#### Accent Colors
```
Accent: #f8fafc
- Used for: Hover states, highlights

Muted: #64748b (medium gray)
- Used for: Secondary text, descriptions, metadata

Destructive: #ef4444 (red)
- Used for: Delete buttons, error states, warnings
```

#### Border & Background
```
Border: #e2e8f0 (light gray)
Background: #ffffff (white)
Foreground: #020617 (near black)
```

### Typography

#### Font Family
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

#### Font Sizes
- **Heading 1**: 2rem (32px) - Page titles
- **Heading 2**: 1.5rem (24px) - Card titles
- **Heading 3**: 1.25rem (20px) - Section headers
- **Body**: 0.875rem (14px) - Main text
- **Small**: 0.75rem (12px) - Metadata, timestamps
- **Tiny**: 0.625rem (10px) - Labels, badges

#### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Subheadings, labels
- **Semibold**: 600 - Card titles, nav items
- **Bold**: 700 - Page titles, emphasis

### Spacing System

Based on Tailwind's spacing scale (4px base):

- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px

### Border Radius

- `rounded-sm`: 2px - Small elements
- `rounded`: 4px - Buttons, inputs
- `rounded-md`: 6px - Cards
- `rounded-lg`: 8px - Panels, modals
- `rounded-full`: 9999px - Avatars, badges

---

## Component Specifications

### Button Variants

#### Default (Primary)
```tsx
<Button>Primary Action</Button>
```
- Background: Primary blue (#0ea5e9)
- Text: White
- Hover: Darker blue
- Use for: Main actions, CTAs

#### Secondary
```tsx
<Button variant="secondary">Secondary Action</Button>
```
- Background: Light gray (#f8fafc)
- Text: Dark gray
- Hover: Slightly darker gray
- Use for: Less important actions

#### Outline
```tsx
<Button variant="outline">Outline Button</Button>
```
- Background: Transparent
- Border: 1px solid gray
- Text: Default foreground
- Use for: Tertiary actions, filters

#### Ghost
```tsx
<Button variant="ghost">Ghost Button</Button>
```
- Background: Transparent
- No border
- Hover: Subtle background
- Use for: Icon buttons, inline actions

#### Destructive
```tsx
<Button variant="destructive">Delete</Button>
```
- Background: Red (#ef4444)
- Text: White
- Use for: Delete, cancel, destructive actions

### Button Sizes

- **Default**: h-10 (40px) - Standard buttons
- **Small**: h-9 (36px) - Compact buttons
- **Large**: h-11 (44px) - Prominent actions
- **Icon**: h-10 w-10 (40x40px) - Icon-only buttons

### Card Component

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

**Specifications:**
- Background: White
- Border: 1px solid #e2e8f0
- Border radius: 8px (rounded-lg)
- Shadow: Subtle (shadow-sm)
- Padding: 24px (p-6)

### Input Fields

```tsx
<div>
  <Label>Field Label</Label>
  <Input type="text" placeholder="Enter value..." />
</div>
```

**Specifications:**
- Height: 40px (h-10)
- Border: 1px solid #e2e8f0
- Border radius: 6px (rounded-md)
- Focus: 2px ring, primary color
- Padding: 12px (px-3)

### Avatar

```tsx
<Avatar>
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

**Specifications:**
- Size: 40x40px (h-10 w-10)
- Border radius: Full circle
- Background: Primary color
- Text: White, uppercase, center-aligned
- Font size: 14px

### Badge

```tsx
<Badge>New</Badge>
<Badge variant="secondary">Active</Badge>
<Badge variant="destructive">Urgent</Badge>
<Badge variant="outline">Draft</Badge>
```

**Specifications:**
- Height: Auto (inline-flex)
- Padding: 2px 10px (px-2.5 py-0.5)
- Border radius: Full (rounded-full)
- Font size: 12px
- Font weight: 600 (semibold)

---

## Layout Specifications

### Sidebar

**Collapsed State:**
- Width: 64px
- Shows: Icons only
- Transition: 300ms ease

**Expanded State:**
- Width: 256px
- Shows: Icons + labels
- Transition: 300ms ease

**Navigation Items:**
- Height: 40px
- Padding: 10px 12px
- Border radius: 8px
- Active state: Primary background
- Hover state: Accent background

### Header

- Height: 64px (h-16)
- Border bottom: 1px solid
- Background: White with backdrop blur
- Fixed position: Top right
- Search bar: Max width 512px
- User menu: Right-aligned

### Main Content Area

- Margin left: Sidebar width (64px or 256px)
- Padding top: Header height (64px)
- Padding: 24px (p-6)
- Min height: calc(100vh - 64px)

---

## Component States

### Hover States
- Buttons: Darken 10%
- Cards: Subtle background (#f8fafc)
- Nav items: Accent background
- Links: Underline

### Focus States
- Inputs: 2px ring, primary color
- Buttons: 2px ring, primary color with offset
- Links: Outline

### Loading States
- Skeleton loaders: Pulsing gray background
- Spinners: Rotating icon
- Disabled: 50% opacity, no pointer events

### Empty States
- Centered content
- Muted text color
- Optional illustration or icon
- Call-to-action button

### Error States
- Red text (#ef4444)
- Red background (10% opacity)
- Error icon
- Clear error message

---

## Icon Usage

### Icon Library: Lucide React

**Common Icons:**
- `LayoutDashboard` - Dashboard
- `Users` - Contacts
- `Building2` - Companies
- `DollarSign` - Deals
- `CheckSquare` - Activities
- `MessageSquare` - Chat
- `Settings` - Settings
- `Search` - Search
- `Bell` - Notifications
- `LogOut` - Sign out
- `Plus` - Add/Create
- `Edit2` - Edit
- `Trash2` - Delete
- `MoreVertical` - More options

**Icon Sizes:**
- Small: 16px (h-4 w-4)
- Medium: 20px (h-5 w-5)
- Large: 24px (h-6 w-6)

**Icon Colors:**
- Default: Inherit from parent
- Muted: text-muted-foreground
- Primary: text-primary

---

## Animation Guidelines

### Transitions
```css
transition-colors /* Color changes (200ms) */
transition-all duration-300 /* Layout changes (300ms) */
```

### Animations
```css
animate-spin /* Loading spinners */
animate-pulse /* Skeleton loaders */
animate-slide-in /* Modal/panel entrance */
animate-fade-in /* Content appearance */
```

### Hover Effects
- Scale: Not used (prefer color/background changes)
- Translate: Used for subtle lift effects
- Opacity: Used for fade in/out

---

## Responsive Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1400px /* Large screens */
```

### Mobile Adaptations
- Sidebar: Overlay on mobile, fixed on desktop
- Header: Simplified on mobile
- Grid layouts: Single column on mobile
- Font sizes: Slightly smaller on mobile

---

## Accessibility Guidelines

### Color Contrast
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Focus Indicators
- Always visible
- 2px ring with offset
- Primary color

### Keyboard Navigation
- Tab order: Logical flow
- Enter/Space: Activate buttons
- Escape: Close modals
- Arrow keys: Navigate lists

### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Alt text for images
- Hidden loading states announced

---

## Design Patterns

### Cards
Use for: Grouped content, list items, panels
- Always have border
- Subtle shadow
- Hover effect on clickable cards

### Lists
Use for: Contacts, companies, deals
- Clear spacing between items
- Hover state
- Action buttons on right

### Forms
Use for: Login, create/edit modals
- Labels above inputs
- Clear error messages
- Submit button at bottom

### Empty States
Use for: No data scenarios
- Centered content
- Descriptive message
- Suggested action

### Loading States
Use for: Async operations
- Skeleton loaders for lists
- Spinners for buttons
- Progress bars for uploads

---

## Chat Interface Design

### Message Bubbles

**User Messages:**
- Background: Primary blue
- Text: White
- Aligned: Right
- Avatar: Right side

**Assistant Messages:**
- Background: Muted gray
- Text: Default foreground
- Aligned: Left
- Avatar: Left side (bot icon)

**Message Spacing:**
- Between messages: 16px (space-4)
- Within bubble: 12px (p-3)
- Max width: 80% of container

### Chat Input

- Height: Auto (min 40px)
- Border: 1px solid gray
- Border radius: 8px
- Padding: 12px
- Send button: Icon only, primary color

### Floating Chat

- Position: Fixed bottom-right
- Width: 420px
- Height: 600px
- Shadow: Large (shadow-2xl)
- Animation: Slide in from right
- Close button: Top right

---

## Dashboard Layout

### Metrics Cards (Top Row)
- Grid: 4 columns on desktop, 2 on tablet, 1 on mobile
- Gap: 16px (gap-4)
- Equal height cards
- Icon in header

### Content Grid (Below Metrics)
- Grid: 2 columns on desktop, 1 on mobile
- Gap: 24px (gap-6)
- Left: Contacts list
- Right: Deals pipeline

---

## Best Practices

### Do's
- Use consistent spacing (multiples of 4)
- Maintain color contrast ratios
- Provide loading and empty states
- Use semantic HTML
- Follow component patterns

### Don'ts
- Mix spacing systems
- Use too many colors
- Ignore accessibility
- Create one-off components
- Hardcode values

---

## Component Composition Examples

### Dashboard Stat Card
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Value</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$125,450</div>
    <p className="text-xs text-muted-foreground">+20% from last month</p>
  </CardContent>
</Card>
```

### Contact List Item
```tsx
<div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer">
  <div className="flex items-center space-x-4">
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
    <div>
      <div className="font-medium">John Doe</div>
      <div className="text-sm text-muted-foreground">john@company.com</div>
    </div>
  </div>
  <Badge>Active</Badge>
</div>
```

---

## Conclusion

This design system ensures:
- Visual consistency across the application
- Professional, modern appearance
- Accessibility compliance
- Easy maintenance and scaling
- Clear developer guidelines

All components follow these patterns, making the codebase predictable and maintainable.
