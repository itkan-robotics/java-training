# SWYFT Robotics Design System Update

This document outlines the changes made to match the SWYFT Robotics website design (https://swyftrobotics.com/).

## Changes Made

### Typography

1. **Font Family**: Changed from `Inter` to **Poppins**
   - Updated in `index.html` Google Fonts import
   - Updated CSS variables `--font-stack` and `--font-stack--headings`

2. **Font Sizes**:
   - Base body font size: Changed from `100%` to **12px** (SWYFT standard)
   - Line height: Changed from `1.6` to **22px** (SWYFT standard)
   - Letter spacing: Added **0.02em** for body text

3. **Heading Styles**:
   - Added **letter-spacing: 0.05em** (SWYFT heading standard)
   - Added **text-transform: uppercase** (SWYFT headings are uppercase)

### Color Palette

Updated to match SWYFT Robotics official colors:

- **Primary Text**: `#232323` (changed from `#1a1a1a`)
- **Secondary Text/Grey**: `#868686`
- **Muted Grey**: `#969696`
- **Background**: `#ffffff` (pure white)
- **Secondary Background**: `#fafafa` (SWYFT bg-global)
- **Border Color**: `#e6e6e6` (SWYFT border-global)
- **Links**: `#232323` (same as text, no blue)
- **Error/Accent Red**: `#e95144` (SWYFT sale badge color)

### Navigation Links

Updated header navigation to match SWYFT style:
- Font size: **14px**
- Font weight: **700** (bold)
- Letter spacing: **0.05em**
- Text transform: **uppercase**
- Line height: **22px**
- No underline by default
- Underline on hover
- No border radius

### Body Text

- Base font size: **12px**
- Line height: **22px**
- Letter spacing: **0.02em**
- Color: `#232323`

### Links

- Default: No underline
- Color: `#232323` (matches text)
- Hover: Underline appears
- Transition: `all ease 0.3s`

### Button Styles

Added SWYFT button color variables:
- Primary button: White text on `#232323` background
- Hover: Black text on white background with black border

## Files Modified

1. **styles.css**: Updated CSS variables, typography, colors, and component styles
2. **index.html**: Updated Google Fonts import to use Poppins instead of Inter

## SWYFT Design System Reference

Based on CSS variables extracted from https://swyftrobotics.com/:
- Font family: Poppins
- Body font size: 12px
- Body line height: 22px
- Heading letter spacing: 0.05em
- Heading text transform: uppercase
- Menu font size: 14px
- Menu font weight: 700
- Menu letter spacing: 0.05em
- Menu text transform: uppercase

## Visual Style Summary

- **Clean, minimal design** with high contrast
- **Uppercase headings** with increased letter spacing
- **No decorative elements** - simple, functional styling
- **Consistent spacing** and typography hierarchy
- **Monochromatic color scheme** with black text on white background
- **Red accent** (`#e95144`) for errors, sales, and special elements

