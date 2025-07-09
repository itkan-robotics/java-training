/**
 * SwyftNav - Configuration Manager
 * Handles all configuration loading and management
 */

class ConfigManager {
    constructor() {
        this.configCache = new Map();
        // Determine the base path for the application
        this.basePath = this.getBasePath();
        console.log(`ConfigManager initialized with base path: ${this.basePath}`);
    }

    getBasePath() {
        // Simple and reliable base path detection
        const pathname = window.location.pathname;
        
        // For GitHub Pages project sites (username.github.io/repository-name/)
        if (pathname !== '/' && pathname.includes('/')) {
            const segments = pathname.split('/').filter(s => s !== '');
            if (segments.length > 0) {
                // If we're in a subdirectory, assume it's the base path
                const firstSegment = segments[0];
                // Check if this looks like a repository name (no file extension)
                if (firstSegment && !firstSegment.includes('.') && !firstSegment.includes('#')) {
                    return `/${firstSegment}/`;
                }
            }
        }
        
        // Default to root for local development or simple hosting
        return '/';
    }

    resolvePath(relativePath) {
        // Convert relative path to absolute path considering base path
        const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
        
        let resolvedPath;
        if (this.basePath === '/') {
            // Local development or root hosting
            resolvedPath = '/' + cleanPath;
        } else {
            // GitHub Pages or subdirectory hosting
            resolvedPath = this.basePath + cleanPath;
        }
        
        // Debug logging
        console.log(`Path resolution: ${relativePath} -> ${resolvedPath} (base: ${this.basePath})`);
        return resolvedPath;
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
            const url = `${resolvedPath}?v=${Date.now()}`;
            
            const response = await fetch(url);
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
            const url = `${resolvedPath}?v=${Date.now()}`;
            
            const response = await fetch(url);
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