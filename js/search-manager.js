/**
 * SwyftNav - Search Manager
 * Handles global search functionality
 */

class SearchManager {
    constructor(contentManager = null, navigationManager = null) {
        this.searchResults = [];
        this.currentSearchQuery = '';
        this.contentManager = contentManager;
        this.navigationManager = navigationManager;
        this.searchTimeout = null;
        this.isSearching = false;
        this.setupSearch();
    }

    setupSearch() {
        const searchInput = document.getElementById('header-search');
        const mobileSearchInput = document.getElementById('mobile-sidebar-search');
        
        console.log('Setting up search inputs:', { searchInput: !!searchInput, mobileSearchInput: !!mobileSearchInput });
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
                // Sync with mobile search
                if (mobileSearchInput) {
                    mobileSearchInput.value = e.target.value;
                }
            });

            searchInput.addEventListener('focus', () => {
                if (this.currentSearchQuery && this.searchResults.length > 0) {
                    this.showResults();
                }
            });
        }
        
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
                // Sync with header search
                if (searchInput) {
                    searchInput.value = e.target.value;
                }
            });

            mobileSearchInput.addEventListener('focus', () => {
                if (this.currentSearchQuery && this.searchResults.length > 0) {
                    this.showResults();
                }
            });
        }
        
        // Close search results when clicking outside
        document.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.search-container-header') && 
                !e.target.closest('.mobile-sidebar-search') && 
                !e.target.closest('.search-results')) {
                this.hideResults();
            }
        });
    }

    handleSearchInput(query) {
        // Clear existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Store current query
        this.currentSearchQuery = query;
        
        if (!query.trim()) {
            this.hideResults();
            return;
        }
        
        // Show loading state
        this.showLoadingState();
        
        // Debounce search
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 200);
    }

    showLoadingState() {
        this.hideResults();
        
        const searchContainer = this.getSearchContainer();
        if (!searchContainer) return;
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'search-results';
        loadingDiv.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: var(--color-sidebar-background);
            border: 2px solid var(--color-background-border);
            border-radius: 0.75rem;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            margin-top: 0.5rem;
            padding: 1rem;
            text-align: center;
            color: var(--color-sidebar-link-text);
        `;
        loadingDiv.textContent = 'Searching...';
        
        searchContainer.appendChild(loadingDiv);
    }

    async performSearch(query) {
        if (this.isSearching) return;
        
        this.isSearching = true;
        const searchQuery = query.toLowerCase().trim();
        
        if (!searchQuery) {
            this.hideResults();
            this.isSearching = false;
            return;
        }
        
        console.log('Performing search for:', searchQuery);
        
        try {
            // Search through all available tabs
            this.searchResults = [];
            await this.searchAllTabs(searchQuery);
            
            // Sort results with titles first
            this.sortResults();
            
            console.log(`Search completed. Found ${this.searchResults.length} results.`);
            this.showResults();
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed. Please try again.');
        } finally {
            this.isSearching = false;
        }
    }

    async searchAllTabs(query) {
        // Search through all loaded tabs first
        if (appState.allTabs) {
            for (const tab of appState.allTabs) {
                await this.searchTab(tab, query);
            }
        }
        
        // Search through all sections
        const sections = appState.config.sections;
        if (sections) {
            for (const sectionId in sections) {
                await this.searchSection(sectionId, sections[sectionId], query);
            }
        }
    }

    async searchTab(tab, query) {
        const tabData = appState.getTabData(tab.id);
        if (!tabData) return;
        
        this.searchInContent(tabData, tab, query);
    }

    async searchSection(sectionId, section, query) {
        if (!section.file) return;
        
        try {
            // Load section if not already loaded
            if (!appState.getTabData(sectionId)) {
                await this.contentManager.loadSectionContent(sectionId);
            }
            
            // Search intro
            if (section.intro) {
                const introData = appState.getTabData(section.intro.id);
                if (introData) {
                    this.searchInContent(introData, {
                        id: section.intro.id,
                        sectionId,
                        sectionLabel: section.title || sectionId,
                        groupId: 'intro',
                        groupLabel: 'Introduction'
                    }, query);
                }
            }
            
            // Search groups
            if (section.groups) {
                for (const group of section.groups) {
                    await this.searchGroup(group, sectionId, section, query);
                }
            }
            
            // Search children
            if (section.children) {
                for (const child of section.children) {
                    await this.searchGroup(child, sectionId, section, query);
                }
            }
            
        } catch (error) {
            console.error(`Error searching section ${sectionId}:`, error);
        }
    }

    async searchGroup(group, sectionId, section, query) {
        // Search direct items
        if (group.items) {
            for (const item of group.items) {
                const tabData = appState.getTabData(item.id);
                if (tabData) {
                    this.searchInContent(tabData, {
                        id: item.id,
                        sectionId,
                        sectionLabel: section.title || sectionId,
                        groupId: group.id,
                        groupLabel: group.label
                    }, query);
                }
            }
        }
        
        // Search nested children
        if (group.children) {
            for (const child of group.children) {
                await this.searchGroup(child, sectionId, section, query);
            }
        }
    }

    searchInContent(data, tab, query) {
        // Search title (highest priority)
        if (data.title && typeof data.title === 'string' && data.title.toLowerCase().includes(query)) {
            const titleLower = data.title.toLowerCase();
            const isFullWordMatch = this.isFullWordMatch(titleLower, query);
            
            this.searchResults.push({
                type: 'title',
                text: data.title,
                section: tab.sectionLabel || tab.sectionId || 'Unknown',
                group: tab.groupLabel || tab.groupId || 'Unknown',
                tabId: tab.id,
                priority: isFullWordMatch ? 1 : 1.5 // Full word matches get higher priority
            });
        }
        
        // Search content sections
        const sections = data.sections || data.content;
        if (sections && Array.isArray(sections)) {
            for (const section of sections) {
                // Search section title
                if (section.title && typeof section.title === 'string' && section.title.toLowerCase().includes(query)) {
                    const sectionTitleLower = section.title.toLowerCase();
                    const isFullWordMatch = this.isFullWordMatch(sectionTitleLower, query);
                    
                    this.searchResults.push({
                        type: 'section',
                        text: section.title,
                        section: tab.sectionLabel || tab.sectionId || 'Unknown',
                        group: tab.groupLabel || tab.groupId || 'Unknown',
                        tabId: tab.id,
                        priority: isFullWordMatch ? 2 : 2.5 // Full word matches get higher priority
                    });
                }
                
                // Search section content - handle different content types
                if (section.content) {
                    let contentText = '';
                    
                    // Handle different content types
                    if (typeof section.content === 'string') {
                        contentText = section.content;
                    } else if (Array.isArray(section.content)) {
                        // If content is an array, join it
                        contentText = section.content.join(' ');
                    } else if (typeof section.content === 'object') {
                        // If content is an object, try to extract text
                        contentText = JSON.stringify(section.content);
                    }
                    
                    if (contentText && contentText.toLowerCase().includes(query)) {
                        const snippet = this.createSnippet(contentText, query);
                        this.searchResults.push({
                            type: 'content',
                            text: snippet,
                            section: tab.sectionLabel || tab.sectionId || 'Unknown',
                            group: tab.groupLabel || tab.groupId || 'Unknown',
                            tabId: tab.id,
                            priority: 3
                        });
                    }
                }
                
                // Search list items
                if (section.items && Array.isArray(section.items)) {
                    for (const item of section.items) {
                        if (typeof item === 'string' && item.toLowerCase().includes(query)) {
                            this.searchResults.push({
                                type: 'list-item',
                                text: item,
                                section: tab.sectionLabel || tab.sectionId || 'Unknown',
                                group: tab.groupLabel || tab.groupId || 'Unknown',
                                tabId: tab.id,
                                priority: 4
                            });
                        }
                    }
                }
                
                // Search code - handle different content types
                if (section.type === 'code' && section.content) {
                    let codeText = '';
                    
                    // Handle different content types for code
                    if (typeof section.content === 'string') {
                        codeText = section.content;
                    } else if (Array.isArray(section.content)) {
                        codeText = section.content.join('\n');
                    } else if (typeof section.content === 'object') {
                        codeText = JSON.stringify(section.content);
                    }
                    
                    if (codeText && codeText.toLowerCase().includes(query)) {
                        const snippet = this.createSnippet(codeText, query, 30);
                        this.searchResults.push({
                            type: 'code',
                            text: snippet,
                            section: tab.sectionLabel || tab.sectionId || 'Unknown',
                            group: tab.groupLabel || tab.groupId || 'Unknown',
                            tabId: tab.id,
                            priority: 5
                        });
                    }
                }
            }
        }
    }

    createSnippet(content, query, contextLength = 50) {
        const index = content.toLowerCase().indexOf(query);
        const start = Math.max(0, index - contextLength);
        const end = Math.min(content.length, index + query.length + contextLength);
        return content.substring(start, end);
    }

    isFullWordMatch(text, query) {
        // Split text into words and check if query is a complete word
        const words = text.toLowerCase().split(/\s+/);
        return words.includes(query.toLowerCase());
    }

    sortResults() {
        // Sort by priority, then remove duplicates
        this.searchResults.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.section.localeCompare(b.section);
        });
        
        // Remove duplicates (keep the first occurrence, which will be the highest priority)
        const seen = new Set();
        this.searchResults = this.searchResults.filter(result => {
            const key = `${result.tabId}-${result.type}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    showResults() {
        this.hideResults();
        
        const searchContainer = this.getSearchContainer();
        if (!searchContainer) return;
        
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'search-results';
        resultsDiv.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: var(--color-sidebar-background);
            border: 2px solid var(--color-background-border);
            border-radius: 0.75rem;
            max-height: 500px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            margin-top: 0.5rem;
        `;
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 0.75rem;
            border-bottom: 1px solid var(--color-background-border);
            font-weight: bold;
            color: var(--color-sidebar-link-text);
            background-color: var(--color-sidebar-item-background--hover);
            cursor: pointer;
            transition: background-color 0.2s ease;
        `;
        
        if (this.searchResults.length === 0) {
            header.textContent = `No results found for "${this.currentSearchQuery}"`;
        } else {
            header.textContent = `Found ${this.searchResults.length} result${this.searchResults.length !== 1 ? 's' : ''}`;
            
            // Make header clickable to show all results
            header.addEventListener('click', () => {
                this.showAllResultsPage();
            });
            
            header.addEventListener('mouseenter', () => {
                header.style.backgroundColor = 'var(--color-sidebar-item-background--hover)';
                header.style.textDecoration = 'underline';
            });
            
            header.addEventListener('mouseleave', () => {
                header.style.backgroundColor = 'var(--color-sidebar-item-background--hover)';
                header.style.textDecoration = 'none';
            });
        }
        resultsDiv.appendChild(header);
        
        // Show results
        this.searchResults.slice(0, 15).forEach(result => {
            const item = this.createResultItem(result);
            resultsDiv.appendChild(item);
        });
        
        searchContainer.appendChild(resultsDiv);
    }

    createResultItem(result) {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 1rem;
            border-bottom: 1px solid var(--color-background-border);
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        const displayText = result.text.length > 100 ? 
            result.text.substring(0, 100) + '...' : 
            result.text;
        
        const highlightedText = this.highlightQuery(displayText, this.currentSearchQuery);
        
        const typeIcons = {
            'title': '📖',
            'section': '📑',
            'content': '📝',
            'list-item': '📋',
            'code': '💻'
        };
        
        // Add visual indicator for full word matches
        const isFullWordMatch = result.priority < Math.floor(result.priority) + 0.5;
        const matchIndicator = isFullWordMatch ? '⭐ ' : '';
        
        item.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 0.5rem; color: var(--color-sidebar-link-text--top-level);">
                ${matchIndicator}${typeIcons[result.type] || '📄'} ${highlightedText}
            </div>
            <div style="font-size: 0.875rem; color: var(--color-sidebar-link-text); margin-bottom: 0.25rem;">
                📁 ${result.section} → ${result.group}
            </div>
            <div style="font-size: 0.75rem; color: var(--color-sidebar-link-text); opacity: 0.7; text-transform: uppercase;">
                ${result.type}${isFullWordMatch ? ' (exact match)' : ''}
            </div>
        `;
        
        item.addEventListener('click', () => {
            if (this.navigationManager) {
                this.navigationManager.navigateToTab(result.tabId);
            }
            this.hideResults();
        });
        
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = 'var(--color-sidebar-item-background--hover)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = '';
        });
        
        return item;
    }

    highlightQuery(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark style="background-color: var(--color-accent); color: var(--color-background); padding: 0.1rem 0.2rem; border-radius: 0.2rem;">$1</mark>');
    }

    getSearchContainer() {
        return document.querySelector('.search-container-header') || 
               document.querySelector('.mobile-sidebar-search');
    }

    hideResults() {
        const existing = document.querySelector('.search-results');
        if (existing) {
            existing.remove();
        }
    }

    showError(message) {
        this.hideResults();
        
        const searchContainer = this.getSearchContainer();
        if (!searchContainer) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'search-results';
        errorDiv.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #f44336;
            color: white;
            border: 2px solid var(--color-background-border);
            border-radius: 0.75rem;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            margin-top: 0.5rem;
            padding: 1rem;
            text-align: center;
        `;
        errorDiv.textContent = message;
        
        searchContainer.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    showAllResultsPage() {
        // Hide the dropdown
        this.hideResults();
        
        // Create the full-page search results
        const container = document.getElementById('tab-container');
        if (!container) return;
        
        // Clear current content
        container.innerHTML = '';
        
        // Create search results page
        const searchPage = document.createElement('div');
        searchPage.id = 'search-results-page';
        searchPage.className = 'tab-content active';
        searchPage.style.cssText = `
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        `;
        
        // Header section
        const header = document.createElement('div');
        header.style.cssText = `
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--color-background-border);
        `;
        
        const title = document.createElement('h1');
        title.style.cssText = `
            color: var(--color-sidebar-link-text--top-level);
            margin-bottom: 0.5rem;
        `;
        title.textContent = `Search Results for "${this.currentSearchQuery}"`;
        
        const resultCount = document.createElement('p');
        resultCount.style.cssText = `
            color: var(--color-sidebar-link-text);
            font-size: 1.1rem;
            margin: 0;
        `;
        resultCount.textContent = `Found ${this.searchResults.length} result${this.searchResults.length !== 1 ? 's' : ''}`;
        
        const backButton = document.createElement('button');
        backButton.textContent = '← Back to Previous Page';
        backButton.style.cssText = `
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background-color: var(--color-sidebar-item-background--hover);
            color: var(--color-sidebar-link-text);
            border: 1px solid var(--color-background-border);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        backButton.addEventListener('click', () => {
            // Go back to the previous page
            window.history.back();
        });
        
        backButton.addEventListener('mouseenter', () => {
            backButton.style.backgroundColor = 'var(--color-sidebar-item-background--hover)';
            backButton.style.transform = 'translateY(-1px)';
        });
        
        backButton.addEventListener('mouseleave', () => {
            backButton.style.backgroundColor = 'var(--color-sidebar-item-background--hover)';
            backButton.style.transform = 'translateY(0)';
        });
        
        header.appendChild(title);
        header.appendChild(resultCount);
        header.appendChild(backButton);
        searchPage.appendChild(header);
        
        // Group results by type
        const groupedResults = this.groupResultsByType();
        
        // Display grouped results
        Object.entries(groupedResults).forEach(([type, results]) => {
            if (results.length === 0) return;
            
            const section = document.createElement('div');
            section.style.cssText = `
                margin-bottom: 2rem;
            `;
            
            const sectionTitle = document.createElement('h2');
            sectionTitle.style.cssText = `
                color: var(--color-sidebar-link-text--top-level);
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid var(--color-background-border);
            `;
            
            const typeLabels = {
                'title': '📖 Page Titles',
                'section': '📑 Section Headers',
                'content': '📝 Content',
                'list-item': '📋 List Items',
                'code': '💻 Code'
            };
            
            sectionTitle.textContent = `${typeLabels[type] || type} (${results.length})`;
            section.appendChild(sectionTitle);
            
            // Create results grid
            const resultsGrid = document.createElement('div');
            resultsGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                gap: 1rem;
            `;
            
            results.forEach(result => {
                const resultCard = this.createFullPageResultCard(result);
                resultsGrid.appendChild(resultCard);
            });
            
            section.appendChild(resultsGrid);
            searchPage.appendChild(section);
        });
        
        container.appendChild(searchPage);
        
        // Update URL to reflect search state
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('search', this.currentSearchQuery);
        const newUrl = `${window.location.pathname}?${searchParams.toString()}#search-results`;
        window.history.pushState({ search: this.currentSearchQuery }, '', newUrl);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    groupResultsByType() {
        const grouped = {
            'title': [],
            'section': [],
            'content': [],
            'list-item': [],
            'code': []
        };
        
        this.searchResults.forEach(result => {
            if (grouped[result.type]) {
                grouped[result.type].push(result);
            }
        });
        
        return grouped;
    }

    createFullPageResultCard(result) {
        const card = document.createElement('div');
        card.style.cssText = `
            background-color: var(--color-sidebar-background);
            border: 1px solid var(--color-background-border);
            border-radius: 0.75rem;
            padding: 1.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        `;
        
        const displayText = result.text.length > 200 ? 
            result.text.substring(0, 200) + '...' : 
            result.text;
        
        const highlightedText = this.highlightQuery(displayText, this.currentSearchQuery);
        
        const typeIcons = {
            'title': '📖',
            'section': '📑',
            'content': '📝',
            'list-item': '📋',
            'code': '💻'
        };
        
        // Add visual indicator for full word matches
        const isFullWordMatch = result.priority < Math.floor(result.priority) + 0.5;
        const matchIndicator = isFullWordMatch ? '⭐ ' : '';
        
        card.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 0.75rem; color: var(--color-sidebar-link-text--top-level); font-size: 1.1rem;">
                ${matchIndicator}${typeIcons[result.type] || '📄'} ${highlightedText}
            </div>
            <div style="font-size: 0.9rem; color: var(--color-sidebar-link-text); margin-bottom: 0.5rem;">
                📁 ${result.section} → ${result.group}
            </div>
            <div style="font-size: 0.8rem; color: var(--color-sidebar-link-text); opacity: 0.7; text-transform: uppercase;">
                ${result.type}${isFullWordMatch ? ' (exact match)' : ''}
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (this.navigationManager) {
                this.navigationManager.navigateToTab(result.tabId);
            }
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.backgroundColor = 'var(--color-sidebar-item-background--hover)';
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.backgroundColor = 'var(--color-sidebar-background)';
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        });
        
        return card;
    }

    restoreSearchResults() {
        if (this.currentSearchQuery && this.searchResults.length > 0) {
            this.showResults();
        }
    }
    
    restoreSearchInputs() {
        if (this.currentSearchQuery) {
            const searchInput = document.getElementById('header-search');
            const mobileSearchInput = document.getElementById('mobile-sidebar-search');
            
            if (searchInput) searchInput.value = this.currentSearchQuery;
            if (mobileSearchInput) mobileSearchInput.value = this.currentSearchQuery;
        }
    }
    
    testSearch() {
        console.log('Testing search functionality...');
        this.performSearch('robot');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
} 