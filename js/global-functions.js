/**
 * SwyftNav - Global Functions
 * HTML integration functions and application initialization
 */

// Global application instance
let app;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    app = new Application();
    window.app = app; // Make app globally accessible
    await app.initialize();
    
    // Router handles popstate and navigation events
    // The router is initialized in the Application constructor
    
    // Delegated click handler for internal <a> links in content
    // This handles content links that reference specific tabs
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

// Keyboard shortcuts overlay toggle
function toggleKeyboardShortcuts() {
    const overlay = document.getElementById('keyboard-shortcuts-overlay');
    if (overlay) {
        const isVisible = overlay.classList.contains('visible');
        if (isVisible) {
            overlay.classList.remove('visible');
            // Re-enable body scroll
            document.body.style.overflow = '';
        } else {
            overlay.classList.add('visible');
            // Disable body scroll when overlay is open
            document.body.style.overflow = 'hidden';
            
            // Focus the close button for accessibility
            const closeButton = overlay.querySelector('.keyboard-shortcuts-close');
            if (closeButton) {
                setTimeout(() => closeButton.focus(), 100);
            }
        }
    }
}

// Add click outside functionality for keyboard shortcuts overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('keyboard-shortcuts-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            // Close overlay if clicking on the background (not the modal)
            if (e.target === overlay) {
                toggleKeyboardShortcuts();
            }
        });
        
        // Add ESC key support to close overlay
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.classList.contains('visible')) {
                e.preventDefault();
                toggleKeyboardShortcuts();
            }
        });
        
        // Add focus trap for accessibility
        const closeButton = overlay.querySelector('.keyboard-shortcuts-close');
        if (closeButton) {
            closeButton.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKeyboardShortcuts();
                }
            });
        }
    }
}); 