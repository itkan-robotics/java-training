# SwyftNav JavaScript Modules

This directory contains the modular JavaScript architecture for SwyftNav, broken down into logical components for better maintainability and organization.

## Module Structure

### Core Modules (Load Order)

1. **`app-state.js`** - Global state management
   - Manages application state, current section, tabs, theme, etc.
   - Provides centralized state access for all other modules

2. **`config-manager.js`** - Configuration loading and management
   - Handles loading of main configuration and section configs
   - Implements caching for performance
   - Manages content file loading

3. **`content-manager.js`** - Content loading and rendering
   - Handles loading of section content and individual items
   - Manages content rendering with different section types
   - Supports various content formats (text, code, lists, etc.)

4. **`navigation-manager.js`** - Navigation and routing
   - Manages sidebar navigation generation
   - Handles URL routing and tab navigation
   - Controls sidebar layout and responsive behavior

5. **`theme-manager.js`** - Theme switching
   - Manages light/dark theme switching
   - Handles theme persistence in localStorage
   - Updates theme icons and UI elements

6. **`search-manager.js`** - Search functionality
   - Implements global search across all content
   - Provides search results with highlighting
   - Manages search UI and interactions

7. **`sidebar-resize-manager.js`** - Sidebar resizing
   - Handles sidebar width resizing functionality
   - Manages resize constraints and persistence
   - Coordinates with main content layout

8. **`event-manager.js`** - Event handling
   - Centralizes all event listeners
   - Handles keyboard navigation, clicks, etc.
   - Manages responsive behavior and interactions

9. **`application.js`** - Main application coordination
   - Coordinates all managers during initialization
   - Handles application startup and error handling
   - Manages default tab selection

10. **`global-functions.js`** - HTML integration functions
    - Provides global functions for HTML onclick handlers
    - Handles application initialization
    - Manages mobile header behavior

### Documentation

- **`main.js`** - Documents the loading order and serves as entry point documentation
- **`README.md`** - This file, providing module documentation

## Architecture Benefits

### Modularity
- Each module has a single responsibility
- Clear separation of concerns
- Easy to understand and maintain

### Dependency Management
- Clear loading order prevents dependency issues
- Each module can depend on previously loaded modules
- Global state (`appState`) available to all modules

### Maintainability
- Smaller files are easier to navigate and debug
- Changes to one module don't affect others
- Clear interfaces between modules

### Extensibility
- New modules can be easily added
- Existing modules can be modified independently
- Clear patterns for adding new functionality

## Usage

### Loading Order
The modules must be loaded in the exact order specified above. The HTML file includes them in this order:

```html
<script src="js/app-state.js"></script>
<script src="js/config-manager.js"></script>
<script src="js/content-manager.js"></script>
<script src="js/navigation-manager.js"></script>
<script src="js/theme-manager.js"></script>
<script src="js/search-manager.js"></script>
<script src="js/sidebar-resize-manager.js"></script>
<script src="js/event-manager.js"></script>
<script src="js/application.js"></script>
<script src="js/global-functions.js"></script>
```

### Global Access
All classes are available globally after loading:
- `AppState` - State management class
- `ConfigManager` - Configuration management
- `ContentManager` - Content handling
- `NavigationManager` - Navigation control
- `ThemeManager` - Theme management
- `SearchManager` - Search functionality
- `SidebarResizeManager` - Sidebar resizing
- `EventManager` - Event handling
- `Application` - Main application

### Global State
The `appState` object is available globally and provides access to:
- Current configuration
- Current section and tab
- Tab data and all tabs
- Theme state
- Initialization status

## Testing

Use `test-modules.html` to verify that all modules load correctly and are accessible.