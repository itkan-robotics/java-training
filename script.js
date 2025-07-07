/**
 * SwyftNav - Interactive Learning Platform
 * Core Application Logic
 * 
 * Architecture Overview:
 * - ConfigManager: Handles all configuration loading and management
 * - NavigationManager: Manages sidebar navigation and URL routing
 * - ContentManager: Handles content loading and rendering
 * - ThemeManager: Manages theme switching and persistence
 * - SearchManager: Handles global search functionality
 * - EventManager: Centralizes all event handling
 */

// ============================================================================
// GLOBAL STATE MANAGEMENT
// ============================================================================

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

// ============================================================================
// CONFIGURATION MANAGER
// ============================================================================

class ConfigManager {
    constructor() {
        this.configCache = new Map();
    }

    async loadMainConfig() {
        try {
            const response = await fetch('data/config/config.json');
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
        // Add cache-busting parameter
        const url = new URL(section.file, window.location.href);
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
            // Add cache-busting parameter
            const url = new URL(filePath, window.location.href);
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

// ============================================================================
// CONTENT MANAGER
// ============================================================================

class ContentManager {
    constructor(configManager = null) {
        this.configManager = configManager || new ConfigManager();
    }

    async loadSectionContent(sectionId) {
        const sectionConfig = await this.configManager.loadSectionConfig(sectionId);
        const contentPromises = [];

        // Handle standalone content files (like homepage)
        if (sectionConfig.file && !sectionConfig.groups && !sectionConfig.intro && !sectionConfig.children) {
            try {
                const data = await this.configManager.loadContentFile(sectionConfig.file);
                const tabInfo = {
                    ...sectionConfig,
                    ...data,
                    sectionId,
                    sectionLabel: sectionConfig.label,
                    loaded: true
                };
                
                appState.addTabData(sectionId, tabInfo);
                appState.allTabs.push(tabInfo);
                return;
            } catch (error) {
                console.error(`Error loading standalone content for ${sectionId}:`, error);
                throw error;
            }
        }

        // Load intro content if exists
        if (sectionConfig.intro) {
            contentPromises.push(this.loadIntroContent(sectionConfig.intro, sectionId, sectionConfig));
        }

        // Load groups content if exists and is an array
        if (Array.isArray(sectionConfig.groups)) {
            contentPromises.push(...this.loadGroupsContent(sectionConfig.groups, sectionId, sectionConfig));
        }

        await Promise.all(contentPromises);
    }

    async loadIntroContent(intro, sectionId, sectionConfig) {
        try {
            const data = await this.configManager.loadContentFile(intro.file);
            const tabInfo = {
                ...intro,
                ...data,
                sectionId,
                sectionLabel: sectionConfig.title || sectionConfig.label,
                loaded: true
            };
            
            appState.addTabData(intro.id, tabInfo);
            appState.allTabs.push(tabInfo);
        } catch (error) {
            console.error(`Error loading intro content for ${sectionId}:`, error);
        }
    }

    loadGroupsContent(groups, sectionId, sectionConfig) {
        const promises = [];
        groups.forEach(group => {
            if (Array.isArray(group.items)) {
                group.items.forEach(item => {
                    promises.push(this.loadItemContent(item, sectionId, sectionConfig, group));
                });
            }
        });
        return promises;
    }

    async loadItemContent(item, sectionId, sectionConfig, group) {
        try {
            const data = await this.configManager.loadContentFile(item.file);
            const tabInfo = {
                ...item,
                ...data,
                sectionId,
                sectionLabel: sectionConfig.title || sectionConfig.label,
                groupId: group.id,
                groupLabel: group.label,
                loaded: true
            };
            
            appState.addTabData(item.id, tabInfo);
            appState.allTabs.push(tabInfo);
        } catch (error) {
            console.error(`Error loading item content ${item.id}:`, error);
        }
    }



    async loadSingleContent(tabId) {
        const tabData = appState.getTabData(tabId);
        if (!tabData || !tabData.file || tabData.loaded) {
            return tabData;
        }

        try {
            const data = await this.configManager.loadContentFile(tabData.file);
            const updatedTabData = { ...tabData, ...data, loaded: true, label: data.title };
            appState.addTabData(tabId, updatedTabData);
            return updatedTabData;
            } catch (error) {
            console.error(`Error loading single content ${tabId}:`, error);
            throw error;
        }
    }

    renderContent(tabId) {
        const data = appState.getTabData(tabId);
        if (!data) {
            console.error(`No data found for tab: ${tabId}`);
            return;
        }
        
        const container = document.getElementById('tab-container');
        container.innerHTML = '';
        
        const tabContent = document.createElement('div');
        tabContent.id = tabId;
        tabContent.className = 'tab-content active';
        
        const section = document.createElement('section');
        section.id = `content-${tabId}`;
        
        const title = document.createElement('h1');
        title.innerHTML = `${data.title}<a class="headerlink" href="#content-${tabId}" title="Link to this heading">¶</a>`;
        section.appendChild(title);
        
        const contentSection = document.createElement('div');
        contentSection.className = 'content-section';
        
        // Render each section (support both 'sections' and 'content')
        const sectionsArray = data.sections || data.content;
        if (sectionsArray && Array.isArray(sectionsArray)) {
            sectionsArray.forEach(sectionData => {
                this.renderSection(contentSection, sectionData);
            });
        }
        
        section.appendChild(contentSection);
        tabContent.appendChild(section);
        container.appendChild(tabContent);
    }

    renderSection(container, sectionData) {
        const renderers = {
            'text': this.renderTextSection.bind(this),
            'list': this.renderListSection.bind(this),
            'code': this.renderCodeSection.bind(this),
            'rules-box': this.renderRulesBox.bind(this),
            'exercise-box': this.renderExerciseBox.bind(this),
            'data-types-grid': this.renderDataTypesGrid.bind(this),
            'logical-operators': this.renderLogicalOperators.bind(this),
            'emphasis-box': this.renderRulesBox.bind(this),
            'link-grid': this.renderLinkGrid.bind(this),
            'section': this.renderSectionTypeSection.bind(this) // NEW: support for 'section' type
        };

        const renderer = renderers[sectionData.type];
        if (renderer) {
            renderer(container, sectionData);
        } else {
            console.warn(`Unknown section type: ${sectionData.type}`);
        }
    }

    renderTextSection(container, data) {
    if (data.title) {
        const h3 = document.createElement('h3');
        h3.textContent = data.title;
        container.appendChild(h3);
    }
    
    const p = document.createElement('p');
    p.innerHTML = data.content;
    container.appendChild(p);
}

    renderListSection(container, data) {
    if (data.title) {
        const h3 = document.createElement('h3');
        h3.textContent = data.title;
        container.appendChild(h3);
    }
    
    const ul = document.createElement('ul');
    data.items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = item;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

    renderCodeSection(container, data) {
    if (data.title) {
        const h3 = document.createElement('h3');
        h3.textContent = data.title;
        container.appendChild(h3);
    }
    
    const codeBlock = document.createElement('div');
    codeBlock.className = 'code-block';
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = data.content;
    pre.appendChild(code);
    codeBlock.appendChild(pre);
    container.appendChild(codeBlock);
}

    renderRulesBox(container, data) {
        const rulesBox = document.createElement('div');
        rulesBox.className = 'rules-box';
        
        if (data.title) {
            const h3 = document.createElement('h3');
            h3.textContent = data.title;
            rulesBox.appendChild(h3);
        }
        
        if (data.subtitle) {
            const h4 = document.createElement('h4');
            h4.textContent = data.subtitle;
            h4.style.marginTop = '0.5rem';
            h4.style.marginBottom = '1rem';
            h4.style.color = 'var(--color-foreground-secondary)';
            h4.style.fontWeight = '500';
            rulesBox.appendChild(h4);
        }
        
        if (data.items && Array.isArray(data.items)) {
            const itemsList = document.createElement('ul');
            itemsList.style.margin = '0';
            itemsList.style.paddingLeft = '1.5rem';
            
            data.items.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = item;
                li.style.marginBottom = '0.5rem';
                li.style.lineHeight = '1.5';
                itemsList.appendChild(li);
            });
            rulesBox.appendChild(itemsList);
        }
        
        if (data.content) {
            const content = document.createElement('div');
            content.innerHTML = data.content;
            content.style.marginTop = '1rem';
            rulesBox.appendChild(content);
        }
        
        container.appendChild(rulesBox);
    }

    renderExerciseBox(container, data) {
        const exerciseBox = document.createElement('div');
        exerciseBox.className = 'exercise-box';

        if (data.title) {
            const h3 = document.createElement('h3');
            h3.textContent = data.title;
            exerciseBox.appendChild(h3);
        }
        
        if (data.subtitle) {
            const subtitle = document.createElement('h4');
            subtitle.textContent = data.subtitle;
            exerciseBox.appendChild(subtitle);
        }
        
        if (data.description) {
            const desc = document.createElement('p');
            desc.textContent = data.description;
            exerciseBox.appendChild(desc);
        }

        if (data.content && typeof data.content === 'string') {
            const contentP = document.createElement('p');
            contentP.textContent = data.content;
            exerciseBox.appendChild(contentP);
        }

        if (data.tasks) {
            const tasksList = document.createElement('ul');
            data.tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task;
                tasksList.appendChild(li);
            });
            exerciseBox.appendChild(tasksList);
        }

        if (data.code) {
            const codeSection = document.createElement('div');
            codeSection.className = 'exercise-code';
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.innerText = data.code;
            pre.appendChild(code);
            codeSection.appendChild(pre);
            exerciseBox.appendChild(codeSection);
        }

        // Show/hide answers button and section
        if (data.answers && Array.isArray(data.answers) && data.answers.length > 0) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'answer-toggle-btn';
            toggleBtn.textContent = 'Show Answers';
            let answersVisible = false;

            const answerSection = document.createElement('div');
            answerSection.className = 'answer-section hidden';

            // Add answers
            data.answers.forEach(answer => {
                const answerItem = document.createElement('div');
                answerItem.className = 'answer-item';

                if (answer.task) {
                    const taskLabel = document.createElement('div');
                    taskLabel.className = 'answer-task-label';
                    taskLabel.textContent = answer.task;
                    answerItem.appendChild(taskLabel);
                }

                if (answer.content) {
                    const codeDiv = document.createElement('div');
                    codeDiv.className = 'answer-code';
                    const pre = document.createElement('pre');
                    const code = document.createElement('code');
                    code.innerText = answer.content;
                    pre.appendChild(code);
                    codeDiv.appendChild(pre);
                    answerItem.appendChild(codeDiv);
                }

                answerSection.appendChild(answerItem);
            });

            toggleBtn.addEventListener('click', () => {
                answersVisible = !answersVisible;
                if (answersVisible) {
                    answerSection.classList.remove('hidden');
                    answerSection.classList.add('visible');
                    toggleBtn.textContent = 'Hide Answers';
                    toggleBtn.classList.add('active');
                } else {
                    answerSection.classList.remove('visible');
                    answerSection.classList.add('hidden');
                    toggleBtn.textContent = 'Show Answers';
                    toggleBtn.classList.remove('active');
                }
            });

            exerciseBox.appendChild(toggleBtn);
            exerciseBox.appendChild(answerSection);
        }

        container.appendChild(exerciseBox);
    }

    renderDataTypesGrid(container, data) {
        const grid = document.createElement('div');
        grid.className = 'data-types-grid';
        
        data.types.forEach(type => {
            const typeBox = document.createElement('div');
            typeBox.className = 'data-type';
            
            const name = document.createElement('h4');
            name.textContent = type.name;
            typeBox.appendChild(name);
            
            const description = document.createElement('p');
            description.textContent = type.description;
            typeBox.appendChild(description);
            
            if (type.example) {
                const example = document.createElement('code');
                example.textContent = type.example;
                typeBox.appendChild(example);
            }
            
            grid.appendChild(typeBox);
        });
        
        container.appendChild(grid);
    }

    renderLogicalOperators(container, data) {
        const logicalOperatorsBox = document.createElement('div');
        logicalOperatorsBox.className = 'logical-operators-box';
        
        if (data.title) {
            const h3 = document.createElement('h3');
            h3.textContent = data.title;
            logicalOperatorsBox.appendChild(h3);
        }
        
        if (data.subtitle) {
            const h4 = document.createElement('h4');
            h4.textContent = data.subtitle;
            logicalOperatorsBox.appendChild(h4);
        }
        
        if (data.operators && Array.isArray(data.operators)) {
            const operatorsList = document.createElement('ul');
            data.operators.forEach(operator => {
                const li = document.createElement('li');
                li.innerHTML = operator;
                operatorsList.appendChild(li);
            });
            logicalOperatorsBox.appendChild(operatorsList);
        }
        
        if (data.examples) {
            const examplesDiv = document.createElement('div');
            examplesDiv.className = 'logical-operators-examples';
            
            const examplesTitle = document.createElement('h4');
            examplesTitle.textContent = 'Examples:';
            examplesDiv.appendChild(examplesTitle);
            
            const codeBlock = document.createElement('div');
            codeBlock.className = 'code-block';
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = data.examples;
            pre.appendChild(code);
            codeBlock.appendChild(pre);
            examplesDiv.appendChild(codeBlock);
            logicalOperatorsBox.appendChild(examplesDiv);
        }
        
        container.appendChild(logicalOperatorsBox);
    }



    renderLinkGrid(container, data) {
        const grid = document.createElement('div');
        grid.className = 'link-grid';
        
        data.links.forEach(link => {
            const linkButton = document.createElement('div');
            linkButton.className = 'link-grid-button';
            
            // Handle different link formats
            if (link.url) {
                // External link format
                linkButton.onclick = () => {
                    if (link.external) {
                        window.open(link.url, '_blank', 'noopener,noreferrer');
                    } else {
                        window.location.href = link.url;
                    }
                };
                linkButton.textContent = link.title || link.label;
            } else if (link.id) {
                // Internal navigation format (like homepage)
                linkButton.onclick = () => {
                    if (app && app.navigationManager) {
                        app.navigationManager.navigateToTab(link.id);
                    }
                };
                linkButton.textContent = link.label || link.title;
            }
            
            grid.appendChild(linkButton);
    });
    
    container.appendChild(grid);
    }

    renderSectionTypeSection(container, data) {
        // Render the title as an <h3> if present
        if (data.title) {
            const h3 = document.createElement('h3');
            h3.textContent = data.title;
            container.appendChild(h3);
        }
        // Render the content as HTML if present
        if (data.content) {
            const div = document.createElement('div');
            div.innerHTML = data.content;
            container.appendChild(div);
        }
        // Optionally, support nested sections in the future
    }
}

// ============================================================================
// NAVIGATION MANAGER
// ============================================================================

class NavigationManager {
    constructor(searchManager = null, contentManager = null) {
        this.contentManager = contentManager || new ContentManager();
        this.searchManager = searchManager;
    }

    async generateNavigation() {
        const navigationContainer = document.querySelector('.sidebar-tree');
        if (!navigationContainer) return;

        navigationContainer.innerHTML = '';

        if (appState.currentSection === 'homepage') {
            this.renderHomepageNavigation(navigationContainer);
        } else {
            await this.renderSectionNavigation(navigationContainer);
        }

        // Adjust layout after navigation is generated
        setTimeout(() => {
            this.adjustLayoutForSidebar();
        }, 100);
    }

    renderHomepageNavigation(container) {
        const li = document.createElement('li');
        li.className = 'toctree-l1 current-page';
        const a = document.createElement('a');
        a.className = 'reference';
        a.href = '#homepage';
        a.textContent = 'Home';
        a.onclick = (e) => {
            e.preventDefault();
            this.navigateToTab('homepage');
        };
        li.appendChild(a);
        container.appendChild(li);
    }

    async renderSectionNavigation(container) {
        const section = appState.config.sections[appState.currentSection];
        if (!section) {
            console.error(`Section ${appState.currentSection} not found in config`);
            return;
        }

        // Load section content if needed
        if (!section.groups && !section.tiers && !section.intro && !section.children) {
            await this.contentManager.loadSectionContent(appState.currentSection);
        } else if (section.groups || section.tiers || section.children) {
            await this.contentManager.loadSectionContent(appState.currentSection);
        }

        const updatedSection = appState.config.sections[appState.currentSection];

        // Support new nested parent/child structure
        if (updatedSection.groups) {
            // Check if groups have children (nested structure)
            const hasNestedStructure = updatedSection.groups.some(group => group.children);
            if (hasNestedStructure) {
                this.renderParentGroupsNavigation(container, updatedSection.groups);
            } else {
                this.renderGroupsNavigation(container, updatedSection.groups);
            }
        } else if (updatedSection.children) {
            this.renderParentGroupsNavigation(container, updatedSection.children);
        } else if (updatedSection.tiers) {
            this.renderTiersNavigation(container, updatedSection.tiers);
        } else if (updatedSection.intro) {
            this.renderIntroNavigation(container, updatedSection.intro);
        }
    }

    renderParentGroupsNavigation(container, parents) {
        parents.forEach(parent => {
            const parentLi = document.createElement('li');
            parentLi.className = 'toctree-l0 parent-folder';

            const parentA = document.createElement('a');
            parentA.className = 'reference parent-folder-reference';
            parentA.href = '#';
            parentA.innerHTML = `
                <span class="expand-icon expand-icon-${parent.id}">▼</span>
                ${parent.label}
            `;
            parentA.onclick = (e) => {
                e.preventDefault();
                this.toggleGroup(parent.id);
            };
            parentLi.appendChild(parentA);

            const childrenUl = document.createElement('ul');
            childrenUl.className = 'children-nav expanded';
            childrenUl.id = `children-${parent.id}`;

            // Render each group (child) under this parent
            if (parent.children) {
                // Support for deeper nesting - render children as groups
                this.renderGroupsNavigation(childrenUl, parent.children);
            } else if (parent.groups) {
                this.renderGroupsNavigation(childrenUl, parent.groups);
            } else if (parent.items) {
                // Render items directly if present
                parent.items.forEach(item => {
                    const itemLi = document.createElement('li');
                    itemLi.className = 'toctree-l2 child-tab';
                    const itemA = document.createElement('a');
                    itemA.className = 'reference child-reference';
                    itemA.href = `#${item.id}`;
                    itemA.textContent = item.label;
                    itemA.onclick = (e) => {
                        e.preventDefault();
                        this.navigateToTab(item.id);
                    };
                    itemLi.appendChild(itemA);
                    childrenUl.appendChild(itemLi);
                });
            }

            parentLi.appendChild(childrenUl);
            container.appendChild(parentLi);
        });
    }

    renderGroupsNavigation(container, groups) {
        if (!Array.isArray(groups)) return;
        groups.forEach(group => {
            const groupLi = document.createElement('li');
            groupLi.className = 'toctree-l1 parent-tab';
            
            const groupA = document.createElement('a');
            groupA.className = 'reference parent-reference';
            groupA.href = '#';
            groupA.innerHTML = `
                <span class="expand-icon expand-icon-${group.id}">▼</span>
                ${group.label}
            `;
            groupA.onclick = (e) => {
                    e.preventDefault();
                this.toggleGroup(group.id);
            };
            groupLi.appendChild(groupA);

            const itemsUl = document.createElement('ul');
            itemsUl.className = 'children-nav expanded';
            itemsUl.id = `children-${group.id}`;

            if (Array.isArray(group.items)) {
                group.items.forEach(item => {
                    const itemLi = document.createElement('li');
                    itemLi.className = 'toctree-l2 child-tab';
                    const itemA = document.createElement('a');
                    itemA.className = 'reference child-reference';
                    itemA.href = `#${item.id}`;
                    itemA.textContent = item.label;
                    itemA.onclick = (e) => {
                        e.preventDefault();
                        this.navigateToTab(item.id);
                    };
                    itemLi.appendChild(itemA);
                    itemsUl.appendChild(itemLi);
                });
            }

            groupLi.appendChild(itemsUl);
            container.appendChild(groupLi);
        });
    }

    renderIntroNavigation(container, intro) {
        const introLi = document.createElement('li');
        introLi.className = 'toctree-l1 current-page';
        const introA = document.createElement('a');
        introA.className = 'reference';
        introA.href = `#${intro.id}`;
        introA.textContent = intro.label;
        introA.onclick = (e) => {
                    e.preventDefault();
            this.navigateToTab(intro.id);
        };
        introLi.appendChild(introA);
        container.appendChild(introLi);
    }

    toggleGroup(groupId) {
        const childrenNav = document.getElementById(`children-${groupId}`);
        const expandIcon = document.querySelector(`.expand-icon-${groupId}`);

        if (childrenNav.classList.contains('expanded')) {
            childrenNav.classList.remove('expanded');
            childrenNav.classList.add('collapsed');
            expandIcon.innerHTML = '▶';
        } else {
            childrenNav.classList.add('expanded');
            childrenNav.classList.remove('collapsed');
            expandIcon.innerHTML = '▼';
        }
        
        // Adjust layout after toggling with a small delay to ensure DOM updates are complete
        setTimeout(() => {
            this.adjustLayoutForSidebar();
        }, 50);
    }

    adjustLayoutForSidebar() {
        // Only adjust on desktop (screen width > 63em)
        if (window.innerWidth <= 1008) { // 63em = 1008px
            return;
        }

        const sidebarDrawer = document.querySelector('.sidebar-drawer');
        const mainContent = document.querySelector('.main');
        
        if (!sidebarDrawer || !mainContent) {
            return;
        }

        // Calculate the optimal width based on visible navigation items
        const sidebarContent = sidebarDrawer.querySelector('.sidebar-scroll');
        if (!sidebarContent) {
            return;
        }

        // Temporarily make sidebar visible to measure content
        const originalLeft = sidebarDrawer.style.left;
        const originalVisibility = sidebarDrawer.style.visibility;
        
        sidebarDrawer.style.left = '0';
        sidebarDrawer.style.visibility = 'visible';
        sidebarDrawer.style.position = 'absolute'; // Temporarily change to absolute to measure

        // Count visible navigation items and measure their content
        const visibleItems = this.countVisibleNavigationItems();
        const contentWidth = this.measureNavigationContentWidth();
        
        // Calculate optimal width based on number of items and content width
        const minSidebarWidth = 240; // 15em minimum
        const maxSidebarWidth = 600; // Increased maximum for better accommodation of multiple sections
        const padding = 50; // Increased padding for better spacing
        
        // Base width calculation
        let optimalWidth = Math.max(minSidebarWidth, contentWidth + padding);
        
        // Adjust width based on number of visible items with better scaling
        if (visibleItems.count > 0) {
            // More aggressive scaling for sections with many items
            const itemMultiplier = Math.min(visibleItems.count / 8, 1.5); // Increased scale factor
            const extraWidth = Math.floor(itemMultiplier * 120); // Up to 180px extra for many items
            optimalWidth += extraWidth;
            
            // Additional width for multiple expanded parent sections
            if (visibleItems.details.parentFolders > 1) {
                const parentMultiplier = visibleItems.details.parentFolders * 20; // 20px per parent section
                optimalWidth += parentMultiplier;
            }
            
            // Extra width for sections with many child items
            if (visibleItems.details.childItems > 10) {
                const childMultiplier = Math.min(visibleItems.details.childItems / 15, 1) * 80; // Up to 80px extra
                optimalWidth += childMultiplier;
            }
        }
        
        // Ensure width doesn't exceed maximum
        optimalWidth = Math.min(maxSidebarWidth, optimalWidth);

        // Restore original positioning
        sidebarDrawer.style.left = originalLeft;
        sidebarDrawer.style.visibility = originalVisibility;
        sidebarDrawer.style.position = 'fixed';

        // Apply the optimal width
        sidebarDrawer.style.width = `${optimalWidth}px`;
        sidebarDrawer.querySelector('.sidebar-container').style.width = `${optimalWidth}px`;

        // Adjust main content area with more generous spacing
        const sidebarOffset = optimalWidth + 120; // Increased buffer for better spacing
        mainContent.style.marginLeft = `${sidebarOffset}px`;
        mainContent.style.maxWidth = `calc(100% - ${sidebarOffset}px)`;

        // Store the current sidebar width for responsive adjustments
        sidebarDrawer.dataset.currentWidth = optimalWidth;
        
        // Ensure sidebar scroll area is properly sized
        const sidebarScroll = sidebarDrawer.querySelector('.sidebar-scroll');
        if (sidebarScroll) {
            sidebarScroll.style.height = `calc(100vh - var(--header-height) - 4rem)`;
            sidebarScroll.style.overflowY = 'auto';
            sidebarScroll.style.overflowX = 'hidden';
        }
    }

    countVisibleNavigationItems() {
        const sidebarTree = document.querySelector('.sidebar-tree');
        if (!sidebarTree) return { count: 0, details: {} };

        let totalCount = 0;
        const details = {
            parentFolders: 0,
            groups: 0,
            childItems: 0,
            expandedParents: 0,
            expandedGroups: 0
        };

        // Count parent folders (OnBot Java, Android Studio)
        const parentFolders = sidebarTree.querySelectorAll('.parent-folder');
        details.parentFolders = parentFolders.length;
        totalCount += parentFolders.length;

        // Count groups under each parent and check if they're expanded
        const groups = sidebarTree.querySelectorAll('.parent-tab');
        details.groups = groups.length;
        totalCount += groups.length;

        // Count expanded groups specifically
        const expandedGroups = sidebarTree.querySelectorAll('.parent-tab .children-nav.expanded');
        details.expandedGroups = expandedGroups.length;

        // Count child items (actual lessons) in expanded sections
        const childItems = sidebarTree.querySelectorAll('.child-tab');
        details.childItems = childItems.length;
        totalCount += childItems.length;

        // Count expanded parent sections
        const expandedParents = sidebarTree.querySelectorAll('.parent-folder .children-nav.expanded');
        details.expandedParents = expandedParents.length;

        // Add extra weight for expanded sections
        if (details.expandedParents > 0) {
            totalCount += details.expandedParents * 2; // Extra weight for expanded parents
        }
        if (details.expandedGroups > 0) {
            totalCount += details.expandedGroups * 3; // Extra weight for expanded groups
        }

        return { count: totalCount, details };
    }

    measureNavigationContentWidth() {
        const sidebarTree = document.querySelector('.sidebar-tree');
        if (!sidebarTree) return 240;

        // Get all text elements in the navigation
        const textElements = sidebarTree.querySelectorAll('.reference');
        let maxWidth = 240; // Minimum width

        textElements.forEach(element => {
            // Temporarily make element visible to measure
            const originalDisplay = element.style.display;
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            
            // Measure the text width
            const textWidth = element.scrollWidth;
            maxWidth = Math.max(maxWidth, textWidth);
            
            // Restore original state
            element.style.display = originalDisplay;
            element.style.visibility = '';
            element.style.position = '';
            element.style.left = '';
        });

        return maxWidth;
    }

    // Method to reset layout when sidebar is hidden
    resetLayoutForHiddenSidebar() {
        const sidebarDrawer = document.querySelector('.sidebar-drawer');
        const mainContent = document.querySelector('.main');
        
        if (!sidebarDrawer || !mainContent) {
            return;
        }

        // Reset sidebar width to default
        sidebarDrawer.style.width = '15em';
        sidebarDrawer.querySelector('.sidebar-container').style.width = '15em';
        
        // Reset main content
        mainContent.style.marginLeft = '0';
        mainContent.style.maxWidth = '100%';
        
        // Clear stored width
        delete sidebarDrawer.dataset.currentWidth;
    }


    async navigateToTab(tabId) {
        try {
            // Store the last opened tab ID
            localStorage.setItem('lastOpenedTab', tabId);
            // Update the URL hash for direct linking and browser navigation
            if (window.location.hash !== `#${tabId}`) {
                window.location.hash = `#${tabId}`;
            }
            // Clear current page classes
            document.querySelectorAll('.toctree-l1, .toctree-l2').forEach(li => {
                li.classList.remove('current-page');
            });
            
            // Clear header navigation active state
            document.querySelectorAll('.header-nav-link').forEach(link => {
                link.classList.remove('active');
            });

            // Find the target tab
            let targetTab = appState.allTabs.find(tab => tab.id === tabId);

            // If not found, try to find the parent section for this tab recursively in config
            if (!targetTab) {
                let parentSectionId = this.findParentSectionIdForTab(tabId, appState.config.sections);
                if (parentSectionId) {
                    appState.setCurrentSection(parentSectionId);
                    await this.generateNavigation();
                    // Try again after navigation is generated
                    targetTab = appState.allTabs.find(tab => tab.id === tabId);
                }
            }

            // Handle dynamic lesson loading
            if (!targetTab) {
                targetTab = appState.getTabData(tabId);
                if (targetTab && targetTab.file && !targetTab.loaded) {
                    try {
                        const updatedTabData = await this.contentManager.loadSingleContent(tabId);
                        targetTab = updatedTabData;
                        // Update navigation label
                        const navLink = document.querySelector(`a[href="#${tabId}"]`);
                        if (navLink && updatedTabData.title) {
                            navLink.textContent = updatedTabData.title;
                        }
                    } catch (error) {
                        console.error(`Error loading lesson ${tabId}:`, error);
                        this.showError('Failed to load lesson. Please refresh the page.');
                        return;
                    }
                }
            }

            // If still not found, try to load the section that might contain this tab
            if (!targetTab) {
                // Try to find which section this tab belongs to
                for (const sectionId in appState.config.sections) {
                    const section = appState.config.sections[sectionId];
                    if (section.groups) {
                        for (const group of section.groups) {
                            if (group.items && group.items.some(item => item.id === tabId)) {
                                // Load this section and try again
                                await this.contentManager.loadSectionContent(sectionId);
                                targetTab = appState.allTabs.find(tab => tab.id === tabId);
                                if (targetTab) break;
                            }
                        }
                    }
                    if (targetTab) break;
                }
            }

            if (targetTab) {
                // Determine section
                let newSection = appState.currentSection;
                if (targetTab.sectionId) {
                    newSection = targetTab.sectionId;
                }
                // Update current section if needed
                if (appState.currentSection !== newSection) {
                    appState.setCurrentSection(newSection);
                    await this.generateNavigation();
                }
                // Highlight navigation
                this.highlightNavigation(tabId);
                // Update header navigation
                this.updateHeaderNavigation(newSection);
                // Render content
                this.contentManager.renderContent(tabId);
                appState.setCurrentTab(tabId);
            } else {
                // Handle section navigation
                await this.handleSectionNavigation(tabId);
            }

            // Close mobile navigation
            document.getElementById('__navigation').checked = false;
            // Restore search results if there was an active search
            if (this.searchManager) {
                this.searchManager.restoreSearchResults();
            }
        } catch (error) {
            console.error(`Error navigating to tab ${tabId}:`, error);
            this.showError('Navigation failed. Please try again.');
        }
    }

    async handleSectionNavigation(sectionId) {
        const section = appState.config.sections[sectionId];
        if (!section || !section.file) return;

        try {
            await this.contentManager.loadSectionContent(sectionId);
            const updatedSection = appState.config.sections[sectionId];
            
            if (updatedSection.intro) {
                await this.navigateToTab(updatedSection.intro.id);
                return;
            }
            
            if (updatedSection.groups && updatedSection.groups.length > 0 && updatedSection.groups[0].items.length > 0) {
                const firstItem = updatedSection.groups[0].items[0];
                await this.navigateToTab(firstItem.id);
                return;
            }
        } catch (error) {
            console.error(`Failed to load section ${sectionId}:`, error);
            this.showError('Failed to load section.');
        }
    }

    highlightNavigation(tabId) {
        const navLinks = document.querySelectorAll('.child-reference, .reference');
        navLinks.forEach(link => {
            if (link.onclick && link.onclick.toString().includes(tabId)) {
                link.closest('.toctree-l1, .toctree-l2').classList.add('current-page');
            }
        });
    }

    updateHeaderNavigation(sectionId) {
        const headerLink = document.querySelector(`.header-nav-link[href="#${sectionId}"]`);
        if (headerLink) {
            headerLink.classList.add('active');
        }
    }

    showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #f44336;
        color: white;
            padding: 2rem;
        border-radius: 0.5rem;
        z-index: 1000;
        text-align: center;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
    }

    // Recursively search config for the parent section of a tabId
    findParentSectionIdForTab(tabId, sections) {
        for (const sectionKey in sections) {
            const section = sections[sectionKey];
            if (section.groups && Array.isArray(section.groups)) {
                for (const group of section.groups) {
                    if (group.items && group.items.some(item => item.id === tabId)) {
                        return sectionKey;
                    }
                }
            }
            if (section.children && Array.isArray(section.children)) {
                for (const child of section.children) {
                    // Check items directly under this child
                    if (child.items && child.items.some(item => item.id === tabId)) {
                        return sectionKey;
                    }
                    // Recurse into deeper children
                    const found = this.findParentSectionIdForTab(tabId, { [child.id]: child });
                    if (found) return sectionKey;
                }
            }
        }
        return null;
    }
}

// ============================================================================
// THEME MANAGER
// ============================================================================

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

// ============================================================================
// SEARCH MANAGER
// ============================================================================

class SearchManager {
    constructor(contentManager = null, navigationManager = null) {
        this.searchResults = [];
        this.currentSearchQuery = '';
        this.contentManager = contentManager;
        this.navigationManager = navigationManager;
        this.setupSearch();
    }

    setupSearch() {
        const searchInput = document.getElementById('header-search');
        const mobileSearchInput = document.getElementById('mobile-sidebar-search');
        
        console.log('Setting up search inputs:', { searchInput: !!searchInput, mobileSearchInput: !!mobileSearchInput });
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                console.log('Header search input:', e.target.value);
                this.performSearch(e.target.value);
                // Sync with mobile search
                if (mobileSearchInput) {
                    mobileSearchInput.value = e.target.value;
                }
            });
        }
        
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (e) => {
                console.log('Mobile search input:', e.target.value);
                this.performSearch(e.target.value);
                // Sync with header search
                if (searchInput) {
                    searchInput.value = e.target.value;
                }
            });
        }
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container-header') && 
                !e.target.closest('.mobile-sidebar-search') && 
                !e.target.closest('.search-results')) {
                this.hideSearchResults();
            }
        });
    }

    async performSearch(query) {
        const searchQuery = query.toLowerCase().trim();
        
        // Store current search query
        this.currentSearchQuery = searchQuery;
        
        if (!searchQuery) {
            this.hideSearchResults();
            this.currentSearchQuery = '';
            return;
        }
        
        console.log('Starting search for:', searchQuery);
        
        // Clear previous results
        this.searchResults = [];
        
        try {
            // First, search through already loaded content
            this.searchLoadedContent(searchQuery);
            
            // Then load and search all sections
            await this.loadAndSearchAllSections(searchQuery);
            
            console.log(`Search completed. Found ${this.searchResults.length} results.`);
            this.displaySearchResults();
        } catch (error) {
            console.error('Search error:', error);
            this.hideSearchResults();
        }
    }
    
    searchLoadedContent(query) {
        // Search through all loaded tabs
        if (appState.allTabs) {
            appState.allTabs.forEach(tab => {
                const tabData = appState.getTabData(tab.id);
                if (tabData) {
                    this.searchInContent(tabData, tab, query);
                }
            });
        }
    }
    
    async loadAndSearchAllSections(query) {
        const sections = appState.config.sections;
        if (!sections) {
            console.log('No sections found in config');
            return;
        }
        
        console.log('Available sections:', Object.keys(sections));
        
        for (const sectionId in sections) {
            const section = sections[sectionId];
            if (section && section.file) {
                try {
                    console.log(`Loading and searching section: ${sectionId}`);
                    
                    // Load section content
                    await this.contentManager.loadSectionContent(sectionId);
                    
                    const sectionConfig = appState.getSectionConfig(sectionId);
                    if (sectionConfig) {
                        this.searchSectionContent(sectionConfig, sectionId, query);
                    }
                } catch (error) {
                    console.error(`Error searching section ${sectionId}:`, error);
                }
            }
        }
    }
    
    searchSectionContent(sectionConfig, sectionId, query) {
        // Search through groups
        if (sectionConfig.groups) {
            sectionConfig.groups.forEach(group => {
                if (group.items) {
                    group.items.forEach(item => {
                        const tabData = appState.getTabData(item.id);
                        if (tabData) {
                            this.searchInContent(tabData, {
                                id: item.id,
                                sectionId: sectionId,
                                sectionLabel: sectionConfig.title || sectionId,
                                groupId: group.id,
                                groupLabel: group.label
                            }, query);
                        }
                    });
                }
            });
        }
        
        // Search through intro content
        if (sectionConfig.intro) {
            const introData = appState.getTabData(sectionConfig.intro.id);
            if (introData) {
                this.searchInContent(introData, {
                    id: sectionConfig.intro.id,
                    sectionId: sectionId,
                    sectionLabel: sectionConfig.title || sectionId,
                    groupId: 'intro',
                    groupLabel: 'Introduction'
                }, query);
            }
        }
    }

    async loadAllSectionsForSearch() {
        const sectionPromises = [];
        const sections = appState.config.sections;
        
        Object.keys(sections).forEach(sectionId => {
            const section = sections[sectionId];
            if (section && section.file && section.groups) {
                sectionPromises.push(this.contentManager.loadSectionContent(sectionId));
            }
        });
        
        if (sectionPromises.length > 0) {
            await Promise.all(sectionPromises);
        }
    }

    searchInContent(data, tab, query) {
        // Search in title
        if (data.title && data.title.toLowerCase().includes(query)) {
            this.searchResults.push({
                type: 'title',
                text: data.title,
                section: tab.sectionLabel || tab.sectionId || 'Unknown',
                group: tab.groupLabel || tab.groupId || 'Unknown',
                tabId: tab.id
            });
        }
        
        // Search in content sections
        if (data.sections) {
            data.sections.forEach((section, sectionIndex) => {
                // Search in section title
                if (section.title && section.title.toLowerCase().includes(query)) {
                    this.searchResults.push({
                        type: 'section',
                        text: section.title,
                        section: tab.sectionLabel || tab.sectionId || 'Unknown',
                        group: tab.groupLabel || tab.groupId || 'Unknown',
                        tabId: tab.id
                    });
                }
                
                // Search in section content
                if (section.content && section.content.toLowerCase().includes(query)) {
                    const content = section.content;
                    const index = content.toLowerCase().indexOf(query);
                    const start = Math.max(0, index - 50);
                    const end = Math.min(content.length, index + query.length + 50);
                    const snippet = content.substring(start, end);
                    
                    this.searchResults.push({
                        type: 'content',
                        text: snippet,
                        section: tab.sectionLabel || tab.sectionId || 'Unknown',
                        group: tab.groupLabel || tab.groupId || 'Unknown',
                        tabId: tab.id
                    });
                }
                
                // Search in section items (for lists)
                if (section.items && Array.isArray(section.items)) {
                    section.items.forEach(item => {
                        if (typeof item === 'string' && item.toLowerCase().includes(query)) {
                            this.searchResults.push({
                                type: 'list-item',
                                text: item,
                                section: tab.sectionLabel || tab.sectionId || 'Unknown',
                                group: tab.groupLabel || tab.groupId || 'Unknown',
                                tabId: tab.id
                            });
                        }
                    });
                }
                
                // Search in code content
                if (section.type === 'code' && section.content && section.content.toLowerCase().includes(query)) {
                    const content = section.content;
                    const index = content.toLowerCase().indexOf(query);
                    const start = Math.max(0, index - 30);
                    const end = Math.min(content.length, index + query.length + 30);
                    const snippet = content.substring(start, end);
                    
                    this.searchResults.push({
                        type: 'code',
                        text: snippet,
                        section: tab.sectionLabel || tab.sectionId || 'Unknown',
                        group: tab.groupLabel || tab.groupId || 'Unknown',
                        tabId: tab.id
                    });
                }
            });
        }
    }

    displaySearchResults() {
        this.hideSearchResults();
        
        if (this.searchResults.length === 0) {
            console.log('No search results to display');
            return;
        }
        
        console.log(`Displaying ${this.searchResults.length} search results`);
        
        // Try to find the search container - check both header and mobile sidebar
        let searchContainer = document.querySelector('.search-container-header');
        let isMobile = false;
        
        if (!searchContainer) {
            searchContainer = document.querySelector('.mobile-sidebar-search');
            isMobile = true;
        }
        
        if (!searchContainer) {
            console.error('Search container not found');
            return;
        }
        
        const searchResultsDiv = document.createElement('div');
        searchResultsDiv.className = 'search-results';
        searchResultsDiv.style.cssText = `
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

        // Add a header showing result count
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = `
            padding: 0.75rem;
            border-bottom: 1px solid var(--color-background-border);
            font-weight: bold;
            color: var(--color-sidebar-link-text);
            background-color: var(--color-sidebar-item-background--hover);
        `;
        headerDiv.textContent = `Found ${this.searchResults.length} result${this.searchResults.length !== 1 ? 's' : ''}`;
        searchResultsDiv.appendChild(headerDiv);

        this.searchResults.slice(0, 15).forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.style.cssText = `
                padding: 1rem;
                border-bottom: 1px solid var(--color-background-border);
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            `;
            
            // Truncate long text
            const displayText = result.text.length > 100 ? 
                result.text.substring(0, 100) + '...' : 
                result.text;
            
            resultItem.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 0.5rem; color: var(--color-sidebar-link-text--top-level);">
                    ${displayText}
                </div>
                <div style="font-size: 0.875rem; color: var(--color-sidebar-link-text); margin-bottom: 0.25rem;">
                    📁 ${result.section} → ${result.group}
                </div>
                <div style="font-size: 0.75rem; color: var(--color-sidebar-link-text); opacity: 0.7; text-transform: uppercase;">
                    ${result.type}
                </div>
            `;
            
            resultItem.addEventListener('click', () => {
                console.log('Navigating to:', result.tabId);
                if (this.navigationManager) {
                    this.navigationManager.navigateToTab(result.tabId);
                } else {
                    console.error('Navigation manager not available');
                }
                this.hideSearchResults();
            });
            
            resultItem.addEventListener('mouseenter', () => {
                resultItem.style.backgroundColor = 'var(--color-sidebar-item-background--hover)';
                resultItem.style.transform = 'translateX(4px)';
            });
            
            resultItem.addEventListener('mouseleave', () => {
                resultItem.style.backgroundColor = '';
                resultItem.style.transform = '';
            });
            
            searchResultsDiv.appendChild(resultItem);
        });

        searchContainer.appendChild(searchResultsDiv);
        console.log('Search results displayed successfully');
    }

        hideSearchResults() {
        const existingResults = document.querySelector('.search-results');
        if (existingResults) {
            existingResults.remove();
        }
    }
    
    restoreSearchResults() {
        // Restore search results if there's an active search
        if (this.currentSearchQuery && this.searchResults.length > 0) {
            // Add a small delay to ensure DOM is ready
            setTimeout(() => {
                this.displaySearchResults();
            }, 100);
        }
        
        // Restore search input values
        this.restoreSearchInputs();
    }
    
    restoreSearchInputs() {
        if (this.currentSearchQuery) {
            const searchInput = document.getElementById('header-search');
            const mobileSearchInput = document.getElementById('mobile-sidebar-search');
            
            if (searchInput) {
                searchInput.value = this.currentSearchQuery;
            }
            if (mobileSearchInput) {
                mobileSearchInput.value = this.currentSearchQuery;
            }
        }
    }
    
    // Test method to verify search is working
    testSearch() {
        console.log('Testing search functionality...');
        console.log('AppState config:', appState.config);
        console.log('AppState sections:', appState.config?.sections);
        console.log('ContentManager available:', !!this.contentManager);
        console.log('NavigationManager available:', !!this.navigationManager);
        
        // Test with a simple search
        this.performSearch('robot');
    }
}

// ============================================================================
// EVENT MANAGER
// ============================================================================

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
                    // Sidebar is now visible
                    setTimeout(() => {
                        this.navigationManager.adjustLayoutForSidebar();
                    }, 300); // Wait for transition
                } else {
                    // Sidebar is now hidden
                    this.navigationManager.resetLayoutForHiddenSidebar();
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
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
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
        const searchInput = document.getElementById('header-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

class Application {
    constructor() {
        this.configManager = new ConfigManager();
        this.contentManager = new ContentManager(this.configManager);
        this.navigationManager = new NavigationManager(null, this.contentManager);
        this.searchManager = new SearchManager(this.contentManager, this.navigationManager);
        this.navigationManager.searchManager = this.searchManager; // Set the reference back
        this.themeManager = new ThemeManager();
        this.eventManager = new EventManager(this.navigationManager, this.themeManager, this.searchManager);
    }

    async initialize() {
        try {
            // Clear any cached configs to ensure fresh loading
            this.configManager.clearCache();
            
            // Load main configuration
            await this.configManager.loadMainConfig();
            
            // Load homepage content
            await this.contentManager.loadSectionContent('homepage');
            
            // Generate initial navigation
            await this.navigationManager.generateNavigation();
            
            // Show default tab
            this.showDefaultTab();
            
            // Mark as initialized
            appState.setInitialized(true);
            
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError('Failed to load application. Please refresh the page.');
        }

    }

    showDefaultTab() {
        let defaultTab;
        const lastOpenedTabId = localStorage.getItem('lastOpenedTab');
        const urlTabId = window.location.hash ? window.location.hash.substring(1) : null;

        if (urlTabId) {
            defaultTab = appState.allTabs.find(tab => tab.id === urlTabId);
            if (defaultTab) {
                localStorage.removeItem('lastOpenedTab');
            }
        } else if (lastOpenedTabId) {
            defaultTab = appState.allTabs.find(tab => tab.id === lastOpenedTabId);
        }

        if (!defaultTab) {
            defaultTab = appState.allTabs.find(tab => tab.default) || appState.allTabs[0];
        }

        if (defaultTab) {
            this.navigationManager.navigateToTab(defaultTab.id);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #f44336;
            color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            z-index: 1000;
            text-align: center;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 5000);
    }
}

// ============================================================================
// GLOBAL FUNCTIONS FOR HTML INTEGRATION
// ============================================================================

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
