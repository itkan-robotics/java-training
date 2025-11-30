# SwyftNav Styling Guide

This comprehensive styling guide documents the design system used throughout the SwyftNav website, based on the SWYFT Robotics minimal design philosophy. Use this document as a reference when making styling changes or adding new components.

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Typography](#typography)
3. [Color Palette](#color-palette)
4. [Component Styles](#component-styles)
5. [General Principles](#general-principles)
6. [Quick Reference](#quick-reference)

---

## Design Philosophy

SWYFT Robotics uses a **minimal, functional design** approach:

- **Clean and uncluttered** - Focus on content, not decoration
- **Professional and modern** - High contrast, readable typography
- **Consistent spacing** - Uniform typography hierarchy
- **No unnecessary visual effects** - Flat design with no depth or dimension
- **Functional over decorative** - Every element serves a purpose

### Core Principles

1. **No border radius** - All corners are sharp (0px)
2. **No shadows** - Clean, flat design
3. **No gradients** - Solid colors only
4. **No transforms** - No animations or movements on hover
5. **Simple borders** - 1px solid borders only
6. **Minimal hover effects** - Background color change only
7. **Consistent transitions** - `all ease 0.3s` everywhere
8. **Flat design** - No depth or dimension effects

---

## Typography

### Font Family

- **Primary Font**: Poppins (from Google Fonts)
- **Monospace Font**: JetBrains Mono
- **Headings Font**: Poppins (same as primary)

### Body Text

- **Font size**: `12px` (SWYFT standard)
- **Line height**: `22px` (SWYFT standard)
- **Letter spacing**: `0.02em`
- **Color**: `#232323` (SWYFT primary text)
- **Font weight**: `400` (normal)

### Headings

All headings (h1-h6) follow these rules:

- **Font family**: Poppins
- **Font weight**: `700` (bold)
- **Letter spacing**: `0.05em` (SWYFT heading standard)
- **Text transform**: `uppercase` (SWYFT headings are uppercase)
- **Line height**: `1.25`

#### Heading Sizes

- **h1**: `2.5em`
- **h2**: `2em`
- **h3**: `1.5em`
- **h4**: `1.25em`
- **h5**: `1.125em`
- **h6**: `1em`

### Navigation Links

Header and menu navigation links:

- **Font size**: `14px` (SWYFT menu-lv1-size)
- **Font weight**: `700` (SWYFT menu-lv1-weight)
- **Letter spacing**: `0.05em` (SWYFT menu-lv1-letter-spacing)
- **Text transform**: `uppercase` (SWYFT menu-lv1-text-transform)
- **Line height**: `22px` (SWYFT menu-lv1-line-height)
- **Color**: `#232323`
- **Text decoration**: None by default, underline on hover
- **Transition**: `all ease 0.3s` (SWYFT anchor-transition)

### Sidebar Navigation

- **Font size**: `10.5px` (var(--font-size--small))
- **Line height**: `1.2rem`
- **Color**: `#868686` (secondary text)
- **Top-level items**: `#232323` (primary text), weight `600`
- **Transition**: `all ease 0.3s`

---

## Color Palette

### Primary Colors

- **Primary Text**: `#232323` (SWYFT text color)
- **Secondary Text/Grey**: `#868686` (SWYFT grey)
- **Muted Grey**: `#969696` (SWYFT muted grey)
- **Border Color**: `#e6e6e6` (SWYFT border / border-global)

### Background Colors

- **Primary Background**: `#ffffff` (pure white)
- **Secondary Background**: `#fafafa` (SWYFT bg-global)
- **Hover Background**: `#f8f8f8` (SWYFT hover state)
- **Code Background**: `#fafafa` (light theme)

### Accent Colors

- **Accent Blue**: `#0088ff` (SWYFT blue)
- **Error Red**: `#e95144` (SWYFT error red / sale badge color)
- **Warning**: `#e0b252` (SWYFT warning)
- **Success**: `#5A5A5A` (SWYFT success)

### Links

- **Default Color**: `#232323` (same as text, no blue)
- **Hover**: Underline appears, color remains `#232323`
- **Transition**: `all ease 0.3s`

### Buttons

- **Primary Button**:
  - Background: `#232323`
  - Text: `#ffffff`
  - Border: `#232323`
- **Primary Button Hover**:
  - Background: `#ffffff`
  - Text: `#232323`
  - Border: `#232323`

---

## Component Styles

### Header / Menu Bar

- **Background**: Solid white (`#ffffff`) - no transparency or blur
- **Border**: Simple 1px bottom border (`#e6e6e6`)
- **No shadows**: Removed all box-shadows
- **No backdrop blur**: Removed blur effects for cleaner look
- **Height**: `4rem` (var(--header-height))
- **Position**: Fixed at top

### Sidebar

#### Sidebar Container
- **Background**: Solid white (`#ffffff`)
- **Border**: Simple 1px right border (`#e6e6e6`)
- **No backdrop blur**: Solid background
- **No box-shadow**: No shadows
- **Width**: `15em` (minimum), resizable up to `600px`

#### Sidebar Navigation Links
- **Border radius**: `0` (sharp corners)
- **Hover effect**: Background change to `#f8f8f8` only
- **No transforms**: No translateY, translateX, or scale
- **No decorative borders**: Removed left borders
- **Transition**: `all ease 0.3s`

#### Parent/Child References
- **Border radius**: `0` (sharp corners)
- **No decorative borders**: Removed left border on active/hover
- **No transforms**: Simple background hover effect
- **Child items**: Indented with `padding-left: 2rem`

### Boxed Items / Containers

#### Rules Box
- **Background**: Flat white (`#ffffff`)
- **Border**: Simple 1px border (`#e6e6e6`)
- **Border radius**: `0` (sharp corners)
- **Box-shadow**: None
- **Padding**: `1.5rem`
- **Margin**: `2rem 0`

#### Exercise Box
- **Background**: Flat white (`#ffffff`)
- **Border**: Simple 1px border (`#e6e6e6`)
- **Border radius**: `0` (sharp corners)
- **Box-shadow**: None
- **Padding**: `2rem`
- **Margin**: `2rem 0`

#### Data Type Cards
- **Background**: Flat white (`#ffffff`)
- **Border**: Simple 1px border (`#e6e6e6`)
- **Border radius**: `0` (sharp corners)
- **Box-shadow**: None
- **Hover**: Background changes to `#f8f8f8` only
- **No transforms**: No scale or translate on hover
- **Padding**: `2rem`
- **Text align**: Center

#### Link Grid Buttons
- **Background**: Flat white (`#ffffff`)
- **Border**: Simple 1px border (`#e6e6e6`)
- **Border radius**: `0` (sharp corners)
- **Box-shadow**: None
- **Hover**: Background changes to `#f8f8f8` only
- **No transforms**: No scale or translate on hover
- **No gradient animations**: Removed all gradient effects
- **Padding**: `1.5rem`
- **Min height**: `80px`

#### Navigation Buttons (Page Navigation)
- **Background**: Flat white (`#ffffff`)
- **Border**: Simple 1px border (`#e6e6e6`)
- **Border radius**: `0` (sharp corners)
- **Box-shadow**: None
- **Hover**: Background changes to `#f8f8f8` only
- **No transforms**: No scale or translate on hover
- **No gradient animations**: Removed all gradient effects
- **Font size**: `12px`
- **Font weight**: `400`
- **Letter spacing**: `0.02em`
- **Transition**: `all ease 0.3s`

### Code Blocks

#### Standard Code Blocks
- **Background**: `#fafafa` (light theme)
- **Border**: Simple 1px border (`#e6e6e6`)
- **Border radius**: `0` (sharp corners)
- **Box-shadow**: None
- **No gradient top border**: Removed decorative elements
- **Padding**: `1.5rem`
- **Font family**: JetBrains Mono
- **Font size**: `9.75px` (var(--font-size--small--2))

#### Code Tabs Container
- **Background**: `#fafafa` (light theme)
- **Border**: Simple 1px border (`#e6e6e6`)
- **Border radius**: `0` (sharp corners)
- **Box-shadow**: None
- **No gradient top border**: Removed decorative elements
- **Tab buttons**:
  - Font size: `12px`
  - Font weight: `400`
  - Border bottom: `1px solid transparent`
  - Active: Border bottom color `#232323`
  - Hover: Background `#f8f8f8`

### Tables

- **Border radius**: `0` (sharp corners)
- **Box-shadow**: None
- **Borders**: Simple 1px borders (`#e6e6e6`)
- **Header background**: `#fafafa` (secondary background)
- **Row hover**: Background changes to `#f8f8f8`
- **Font size**: `10.5px` (var(--font-size--small))

### Search Inputs

- **Border radius**: `0` (sharp corners)
- **Box-shadow**: None
- **Border**: Simple 1px border (`#e6e6e6`)
- **Background**: `#ffffff`
- **Font size**: `12px`
- **Letter spacing**: `0.02em`
- **Focus**: Border color changes to `#232323`
- **No transforms**: No scale or translate on focus
- **No backdrop blur**: Removed blur effects
- **Transition**: `all ease 0.3s`

### Search Results

- **Background**: `#ffffff`
- **Border**: Simple 1px border (`#e6e6e6`)
- **Border radius**: `0.5rem` (slightly rounded for dropdown)
- **Box-shadow**: `0 4px 12px rgba(0, 0, 0, 0.15)` (for dropdown visibility)
- **Result item hover**: Background `#f8f8f8`

---

## General Principles

### Hover Effects

All hover effects follow these rules:

1. **No transforms**: No `translateY()`, `translateX()`, or `scale()` transforms
2. **No shadows**: No box-shadows on hover
3. **No decorative animations**: No gradient animations or fancy effects
4. **Simple background change**: Hover changes background color to `#f8f8f8` only
5. **Consistent transitions**: All use `all ease 0.3s` (SWYFT's anchor-transition)

#### Elements with Hover Effects

- Sidebar navigation links
- Header navigation links
- Link grid buttons
- Data type cards
- Table rows
- Search result items
- Mobile sidebar navigation
- Parent/child references in sidebar
- Navigation buttons
- Code tab buttons

### Spacing

- **Consistent margins**: Use standard spacing units (0.5rem, 1rem, 1.5rem, 2rem)
- **Sidebar item spacing**: 
  - Vertical: `0.75rem`
  - Horizontal: `1.25rem`
- **Content padding**: `1.5rem` to `2rem` for containers

### Borders

- **Width**: Always `1px`
- **Style**: Always `solid`
- **Color**: `#e6e6e6` (SWYFT border color)
- **Radius**: Always `0` (sharp corners)

### Transitions

- **Property**: `all`
- **Timing function**: `ease`
- **Duration**: `0.3s`
- **Usage**: Applied to all interactive elements

---

## Quick Reference

### CSS Variables

```css
/* Typography */
--font-stack: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-stack--monospace: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Consolas, monospace;
--body-font-size: 12px;
--body-line-height: 22px;
--body-letter-spacing: 0.02em;

/* Colors */
--color-foreground-primary: #232323;
--color-foreground-secondary: #868686;
--color-foreground-muted: #969696;
--color-background-primary: #ffffff;
--color-background-secondary: #fafafa;
--color-background-hover: #f8f8f8;
--color-background-border: #e6e6e6;
--color-brand-primary: #232323;
--color-accent: #0088ff;
--color-error: #e95144;
```

### Typography Quick Reference

| Element | Font Size | Weight | Letter Spacing | Transform |
|---------|-----------|--------|----------------|-----------|
| Body | 12px | 400 | 0.02em | none |
| Headings | 1.25em - 2.5em | 700 | 0.05em | uppercase |
| Navigation | 14px | 700 | 0.05em | uppercase |
| Sidebar | 10.5px | 400 | 0.02em | none |
| Code | 9.75px | 400 | 0.02em | none |

### Color Quick Reference

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary Text | Black | `#232323` |
| Secondary Text | Grey | `#868686` |
| Muted Text | Light Grey | `#969696` |
| Background | White | `#ffffff` |
| Secondary BG | Off-white | `#fafafa` |
| Hover BG | Light Grey | `#f8f8f8` |
| Border | Light Grey | `#e6e6e6` |
| Error/Accent | Red | `#e95144` |

### Component Checklist

When creating or modifying components, ensure:

- [ ] No border radius (0px)
- [ ] No box-shadow
- [ ] No gradients
- [ ] No transforms on hover
- [ ] Simple 1px borders only
- [ ] Background hover color: `#f8f8f8`
- [ ] Transition: `all ease 0.3s`
- [ ] Sharp corners (border-radius: 0)
- [ ] Flat design (no depth effects)

---

## Files Reference

### Main Stylesheet

- **Location**: `css/styles.css` (or `styles.css` in root)
- **Contains**: All component styles, CSS variables, and theme definitions

### HTML Files

- **index.html**: Main entry point, includes Google Fonts (Poppins)
- **404.html**: Error page, uses same styling

### Design System Source

Based on CSS variables extracted from [SWYFT Robotics website](https://swyftrobotics.com/).

---

## Design System Reference

### SWYFT Standards

- **Font family**: Poppins
- **Body font size**: 12px
- **Body line height**: 22px
- **Heading letter spacing**: 0.05em
- **Heading text transform**: uppercase
- **Menu font size**: 14px
- **Menu font weight**: 700
- **Menu letter spacing**: 0.05em
- **Menu text transform**: uppercase
- **Transition**: `all ease 0.3s` (anchor-transition)

### Visual Style Summary

- **Clean, minimal design** with high contrast
- **Uppercase headings** with increased letter spacing
- **No decorative elements** - simple, functional styling
- **Consistent spacing** and typography hierarchy
- **Monochromatic color scheme** with black text on white background
- **Red accent** (`#e95144`) for errors, sales, and special elements

---

## Notes for Developers

1. **Always use CSS variables** defined in `:root` for colors and spacing
2. **Follow the transition pattern**: `all ease 0.3s` for all interactive elements
3. **Avoid decorative effects**: No shadows, gradients, or transforms
4. **Maintain consistency**: Use the same patterns across all components
5. **Test hover states**: Ensure all hover effects only change background color
6. **Keep it flat**: No depth, dimension, or 3D effects

---

*Last updated: Based on SWYFT Robotics design system implementation*

