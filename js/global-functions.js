/**
 * SwyftNav - Global Functions
 * HTML integration functions and application initialization
 */

// Global application instance
let app;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    app = new Application();
    await app.initialize();
    
    // Add popstate handler for browser back/forward navigation
    window.addEventListener('popstate', function(event) {
        if (app && app.navigationManager) {
            const urlData = app.navigationManager.parseCurrentUrl();
            if (urlData.tabId) {
                // Navigate to specific tab
                if (appState.currentTab !== urlData.tabId) {
                    app.navigationManager.navigateToTab(urlData.tabId);
                }
            } else if (urlData.sectionId) {
                // Navigate to section
                if (appState.currentSection !== urlData.sectionId) {
                    app.navigationManager.navigateToTab(urlData.sectionId);
                }
            }
        }
    });

    // Add hashchange handler for browser navigation and direct links (fallback)
    window.onhashchange = function() {
        const tabId = window.location.hash ? window.location.hash.substring(1) : null;
        if (tabId && app && app.navigationManager) {
            // Only navigate if not already on this tab
            if (appState.currentTab !== tabId) {
                app.navigationManager.navigateToTab(tabId);
            }
        }
    };
    
    // Delegated click handler for internal <a> links in content
    document.getElementById('tab-container').addEventListener('click', function(e) {
        const anchor = e.target.closest('a');
        if (anchor && anchor.getAttribute('href')) {
            const href = anchor.getAttribute('href');
            // Match ../motors/basic-motor-control.json or similar
            const match = href.match(/\.\.\/([\w-]+)\/([\w-]+)\.json$/);
            let tabId = null;
            if (match) {
                tabId = match[2];
            } else if (href.startsWith('#')) {
                tabId = href.substring(1);
            } else if (/^[\w-]+$/.test(href)) {
                // Support <a href="basic-motor-control">...</a> style
                tabId = href;
            }
            // Check if tabId is a valid internal tab
            if (tabId && (appState.allTabs.some(tab => tab.id === tabId) || appState.getTabData(tabId))) {
                if (app && app.navigationManager) {
                    e.preventDefault();
                    app.navigationManager.navigateToTab(tabId);
                }
            }
        }
    });
});

/**
 * SwyftNav - Global Utility Functions
 * Provides utility functions for debugging and development
 */

// Global utility functions for debugging and development
window.SwyftNavUtils = {
    /**
     * Clear all saved application state
     */
    clearSavedState() {
        appState.clearSavedState();
    },

    /**
     * View current application state
     */
    viewCurrentState() {
        const state = {
            currentSection: appState.currentSection,
            currentTab: appState.currentTab,
            theme: appState.theme,
            scrollPosition: appState.scrollPosition,
            sidebarOpen: appState.sidebarOpen,
            searchQuery: appState.searchQuery,
            isInitialized: appState.isInitialized,
            allTabsCount: appState.allTabs.length,
            tabDataCount: appState.tabData.size
        };
        return state;
    },

    /**
     * View saved state from localStorage
     */
    viewSavedState() {
        try {
            const savedState = localStorage.getItem('swyftnav_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                return state;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    },

    /**
     * Test persistence system
     */
    testPersistence() {
        // Save current state
        appState.saveState();
        
        // Change state
        appState.currentTab = 'test-tab';
        appState.saveState();
        
        // Restore state
        appState.loadState();
    },

    /**
     * Navigate to a tab and save state
     */
    navigateAndSave(tabId) {
        if (app && app.navigationManager) {
            app.navigationManager.navigateToTab(tabId);
            appState.saveState();
        }
    },

    /**
     * Set scroll position and save state
     */
    setScrollAndSave(position) {
        appState.scrollPosition = position;
        appState.saveState();
    },

    /**
     * Toggle sidebar and save state
     */
    toggleSidebarAndSave() {
        const sidebarCheckbox = document.getElementById('__navigation');
        if (sidebarCheckbox) {
            appState.sidebarOpen = sidebarCheckbox.checked;
            appState.saveState();
        }
    },

    /**
     * Set search query and save state
     */
    setSearchAndSave(query) {
        appState.searchQuery = query;
        appState.saveState();
    },

    /**
     * Get persistence statistics
     */
    getPersistenceStats() {
        const stats = {
            localStorageSize: 0,
            savedStateSize: 0,
            lastSaved: null,
            stateAge: null
        };

        try {
            // Calculate localStorage size
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }
            stats.localStorageSize = totalSize;

            // Get saved state info
            const savedState = localStorage.getItem('swyftnav_state');
            if (savedState) {
                stats.savedStateSize = savedState.length;
                const state = JSON.parse(savedState);
                stats.lastSaved = new Date(state.timestamp);
                stats.stateAge = Date.now() - state.timestamp;
            }
        } catch (error) {
            // Handle errors silently
        }

        return stats;
    }
};

// Global functions for HTML onclick handlers
function openTab(event, tabId) {
    event.preventDefault();
    if (app && app.navigationManager) {
        app.navigationManager.navigateToTab(tabId);
    } else {
        console.error('Application not initialized or navigation manager not available');
    }
}

function toggleTheme() {
    if (app && app.themeManager) {
        app.themeManager.toggleTheme();
    }
}

// Function to handle sidebar opening and scroll to current tab
function handleSidebarOpen() {
    if (app && app.navigationManager && appState.currentTab) {
        // Use the new method that includes retry logic
        app.navigationManager.ensureCurrentTabHighlighted();
    }
}

// Mobile header scroll behavior
let lastScrollTop = 0;
const mobileHeader = document.querySelector('.mobile-header');

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop < lastScrollTop) {
        mobileHeader.classList.remove('visible');
    } else {
        mobileHeader.classList.add('visible');
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false); 