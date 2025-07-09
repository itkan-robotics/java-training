/**
 * SwyftNav - Theme Manager
 * Manages theme switching and persistence
 */

class ThemeManager {
    constructor() {
        this.initializeTheme();
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || 'light'; // Default to light theme
        
        appState.setTheme(theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const newTheme = appState.theme === 'light' ? 'dark' : 'light';
        appState.setTheme(newTheme);
        this.updateThemeIcon(newTheme);
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