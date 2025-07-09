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
    
    // Add hashchange handler for browser navigation and direct links
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