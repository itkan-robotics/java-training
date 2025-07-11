/**
 * SwyftNav - Client-Side Router
 * Handles routing for both GitHub Pages and local development
 */

class Router {
    constructor(navigationManager) {
        this.navigationManager = navigationManager;
        this.routes = new Map();
        this.currentRoute = null;
        this.isInitialized = false;
        
        // Bind methods to preserve context
        this.handlePopState = this.handlePopState.bind(this);
        this.handleClick = this.handleClick.bind(this);
        
        // Initialize router
        this.initialize();
    }

    /**
     * Initialize the router
     */
    initialize() {
        // Set up event listeners
        window.addEventListener('popstate', this.handlePopState);
        document.addEventListener('click', this.handleClick);
        
        this.isInitialized = true;
    }

    /**
     * Handle the initial route after the application is ready
     */
    handleInitialRoute() {
        // Check if we're on GitHub Pages and have a redirect parameter
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('redirect');
        
        if (redirectPath) {
            // We're on GitHub Pages and have a redirected path
            // Clean up the URL by removing the redirect parameter
            const cleanUrl = window.location.pathname;
            window.history.replaceState(null, '', cleanUrl);
            
            // Parse and navigate to the intended route
            this.navigateToPath(redirectPath);
        } else {
            // Normal route handling
            const currentPath = window.location.pathname;
            this.navigateToPath(currentPath);
        }
    }

    /**
     * Navigate to a specific path
     */
    navigateToPath(path) {
        const routeData = this.parsePath(path);
        
        if (routeData) {
            this.currentRoute = routeData;
            this.navigationManager.navigateToTab(routeData.tabId || routeData.sectionId);
        } else {
            // Invalid route, navigate to homepage
            this.navigateToPath('/');
        }
    }

    /**
     * Parse a path to extract section and tab information
     */
    parsePath(path) {
        // Remove leading/trailing slashes
        const cleanPath = path.replace(/^\/+|\/+$/g, '');
        
        if (!cleanPath) {
            // Root path - homepage
            return { sectionId: 'homepage', tabId: null };
        }
        
        const pathParts = cleanPath.split('/');
        
        // Check for section/tab structure like /java/java-intro
        if (pathParts.length === 2) {
            const [sectionPath, tabId] = pathParts;
            const sectionId = this.navigationManager.urlSectionMap[sectionPath];
            
            if (sectionId) {
                return { sectionId, tabId };
            }
        }
        
        // Check for main section paths like /java
        if (pathParts.length === 1) {
            const sectionPath = pathParts[0];
            const sectionId = this.navigationManager.urlSectionMap[sectionPath];
            
            if (sectionId) {
                return { sectionId, tabId: null };
            }
        }
        
        // Check if it's a direct tab ID
        if (pathParts.length === 1) {
            const tabId = pathParts[0];
            const parentSection = this.navigationManager.findParentSectionIdForTab(
                tabId, 
                appState.config?.sections || {}
            );
            
            if (parentSection) {
                return { sectionId: parentSection, tabId };
            }
        }
        
        return null;
    }

    /**
     * Update the browser URL to reflect the current route
     */
    updateUrl(sectionId, tabId = null) {
        const sectionPath = this.navigationManager.sectionUrlMap[sectionId];
        
        if (sectionPath) {
            let newPath;
            
            if (tabId) {
                // For specific tabs within sections, use full path routing
                newPath = `/${sectionPath}/${tabId}`;
            } else {
                // For main sections, just use path
                newPath = `/${sectionPath}`;
            }
            
            // Use replaceState to avoid adding to browser history
            window.history.replaceState(
                { section: sectionId, tab: tabId }, 
                '', 
                newPath
            );
        } else if (sectionId === 'homepage') {
            // For homepage, use root path
            window.history.replaceState(
                { section: 'homepage' }, 
                '', 
                '/'
            );
        } else {
            // Fallback to hash routing for unknown sections
            const path = tabId ? `#${tabId}` : `#${sectionId}`;
            if (window.location.hash !== path) {
                window.location.hash = path;
            }
        }
    }

    /**
     * Handle browser back/forward navigation
     */
    handlePopState(event) {
        const currentPath = window.location.pathname;
        this.navigateToPath(currentPath);
    }

    /**
     * Handle clicks on internal links
     */
    handleClick(event) {
        const link = event.target.closest('a');
        
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Only handle internal links
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return; // Let external links work normally
        }
        
        // Handle hash links (legacy support)
        if (href.startsWith('#')) {
            const tabId = href.substring(1);
            if (this.isValidTab(tabId)) {
                event.preventDefault();
                this.navigateToTab(tabId);
            }
            return;
        }
        
        // Handle relative paths and absolute paths
        if (href.startsWith('/') || (!href.startsWith('http') && !href.startsWith('#'))) {
            event.preventDefault();
            this.navigateToPath(href);
        }
    }

    /**
     * Navigate to a specific tab
     */
    navigateToTab(tabId) {
        if (this.navigationManager) {
            this.navigationManager.navigateToTab(tabId);
        }
    }

    /**
     * Check if a tab ID is valid
     */
    isValidTab(tabId) {
        return appState.allTabs.some(tab => tab.id === tabId) || 
               appState.getTabData(tabId);
    }

    /**
     * Get the current route information
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Check if the router is initialized
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Clean up router event listeners
     */
    destroy() {
        window.removeEventListener('popstate', this.handlePopState);
        document.removeEventListener('click', this.handleClick);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
} 