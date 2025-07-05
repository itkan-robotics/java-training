// Furo-inspired Documentation JavaScript for FRCCodeLab

// Global variables
let config = null;
let currentTab = null;
let tabData = {};
let allTabs = []; // Flattened list of all child tabs for easy access

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
        generateNavigation();
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
        const response = await fetch('data/config.json');
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
    config.tabs.forEach(parentTab => {
        if (parentTab.type === 'parent' && parentTab.children) {
            parentTab.children.forEach(childTab => {
                allTabs.push({
                    ...childTab,
                    parentId: parentTab.id,
                    parentLabel: parentTab.label
                });
            });
        } else {
            // Handle non-hierarchical tabs if any exist
            allTabs.push(parentTab);
        }
    });
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

// Generate hierarchical navigation sidebar
function generateNavigation() {
    const navigationUl = document.getElementById('sidebar-navigation');
    
    config.tabs.forEach((parentTab) => {
        if (parentTab.type === 'parent') {
            // Create parent tab
            const parentLi = document.createElement('li');
            parentLi.className = 'toctree-l1 parent-tab';
            
            const parentA = document.createElement('a');
            parentA.className = 'reference parent-reference';
            parentA.href = '#'; // Keep this as '#' for parent links (they don't directly open a tab)
            parentA.innerHTML = `
                <span class="expand-icon expand-icon-${parentTab.id}">${parentTab.expanded ? '▼' : '\u25B6\uFE0E'}</span>
                ${parentTab.label}
            `;
            parentA.onclick = (e) => {
                e.preventDefault();
                toggleParentTab(parentTab.id);
            };
            
            parentLi.appendChild(parentA);
            
            // Create children container
            const childrenUl = document.createElement('ul');
            childrenUl.className = `children-nav ${parentTab.expanded ? 'expanded' : 'collapsed'}`;
            childrenUl.id = `children-${parentTab.id}`;
            
            // Add child tabs
            parentTab.children.forEach((childTab) => {
                const childLi = document.createElement('li');
                childLi.className = `toctree-l2 child-tab ${childTab.default ? 'current-page' : ''}`;
                
                const childA = document.createElement('a');
                childA.className = 'reference child-reference';
                childA.href = `#${childTab.id}`;  // Construct the URL
                childA.textContent = childTab.label;
                childA.onclick = (e) => {
                    e.preventDefault();
                    // Update the URL
                    window.location.hash = `#${childTab.id}`;
                    openTab(e, childTab.id);
                };
                
                childLi.appendChild(childA);
                childrenUl.appendChild(childLi);
            });
            
            parentLi.appendChild(childrenUl);
            navigationUl.appendChild(parentLi);
        } else {
            // Handle non-hierarchical tabs
            const li = document.createElement('li');
            li.className = `toctree-l1 ${parentTab.default ? 'current-page' : ''}`;
            
            const a = document.createElement('a');
            a.className = 'reference';
            a.href = `#${parentTab.id}`; // Construct the URL
            a.textContent = parentTab.label;
            a.onclick = (e) => {
                e.preventDefault();
                // Update the URL
                window.location.hash = `#${parentTab.id}`;
                openTab(e, parentTab.id);
            };
            
            li.appendChild(a);
            navigationUl.appendChild(li);
        }
    });
}


// Toggle parent tab expand/`collapse
function toggleParentTab(parentId) {
    const childrenNav = document.getElementById(`children-${parentId}`);
    const expandIcon = document.querySelector(`.expand-icon-${parentId}`); // Use the specific class

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
    const urlTabId = window.location.hash ? window.location.hash.substring(1) : null; // Get tab ID from URL

    if (urlTabId) {
        defaultTab = allTabs.find(tab => tab.id === urlTabId);
        if (defaultTab) {
            // If there's a valid tab ID in the URL, remove the last opened tab
            localStorage.removeItem('lastOpenedTab');
        }
    } else if (lastOpenedTabId) {
        defaultTab = allTabs.find(tab => tab.id === lastOpenedTabId);
    }

    if (!defaultTab) {
        defaultTab = allTabs.find(tab => tab.default) || allTabs[0];
    }

    if (defaultTab) {
        // Ensure parent is expanded if needed
        if (defaultTab.parentId) {
            const parentConfig = config.tabs.find(t => t.id === defaultTab.parentId);
            if (parentConfig && !parentConfig.expanded) {
                toggleParentTab(defaultTab.parentId);
            }
        }
        openTab(null, defaultTab.id);
    }
}


// Open a specific tab
function openTab(event, tabId) {
    // Store the last opened tab ID
    localStorage.setItem('lastOpenedTab', tabId);

    // Remove current-page class from all tabs
    document.querySelectorAll('.toctree-l1, .toctree-l2').forEach(li => {
        li.classList.remove('current-page');
    });
    
    // Find and highlight the selected tab
    const targetTab = allTabs.find(tab => tab.id === tabId);
    if (targetTab) {
        // If it's a child tab, ensure parent is expanded
        if (targetTab.parentId) {
            const parentChildren = document.getElementById(`children-${targetTab.parentId}`);
            if (!parentChildren.classList.contains('expanded')) {
                toggleParentTab(targetTab.parentId);
            }
        }
        
        // Find the navigation element
        const navLinks = document.querySelectorAll('.child-reference, .reference');
        navLinks.forEach(link => {
            if (link.onclick && link.onclick.toString().includes(tabId)) {
                link.closest('.toctree-l1, .toctree-l2').classList.add('current-page');
            }
        });
    }
    
    // Render tab content
    renderTabContent(tabId);
    currentTab = tabId;
    
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
    
    if (data.items) {
        const ul = document.createElement('ul');
        data.items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = item;
            ul.appendChild(li);
        });
        rulesBox.appendChild(ul);
    }
    
    if (data.goodPractices) {
        const h4Good = document.createElement('h4');
        h4Good.textContent = '✅ Good Practice:';
        rulesBox.appendChild(h4Good);
        
        const ulGood = document.createElement('ul');
        data.goodPractices.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = item;
            ulGood.appendChild(li);
        });
        rulesBox.appendChild(ulGood);
    }
    
    if (data.avoid) {
        const h4Avoid = document.createElement('h4');
        h4Avoid.textContent = '❌ Avoid:';
        rulesBox.appendChild(h4Avoid);
        
        const ulAvoid = document.createElement('ul');
        data.avoid.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = item;
            ulAvoid.appendChild(li);
        });
        rulesBox.appendChild(ulAvoid);
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

    const h4 = document.createElement('h4');
    h4.textContent = data.subtitle;
    exerciseBox.appendChild(h4);

    const p = document.createElement('p');
    p.textContent = data.content;
    exerciseBox.appendChild(p);

    const ol = document.createElement('ol');
    data.tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task;
        ol.appendChild(li);
    });
    exerciseBox.appendChild(ol);

    // Add hint box if hint exists
    if (data.hint) { // Modified this part
        const hintBox = document.createElement('div');
        hintBox.className = 'hint-box';

        const hintTitle = document.createElement('h5');
        hintTitle.textContent = '🔑 Hint';
        hintBox.appendChild(hintTitle);

        const hintContent = document.createElement('p');
        hintContent.innerHTML = data.hint;
        hintBox.appendChild(hintContent);

        exerciseBox.appendChild(hintBox);
    }

    // Add answer button and section if answers exist
    if (data.answers && data.answers.length > 0) {
        const answerButton = document.createElement('button');
        answerButton.className = 'answer-toggle-btn';
        answerButton.textContent = '💡 Show Answers';
        answerButton.onclick = () => toggleAnswers(answerButton, answerSection);
        exerciseBox.appendChild(answerButton);

        const answerSection = document.createElement('div');
        answerSection.className = 'answer-section hidden';

        const answerTitle = document.createElement('h5');
        answerTitle.textContent = '📝 Exercise Answers:';
        answerTitle.className = 'answer-title';
        answerSection.appendChild(answerTitle);

        data.answers.forEach((answer, index) => {
            const answerItem = document.createElement('div');
            answerItem.className = 'answer-item';

            const taskLabel = document.createElement('h6');
            taskLabel.textContent = `${index + 1}. ${answer.task}`;
            taskLabel.className = 'answer-task-label';
            answerItem.appendChild(taskLabel);

            const codeBlock = document.createElement('div');
            codeBlock.className = 'code-block answer-code';

            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = answer.code;
            pre.appendChild(code);
            codeBlock.appendChild(pre);

            answerItem.appendChild(codeBlock);
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
        button.textContent = '🙈 Hide Answers';
        button.classList.add('active');
    } else {
        answerSection.classList.add('hidden');
        answerSection.classList.remove('visible');
        button.textContent = '💡 Show Answers';
        button.classList.remove('active');
    }
}

// Render data types grid
function renderDataTypesGrid(container, data) {
    const grid = document.createElement('div');
    grid.className = 'data-types-grid';
    
    data.types.forEach(type => {
        const card = document.createElement('div');
        card.className = 'data-type-card';
        
        const h4 = document.createElement('h4');
        h4.textContent = type.name;
        card.appendChild(h4);
        
        const p = document.createElement('p');
        p.innerHTML = `<strong>${type.description}</strong>`;
        card.appendChild(p);
        
        const code = document.createElement('code');
        code.textContent = type.example;
        card.appendChild(code);
        
        const small = document.createElement('small');
        small.textContent = type.note;
        card.appendChild(small);
        
        grid.appendChild(card);
    });
    
    container.appendChild(grid);
}

// Render logical operators
function renderLogicalOperators(container, data) {
    const h3 = document.createElement('h3');
    h3.textContent = data.title;
    container.appendChild(h3);
    
    const rulesBox = document.createElement('div');
    rulesBox.className = 'rules-box';
    
    const h4 = document.createElement('h4');
    h4.textContent = data.subtitle;
    rulesBox.appendChild(h4);
    
    const ul = document.createElement('ul');
    data.operators.forEach(op => {
        const li = document.createElement('li');
        li.innerHTML = op;
        ul.appendChild(li);
    });
    rulesBox.appendChild(ul);
    
    const codeBlock = document.createElement('div');
    codeBlock.className = 'code-block';
    
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = data.examples;
    pre.appendChild(code);
    codeBlock.appendChild(pre);
    rulesBox.appendChild(codeBlock);
    
    container.appendChild(rulesBox);
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key >= '1' && e.key <= '9') {
            const tabIndex = parseInt(e.key) - 1;
            if (allTabs[tabIndex]) {
                openTab(null, allTabs[tabIndex].id);
            }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            navigateWithArrows(e.key);
        }
    });
    
    // Copy code blocks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.code-block')) {
            copyToClipboard(e.target.closest('.code-block').querySelector('code').textContent);
        }
    });
}

// Navigate with arrow keys
function navigateWithArrows(key) {
    const currentIndex = allTabs.findIndex(tab => tab.id === currentTab);
    let newIndex;
    
    if (key === 'ArrowLeft') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : allTabs.length - 1;
    } else {
        newIndex = currentIndex < allTabs.length - 1 ? currentIndex + 1 : 0;
    }
    
    openTab(null, allTabs[newIndex].id);
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Code copied to clipboard!');
    }).catch(() => {
        console.log('Failed to copy to clipboard');
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
        background: var(--color-background-secondary);
        color: var(--color-foreground-primary);
        padding: 10px 20px;
        border-radius: 4px;
        border: 1px solid var(--color-background-border);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show error message
function showError(message) {
    const container = document.getElementById('tab-container');
    container.innerHTML = `
        <div class="error-message" style="
            text-align: center;
            padding: 2rem;
            color: var(--color-problematic);
        ">
            <h2>Error</h2>
            <p>${message}</p>
        </div>
    `;
}

// Theme toggle functionality
function toggleTheme() {
    const html = document.documentElement;
    // const currentTheme = html.getAttribute('data-theme');
    // const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // html.setAttribute('data-theme', newTheme);
    // localStorage.setItem('theme', newTheme);
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme); // Ensure this updates the icon correctly
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon'); // Make sure this class matches your icon element
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️'; // Assuming sun for dark, moon for light
    }
  }
  

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style); 