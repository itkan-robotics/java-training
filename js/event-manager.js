/**
 * SwyftNav - Event Manager
 * Centralizes all event handling
 */

class EventManager {
    constructor(navigationManager = null, themeManager = null, searchManager = null) {
        this.navigationManager = navigationManager;
        this.themeManager = themeManager;
        this.searchManager = searchManager;
        this.resizeTimeout = null;
        this.setupEvents();
    }

    setupEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.themeManager.toggleTheme();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchManager.performSearch(e.target.value);
            });
        }

        // Header search functionality
        const headerSearchInput = document.getElementById('search-input-header');
        if (headerSearchInput) {
            headerSearchInput.addEventListener('input', (e) => {
                this.searchManager.performSearch(e.target.value);
            });
        }

        // Mobile sidebar toggle
        const navToggle = document.getElementById('__navigation');
        if (navToggle) {
            navToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Sidebar is now visible - ensure smooth transition
                    this.navigationManager.ensureSmoothSidebarTransition();
                    // Adjust layout immediately for smooth animation
                    this.navigationManager.adjustLayoutForSidebar();
                } else {
                    // Sidebar is now hidden
                    this.navigationManager.resetLayoutForHiddenSidebar();
                }
            });
        }

        // Hide sidebar when clicking on main content
        const mainContent = document.querySelector('.main');
        const sidebarDrawer = document.querySelector('.sidebar-drawer');
        if (mainContent && sidebarDrawer && navToggle) {
            mainContent.addEventListener('mousedown', (e) => {
                // Only close if sidebar is open and click is outside sidebar
                if (navToggle.checked) {
                    // Check if click is inside sidebar
                    if (!sidebarDrawer.contains(e.target)) {
                        // Ensure smooth transition before closing
                        this.navigationManager.ensureSmoothSidebarTransition();
                        navToggle.checked = false;
                        // Reset layout immediately to ensure smooth transition
                        this.navigationManager.resetLayoutForHiddenSidebar();
                    }
                }
            });
            // Also support touch events
            mainContent.addEventListener('touchstart', (e) => {
                if (navToggle.checked) {
                    if (!sidebarDrawer.contains(e.target)) {
                        // Ensure smooth transition before closing
                        this.navigationManager.ensureSmoothSidebarTransition();
                        navToggle.checked = false;
                        // Reset layout immediately to ensure smooth transition
                        this.navigationManager.resetLayoutForHiddenSidebar();
                    }
                }
            });
        }

        // Window resize handler for responsive layout
        window.addEventListener('resize', () => {
            // Debounce the resize event
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                if (window.innerWidth <= 1008) { // 63em = 1008px
                    // Reset to default layout on mobile
                    this.navigationManager.resetLayoutForHiddenSidebar();
                } else {
                    // Adjust layout on desktop
                    this.navigationManager.adjustLayoutForSidebar();
                }
            }, 250);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Section-based navigation with Ctrl+Arrow or Ctrl+<, Ctrl+>
            if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === '>' || e.key === '<')) {
                e.preventDefault();
                this.navigateSectionTabs(e.key === 'ArrowRight' || e.key === '>' ? 'next' : 'prev');
                return;
            }
            // Legacy: global tab navigation with just arrows
            this.navigateWithArrows(e.key);
        });

        // Copy to clipboard functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) {
                const codeBlock = e.target.closest('.code-block');
                if (codeBlock) {
                    const code = codeBlock.querySelector('code');
                    if (code) {
                        this.copyToClipboard(code.textContent);
                    }
                }
            }
        });

        // Answer toggle functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('answer-toggle-btn')) {
                const answerSection = e.target.nextElementSibling;
                if (answerSection && answerSection.classList.contains('answer-section')) {
                    answerSection.classList.toggle('hidden');
                    answerSection.classList.toggle('visible');
                    e.target.classList.toggle('active');
                }
            }
        });

        // Focus search on Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
        });
    }

    navigateWithArrows(key) {
        const currentIndex = appState.allTabs.findIndex(tab => tab.id === appState.currentTab);
        let newIndex;
        
        if (key === 'left') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : appState.allTabs.length - 1;
        } else if (key === 'right') {
            newIndex = currentIndex < appState.allTabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        if (newIndex !== undefined && appState.allTabs[newIndex]) {
            this.navigationManager.navigateToTab(appState.allTabs[newIndex].id);
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--color-sidebar-background);
            color: var(--color-sidebar-link-text);
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    focusSearch() {
        // Check if we're on mobile (sidebar is visible/checked)
        const navToggle = document.getElementById('__navigation');
        const mobileSearchInput = document.getElementById('mobile-sidebar-search');
        const headerSearchInput = document.getElementById('header-search');
        
        if (navToggle && navToggle.checked && mobileSearchInput) {
            // On mobile with sidebar open, focus mobile search
            mobileSearchInput.focus();
            mobileSearchInput.select();
        } else if (headerSearchInput) {
            // Otherwise focus header search
            headerSearchInput.focus();
            headerSearchInput.select();
        }
    }

    /**
     * Navigate to next/previous tab within the current section config, wrapping around.
     * @param {'next'|'prev'} direction
     */
    navigateSectionTabs(direction) {
        // Find the current section config
        const sectionId = appState.currentSection;
        const config = appState.config && appState.config.sections && appState.config.sections[sectionId];
        if (!config) return;

        // Build ordered list of tab IDs in this section
        const tabOrder = [];
        // Add intro if present
        if (config.intro && config.intro.id) tabOrder.push(config.intro.id);
        // Add groups/children/items recursively
        function addItemsFromGroups(groups) {
            if (!Array.isArray(groups)) return;
            groups.forEach(group => {
                if (Array.isArray(group.items)) {
                    group.items.forEach(item => tabOrder.push(item.id));
                }
                if (Array.isArray(group.children)) {
                    addItemsFromGroups(group.children);
                }
            });
        }
        if (Array.isArray(config.groups)) addItemsFromGroups(config.groups);
        if (Array.isArray(config.children)) addItemsFromGroups(config.children);
        // Add top-level items if present
        if (Array.isArray(config.items)) {
            config.items.forEach(item => tabOrder.push(item.id));
        }

        if (tabOrder.length === 0) return;
        const currentTab = appState.currentTab;
        let idx = tabOrder.indexOf(currentTab);
        if (idx === -1) {
            // If not found, default to first
            idx = 0;
        }
        let newIdx;
        if (direction === 'next') {
            newIdx = (idx + 1) % tabOrder.length;
        } else {
            newIdx = (idx - 1 + tabOrder.length) % tabOrder.length;
        }
        const newTabId = tabOrder[newIdx];
        if (newTabId && this.navigationManager) {
            this.navigationManager.navigateToTab(newTabId);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
} 