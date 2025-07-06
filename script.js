// Furo-inspired Documentation JavaScript for FRCCodeLab

// Global variables
let config = null;
let currentSection = 'homepage';
let currentTab = null;
let tabData = {};
let allTabs = []; // Flattened list of all tabs for easy access

// Initialize theme immediately
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    let theme = savedTheme || systemTheme;

    // Change the default to light mode
    if (!savedTheme) {
        theme = 'light'; 
    }

    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.querySelector('.theme-icon');
    const themeButton = document.querySelector('.theme-toggle');

    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
    if (themeButton) {
        themeButton.style.display = 'block';
    }
}

let lastScrollTop = 0;
const mobileHeader = document.querySelector('.mobile-header');

window.addEventListener('scroll', function() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop < lastScrollTop) {
    // Scrolling up
    mobileHeader.classList.remove('visible');
  } else {
    // Scrolling down
    mobileHeader.classList.add('visible');
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
}, false);

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    initializeTheme();
    try {
        await loadConfiguration();
        flattenTabs();
        await loadAllTabs();
        await generateNavigation();
        showDefaultTab();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to load application. Please refresh the page.');
    }
});

// Load the main configuration file
async function loadConfiguration() {
    try {
        const response = await fetch('data/config/config.json');
        if (!response.ok) throw new Error('Failed to load configuration');
        config = await response.json();
        document.title = config.title;
    } catch (error) {
        console.error('Error loading configuration:', error);
        throw error;
    }
}

// Flatten hierarchical tabs structure for easier processing
function flattenTabs() {
    allTabs = [];
    
    // Add homepage
    if (config.sections.homepage) {
        allTabs.push(config.sections.homepage);
    }
    
    // Note: Other sections will be loaded dynamically when needed
    // to avoid loading all content at startup
}

// Load all tab data files
async function loadAllTabs() {
    const promises = allTabs.map(async (tab) => {
        if (tab.file) {
            try {
                const response = await fetch(tab.file);
                if (!response.ok) throw new Error(`Failed to load ${tab.file}`);
                const data = await response.json();
                tabData[tab.id] = data;
            } catch (error) {
                console.error(`Error loading tab ${tab.id}:`, error);
                throw error;
            }
        }
    });
    
    await Promise.all(promises);
}

// Load section config and its content
async function loadSectionConfig(sectionId) {
    const section = config.sections[sectionId];
    if (!section || !section.file) return;
    
    try {
        const response = await fetch(section.file);
        if (!response.ok) throw new Error(`Failed to load section config: ${section.file}`);
        const sectionConfig = await response.json();
        
        // Store section config
        config.sections[sectionId] = { ...section, ...sectionConfig };
        
        // Load all content files for this section
        const contentPromises = [];
        
        // Load intro page if it exists
        if (sectionConfig.intro) {
            contentPromises.push(
                fetch(sectionConfig.intro.file)
                    .then(response => {
                        if (!response.ok) throw new Error(`Failed to load ${sectionConfig.intro.file}`);
                        return response.json();
                    })
                    .then(data => {
                        tabData[sectionConfig.intro.id] = data;
                        // Add to allTabs for navigation
                        allTabs.push({
                            ...sectionConfig.intro,
                            sectionId: sectionId,
                            sectionLabel: sectionConfig.label
                        });
                    })
                    .catch(error => {
                        console.error(`Error loading ${sectionConfig.intro.id}:`, error);
                    })
            );
        }
        
        if (sectionConfig.groups) {
            sectionConfig.groups.forEach(group => {
                group.items.forEach(item => {
                    contentPromises.push(
                        fetch(item.file)
                            .then(response => {
                                if (!response.ok) throw new Error(`Failed to load ${item.file}`);
                                return response.json();
                            })
                            .then(data => {
                                tabData[item.id] = data;
                                // Add to allTabs for navigation
                                allTabs.push({
                                    ...item,
                                    sectionId: sectionId,
                                    sectionLabel: sectionConfig.label,
                                    groupId: group.id,
                                    groupLabel: group.label
                                });
                            })
                            .catch(error => {
                                console.error(`Error loading ${item.id}:`, error);
                            })
                    );
                });
            });
        }
        
        await Promise.all(contentPromises);
    } catch (error) {
        console.error(`Error loading section ${sectionId}:`, error);
        throw error;
    }
}

// Generate dynamic navigation sidebar based on current section
async function generateNavigation() {
    const navigationUl = document.getElementById('sidebar-navigation');
    navigationUl.innerHTML = ''; // Clear existing navigation
    
    if (currentSection === 'homepage') {
        // Show homepage only
            const li = document.createElement('li');
        li.className = 'toctree-l1 current-page';
            
            const a = document.createElement('a');
            a.className = 'reference';
        a.href = '#homepage';
        a.textContent = 'Home';
            a.onclick = (e) => {
                e.preventDefault();
            window.location.hash = '#homepage';
            openTab(e, 'homepage');
            };
            
            li.appendChild(a);
            navigationUl.appendChild(li);
    } else {
        // Load section config if not already loaded
        const section = config.sections[currentSection];
        if (section && section.file && !section.groups) {
            try {
                await loadSectionConfig(currentSection);
            } catch (error) {
                console.error(`Failed to load section ${currentSection}:`, error);
                return;
            }
        }
        
        // Show current section's groups and items
        const updatedSection = config.sections[currentSection];
        
        // Add intro page if it exists
        if (updatedSection && updatedSection.intro) {
            const introLi = document.createElement('li');
            introLi.className = 'toctree-l1 current-page';
            
            const introA = document.createElement('a');
            introA.className = 'reference';
            introA.href = `#${updatedSection.intro.id}`;
            introA.textContent = updatedSection.intro.label;
            introA.onclick = (e) => {
                e.preventDefault();
                window.location.hash = `#${updatedSection.intro.id}`;
                openTab(e, updatedSection.intro.id);
            };
            
            introLi.appendChild(introA);
            navigationUl.appendChild(introLi);
        }
        
        if (updatedSection && updatedSection.groups) {
            updatedSection.groups.forEach(group => {
                // Create group header
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
                    toggleGroup(group.id);
                };
                
                groupLi.appendChild(groupA);
                
                // Create group items container
                const itemsUl = document.createElement('ul');
                itemsUl.className = `children-nav expanded`;
                itemsUl.id = `children-${group.id}`;
                
                // Add group items
                group.items.forEach(item => {
                    const itemLi = document.createElement('li');
                    itemLi.className = 'toctree-l2 child-tab';
                    
                    const itemA = document.createElement('a');
                    itemA.className = 'reference child-reference';
                    itemA.href = `#${item.id}`;
                    itemA.textContent = item.label;
                    itemA.onclick = (e) => {
                e.preventDefault();
                        window.location.hash = `#${item.id}`;
                        openTab(e, item.id);
                    };
                    
                    itemLi.appendChild(itemA);
                    itemsUl.appendChild(itemLi);
                });
                
                groupLi.appendChild(itemsUl);
                navigationUl.appendChild(groupLi);
            });
        }
    }
}

// Toggle group expand/collapse
function toggleGroup(groupId) {
    const childrenNav = document.getElementById(`children-${groupId}`);
    const expandIcon = document.querySelector(`.expand-icon-${groupId}`);

    if (childrenNav.classList.contains('expanded')) {
        childrenNav.classList.remove('expanded');
        childrenNav.classList.add('collapsed');
        expandIcon.textContent = '\u25B6\uFE0E';
    } else {
        childrenNav.classList.add('expanded');
        childrenNav.classList.remove('collapsed');
        expandIcon.textContent = '▼';
    }
}

// Show the default tab
function showDefaultTab() {
    let defaultTab;
    const lastOpenedTabId = localStorage.getItem('lastOpenedTab');
    const urlTabId = window.location.hash ? window.location.hash.substring(1) : null;

    if (urlTabId) {
        defaultTab = allTabs.find(tab => tab.id === urlTabId);
        if (defaultTab) {
            localStorage.removeItem('lastOpenedTab');
        }
    } else if (lastOpenedTabId) {
        defaultTab = allTabs.find(tab => tab.id === lastOpenedTabId);
    }

    if (!defaultTab) {
        defaultTab = allTabs.find(tab => tab.default) || allTabs[0];
    }

    if (defaultTab) {
        openTab(null, defaultTab.id);
    }
}

// Open a specific tab
async function openTab(event, tabId) {
    // Store the last opened tab ID
    localStorage.setItem('lastOpenedTab', tabId);

    // Remove current-page class from all tabs
    document.querySelectorAll('.toctree-l1, .toctree-l2').forEach(li => {
        li.classList.remove('current-page');
    });
    
    // Remove active class from header navigation
    document.querySelectorAll('.header-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find the target tab
    const targetTab = allTabs.find(tab => tab.id === tabId);
    if (targetTab) {
        // Determine the section this tab belongs to
        let newSection = 'homepage';
        if (targetTab.sectionId) {
            newSection = targetTab.sectionId;
        }
        
        // Update current section if needed
        if (currentSection !== newSection) {
            currentSection = newSection;
            await generateNavigation();
        }
        
        // Highlight the navigation element
        const navLinks = document.querySelectorAll('.child-reference, .reference');
        navLinks.forEach(link => {
            if (link.onclick && link.onclick.toString().includes(tabId)) {
                link.closest('.toctree-l1, .toctree-l2').classList.add('current-page');
            }
        });
        
        // Update header navigation active state
        const headerLink = document.querySelector(`.header-nav-link[href="#${newSection}"]`);
        if (headerLink) {
            headerLink.classList.add('active');
        }
    }
    
    // Render tab content
    const data = tabData[tabId];
    if (data) {
    renderTabContent(tabId);
    currentTab = tabId;
    } else {
        // Handle section navigation - show intro page or first item of the section
        const section = config.sections[tabId];
        if (section && section.file && !section.groups) {
            // Load section config first
            try {
                await loadSectionConfig(tabId);
                const updatedSection = config.sections[tabId];
                if (updatedSection && updatedSection.intro) {
                    // Show intro page if it exists
                    openTab(event, updatedSection.intro.id);
                    return; // Exit early since we're opening the intro tab
                } else if (updatedSection && updatedSection.groups && updatedSection.groups.length > 0 && updatedSection.groups[0].items.length > 0) {
                    const firstItem = updatedSection.groups[0].items[0];
                    openTab(event, firstItem.id);
                    return; // Exit early since we're opening a child tab
                }
            } catch (error) {
                console.error(`Failed to load section ${tabId}:`, error);
            }
        } else if (section && section.intro) {
            // Show intro page if it exists
            openTab(event, section.intro.id);
            return; // Exit early since we're opening the intro tab
        } else if (section && section.groups && section.groups.length > 0 && section.groups[0].items.length > 0) {
            const firstItem = section.groups[0].items[0];
            openTab(event, firstItem.id);
            return; // Exit early since we're opening a child tab
        }
    }
    
    // Close mobile navigation
    document.getElementById('__navigation').checked = false;
}

// Render tab content from JSON data
function renderTabContent(tabId) {
    const data = tabData[tabId];
    if (!data) {
        console.error(`No data found for tab: ${tabId}`);
        return;
    }
    
    const container = document.getElementById('tab-container');
    
    const tabContent = document.createElement('div');
    tabContent.id = tabId;
    tabContent.className = 'tab-content active';
    
    const section = document.createElement('section');
    section.id = `java-${tabId}`;
    
    const title = document.createElement('h1');
    title.innerHTML = `${data.title}<a class="headerlink" href="#java-${tabId}" title="Link to this heading">¶</a>`;
    section.appendChild(title);
    
    const contentSection = document.createElement('div');
    contentSection.className = 'content-section';
    
    // Render each section
    data.sections.forEach(sectionData => {
        renderSection(contentSection, sectionData);
    });
    
    section.appendChild(contentSection);
    tabContent.appendChild(section);
    
    // Clear container and add new content
    container.innerHTML = '';
    container.appendChild(tabContent);
}

// Render individual sections based on type
function renderSection(container, sectionData) {
    switch (sectionData.type) {
        case 'text':
            renderTextSection(container, sectionData);
            break;
        case 'list':
            renderListSection(container, sectionData);
            break;
        case 'code':
            renderCodeSection(container, sectionData);
            break;
        case 'rules-box':
            renderRulesBox(container, sectionData);
            break;
        case 'exercise-box':
            renderExerciseBox(container, sectionData);
            break;
        case 'data-types-grid':
            renderDataTypesGrid(container, sectionData);
            break;
        case 'logical-operators':
            renderLogicalOperators(container, sectionData);
            break;
        case 'emphasis-box':
            renderEmphasisBox(container, sectionData);
            break;
        case 'link-grid':
            renderLinkGrid(container, sectionData);
            break;
        default:
            console.warn(`Unknown section type: ${sectionData.type}`);
    }
}

// Render text section
function renderTextSection(container, data) {
    if (data.title) {
        const h3 = document.createElement('h3');
        h3.textContent = data.title;
        container.appendChild(h3);
    }
    
    const p = document.createElement('p');
    p.innerHTML = data.content;
    container.appendChild(p);
}

// Render list section
function renderListSection(container, data) {
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

// Render section box
function renderEmphasisBox(container, data) {
    const sectionBox = document.createElement('div');
    sectionBox.className = 'emphasis-box';

    if (data.title) {
        const h3 = document.createElement('h3');
        h3.textContent = data.title;
        sectionBox.appendChild(h3);
    }

    if (data.content) {
        const p = document.createElement('p');
        p.innerHTML = data.content;
        sectionBox.appendChild(p);
    }

    if (data.items) {
        const ul = document.createElement('ul');
        data.items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = item;
            ul.appendChild(li);
        });
        sectionBox.appendChild(ul);
    }

    container.appendChild(sectionBox);
}

// Render link grid section
function renderLinkGrid(container, data) {
    if (data.title) {
        const h3 = document.createElement('h3');
        h3.textContent = data.title;
        container.appendChild(h3);
    }
    
    const linkGrid = document.createElement('div');
    linkGrid.className = 'link-grid';
    
    data.links.forEach(link => {
        const linkButton = document.createElement('button');
        linkButton.className = 'link-grid-button';
        linkButton.textContent = link.label;
        linkButton.onclick = (e) => {
            e.preventDefault();
            openTab(e, link.id);
        };
        linkGrid.appendChild(linkButton);
    });
    
    container.appendChild(linkGrid);
}

// Render code section
function renderCodeSection(container, data) {
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

// Render rules box
function renderRulesBox(container, data) {
    const h3 = document.createElement('h3');
    h3.textContent = data.title;
    container.appendChild(h3);
    
    const rulesBox = document.createElement('div');
    rulesBox.className = 'rules-box';
    
    if (data.subtitle) {
        const h4 = document.createElement('h4');
        h4.textContent = data.subtitle;
        rulesBox.appendChild(h4);
    }
    
    if (data.content) {
        const p = document.createElement('p');
        p.innerHTML = data.content;
        rulesBox.appendChild(p);
    }
    
    if (data.rules) {
        const ul = document.createElement('ul');
        data.rules.forEach(rule => {
            const li = document.createElement('li');
            li.innerHTML = rule;
            ul.appendChild(li);
        });
        rulesBox.appendChild(ul);
    }
    
    container.appendChild(rulesBox);
}

// Render exercise box
function renderExerciseBox(container, data) {
    const h3 = document.createElement('h3');
    h3.textContent = data.title;
    container.appendChild(h3);

    const exerciseBox = document.createElement('div');
    exerciseBox.className = 'exercise-box';

    if (data.description) {
    const p = document.createElement('p');
        p.innerHTML = data.description;
    exerciseBox.appendChild(p);
    }

    if (data.tasks) {
        const ul = document.createElement('ul');
    data.tasks.forEach(task => {
        const li = document.createElement('li');
            li.innerHTML = task;
            ul.appendChild(li);
        });
        exerciseBox.appendChild(ul);
    }
    
    if (data.code) {
        const codeBlock = document.createElement('div');
        codeBlock.className = 'exercise-code';
        
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = data.code;
        pre.appendChild(code);
        codeBlock.appendChild(pre);
        
        exerciseBox.appendChild(codeBlock);
      }

    if (data.answers) {
        const answerButton = document.createElement('button');
        answerButton.className = 'answer-toggle-btn';
        answerButton.textContent = 'Show Answers';
        answerButton.onclick = function() {
            toggleAnswers(this, answerSection);
        };
        exerciseBox.appendChild(answerButton);

        const answerSection = document.createElement('div');
        answerSection.className = 'answer-section hidden';

        const answerTitle = document.createElement('h5');
        answerTitle.className = 'answer-title';
        answerTitle.textContent = 'Answers:';
        answerSection.appendChild(answerTitle);

        data.answers.forEach((answer, index) => {
            const answerItem = document.createElement('div');
            answerItem.className = 'answer-item';

            const taskLabel = document.createElement('div');
            taskLabel.className = 'answer-task-label';
            taskLabel.textContent = `Task ${index + 1}:`;
            answerItem.appendChild(taskLabel);

            const answerCode = document.createElement('div');
            answerCode.className = 'answer-code';

            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = answer;
            pre.appendChild(code);
            answerCode.appendChild(pre);

            answerItem.appendChild(answerCode);
            answerSection.appendChild(answerItem);
        });

        exerciseBox.appendChild(answerSection);
    }

    container.appendChild(exerciseBox);
}

// Toggle answers visibility
function toggleAnswers(button, answerSection) {
    if (answerSection.classList.contains('hidden')) {
        answerSection.classList.remove('hidden');
        answerSection.classList.add('visible');
        button.textContent = 'Hide Answers';
        button.classList.add('active');
    } else {
        answerSection.classList.remove('visible');
        answerSection.classList.add('hidden');
        button.textContent = 'Show Answers';
        button.classList.remove('active');
    }
}

// Render data types grid
function renderDataTypesGrid(container, data) {
    if (data.title) {
        const h3 = document.createElement('h3');
        h3.textContent = data.title;
        container.appendChild(h3);
    }
    
    const grid = document.createElement('div');
    grid.className = 'data-types-grid';
    
    data.types.forEach(type => {
        const card = document.createElement('div');
        card.className = 'data-type-card';
        
        const h4 = document.createElement('h4');
        h4.textContent = type.name;
        card.appendChild(h4);
        
        const code = document.createElement('code');
        code.textContent = type.keyword;
        card.appendChild(code);
        
        const p = document.createElement('p');
        p.textContent = type.description;
        card.appendChild(p);
        
        grid.appendChild(card);
    });
    
    container.appendChild(grid);
}

// Render logical operators
function renderLogicalOperators(container, data) {
    if (data.title) {
    const h3 = document.createElement('h3');
    h3.textContent = data.title;
    container.appendChild(h3);
    }
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '1rem';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    data.headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.border = '1px solid var(--color-background-border)';
        th.style.padding = '0.5rem';
        th.style.textAlign = 'left';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    data.operators.forEach(op => {
        const row = document.createElement('tr');
        
        const td1 = document.createElement('td');
        td1.textContent = op.operator;
        td1.style.border = '1px solid var(--color-background-border)';
        td1.style.padding = '0.5rem';
        row.appendChild(td1);
        
        const td2 = document.createElement('td');
        td2.textContent = op.description;
        td2.style.border = '1px solid var(--color-background-border)';
        td2.style.padding = '0.5rem';
        row.appendChild(td2);
        
        const td3 = document.createElement('td');
        td3.textContent = op.example;
        td3.style.border = '1px solid var(--color-background-border)';
        td3.style.padding = '0.5rem';
        row.appendChild(td3);
        
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    container.appendChild(table);
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    navigateWithArrows('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    navigateWithArrows('right');
                    break;
                case 'k':
                    e.preventDefault();
                    focusSearch();
                    break;
            }
        }
    });
    
    // Copy code blocks on click
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'CODE' && e.target.closest('.code-block')) {
            const codeText = e.target.textContent;
            copyToClipboard(codeText);
            showNotification('Code copied to clipboard!');
        }
    });
    
    // Global search functionality
    const searchInput = document.getElementById('header-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            performGlobalSearch(e.target.value).catch(error => {
                console.error('Search error:', error);
            });
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-container-header') && !e.target.closest('.search-results')) {
                hideSearchResults();
            }
        });
    }
}

// Navigate with arrow keys
function navigateWithArrows(key) {
    const currentIndex = allTabs.findIndex(tab => tab.id === currentTab);
    let newIndex;
    
    if (key === 'left') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : allTabs.length - 1;
    } else if (key === 'right') {
        newIndex = currentIndex < allTabs.length - 1 ? currentIndex + 1 : 0;
    }
    
    if (newIndex !== undefined && allTabs[newIndex]) {
    openTab(null, allTabs[newIndex].id);
    }
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Show notification
function showNotification(message) {
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

// Show error message
function showError(message) {
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

// Focus search input
function focusSearch() {
    const searchInput = document.getElementById('header-search');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

// Perform global search across all content
async function performGlobalSearch(query) {
    const searchQuery = query.toLowerCase().trim();
    
    if (!searchQuery) {
        hideSearchResults();
        return;
    }
    
    // Load all sections if not already loaded for comprehensive search
    const sectionPromises = [];
    Object.keys(config.sections).forEach(sectionId => {
        const section = config.sections[sectionId];
        if (section && section.file && !section.groups) {
            sectionPromises.push(loadSectionConfig(sectionId));
        }
    });
    
    if (sectionPromises.length > 0) {
        await Promise.all(sectionPromises);
    }
    
    // Search through all tabs and their content
    const searchResults = [];
    
    allTabs.forEach(tab => {
        if (tab.file && tabData[tab.id]) {
            const data = tabData[tab.id];
            const matches = [];
            
            // Search in title
            if (data.title && data.title.toLowerCase().includes(searchQuery)) {
                matches.push({
                    type: 'title',
                    text: data.title,
                    section: tab.sectionLabel || 'Unknown',
                    group: tab.groupLabel || 'Unknown'
                });
            }
            
            // Search in content sections
            if (data.sections) {
                data.sections.forEach((section, sectionIndex) => {
                    if (section.title && section.title.toLowerCase().includes(searchQuery)) {
                        matches.push({
                            type: 'section',
                            text: section.title,
                            section: tab.sectionLabel || 'Unknown',
                            group: tab.groupLabel || 'Unknown',
                            tabId: tab.id
                        });
                    }
                    
                    if (section.content && section.content.toLowerCase().includes(searchQuery)) {
                        // Extract a snippet around the match
                        const content = section.content;
                        const index = content.toLowerCase().indexOf(searchQuery);
                        const start = Math.max(0, index - 50);
                        const end = Math.min(content.length, index + searchQuery.length + 50);
                        const snippet = content.substring(start, end);
                        
                        matches.push({
                            type: 'content',
                            text: snippet,
                            section: tab.sectionLabel || 'Unknown',
                            group: tab.groupLabel || 'Unknown',
                            tabId: tab.id
                        });
                    }
                });
            }
            
            if (matches.length > 0) {
                searchResults.push({
                    tab: tab,
                    matches: matches
                });
            }
        }
    });
    
    displaySearchResults(searchResults, searchQuery);
}

// Display search results
function displaySearchResults(results, query) {
    // Remove existing results
    hideSearchResults();
    
    if (results.length === 0) {
        return;
    }
    
    const searchContainer = document.querySelector('.search-container-header');
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    
    const resultsList = document.createElement('div');
    resultsList.className = 'search-results-list';
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        const header = document.createElement('div');
        header.className = 'search-result-header';
        header.innerHTML = `
            <span class="search-result-title">${result.tab.label}</span>
            <span class="search-result-section">${result.tab.sectionLabel || 'Unknown'}</span>
        `;
        
        const matchesList = document.createElement('div');
        matchesList.className = 'search-result-matches';
        
        result.matches.forEach(match => {
            const matchItem = document.createElement('div');
            matchItem.className = 'search-result-match';
            matchItem.innerHTML = `
                <span class="match-type">${match.type}</span>
                <span class="match-text">${highlightText(match.text, query)}</span>
            `;
            matchItem.onclick = () => {
                openTab(null, result.tab.id);
                hideSearchResults();
                document.getElementById('header-search').value = '';
            };
            matchesList.appendChild(matchItem);
        });
        
        resultItem.appendChild(header);
        resultItem.appendChild(matchesList);
        resultsList.appendChild(resultItem);
    });
    
    resultsContainer.appendChild(resultsList);
    searchContainer.appendChild(resultsContainer);
}

// Hide search results
function hideSearchResults() {
    const existingResults = document.querySelector('.search-results');
    if (existingResults) {
        existingResults.remove();
    }
}

// Highlight matching text
function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// Update theme icon
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
} 