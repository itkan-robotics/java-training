/**
 * SwyftNav - Main Application
 * Coordinates all managers and handles application initialization
 */

class Application {
    constructor() {
        this.configManager = new ConfigManager();
        this.contentManager = new ContentManager(this.configManager);
        this.navigationManager = new NavigationManager(null, this.contentManager);
        this.searchManager = new SearchManager(this.contentManager, this.navigationManager);
        this.navigationManager.searchManager = this.searchManager; // Set the reference back
        this.themeManager = new ThemeManager();
        this.eventManager = new EventManager(this.navigationManager, this.themeManager, this.searchManager);
        this.sidebarResizeManager = new SidebarResizeManager();
    }

    async initialize() {
        try {
            // Clear any cached configs to ensure fresh loading
            this.configManager.clearCache();
            
            // Load main configuration
            await this.configManager.loadMainConfig();
            
            // Load homepage content
            await this.contentManager.loadSectionContent('homepage');
            
            // Generate initial navigation
            await this.navigationManager.generateNavigation();
            
            // Initialize sidebar resize functionality
            this.sidebarResizeManager.initialize();
            
            // Show default tab
            this.showDefaultTab();
            
            // Mark as initialized
            appState.setInitialized(true);
            
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError('Failed to load application. Please refresh the page.');
        }
    }

    showDefaultTab() {
        let defaultTab;
        const lastOpenedTabId = localStorage.getItem('lastOpenedTab');
        
        // Parse URL to determine section and tab
        const urlData = this.navigationManager.parseCurrentUrl();
        
        if (urlData.tabId) {
            // URL contains specific tab
            defaultTab = appState.allTabs.find(tab => tab.id === urlData.tabId);
            if (defaultTab) {
                localStorage.removeItem('lastOpenedTab');
                this.navigationManager.navigateToTab(urlData.tabId);
                return;
            }
        } else if (urlData.sectionId && urlData.sectionId !== 'homepage') {
            // URL contains section but no specific tab
            this.navigationManager.navigateToTab(urlData.sectionId);
            return;
        }

        // Fallback to stored tab or default
        if (lastOpenedTabId) {
            defaultTab = appState.allTabs.find(tab => tab.id === lastOpenedTabId);
        }

        if (!defaultTab) {
            defaultTab = appState.allTabs.find(tab => tab.default) || appState.allTabs[0];
        }

        if (defaultTab) {
            this.navigationManager.navigateToTab(defaultTab.id);
        } else {
            // Navigate to homepage if no default tab found
            this.navigationManager.navigateToTab('homepage');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #f44336;
            color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            z-index: 1000;
            text-align: center;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 5000);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Application;
} 