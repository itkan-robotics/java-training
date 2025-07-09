/**
 * SwyftNav - Content Manager
 * Handles content loading and rendering
 */

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
            // Handle direct items in group
            if (Array.isArray(group.items)) {
                group.items.forEach(item => {
                    promises.push(this.loadItemContent(item, sectionId, sectionConfig, group));
                });
            }
            
            // Handle nested children structure (like FTC config)
            if (Array.isArray(group.children)) {
                group.children.forEach(child => {
                    if (Array.isArray(child.items)) {
                        child.items.forEach(item => {
                            promises.push(this.loadItemContent(item, sectionId, sectionConfig, child));
                        });
                    }
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
            'section': this.renderSectionTypeSection.bind(this)
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
        // Defensive: support both 'items' and 'content', and ensure it's an array
        let items = Array.isArray(data.items) ? data.items : (Array.isArray(data.content) ? data.content : []);
        items.forEach(item => {
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
        
        // Determine what code to render - use content if no code property exists
        const codeToRender = data.code || data.content;
        
        // Only render content as HTML above the code block if there's a code property AND content is different
        // If there's no code property, content IS the code, so don't render it as HTML
        if (data.code && data.content && data.content !== data.code) {
            const div = document.createElement('div');
            div.innerHTML = data.content;
            container.appendChild(div);
        }
        
        const codeBlock = document.createElement('div');
        codeBlock.className = 'code-block';
        // Add language class if specified
        if (data.language) {
            codeBlock.classList.add(`language-${data.language}`);
        }
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        // Set language class on code element for syntax highlighting
        if (data.language) {
            code.className = `language-${data.language}`;
        }
        code.textContent = codeToRender;
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
            desc.innerHTML = data.description;
            exerciseBox.appendChild(desc);
        }

        // Determine what code to render - use content if no code property exists
        const codeToRender = data.code || data.content;
        
        // Only render content as HTML above the code block if there's a code property AND content is different
        // If there's no code property, content IS the code, so don't render it as HTML
        if (data.code && data.content && data.content !== data.code && typeof data.content === 'string') {
            const contentP = document.createElement('p');
            contentP.innerHTML = data.content;
            exerciseBox.appendChild(contentP);
        }

        if (data.tasks) {
            const tasksList = document.createElement('ul');
            data.tasks.forEach(task => {
                const li = document.createElement('li');
                li.innerHTML = task;
                tasksList.appendChild(li);
            });
            exerciseBox.appendChild(tasksList);
        }

        const codeSection = document.createElement('div');
        codeSection.className = 'exercise-code';
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = codeToRender;
        pre.appendChild(code);
        codeSection.appendChild(pre);
        exerciseBox.appendChild(codeSection);

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
        
        // Handle 'links', 'items', or 'content' properties for compatibility
        const links = data.links || data.items || data.content || [];
        
        if (!Array.isArray(links)) {
            console.warn('Link grid data is not an array:', links);
            return;
        }
        
        links.forEach(link => {
            const linkButton = document.createElement('div');
            linkButton.className = 'link-grid-button';
            
            // Handle different link formats
            if (typeof link === 'string') {
                // Parse HTML string to extract text and href
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = link;
                const anchor = tempDiv.querySelector('a');
                
                if (anchor) {
                    // Extract text content (remove HTML tags)
                    const textContent = anchor.textContent || anchor.innerText || 'Link';
                    linkButton.textContent = textContent;
                    
                    linkButton.onclick = () => {
                        if (anchor.target === '_blank') {
                            window.open(anchor.href, '_blank', 'noopener,noreferrer');
                        } else {
                            window.location.href = anchor.href;
                        }
                    };
                } else {
                    // Fallback if no anchor found
                    linkButton.textContent = link;
                }
            } else if (link.url) {
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentManager;
} 