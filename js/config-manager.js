/**
 * SwyftNav - Configuration Manager
 * Handles all configuration loading and management
 */

class ConfigManager {
    constructor() {
        this.configCache = new Map();
        // Determine the base path for the application
        this.basePath = this.getBasePath();
    }

    getBasePath() {
        // Detect base path from the script tag or pathname
        const scriptTags = document.querySelectorAll('script[src]');
        for (const script of scriptTags) {
            const src = script.getAttribute('src');
            if (src && src.includes('config-manager.js')) {
                // Extract base path from script location
                const basePath = src.replace(/js\/config-manager\.js.*$/, '');
                return basePath || './';
            }
        }
        
        // Fallback: detect from pathname for GitHub Pages
        const pathname = window.location.pathname;
        // For GitHub Pages project sites (username.github.io/repository-name/)
        if (pathname !== '/' && pathname.includes('/')) {
            const segments = pathname.split('/').filter(s => s !== '');
            if (segments.length > 0) {
                // Check if this looks like a GitHub Pages project path
                const possibleRepoName = segments[0];
                if (possibleRepoName && !possibleRepoName.includes('.')) {
                    return `/${possibleRepoName}/`;
                }
            }
        }
        
        return './'; // Default to relative path
    }

    resolvePath(relativePath) {
        // Convert relative path to absolute path considering base path
        const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
        if (this.basePath === './') {
            return cleanPath; // Use relative path as-is
        } else {
            return this.basePath + cleanPath; // Use absolute path with base
        }
    }

    async loadMainConfig() {
        try {
            const configPath = this.resolvePath('data/config/config.json');
            const response = await fetch(configPath);
            if (!response.ok) throw new Error('Failed to load main configuration');
            
            const config = await response.json();
            appState.setConfig(config);
            return config;
        } catch (error) {
            console.error('Error loading main configuration:', error);
            throw error;
        }
    }

    async loadSectionConfig(sectionId) {
        // Check cache first
        if (this.configCache.has(sectionId)) {
            return this.configCache.get(sectionId);
        }

        const section = appState.config.sections[sectionId];
        if (!section || !section.file) {
            throw new Error(`Section ${sectionId} not found or missing file`);
        }
    
        try {
            // Resolve path considering base path (for GitHub Pages)
            const resolvedPath = this.resolvePath(section.file);
            // Add cache-busting parameter
            const url = new URL(resolvedPath, window.location.origin);
            url.searchParams.set('v', Date.now());
            
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`Failed to load section config: ${section.file}`);
                
            const sectionConfig = await response.json();
            const fullConfig = { ...section, ...sectionConfig };
            
            // Cache the config
            this.configCache.set(sectionId, fullConfig);
            
            // Update the main config
            appState.config.sections[sectionId] = fullConfig;
            
            return fullConfig;
        } catch (error) {
            console.error(`Error loading section config ${sectionId}:`, error);
            throw error;
        }
    }

    async loadContentFile(filePath) {
        try {
            // Resolve path considering base path (for GitHub Pages)
            const resolvedPath = this.resolvePath(filePath);
            // Add cache-busting parameter
            const url = new URL(resolvedPath, window.location.origin);
            url.searchParams.set('v', Date.now());
            
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`Failed to load content file: ${filePath}`);
            return await response.json();
        } catch (error) {
            console.error(`Error loading content file ${filePath}:`, error);
            throw error;
        }
    }

    getSectionConfig(sectionId) {
        return appState.config.sections[sectionId];
    }

    getAllSections() {
        return Object.keys(appState.config.sections);
    }

    clearCache() {
        this.configCache.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
} 