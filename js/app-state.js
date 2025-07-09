/**
 * SwyftNav - Global State Management
 * Handles all application state and provides centralized state management
 */

class AppState {
    constructor() {
        this.config = null;
        this.currentSection = 'homepage';
        this.currentTab = null;
        this.tabData = new Map();
        this.allTabs = [];
        this.theme = 'light';
        this.isInitialized = false;
    }

    setConfig(config) {
        this.config = config;
    }

    setCurrentSection(section) {
        this.currentSection = section;
    }

    setCurrentTab(tab) {
        this.currentTab = tab;
    }

    addTabData(id, data) {
        this.tabData.set(id, data);
    }

    getTabData(id) {
        return this.tabData.get(id);
    }

    setAllTabs(tabs) {
        this.allTabs = tabs;
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    setInitialized(value) {
        this.isInitialized = value;
    }
}

// Global app state instance
const appState = new AppState();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState, appState };
} 