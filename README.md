# Mantik - FIRST Programming Made Easy

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
**Professional FRC robotics development** (36 lessons, ~27 hours)

- **Environment Setup**: WPILib installation, Gradle, VS Code, Driver Station, Elastic dashboard, code organization
- **Hardware Vendors**: 
  - **CTRE**: Talon FX, CANcoder, Pigeon IMU, sensors
  - **REV**: SPARK MAX, NEO motors, sensors and encoders
  - **Vendor Generic**: Motor controller configuration, PID control, current limiting
- **Command-Based Programming**: WPILib command-based architecture, commands, subsystems, scheduler, triggers
- **Control Theory**: PID control, motion profiling (trapezoidal & exponential), feedforward, advanced control techniques
- **Pose Estimation**: Odometry, vision subsystems, AprilTag detection, sensor fusion, fused pose estimation
- **External Tools**: PathPlanner, YASS (YAGSL, YAMS, YALL, YAMG), AdvantageScope, AdvantageKit
- **Advanced Topics**: Simulation basics, unit testing, code organization

**Difficulty Distribution**: 5 beginner, 25 intermediate, 6 advanced lessons

### 🏆 Competitive Coding Training
**From beginner to LeetCode master**
- **Phase 1: Foundation**: Problem-solving framework, time complexity, Big O notation
- **Phase 2: Data Structures**: Arrays, linked lists, trees, graphs, heaps, hash tables
- **Phase 3: Core Algorithms**: Sorting, searching, two pointers, sliding window, binary search, dynamic programming, greedy algorithms
- **Phase 4: Advanced Techniques**: Advanced DP, backtracking, union-find, tries, segment trees, bit manipulation
- **Phase 5: LeetCode Mastery**: Problem patterns, optimization, interview prep, contest strategies, advanced problem solving

## 🚀 Quick Start

### Local Development

#### Using Node.js and npm (Recommended)

1. **Install Node.js**
   - Download and install Node.js from [nodejs.org](https://nodejs.org/).
   - This will also install npm (Node Package Manager).

2. **Install Dependencies**
   - Open a terminal in the project root directory.
   - Run:
     ```bash
     npm install
     ```
   - This will install any required dependencies (if `package.json` is present).

3. **Start the Local Server**
   - Run:
     ```bash
     npx http-server -p 8000 -c-1
     ```
   - If you prefer, you can install `http-server` globally:
     ```bash
     npm install -g http-server
     http-server -p 8000 -c-1
     ```
   - Alternatively, if a script is provided in `package.json`, you can use:
     ```bash
     npm start
     ```
     (Check `package.json` for available scripts.)

4. **Open the App**
   - Visit [http://localhost:8000/](http://localhost:8000/) in your browser.

#### Troubleshooting
- If you get a 'command not found' error for `http-server`, ensure you have installed it globally or use `npx http-server`.
- If port 8000 is in use, change the port number (e.g., `-p 8080`).
- For Windows users, use PowerShell or Command Prompt in the project directory.

#### Alternative: Python HTTP Server
If you have Python installed, you can also run:
```bash
python -m http.server 8000
```

#### Alternative: VS Code Live Server Extension
- Right-click `index.html` → "Open with Live Server"

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
- **Styling**: Custom CSS with CSS Grid and Flexbox, following SWYFT Robotics design system
- **Design System**: Minimal, flat design with Poppins typography (see `STYLING_GUIDE.md`)
- **Theme**: Light/dark theme support with CSS custom properties
- **Icons**: Custom SVG icons and emoji
- **No Build Process**: Pure vanilla JavaScript for simplicity

## 📁 Project Structure

```
mantik/
├── index.html                          # Main application entry point
├── css/                                # Stylesheets
│   └── styles.css                      # Main stylesheet with theme system
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
│   │   ├── frc-specific-config.json    # FRC section config (groups structure)
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
│   │   ├── environment-setup/          # Environment setup and tools
│   │   ├── hardware-vendors/           # Hardware vendor-specific content
│   │   │   ├── ctre/                   # CTRE hardware (Talon FX, sensors)
│   │   │   ├── rev/                    # REV hardware (SPARK MAX, NEO)
│   │   │   └── vendor-generic/         # Common motor controller topics
│   │   ├── command-based/              # Command-based programming
│   │   ├── control-theory/             # PID, motion profiling, feedforward
│   │   ├── pose-estimation/            # Odometry and vision-based pose estimation
│   │   ├── external-tools/             # PathPlanner, YASS, AdvantageScope, AdvantageKit
│   │   └── advanced-topics/            # Simulation, unit testing, code organization
│   └── comp/                           # Competitive coding content
│       ├── foundation/                 # Problem-solving foundation
│       ├── data-structures/            # Data structures
│       ├── algorithms/                 # Core algorithms
│       ├── strategies/                 # Problem-solving strategies
│       └── advanced/                   # Advanced techniques
├── media/                              # Images and icons
├── docs/                               # Documentation files
│   ├── DEPLOYMENT_CHECKLIST.md         # Deployment checklist
│   ├── NETLIFY_DEPLOYMENT.md           # Netlify deployment guide
│   └── STYLING_GUIDE.md                # Complete styling reference guide
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

#### 3. Groups Structure with Intro (FRC Curriculum)
```json
{
  "title": "Section Title",
  "description": "Section description",
  "intro": {
    "id": "section-intro",
    "label": "Section Overview",
    "file": "data/section/intro.json",
    "type": "overview"
  },
  "groups": [
    {
      "id": "group-id",
      "label": "Group Label",
      "description": "Group description",
      "icon": "⚙️",
      "items": [
        {
          "id": "item-id",
          "label": "Item Label",
          "file": "data/section/item.json",
          "difficulty": "beginner|intermediate|advanced",
          "duration": "30 min"
        }
      ]
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "totalLessons": 10,
    "estimatedDuration": "5 hours"
  }
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
      "type": "code-tabs",
      "title": "Code Tabs Example",
      "content": "Optional explanation text above the tabs",
      "tabs": [
        {
          "label": "Option A",
          "code": "public class OptionA {\n    // Code for Option A\n}"
        },
        {
          "label": "Option B",
          "code": "public class OptionB {\n    // Code for Option B\n}"
        }
      ]
    },
    {
      "type": "table",
      "title": "Comparison Table",
      "headers": ["Feature", "Option A", "Option B"],
      "rows": [
        ["Speed", "Fast", "Slow"],
        ["Memory", "Low", "High"],
        ["Complexity", "Simple", "Complex"]
      ]
    },
    {
      "type": "exercise-box",
      "title": "Practice Exercise",
      "description": "Exercise description",
      "tasks": [
        "Task 1",
        "Task 2"
      ],
      "content": "// Example code",
      "answers": [
        {
          "task": "Task 1",
          "answer": "Answer explanation for task 1",
          "code": "// Solution code"
        }
      ]
    },
    {
      "type": "link-grid",
      "title": "Related Topics",
      "links": [
        {
          "label": "Related Topic",
          "url": "#section-id",
          "description": "Brief description"
        }
      ]
    }
  ]
}
```

### Supported Content Types

- `text`: Regular paragraphs with HTML formatting
- `code`: Syntax-highlighted code blocks with Java syntax highlighting and copy functionality
- `code-tabs`: Tabbed code examples showing multiple implementations (e.g., SPARK MAX vs Talon FX, PhotonVision vs Limelight vs WPILib)
- `rules-box`: Important rules and guidelines with structured formatting
- `exercise-box`: Interactive practice problems with show/hide answer functionality
- `list`: Key points and bullet lists (ordered and unordered)
- `emphasis-box`: Important information highlights (uses rules-box styling)
- `data-types-grid`: Interactive data type comparison cards
- `logical-operators`: Operator reference tables with logical and comparison operators
- `link-grid`: Navigation grid to related topics and documentation
- `table`: Structured data tables with headers and rows, supports hover effects

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
The theme system uses CSS custom properties for easy customization. The design follows the SWYFT Robotics minimal design system:

```css
:root {
    --color-background-primary: #ffffff;
    --color-foreground-primary: #232323;
    --color-sidebar-background: #ffffff;
    --font-stack: 'Poppins', sans-serif;
    /* ... more properties */
}

[data-theme="dark"] {
    --color-background-primary: #0f172a;
    --color-foreground-primary: #f8fafc;
    --color-sidebar-background: #1e293b;
    /* ... dark theme overrides */
}
```

### Design System
The website follows the SWYFT Robotics design system with:
- **Typography**: Poppins font family, 12px base size, uppercase headings
- **Colors**: Minimal color palette with `#232323` primary text, `#fafafa` backgrounds
- **Styling**: Flat design with no border radius, shadows, or gradients
- **Hover Effects**: Simple background color changes only (`#f8f8f8`)
- **Transitions**: Consistent `all ease 0.3s` transitions

See `STYLING_GUIDE.md` for complete styling reference.

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
- **Attribution**: When using or referencing this content, please attribute to "Mantik"

### Legal Notice
This project does not claim copyright over AI-generated content. The content is intended for educational use and should be used in accordance with fair use principles. Users are responsible for ensuring their use complies with applicable laws and regulations.

### Contributing
When contributing to this project, please ensure that any new content you add is either:
1. Your original work
2. Properly licensed content
3. Content you have the right to use and distribute

For questions about licensing or usage, please contact the project maintainers.
