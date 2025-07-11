/**
 * SwyftNav - Theme Manager
 * Manages theme switching and persistence
 */

class ThemeManager {
    constructor() {
        this.initializeTheme();
    }

    initializeTheme() {
        // Theme is already restored by AppState, just update the icon
        this.updateThemeIcon(appState.theme);
    }

    setTheme(theme) {
        appState.setTheme(theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const newTheme = appState.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
} 