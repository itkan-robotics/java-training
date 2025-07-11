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
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            searchInput.addEventListener('focus', () => {
                if (this.currentSearchQuery && this.searchResults.length > 0) {
                    // Optionally show search results
                }
            });
        }
        
        // Close search results when clicking outside
        document.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.search-container-header') && 
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
        
        // Store current query and save to app state
        this.currentSearchQuery = query;
        appState.setSearchQuery(query);
        
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
        
        // Check if this is the mobile sidebar search
        const isMobileSearch = searchContainer.classList.contains('mobile-sidebar-search-container');
        
        const loadingDiv = this.createSearchResultsContainer(isMobileSearch);
        loadingDiv.textContent = 'Searching...';
        
        searchContainer.appendChild(loadingDiv);
    }

    // Helper method to create search results container
    createSearchResultsContainer(isMobileSearch = false) {
        const container = document.createElement('div');
        container.className = 'search-results';
        
        const baseStyles = {
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            backgroundColor: 'var(--color-sidebar-background)',
            border: '2px solid var(--color-background-border)',
            borderRadius: '0.75rem',
            zIndex: '1000',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            marginTop: '0.5rem',
            padding: '1rem',
            textAlign: 'center',
            color: 'var(--color-sidebar-link-text)',
            maxHeight: isMobileSearch ? '60vh' : '200px'
        };
        
        Object.assign(container.style, baseStyles);
        return container;
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
        
        try {
            // Search through all available tabs
            this.searchResults = [];
            await this.searchAllTabs(searchQuery);
            
            // Sort results with titles first
            this.sortResults();
            
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
                    const titleLower = section.title.toLowerCase();
                    const isFullWordMatch = this.isFullWordMatch(titleLower, query);
                    
                    this.searchResults.push({
                        type: 'section-title',
                        text: section.title,
                        section: tab.sectionLabel || tab.sectionId || 'Unknown',
                        group: tab.groupLabel || tab.groupId || 'Unknown',
                        tabId: tab.id,
                        priority: isFullWordMatch ? 2 : 2.5
                    });
                }
                
                // Search section content
                if (section.content && typeof section.content === 'string' && section.content.toLowerCase().includes(query)) {
                    const contentLower = section.content.toLowerCase();
                    const isFullWordMatch = this.isFullWordMatch(contentLower, query);
                    
                    // Create snippet for content matches
                    const snippet = this.createSnippet(section.content, query);
                    
                    this.searchResults.push({
                        type: 'content',
                        text: snippet,
                        section: tab.sectionLabel || tab.sectionId || 'Unknown',
                        group: tab.groupLabel || tab.groupId || 'Unknown',
                        tabId: tab.id,
                        priority: isFullWordMatch ? 3 : 3.5
                    });
                }
                
                // Search code content
                if (section.code && typeof section.code === 'string' && section.code.toLowerCase().includes(query)) {
                    const codeLower = section.code.toLowerCase();
                    const isFullWordMatch = this.isFullWordMatch(codeLower, query);
                    
                    // Create snippet for code matches
                    const snippet = this.createSnippet(section.code, query);
                    
                    this.searchResults.push({
                        type: 'code',
                        text: snippet,
                        section: tab.sectionLabel || tab.sectionId || 'Unknown',
                        group: tab.groupLabel || tab.groupId || 'Unknown',
                        tabId: tab.id,
                        priority: isFullWordMatch ? 4 : 4.5
                    });
                }
                
                // Search list items
                if (section.items && Array.isArray(section.items)) {
                    for (const item of section.items) {
                        if (typeof item === 'string' && item.toLowerCase().includes(query)) {
                            const itemLower = item.toLowerCase();
                            const isFullWordMatch = this.isFullWordMatch(itemLower, query);
                            
                            const snippet = this.createSnippet(item, query);
                            
                            this.searchResults.push({
                                type: 'list-item',
                                text: snippet,
                                section: tab.sectionLabel || tab.sectionId || 'Unknown',
                                group: tab.groupLabel || tab.groupId || 'Unknown',
                                tabId: tab.id,
                                priority: isFullWordMatch ? 5 : 5.5
                            });
                        }
                    }
                }
            }
        }
    }

    createSnippet(content, query, contextLength = 50) {
        const lowerContent = content.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerContent.indexOf(lowerQuery);
        
        if (index === -1) return content.substring(0, contextLength * 2);
        
        const start = Math.max(0, index - contextLength);
        const end = Math.min(content.length, index + query.length + contextLength);
        
        let snippet = content.substring(start, end);
        
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';
        
        return snippet;
    }

    isFullWordMatch(text, query) {
        const words = text.split(/\s+/);
        return words.some(word => word.toLowerCase() === query.toLowerCase());
    }

    sortResults() {
        this.searchResults.sort((a, b) => {
            // First by priority
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            
            // Then by section name
            if (a.section !== b.section) {
                return a.section.localeCompare(b.section);
            }
            
            // Then by group name
            if (a.group !== b.group) {
                return a.group.localeCompare(b.group);
            }
            
            // Finally by text
            return a.text.localeCompare(b.text);
        });
        // Deduplicate results: keep only one per tabId/type/text
        const seen = new Set();
        this.searchResults = this.searchResults.filter(result => {
            // For content/code/list-item, include text in key; for title/section-title, just tabId+type
            const key =
                (result.type === 'content' || result.type === 'code' || result.type === 'list-item')
                    ? `${result.tabId}|${result.type}|${result.text}`
                    : `${result.tabId}|${result.type}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    showResults() {
        this.hideResults();
        
        const searchContainer = this.getSearchContainer();
        if (!searchContainer) {
            console.error('No search container found');
            return;
        }
        
        // Check if this is the mobile sidebar search
        const isMobileSearch = searchContainer.classList.contains('mobile-sidebar-search-container');
        
        const resultsDiv = this.createSearchResultsContainer(isMobileSearch);
        resultsDiv.style.textAlign = 'left';
        
        // Only show up to 15 results in dropdown
        const shownResults = this.searchResults.slice(0, 15);
        const header = this.createSearchResultsHeader(resultsDiv, this.searchResults.length, isMobileSearch, shownResults.length);
        if (header) {
            resultsDiv.appendChild(header); // On mobile, header goes inside the dropdown
        }
        
        // Show results
        shownResults.forEach(result => {
            const item = this.createResultItem(result);
            item.style.textAlign = 'left';
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
            'section-title': '📑',
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
        return document.querySelector('.search-container-header');
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
        
        // Check if this is the mobile sidebar search
        const isMobileSearch = searchContainer.classList.contains('mobile-sidebar-search-container');
        
        const errorDiv = this.createSearchResultsContainer(isMobileSearch);
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
            text-align: left;
        `;
        
        // Header section
        const header = document.createElement('div');
        header.style.cssText = `
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--color-background-border);
            text-align: left;
        `;
        
        const title = document.createElement('h1');
        title.style.cssText = `
            color: var(--color-sidebar-link-text--top-level);
            margin-bottom: 0.5rem;
            text-align: left;
        `;
        title.textContent = `Search Results for "${this.currentSearchQuery}"`;
        
        const resultCount = document.createElement('p');
        resultCount.style.cssText = `
            color: var(--color-sidebar-link-text);
            font-size: 1.1rem;
            margin: 0;
            text-align: left;
        `;
        resultCount.textContent = `Found ${this.searchResults.length} result${this.searchResults.length !== 1 ? 's' : ''}`;
        
        // Improved back button logic
        const backButton = document.createElement('span');
        backButton.textContent = '← Back to Previous Page';
        backButton.style.cssText = `
            margin-top: 1rem;
            color: var(--color-sidebar-link-text--top-level);
            text-decoration: underline;
            cursor: pointer;
            font-size: 1rem;
            display: inline-block;
        `;
        backButton.onclick = (e) => {
            e.preventDefault();
            // Try to go back, but if not possible, go to homepage
            if (window.history.length > 1) {
                window.history.back();
                setTimeout(() => {
                    window.location.reload();
                }, 200);
            } else {
                window.location.href = '/';
            }
        };
        
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
                text-align: left;
            `;
            
            const sectionTitle = document.createElement('h2');
            sectionTitle.style.cssText = `
                color: var(--color-sidebar-link-text--top-level);
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid var(--color-background-border);
                text-align: left;
            `;
            
            const typeLabels = {
                'title': '📖 Page Titles',
                'section-title': '📑 Section Headers',
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
                text-align: left;
            `;
            
            results.forEach(result => {
                const resultCard = this.createFullPageResultCard(result);
                resultCard.style.textAlign = 'left';
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
            'section-title': [],
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
            'section-title': '📑',
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

    // Creates the header for the dropdown search results
    createSearchResultsHeader(resultsDiv, resultCount, isMobileSearch = false, shownCount = null) {
        // On mobile, use a more compact header styled for the dropdown, not the header bar
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = isMobileSearch
            ? `
                display: block;
                text-align: left;
                padding: 0.25rem 0.5rem 0.25rem 0;
                border-bottom: 1px solid var(--color-background-border);
                margin-bottom: 0.5rem;
                font-size: 0.95rem;
                color: var(--color-sidebar-link-text--top-level);
                background: none;
            `
            : `
                display: block;
                text-align: left;
                padding: 0.5rem 1rem 0.5rem 0;
                border-bottom: 1px solid var(--color-background-border);
                margin-bottom: 0.5rem;
                font-size: 1rem;
                color: var(--color-sidebar-link-text--top-level);
                background: none;
            `;

        // Results count
        const countSpan = document.createElement('span');
        countSpan.textContent = `Results (${shownCount !== null ? shownCount : resultCount}${shownCount !== null && shownCount < resultCount ? ' of ' + resultCount : ''})`;
        countSpan.style.fontWeight = 'bold';
        countSpan.style.display = 'block';
        countSpan.style.marginBottom = '0.15rem';
        headerDiv.appendChild(countSpan);

        // If there are more than 15 results, show a 'Show all results' link
        if (resultCount > 15 && shownCount !== null && shownCount < resultCount) {
            const showAllLink = document.createElement('span');
            showAllLink.textContent = 'Show all results';
            showAllLink.style.cssText = `
                color: var(--color-sidebar-link-text--top-level);
                text-decoration: underline;
                cursor: pointer;
                font-size: 0.95rem;
                display: block;
                margin-top: 0.1rem;
                margin-bottom: 0.1rem;
                width: fit-content;
            `;
            showAllLink.onclick = (e) => {
                e.preventDefault();
                this.showAllResultsPage();
            };
            headerDiv.appendChild(showAllLink);
        }

        return headerDiv;
    }

    restoreSearchResults() {
        if (this.currentSearchQuery && this.searchResults.length > 0) {
            this.showResults();
        }
    }
    
    restoreSearchInputs() {
        if (this.currentSearchQuery) {
            const searchInput = document.getElementById('header-search');
            
            if (searchInput) searchInput.value = this.currentSearchQuery;
        }
    }
    
    testSearch() {
        // Test search functionality
        this.performSearch('test');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
} 