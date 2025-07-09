/**
 * SwyftNav - Configuration Manager
 * Handles all configuration loading and management
 */

class ConfigManager {
    constructor() {
        this.configCache = new Map();
    }

    async loadMainConfig() {
        try {
            const response = await fetch('/data/config/config.json');
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
            // Ensure path is absolute from root
            const absolutePath = section.file.startsWith('/') ? section.file : `/${section.file}`;
            // Add cache-busting parameter
            const url = new URL(absolutePath, window.location.origin);
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
            // Ensure path is absolute from root
            const absolutePath = filePath.startsWith('/') ? filePath : `/${filePath}`;
            // Add cache-busting parameter
            const url = new URL(absolutePath, window.location.origin);
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