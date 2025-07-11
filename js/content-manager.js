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
        
        // Update page title based on current content
        this.updatePageTitle(data);
        
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

    /**
     * Updates the page title based on the current content
     */
    updatePageTitle(data) {
        let title = 'SwyftNav - Programming Fundamentals';
        
        if (data && data.title) {
            // Format: "Page Title - SwyftNav"
            title = `${data.title} - SwyftNav`;
        }
        
        // Update the document title
        document.title = title;
    }

    /**
     * Gets a display name for a section ID
     */
    getSectionDisplayName(sectionId) {
        const sectionNames = {
            'homepage': 'Home',
            'java-training': 'Java Training',
            'ftc-specific': 'FTC Training',
            'frc-specific': 'FRC Training',
            'competitive-training': 'Competitive Training'
        };
        
        return sectionNames[sectionId] || sectionId;
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
            'section': this.renderSectionTypeSection.bind(this),
            'table': this.renderTableSection.bind(this)
        };

        const renderer = renderers[sectionData.type];
        if (renderer) {
            renderer(container, sectionData);
        } else {
            console.warn(`Unknown section type: ${sectionData.type}`);
        }
    }

    // Helper methods to reduce code duplication
    createSectionTitle(container, title) {
        if (title) {
            const h3 = document.createElement('h3');
            h3.textContent = title;
            container.appendChild(h3);
        }
    }

    createStyledElement(tagName, className, styles = {}) {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        Object.assign(element.style, styles);
        return element;
    }

    renderTextSection(container, data) {
        this.createSectionTitle(container, data.title);
        
        const paragraph = document.createElement('p');
        paragraph.innerHTML = data.content;
        container.appendChild(paragraph);
    }

    renderListSection(container, data) {
        this.createSectionTitle(container, data.title);
        
        const list = document.createElement('ul');
        // Defensive: support both 'items' and 'content', and ensure it's an array
        const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.content) ? data.content : []);
        
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = item;
            list.appendChild(listItem);
        });
        
        container.appendChild(list);
    }

    renderCodeSection(container, data) {
        this.createSectionTitle(container, data.title);
        
        // Determine what code to render - use content if no code property exists
        const codeToRender = data.code || data.content;
        
        // Only render content as HTML above the code block if there's a code property AND content is different
        // If there's no code property, content IS the code, so don't render it as HTML
        if (data.code && data.content && data.content !== data.code) {
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = data.content;
            container.appendChild(contentDiv);
        }
        
        const codeBlock = this.createStyledElement('div', 'code-block');
        
        // Add language class if specified
        if (data.language) {
            codeBlock.classList.add(`language-${data.language}`);
        }
        
        // Create header with minimize/maximize button
        const codeHeader = this.createStyledElement('div', 'code-header', {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: 'var(--color-background-secondary)',
            borderBottom: '1px solid var(--color-border)',
            borderRadius: '6px 6px 0 0',
            fontSize: '0.9em',
            color: 'var(--color-foreground-secondary)'
        });
        
        const titleLabel = this.createStyledElement('span', null, {
            fontWeight: '500',
            fontFamily: 'var(--font-stack--monospace)',
            fontSize: '0.85em'
        });
        
        // Use the section title if available, otherwise fall back to language or "CODE"
        const displayTitle = data.title || (data.language ? data.language.toUpperCase() : 'CODE');
        titleLabel.textContent = displayTitle;
        
        const toggleButton = this.createStyledElement('button', 'code-toggle-btn', {
            background: 'none',
            border: 'none',
            color: 'var(--color-foreground-secondary)',
            cursor: 'pointer',
            fontSize: '1.2em',
            fontWeight: 'bold',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '3px',
            transition: 'background-color 0.2s'
        });
        
        toggleButton.innerHTML = '−'; // Minus sign for collapse
        
        // Add hover effect
        toggleButton.addEventListener('mouseenter', () => {
            toggleButton.style.backgroundColor = 'var(--color-background-tertiary)';
        });
        
        toggleButton.addEventListener('mouseleave', () => {
            toggleButton.style.backgroundColor = 'transparent';
        });
        
        codeHeader.appendChild(titleLabel);
        codeHeader.appendChild(toggleButton);
        codeBlock.appendChild(codeHeader);
        
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        
        // Set language class on code element for syntax highlighting
        if (data.language) {
            code.className = `language-${data.language}`;
        }
        
        code.textContent = codeToRender;
        pre.appendChild(code);
        codeBlock.appendChild(pre);
        
        // Add toggle functionality
        let isCollapsed = false;
        toggleButton.addEventListener('click', () => {
            isCollapsed = !isCollapsed;
            if (isCollapsed) {
                pre.style.display = 'none';
                toggleButton.innerHTML = '+'; // Plus sign for expand
                codeBlock.style.borderRadius = '6px';
            } else {
                pre.style.display = 'block';
                toggleButton.innerHTML = '−'; // Minus sign for collapse
                codeBlock.style.borderRadius = '6px 6px 0 0';
            }
        });
        
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
        
        // Handle goodPractices section
        if (data.goodPractices && Array.isArray(data.goodPractices)) {
            const goodPracticesSection = document.createElement('div');
            goodPracticesSection.style.marginBottom = '1.5rem';
            
            const goodPracticesTitle = document.createElement('h5');
            goodPracticesTitle.textContent = 'Good Practices:';
            goodPracticesTitle.style.marginBottom = '0.5rem';
            goodPracticesTitle.style.color = 'var(--color-success)';
            goodPracticesTitle.style.fontWeight = '600';
            goodPracticesSection.appendChild(goodPracticesTitle);
            
            const goodPracticesList = document.createElement('ul');
            goodPracticesList.style.margin = '0';
            goodPracticesList.style.paddingLeft = '1.5rem';
            
            data.goodPractices.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = item;
                li.style.marginBottom = '0.5rem';
                li.style.lineHeight = '1.5';
                goodPracticesList.appendChild(li);
            });
            goodPracticesSection.appendChild(goodPracticesList);
            rulesBox.appendChild(goodPracticesSection);
        }
        
        // Handle avoid section
        if (data.avoid && Array.isArray(data.avoid)) {
            const avoidSection = document.createElement('div');
            avoidSection.style.marginBottom = '1.5rem';
            
            const avoidTitle = document.createElement('h5');
            avoidTitle.textContent = 'Avoid:';
            avoidTitle.style.marginBottom = '0.5rem';
            avoidTitle.style.color = 'var(--color-error)';
            avoidTitle.style.fontWeight = '600';
            avoidSection.appendChild(avoidTitle);
            
            const avoidList = document.createElement('ul');
            avoidList.style.margin = '0';
            avoidList.style.paddingLeft = '1.5rem';
            
            data.avoid.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = item;
                li.style.marginBottom = '0.5rem';
                li.style.lineHeight = '1.5';
                avoidList.appendChild(li);
            });
            avoidSection.appendChild(avoidList);
            rulesBox.appendChild(avoidSection);
        }
        
        // Handle legacy items (for backward compatibility)
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

        // Only render code section if there's actual code or content to display
        const codeToRender = data.code || data.content;
        if (codeToRender && codeToRender.trim() !== '') {
            const codeBlock = document.createElement('div');
            codeBlock.className = 'code-block';
            // Add language class if specified
            if (data.language) {
                codeBlock.classList.add(`language-${data.language}`);
            }
            
            // Create header with minimize/maximize button for exercise code
            const codeHeader = document.createElement('div');
            codeHeader.className = 'code-header';
            codeHeader.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: var(--color-background-secondary);
                border-bottom: 1px solid var(--color-border);
                border-radius: 6px 6px 0 0;
                font-size: 0.9em;
                color: var(--color-foreground-secondary);
            `;
            
            const titleLabel = document.createElement('span');
            // Use the section title if available, otherwise fall back to language or "CODE"
            const displayTitle = data.title || (data.language ? data.language.toUpperCase() : 'CODE');
            titleLabel.textContent = displayTitle;
            titleLabel.style.cssText = `
                font-weight: 500;
                font-family: var(--font-stack--monospace);
                font-size: 0.85em;
            `;
            
            const toggleButton = document.createElement('button');
            toggleButton.className = 'code-toggle-btn';
            toggleButton.innerHTML = '−'; // Minus sign for collapse
            toggleButton.style.cssText = `
                background: none;
                border: none;
                color: var(--color-foreground-secondary);
                cursor: pointer;
                font-size: 1.2em;
                font-weight: bold;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 3px;
                transition: background-color 0.2s;
            `;
            
            // Add hover effect
            toggleButton.addEventListener('mouseenter', () => {
                toggleButton.style.backgroundColor = 'var(--color-background-tertiary)';
            });
            
            toggleButton.addEventListener('mouseleave', () => {
                toggleButton.style.backgroundColor = 'transparent';
            });
            
            codeHeader.appendChild(titleLabel);
            codeHeader.appendChild(toggleButton);
            codeBlock.appendChild(codeHeader);
            
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            // Set language class on code element for syntax highlighting
            if (data.language) {
                code.className = `language-${data.language}`;
            }
            code.textContent = codeToRender;
            pre.appendChild(code);
            codeBlock.appendChild(pre);
            
            // Add toggle functionality
            let isCollapsed = false;
            toggleButton.addEventListener('click', () => {
                isCollapsed = !isCollapsed;
                if (isCollapsed) {
                    pre.style.display = 'none';
                    toggleButton.innerHTML = '+'; // Plus sign for expand
                    codeBlock.style.borderRadius = '6px';
                } else {
                    pre.style.display = 'block';
                    toggleButton.innerHTML = '−'; // Minus sign for collapse
                    codeBlock.style.borderRadius = '6px 6px 0 0';
                }
            });
            
            exerciseBox.appendChild(codeBlock);
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
            data.answers.forEach((answer, index) => {
                const answerItem = document.createElement('div');
                answerItem.className = 'answer-item';

                if (answer.task) {
                    const taskLabel = document.createElement('div');
                    taskLabel.className = 'answer-task-label';
                    taskLabel.textContent = answer.task;
                    answerItem.appendChild(taskLabel);
                }

                if (answer.content) {
                    const codeBlock = document.createElement('div');
                    codeBlock.className = 'code-block';
                    // Add language class if specified
                    if (answer.language) {
                        codeBlock.classList.add(`language-${answer.language}`);
                    }
                    
                    // Create header with minimize/maximize button for answer code
                    const codeHeader = document.createElement('div');
                    codeHeader.className = 'code-header';
                    codeHeader.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 12px;
                        background: var(--color-background-secondary);
                        border-bottom: 1px solid var(--color-border);
                        border-radius: 6px 6px 0 0;
                        font-size: 0.9em;
                        color: var(--color-foreground-secondary);
                    `;
                    
                    const titleLabel = document.createElement('span');
                    // Use the task title if available, otherwise fall back to language or "CODE"
                    const displayTitle = answer.task || (answer.language ? answer.language.toUpperCase() : 'CODE');
                    titleLabel.textContent = displayTitle;
                    titleLabel.style.cssText = `
                        font-weight: 500;
                        font-family: var(--font-stack--monospace);
                        font-size: 0.85em;
                    `;
                    
                    const toggleButton = document.createElement('button');
                    toggleButton.className = 'code-toggle-btn';
                    toggleButton.innerHTML = '−'; // Minus sign for collapse
                    toggleButton.style.cssText = `
                        background: none;
                        border: none;
                        color: var(--color-foreground-secondary);
                        cursor: pointer;
                        font-size: 1.2em;
                        font-weight: bold;
                        padding: 0;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 3px;
                        transition: background-color 0.2s;
                    `;
                    
                    // Add hover effect
                    toggleButton.addEventListener('mouseenter', () => {
                        toggleButton.style.backgroundColor = 'var(--color-background-tertiary)';
                    });
                    
                    toggleButton.addEventListener('mouseleave', () => {
                        toggleButton.style.backgroundColor = 'transparent';
                    });
                    
                    codeHeader.appendChild(titleLabel);
                    codeHeader.appendChild(toggleButton);
                    codeBlock.appendChild(codeHeader);
                    
                    const pre = document.createElement('pre');
                    const code = document.createElement('code');
                    // Set language class on code element for syntax highlighting
                    if (answer.language) {
                        code.className = `language-${answer.language}`;
                    }
                    code.textContent = answer.content;
                    pre.appendChild(code);
                    codeBlock.appendChild(pre);
                    
                    // Add toggle functionality
                    let isCollapsed = false;
                    toggleButton.addEventListener('click', () => {
                        isCollapsed = !isCollapsed;
                        if (isCollapsed) {
                            pre.style.display = 'none';
                            toggleButton.innerHTML = '+'; // Plus sign for expand
                            codeBlock.style.borderRadius = '6px';
                        } else {
                            pre.style.display = 'block';
                            toggleButton.innerHTML = '−'; // Minus sign for collapse
                            codeBlock.style.borderRadius = '6px 6px 0 0';
                        }
                    });
                    
                    answerItem.appendChild(codeBlock);
                }

                answerSection.appendChild(answerItem);
            });

            toggleBtn.addEventListener('click', () => {
                answersVisible = !answersVisible;
                
                if (!answersVisible) {
                    // Show answers
                    answerSection.classList.remove('hidden');
                    answerSection.classList.add('visible');
                    toggleBtn.textContent = 'Show Answers';
                    toggleBtn.classList.add('active');
                } else {
                    // Hide answers
                    answerSection.classList.remove('visible');
                    answerSection.classList.add('hidden');
                    toggleBtn.textContent = 'Hide Answers';
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
        if (data.title) {
            const h3 = document.createElement('h3');
            h3.textContent = data.title;
            container.appendChild(h3);
        }
        
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
                        // Always open external links in new tab
                        if (anchor.href && (anchor.href.startsWith('http') || anchor.href.startsWith('https'))) {
                            window.open(anchor.href, '_blank', 'noopener,noreferrer');
                        } else if (anchor.target === '_blank') {
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
                    // Always open external URLs in new tab
                    if (link.url.startsWith('http') || link.url.startsWith('https') || link.external) {
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

    renderTableSection(container, data) {
        if (data.title) {
            const h3 = document.createElement('h3');
            h3.textContent = data.title;
            container.appendChild(h3);
        }
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        const table = document.createElement('table');
        table.className = 'content-table';
        
        // Create table header
        if (data.headers && Array.isArray(data.headers)) {
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            data.headers.forEach(header => {
                const th = document.createElement('th');
                th.innerHTML = header;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
        }
        
        // Create table body
        if (data.rows && Array.isArray(data.rows)) {
            const tbody = document.createElement('tbody');
            
            data.rows.forEach(row => {
                const tr = document.createElement('tr');
                
                row.forEach(cell => {
                    const td = document.createElement('td');
                    td.innerHTML = cell;
                    tr.appendChild(td);
                });
                
                tbody.appendChild(tr);
            });
            
            table.appendChild(tbody);
        }
        
        tableContainer.appendChild(table);
        container.appendChild(tableContainer);
    }

    toggleAllCodeBlocks() {
        // Find all code blocks with a code-toggle-btn
        const codeBlocks = document.querySelectorAll('.code-block');
        if (!codeBlocks.length) return;

        // Determine if we should collapse or expand (collapse if any are open)
        let shouldCollapse = false;
        for (const block of codeBlocks) {
            const pre = block.querySelector('pre');
            if (pre && pre.style.display !== 'none') {
                shouldCollapse = true;
                break;
            }
        }

        for (const block of codeBlocks) {
            const pre = block.querySelector('pre');
            const toggleBtn = block.querySelector('.code-toggle-btn');
            if (!pre || !toggleBtn) continue;
            if (shouldCollapse) {
                pre.style.display = 'none';
                toggleBtn.innerHTML = '+';
                block.style.borderRadius = '6px';
            } else {
                pre.style.display = 'block';
                toggleBtn.innerHTML = '−';
                block.style.borderRadius = '6px 6px 0 0';
            }
        }

        // Show notification
        const action = shouldCollapse ? 'Collapsed' : 'Expanded';
        this.showNotification(`${action} code blocks`);
    }

    showNotification(message, duration = 3000) {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification-popup');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification-popup';
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: calc(var(--header-height) + 10px);
            right: 20px;
            background: var(--color-background-secondary);
            color: var(--color-foreground-secondary);
            padding: 6px 10px;
            border-radius: var(--radius-sm);
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--color-background-border);
            font-family: var(--font-stack--monospace);
            font-size: 0.75rem;
            font-weight: 400;
            z-index: 10000;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.2s ease;
            max-width: 200px;
            word-wrap: break-word;
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Auto remove after duration
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(10px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 200);
        }, duration);

        // Allow manual dismissal on click
        notification.addEventListener('click', () => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(10px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 200);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentManager;
} 