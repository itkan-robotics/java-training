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
            
            // Set up navigation persistence after navigation manager is ready
            appState.setupNavigationPersistence();
            
            // Show appropriate tab based on saved state or defaults
            await this.showAppropriateTab();
            
            // Restore UI state after navigation
            this.restoreUIState();
            
            // Mark as initialized
            appState.setInitialized(true);
            
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError('Failed to load application. Please refresh the page.');
        }
    }

    async showAppropriateTab() {
        // Priority order: URL hash > saved state > default tab
        const urlTabId = window.location.hash ? window.location.hash.substring(1) : null;
        const savedState = appState.restoreState();
        
        let targetTab = null;
        let targetSection = null;

        // Check URL hash first
        if (urlTabId) {
            targetTab = appState.allTabs.find(tab => tab.id === urlTabId);
            if (targetTab) {
                console.log('Navigating to URL hash tab:', urlTabId);
                await this.navigationManager.navigateToTab(urlTabId);
                return;
            }
        }

        // Check saved state
        if (savedState && savedState.currentTab) {
            targetTab = appState.allTabs.find(tab => tab.id === savedState.currentTab);
            targetSection = savedState.currentSection;
            
            if (targetTab) {
                console.log('Navigating to saved tab:', savedState.currentTab);
                await this.navigationManager.navigateToTab(savedState.currentTab);
                return;
            } else if (targetSection && targetSection !== 'homepage') {
                console.log('Navigating to saved section:', targetSection);
                await this.navigationManager.handleSectionNavigation(targetSection);
                return;
            }
        }

        // Fallback to default tab
        const defaultTab = appState.allTabs.find(tab => tab.default) || appState.allTabs[0];
        if (defaultTab) {
            console.log('Navigating to default tab:', defaultTab.id);
            await this.navigationManager.navigateToTab(defaultTab.id);
        }
    }

    restoreUIState() {
        // Restore scroll position
        appState.restoreScrollPosition();
        
        // Restore sidebar state
        appState.restoreSidebarState();
        
        // Restore search query
        appState.restoreSearchQuery();
        
        // Restore theme (already handled in AppState constructor)
        if (appState.theme) {
            this.themeManager.setTheme(appState.theme);
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