# SwyftNav - FIRST Programming Made Easy

A comprehensive, interactive web-based learning platform for programming fundamentals, robotics development, and competitive coding. Designed for FTC (FIRST Tech Challenge), FRC (FIRST Robotics Competition) teams, and programming enthusiasts.

## 🎯 Features

- **Multi-Section Learning**: Five comprehensive training tracks
- **Interactive Navigation**: Hierarchical content with collapsible groups and tier-based organization
- **Robotics-Focused**: Real-world examples from FTC and FRC competitions
- **Competitive Coding**: Complete curriculum from beginner to LeetCode master
- **Modern UI**: Professional theme with dark/light mode toggle
- **Mobile Responsive**: Works seamlessly on all devices
- **Search Functionality**: Global search across all content with Ctrl+K shortcut
- **Exercise System**: Interactive practice problems with show/hide answers
- **Modular Architecture**: Clean, maintainable codebase with separation of concerns

## 🏗 Architecture Overview

The platform uses a modular, class-based architecture with clear separation of concerns:

### Core Architecture Components

```
Application
├── AppState (Global State Management)
├── ConfigManager (Configuration Loading & Caching)
├── ContentManager (Content Loading & Rendering)
├── NavigationManager (Navigation & Routing)
├── ThemeManager (Theme Switching)
├── SearchManager (Global Search)
├── EventManager (Event Handling)
└── SidebarResizeManager (UI Responsiveness)
```

### Key Design Principles

1. **Single Responsibility**: Each class has one clear purpose
2. **Dependency Injection**: Managers are injected where needed
3. **State Management**: Centralized state in AppState class
4. **Error Handling**: Comprehensive error handling throughout
5. **Caching**: Config and content caching for performance
6. **Modularity**: Easy to extend and maintain
7. **Progressive Enhancement**: Works without JavaScript for basic functionality

## 📚 Training Sections

### 🏠 Home
- Platform overview and navigation guide
- Quick start information for all sections

### ☕ Java Training
**From zero to confident Java programmer**
- **Java Basics**: Variables, data types, arrays, calculations
- **Programming Logic**: Conditionals, methods, control structures, exception handling
- **Loops**: While loops, for loops, loop control, best practices
- **Object-Oriented Programming**: Classes, objects, references, overloading

### 🤖 FTC-Specific Training
**Complete FTC robotics programming curriculum**
- **Beginner Tier**: OnBot Java setup, basic drivetrain, gamepad control, sensors, simple autonomous, mechanisms
- **Intermediate Tier**: Android Studio intro, OnBot vs Android Studio, Git & version control, command-based programming, PedroPathing
- **Advanced Tier**: Advanced command-based programming, advanced PedroPathing, computer vision

### 🏁 FRC-Specific Training
**Professional FRC robotics development**
- **FRC Basics**: WPILib framework, motor control, commands & subsystems
- **Advanced Features**: Command-based programming, PID control systems

### 🏆 Competitive Coding Training
**From beginner to LeetCode master**
- **Phase 1: Foundation**: Problem-solving framework, time complexity, Big O notation
- **Phase 2: Data Structures**: Arrays, linked lists, trees, graphs, heaps, hash tables
- **Phase 3: Core Algorithms**: Sorting, searching, two pointers, sliding window, binary search, dynamic programming, greedy algorithms
- **Phase 4: Advanced Techniques**: Advanced DP, backtracking, union-find, tries, segment trees, bit manipulation
- **Phase 5: LeetCode Mastery**: Problem patterns, optimization, interview prep, contest strategies, advanced problem solving

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/swyftnav.git
cd swyftnav

# Start local server (choose one):

# Option 1: Python (built-in)
python -m http.server 8000

# Option 2: Node.js (recommended)
npm install -g http-server
http-server -p 8000 -c-1

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then visit: `http://localhost:8000/`

### Production Deployment

#### GitHub Pages (Recommended)
1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → "main" → "/ (root)"
4. Your site will be available at: `https://YOUR_USERNAME.github.io/REPO_NAME/`

#### Netlify
1. Visit [netlify.com](https://netlify.com)
2. Drag the project folder to deploy
3. Get instant URL with optional custom domain

## 🛠 Technical Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Architecture**: Modular class-based architecture with dependency injection
- **State Management**: Centralized state management with AppState class
- **Data**: JSON-based content management system with modular configs
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Theme**: Furo documentation theme adaptation
- **Icons**: Custom SVG icons and emoji
- **No Build Process**: Pure vanilla JavaScript for simplicity

## 📁 Project Structure

```
swyftnav/
├── index.html                          # Main application entry point
├── styles.css                          # Main stylesheet with theme system
├── js/                                 # Modular JavaScript architecture
│   ├── app-state.js                    # Global state management
│   ├── config-manager.js               # Configuration loading & caching
│   ├── content-manager.js              # Content loading & rendering
│   ├── navigation-manager.js           # Navigation & routing
│   ├── theme-manager.js                # Theme switching
│   ├── search-manager.js               # Global search functionality
│   ├── sidebar-resize-manager.js       # UI responsiveness
│   ├── event-manager.js                # Event handling
│   ├── application.js                  # Main application coordination
│   ├── global-functions.js             # HTML integration functions
│   └── main.js                         # Module loading documentation
├── data/                               # Content organization
│   ├── config/                         # Configuration files
│   │   ├── config.json                 # Main navigation configuration
│   │   ├── homepage.json               # Home page content
│   │   ├── java-training-config.json   # Java section config
│   │   ├── ftc-specific-config.json    # FTC section config (tiers structure)
│   │   ├── frc-specific-config.json    # FRC section config
│   │   └── competitive-training-config.json # Competitive section config
│   ├── java/                           # Java training content
│   │   ├── java-basics/                # Basic Java concepts
│   │   ├── java-loops/                 # Loop structures
│   │   ├── java-oop/                   # Object-oriented programming
│   │   └── java-programming-logic/     # Programming logic
│   ├── ftc/                            # FTC training content
│   │   ├── onbot-java/                 # OnBot Java development
│   │   └── android-studio/             # Android Studio development
│   ├── frc/                            # FRC training content
│   │   ├── beginner/                   # Beginner FRC concepts
│   │   ├── intermediate/               # Intermediate FRC concepts
│   │   └── advanced/                   # Advanced FRC concepts
│   └── comp/                           # Competitive coding content
│       ├── foundation/                 # Problem-solving foundation
│       ├── data-structures/            # Data structures
│       ├── algorithms/                 # Core algorithms
│       ├── strategies/                 # Problem-solving strategies
│       └── advanced/                   # Advanced techniques
├── media/                              # Images and icons
└── README.md                           # This file
```

## 🏗 Navigation Architecture

### Configuration Structure

The platform supports two main navigation structures:

#### 1. Groups Structure (Traditional)
```json
{
  "title": "Section Title",
  "groups": [
    {
      "id": "group-id",
      "label": "Group Label",
      "items": [
        {
          "id": "item-id",
          "label": "Item Label",
          "file": "data/section/item.json"
        }
      ]
    }
  ]
}
```

#### 2. Tiers Structure (FTC Curriculum)
```json
{
  "title": "Section Title",
  "tiers": [
    {
      "id": "tier-id",
      "title": "Tier Title",
      "description": "Tier description",
      "lessons": [
        "tier/lesson-file.json",
        "tier/another-lesson.json"
      ]
    }
  ]
}
```

### Content File Structure

All content files follow a standardized JSON format:

```json
{
  "title": "Page Title",
  "sections": [
    {
      "type": "text",
      "title": "Section Title",
      "content": "HTML content with <strong>formatting</strong>"
    },
    {
      "type": "code",
      "title": "Code Example",
      "content": "Code Explanation",
      "code": "public class Example {\n    // Code here\n}"
    },
    {
      "type": "exercise-box",
      "title": "Practice Exercise",
      "description": "Exercise description",
      "tasks": [
        "Task 1",
        "Task 2"
      ],
      "content": "// Example code"
    }
  ]
}
```

### Supported Content Types

- `text`: Regular paragraphs with HTML formatting
- `code`: Syntax-highlighted code blocks
- `rules-box`: Important rules and guidelines
- `exercise-box`: Interactive practice problems
- `list`: Key points and bullet lists
- `emphasis-box`: Important information highlights
- `data-types-grid`: Interactive data type comparisons
- `logical-operators`: Operator reference tables
- `link-grid`: Navigation to related topics

## 🔧 Development Guidelines

### Adding New Content

#### 1. Create Content File
Create a new JSON file in the appropriate section folder following the content structure above.

#### 2. Update Section Configuration
Add the new content to the corresponding section config file:

**For Groups Structure:**
```json
{
  "id": "new-item",
  "label": "New Item Label",
  "file": "data/section/new-item.json"
}
```

**For Tiers Structure:**
```json
{
  "lessons": [
    "existing-lesson.json",
    "new-lesson.json"  // Add your new lesson
  ]
}
```

#### 3. Naming Conventions
- **Files**: `[section-prefix]-[descriptive-name].json`
- **IDs**: `[section-prefix]-[descriptive-name]`
- **Labels**: Human-readable, descriptive titles

### Adding New Sections

#### 1. Create Section Configuration
Create a new config file in `data/config/`:

```json
{
  "title": "New Section Title",
  "groups": [
    {
      "id": "main-group",
      "label": "Main Group",
      "items": [
        {
          "id": "intro",
          "label": "Introduction",
          "file": "data/new-section/intro.json"
        }
      ]
    }
  ]
}
```

#### 2. Add to Main Configuration
Update `data/config/config.json`:

```json
{
  "sections": {
    "new-section": {
      "id": "new-section",
      "label": "New Section",
      "file": "data/config/new-section-config.json"
    }
  }
}
```

#### 3. Create Content Directory
Create a folder in `data/` for your section content.

### Extending the Architecture

#### Adding New Content Types

1. **Add Renderer Method** in `ContentManager`:
```javascript
renderNewType(container, data) {
    // Your rendering logic here
}
```

2. **Register in renderSection Method**:
```javascript
const renderers = {
    'new-type': this.renderNewType.bind(this),
    // ... existing renderers
};
```

#### Adding New Managers

1. **Create Manager Class**:
```javascript
class NewManager {
    constructor() {
        // Initialize
    }
    
    // Your methods
}
```

2. **Integrate with Application**:
```javascript
class Application {
    constructor() {
        this.newManager = new NewManager();
        // ... other managers
    }
}
```

## 🎨 Theming System

### CSS Custom Properties
The theme system uses CSS custom properties for easy customization:

```css
:root {
    --color-background: #ffffff;
    --color-text: #000000;
    --color-sidebar-background: #f8f9fa;
    /* ... more properties */
}

[data-theme="dark"] {
    --color-background: #1a1a1a;
    --color-text: #ffffff;
    --color-sidebar-background: #2d2d2d;
    /* ... dark theme overrides */
}
```

### Adding New Themes
1. Add theme variables to `:root`
2. Create theme variant in `[data-theme="theme-name"]`
3. Update `ThemeManager` to support the new theme

## 🔍 Search System

### Global Search Features
- **Real-time Search**: Instant results as you type
- **Multi-section Search**: Searches across all loaded content
- **Content Types**: Searches titles, content, and code
- **Keyboard Shortcut**: Ctrl+K to focus search
- **Result Highlighting**: Search terms highlighted in results

### Search Implementation
The search system automatically loads all sections when needed and provides comprehensive results across all content types.

## 🧪 Testing

### Manual Testing Checklist
- [ ] All sections load correctly
- [ ] Navigation works on all devices
- [ ] Search functionality works
- [ ] Theme switching works
- [ ] Content renders properly
- [ ] Error handling works
- [ ] Performance is acceptable
- [ ] Sidebar resizing works
- [ ] State persistence works

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🚀 Performance Optimization

### Current Optimizations
- **Lazy Loading**: Content loaded only when needed
- **Caching**: Config and content cached in memory
- **Minimal Dependencies**: Pure vanilla JavaScript
- **Efficient DOM Updates**: Minimal re-renders
- **State Persistence**: Local storage for user preferences

### Further Optimization Ideas
- **Service Worker**: For offline functionality
- **Content Preloading**: For frequently accessed content
- **Image Optimization**: WebP format for images
- **Code Splitting**: If moving to a build system

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch
3. **Follow** the architecture patterns
4. **Test** thoroughly
5. **Submit** a pull request

### Code Standards
- **ES6+**: Use modern JavaScript features
- **Class-based**: Follow the established architecture
- **Error Handling**: Always include proper error handling
- **Documentation**: Comment complex logic
- **Naming**: Use descriptive, consistent naming

### Content Guidelines
- **Educational Focus**: Keep content educational and practical
- **Robotics Context**: Include robotics examples where relevant
- **Progressive Difficulty**: Build from simple to complex
- **Interactive Elements**: Include exercises and examples
- **Consistent Format**: Follow established content structure

## 🎓 Educational Context

Created for comprehensive programming and robotics education, covering:

### Target Audiences
- **FTC Teams**: Learning Java for robot programming with OnBot Java and Android Studio
- **FRC Teams**: Professional robotics development with WPILib and command-based programming
- **Programming Students**: Java fundamentals with practical applications
- **Competitive Programmers**: Algorithm and data structure mastery
- **Educators**: Teaching programming with robotics and competitive contexts

### Learning Paths
- **Beginner**: Start with Java basics, progress through robotics applications
- **Intermediate**: Advanced programming concepts with real-world robotics scenarios
- **Advanced**: Competitive coding techniques and optimization strategies

Perfect for:
- Robotics teams learning programming fundamentals
- Computer science students needing practical examples
- Educators teaching programming with real-world context
- Self-learners wanting comprehensive programming education
- Competitive programming enthusiasts building problem-solving skills

## 🔄 Migration Guide

### From Old Architecture
If migrating from the previous architecture:

1. **Content Files**: No changes needed - same JSON structure
2. **Configuration**: Update to new config structure if using custom sections
3. **Custom Code**: Update to use new manager classes
4. **Event Handlers**: Update to use new navigation system

### Breaking Changes
- Navigation system completely rewritten
- State management centralized
- Error handling improved
- Performance optimizations added
- Modular JavaScript architecture implemented

## 📞 Support

For questions, issues, or contributions:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Follow the contribution guidelines
4. Test thoroughly before submitting

## 📄 License & AI Content Disclosure

### AI-Generated Content
This project contains content that was generated or assisted by artificial intelligence (AI) systems. The educational content, code examples, and documentation were created with the assistance of AI tools. While AI was used in the creation process, the final content has been reviewed and curated for educational purposes.

### Copyright & Usage
- **Educational Use**: This content is provided for educational purposes only
- **No Warranty**: The content is provided "as is" without any warranties
- **Fair Use**: Users may use this content for personal learning and educational purposes
- **Attribution**: When using or referencing this content, please attribute to "SwyftNav"

### Legal Notice
This project does not claim copyright over AI-generated content. The content is intended for educational use and should be used in accordance with fair use principles. Users are responsible for ensuring their use complies with applicable laws and regulations.

### Contributing
When contributing to this project, please ensure that any new content you add is either:
1. Your original work
2. Properly licensed content
3. Content you have the right to use and distribute

For questions about licensing or usage, please contact the project maintainers.
