# FRCCodeLab - Interactive Learning Platform

A comprehensive, interactive web-based learning platform for Java programming fundamentals, specifically designed for FRC (FIRST Robotics Competition) robotics teams.

## 🎯 Features

- **Interactive Learning**: Tabbed navigation with hierarchical content organization
- **Robotics-Focused**: All examples use FRC robotics scenarios and contexts
- **Comprehensive Coverage**: 15+ topics from basic syntax to advanced OOP concepts
- **Modern UI**: Professional Furo-inspired theme with dark/light mode toggle
- **Mobile Responsive**: Works seamlessly on all devices
- **Exercise System**: Interactive practice problems with show/hide answers

## 📚 Content Structure

### Java Basics
- Printing and Output
- Variables and Data Types
- Mathematical Calculations
- Arrays and Collections

### Programming Logic
- Conditional Statements
- Methods and Functions
- Control Structures
- Exception Handling (Try-Catch)

### Loops
- While Loops
- For Loops
- Loop Control (break/continue)
- Best Practices

### Object-Oriented Programming
- Classes and Objects
- Object References and Memory
- Method and Constructor Overloading

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/java-overview.git
cd java-overview

# Start local server (choose one):

# Option 1: Python (built-in)
python3 -m http.server 8001

# Option 2: Node.js (recommended)
npm install -g http-server
http-server -p 8001 -c-1

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then visit: `http://localhost:8001/java overview/`

### Production Deployment

#### GitHub Pages (Recommended)
1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → "main" → "/ (root)"
4. Your site will be available at: `https://YOUR_USERNAME.github.io/REPO_NAME/java overview/`

#### Netlify
1. Visit [netlify.com](https://netlify.com)
2. Drag the `java overview` folder to deploy
3. Get instant URL with optional custom domain

## 🛠 Technical Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Architecture**: Single-page application with dynamic content loading
- **Data**: JSON-based content management system
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Theme**: Furo documentation theme adaptation
- **Icons**: Custom SVG icons and emoji

## 📁 Project Structure

```
java overview/
├── index.html              # Main application entry point
├── styles.css             # Main stylesheet with theme system
├── script.js              # Core application logic
├── data/                  # Content JSON files
│   ├── config.json        # Navigation configuration
│   ├── printing.json      # Printing and output content
│   ├── variables.json     # Variables and data types
│   ├── methods.json       # Methods and functions
│   └── ...               # Additional topic files
└── README.md             # This file
```

## 🎨 Customization

### Adding New Content
1. Create a new JSON file in the `data/` directory
2. Follow the existing content structure with sections array
3. Add the new tab to `data/config.json`
4. Content types supported:
   - `text`: Regular paragraphs
   - `code`: Syntax-highlighted code blocks
   - `rules-box`: Important rules and guidelines
   - `exercise-box`: Interactive practice problems
   - `list`: Key points
   - `emphasis-box`: Important information

### Theming
- Modify CSS custom properties in `styles.css`
- Color scheme defined in `:root` selector
- Dark mode variants in `[data-theme="dark"]`

## 🤝 Contributing

This educational resource is designed for FRC robotics teams and programming educators.

### Content Guidelines
- Keep examples relevant to robotics and FRC competition
- Include practical, real-world scenarios
- Maintain consistent difficulty progression
- Add interactive exercises for each major concept

### Technical Guidelines
- Follow existing JSON structure for new content
- Test on multiple devices and browsers
- Ensure accessibility compliance
- Keep dependencies minimal (pure vanilla JS)

## 📄 License

This educational resource is provided under the MIT License. Free to use, modify, and distribute for educational purposes.

## 🎓 Educational Context

Created for FRC (FIRST Robotics Competition) robotics teams learning Java programming. Content follows University of Helsinki's Java Programming MOOC methodology while maintaining practical robotics applications throughout.

Perfect for:
- FRC and FTC teams learning Java for robot programming
- Computer science students needing practical examples
- Educators teaching programming with robotics context
- Self-learners wanting interactive programming tutorials
