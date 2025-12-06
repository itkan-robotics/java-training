/**
 * Mantik - Main Entry Point
 * Loads all modules in the correct order
 * 
 * Loading Order:
 * 1. app-state.js - Global state management (must be first)
 * 2. config-manager.js - Configuration loading
 * 3. content-manager.js - Content loading and rendering
 * 4. navigation-manager.js - Navigation and routing
 * 5. theme-manager.js - Theme switching
 * 6. search-manager.js - Search functionality
 * 7. sidebar-resize-manager.js - Sidebar resizing
 * 8. event-manager.js - Event handling
 * 9. application.js - Main application coordination
 * 10. global-functions.js - HTML integration functions
 * 
 * The HTML file includes these scripts in this exact order.
 * This file serves as documentation of the loading order.
 */ 