# Java Training Platform - Interactive Learning for Robotics & Programming

A comprehensive, interactive web-based learning platform for Java programming, robotics development, and competitive coding. Designed for FTC (FIRST Tech Challenge), FRC (FIRST Robotics Competition) teams, and programming enthusiasts.

## 🎯 Features

- **Multi-Section Learning**: Four comprehensive training tracks
- **Interactive Navigation**: Hierarchical content with collapsible groups
- **Robotics-Focused**: Real-world examples from FTC and FRC competitions
- **Competitive Coding**: Complete curriculum from beginner to LeetCode master
- **Modern UI**: Professional theme with dark/light mode toggle
- **Mobile Responsive**: Works seamlessly on all devices
- **Search Functionality**: Global search across all content with Ctrl+K shortcut
- **Exercise System**: Interactive practice problems with show/hide answers

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
- **FTC Basics**: Robot control, motors, sensors, game controllers
- **Autonomous Programming**: Basic and advanced autonomous, vision systems
- **Advanced FTC**: Teleop features, mechanisms, optimization, control systems
- **Development Environment**: Android Studio setup, FTC SDK deep dive

### 🏆 FRC-Specific Training
**Professional FRC robotics development**
- **FRC Basics**: WPILib framework, motor control, commands & subsystems
- **Advanced Features**: Command-based programming, PID control systems

### 🧮 Competitive Coding Training
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
git clone https://github.com/YOUR_USERNAME/java-training.git
cd java-training

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
- **Architecture**: Single-page application with dynamic content loading
- **Data**: JSON-based content management system with modular configs
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Theme**: Furo documentation theme adaptation
- **Icons**: Custom SVG icons and emoji

## 📁 Project Structure

```
java-training/
├── index.html                          # Main application entry point
├── styles.css                          # Main stylesheet with theme system
├── script.js                           # Core application logic
├── data/                               # Content organization
│   ├── config/                         # Configuration files
│   │   ├── config.json                 # Main navigation configuration
│   │   ├── homepage.json               # Home page content
│   │   ├── java-training-config.json   # Java section config
│   │   ├── ftc-specific-config.json    # FTC section config
│   │   ├── frc-specific-config.json    # FRC section config
│   │   └── competitive-training-config.json # Competitive section config
│   ├── java/                           # Java training content
│   │   ├── java-intro.json             # Java introduction
│   │   ├── java-printing.json          # Printing and output
│   │   ├── java-variables.json         # Variables and data types
│   │   └── ...                         # Additional Java topics
│   ├── ftc/                            # FTC training content
│   │   ├── ftc-intro.json              # FTC introduction
│   │   ├── ftc-basic-control.json      # Basic robot control
│   │   ├── ftc-advanced-motors.json    # Advanced motor control
│   │   └── ...                         # Additional FTC topics
│   ├── frc/                            # FRC training content
│   │   ├── frc-intro.json              # FRC introduction
│   │   ├── frc-wpilib.json             # WPILib framework
│   │   ├── frc-motors.json             # Motor control
│   │   └── ...                         # Additional FRC topics
│   └── comp/                           # Competitive coding content
│       ├── comp-intro.json             # Competitive coding introduction
│       ├── comp-problem-solving.json   # Problem-solving framework
│       ├── comp-arrays-strings.json    # Arrays and strings
│       └── ...                         # Additional competitive topics
├── media/                              # Images and icons
└── README.md                           # This file
```

## 🎨 Content Structure

### JSON Content Format
Each content file follows a structured format:
```json
{
  "id": "unique-identifier",
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
      "content": "public class Example {\n    // Code here\n}"
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

## 🎨 Customization

### Adding New Content
1. Create a new JSON file in the appropriate section folder (`data/java/`, `data/ftc/`, etc.)
2. Follow the existing content structure with sections array
3. Add the new item to the corresponding section config file
4. Use the naming convention: `[section-prefix]-[topic-name].json`

### Adding New Sections
1. Create a new config file in `data/config/`
2. Add the section to the main `config.json`
3. Create a content folder in `data/`
4. Update the frontend to handle the new section

### Theming
- Modify CSS custom properties in `styles.css`
- Color scheme defined in `:root` selector
- Dark mode variants in `[data-theme="dark"]`
- Theme toggle with sun/moon icons

## 🔍 Search Functionality

- **Global Search**: Search across all loaded content
- **Keyboard Shortcut**: Ctrl+K to focus search
- **Real-time Results**: Instant filtering as you type
- **Highlighted Matches**: Search terms highlighted in results
- **Section Organization**: Results grouped by section and topic

## 🤝 Contributing

This educational resource is designed for robotics teams, programming students, and educators.

### Content Guidelines
- Keep examples relevant to robotics and programming contexts
- Include practical, real-world scenarios
- Maintain consistent difficulty progression
- Add interactive exercises for each major concept
- Follow the established naming conventions

### Technical Guidelines
- Follow existing JSON structure for new content
- Test on multiple devices and browsers
- Ensure accessibility compliance
- Keep dependencies minimal (pure vanilla JS)
- Maintain the modular config structure

## 📄 License

This educational resource is provided under the MIT License. Free to use, modify, and distribute for educational purposes.

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
