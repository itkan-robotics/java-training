# Client-Side Routing Implementation

This document describes the client-side routing implementation for the SwyftNav application, which supports both GitHub Pages and local development environments.

## Overview

The routing system provides clean URLs (using forward slashes `/`) instead of hash-based routing (`#`), making URLs shareable and bookmarkable while maintaining compatibility with GitHub Pages.

## Architecture

### Components

1. **404.html** - GitHub Pages redirect handler
2. **js/router.js** - Main router implementation
3. **js/navigation-manager.js** - Updated to integrate with router
4. **js/application.js** - Updated to initialize router

### URL Structure

- `/` - Homepage
- `/java` - Java Training section
- `/ftc` - FTC Training section
- `/frc` - FRC Training section
- `/comp` - Competitive Training section
- `/java/java-intro` - Specific tab within Java section
- `/ftc/motors/basic-motor-control` - Specific tab within FTC section

## GitHub Pages Compatibility

### 404.html Redirect Handler

The `404.html` file handles GitHub Pages routing by:

1. Capturing all 404 requests
2. Redirecting to `index.html` with the original path as a query parameter
3. The router then extracts the path and navigates to the correct content

### Example Flow

1. User visits `/java/java-intro` on GitHub Pages
2. GitHub Pages returns 404.html
3. 404.html redirects to `/index.html?redirect=%2Fjava%2Fjava-intro`
4. Router extracts the redirect parameter and navigates to the correct content
5. URL is cleaned up to show `/java/java-intro`

## Local Development

The router works directly with the local development server:

1. User visits `/java/java-intro`
2. Router parses the path and navigates to the correct content
3. No redirects needed

## Router Features

### Path Parsing

The router can handle:
- Root paths (`/`)
- Section paths (`/java`, `/ftc`, etc.)
- Tab paths (`/java/java-intro`)
- Legacy hash links (`#tab-id`)

### Navigation

- Browser back/forward buttons work correctly
- Direct URL access works
- Shareable URLs
- Clean URLs without hash symbols

### Event Handling

- Intercepts clicks on internal links
- Handles popstate events for browser navigation
- Preserves external link functionality

## Integration

### Navigation Manager

The navigation manager has been updated to:
- Use the router for URL updates when available
- Fall back to direct URL manipulation when router is not ready
- Maintain backward compatibility

### Application Initialization

The application:
- Creates the router after navigation manager
- Sets up cross-references between components
- Handles initial route after application is ready

## Testing

### Test File

A simple test file (`test-router.html`) is provided to verify basic routing functionality.

### Debugging

The router includes console logging for debugging:
- Path parsing
- Route navigation
- Error handling

## Usage

### Adding New Routes

1. Update the section URL mappings in `navigation-manager.js`
2. Ensure the section exists in the configuration
3. Test with both local development and GitHub Pages

### Custom Navigation

Use the router's methods:
- `router.navigateToPath(path)` - Navigate to a specific path
- `router.updateUrl(sectionId, tabId)` - Update URL for current state
- `router.getCurrentRoute()` - Get current route information

## Compatibility Notes

- Works with existing hash-based links (legacy support)
- Maintains all existing functionality
- No external dependencies required
- Lightweight implementation 