<!-- cf5c0e53-1ce0-469f-8730-b720224754c3 4f4deb49-86d5-4d36-a545-4bc5af9b0fcd -->
# FRC Environment Setup Lessons - Detailed Plan

## 1. wpilib-setup.json

**Learning Objectives:**

- Understand what WPILib is and its role in FRC programming
- Successfully install WPILib and all required components
- Verify installation and understand the installed components
- Know how to update WPILib for new seasons

**Content Structure:**

- **Introduction to WPILib**: What WPILib is, why it's used, and its relationship to FRC
- **System Requirements**: Operating system requirements, Java version, disk space
- **Download and Installation**:
- Where to download the WPILib installer
- Step-by-step installation process
- Component selection (Java, WPILib libraries, VS Code, etc.)
- Installation paths and directory structure
- **Installed Components**:
- WPILib libraries and their purpose
- Java Development Kit (JDK)
- Gradle build system
- FRC utilities and tools
- **Verification Steps**: How to verify installation was successful
- **Updating WPILib**: How to check for and install updates
- **Troubleshooting**: Common installation issues and solutions

**Code Examples:**

- None (installation-focused lesson)

**Key Concepts:**

- WPILib versioning and season compatibility
- Installation directory structure
- Component dependencies

---

## 2. project-creation.json

**Learning Objectives:**

- Create a new FRC robot project using WPILib templates
- Understand the project structure and key files
- Configure team number and project settings
- Build and deploy a basic project to verify setup

**Content Structure:**

- **Project Templates**: Overview of available templates (TimedRobot, Command Robot, etc.)
- **Creating a New Project**:
- Using VS Code WPILib extension to create project
- Selecting project type and language
- Choosing project location
- Setting team number
- **Project Structure**:
- `src/main/java/` directory structure
- `build.gradle` file overview
- `settings.gradle` file
- `.wpilib/` configuration directory
- `vendordeps/` for third-party libraries
- **Key Files Explained**:
- Main robot class (Robot.java)
- RobotContainer (for command-based)
- Constants file
- Build configuration files
- **Building the Project**: Using Gradle to compile
- **Deploying to Robot**: Deploy process and verification
- **Project Configuration**: Understanding `.wpilib/wpilib_preferences.json`

**Code Examples:**

- Basic TimedRobot template structure
- Project directory tree visualization
- Example build.gradle file with comments

**Key Concepts:**

- Project lifecycle (create, build, deploy)
- Team number configuration
- Build system integration

---

## 3. vs-code-setup.json

**Learning Objectives:**

- Install and configure VS Code for FRC development
- Understand the WPILib VS Code extension features
- Navigate the VS Code interface for FRC development
- Use VS Code features effectively for robot programming

**Content Structure:**

- **Installing VS Code**: Download and installation steps
- **WPILib Extension Installation**:
- Installing from VS Code marketplace
- Extension features overview
- Extension settings and configuration
- **VS Code Workspace Setup**:
- Opening FRC projects
- Workspace configuration
- Multi-root workspaces for team projects
- **Key VS Code Features for FRC**:
- Command Palette and WPILib commands
- Integrated terminal for Gradle commands
- Code navigation and IntelliSense
- Git integration
- Debugging configuration
- **WPILib Extension Commands**:
- Create new project
- Deploy code
- Manage robot code
- Manage vendor dependencies
- **Build Tasks**: Understanding and using build tasks
- Build Robot Code
- Deploy Robot Code
- Clean Build
- **Debugging Setup**: Configuring debugger for robot code
- **Code Formatting**: Setting up Java formatter
- **Extensions Recommendations**: Useful VS Code extensions for Java/FRC

**Code Examples:**

- Example launch.json for debugging
- Example tasks.json for build tasks
- Workspace settings example

**Key Concepts:**

- IDE workflow for FRC development
- Extension-based development workflow
- Debugging robot code

---

## 4. gradle-build-system.json

**Learning Objectives:**

- Understand what Gradle is and why it's used in FRC
- Navigate and understand build.gradle files
- Use Gradle commands for building and deploying
- Manage dependencies and vendor libraries
- Troubleshoot common Gradle issues

**Content Structure:**

- **Introduction to Gradle**: What Gradle is, why FRC uses it
- **Gradle in FRC Projects**:
- Understanding the build system
- Gradle wrapper and version management
- **build.gradle File Structure**:
- Plugins section (WPILib, Java, etc.)
- Repositories (Maven Central, WPILib releases)
- Dependencies section
- WPILib version specification
- Source sets and project structure
- **Common Gradle Tasks**:
- `./gradlew build` - Compile project
- `./gradlew deploy` - Deploy to robot
- `./gradlew clean` - Clean build artifacts
- `./gradlew tasks` - List available tasks
- `./gradlew :dependencies` - View dependency tree
- **Managing Dependencies**:
- Adding WPILib dependencies
- Adding vendor dependencies (CTRE, REV, etc.)
- Using vendordeps folder
- Online vendordeps vs local vendordeps
- **Gradle Wrapper**: Understanding gradlew and gradle wrapper
- **Build Output**: Understanding build logs and errors
- **Troubleshooting**:
- Common build errors
- Dependency resolution issues
- Network/connectivity problems
- Cache issues

**Code Examples:**

- Example build.gradle with comments explaining each section
- Adding CTRE Phoenix dependency example
- Adding REV Robotics dependency example
- Custom Gradle task examples

**Key Concepts:**

- Dependency management
- Build lifecycle
- Gradle wrapper vs system Gradle

---

## 5. driver-station-setup.json

**Learning Objectives:**

- Install and configure FRC Driver Station
- Understand the Driver Station interface and features
- Configure team number and robot communication
- Use Driver Station for testing and competition
- Understand robot modes and state management

**Content Structure:**

- **Introduction to Driver Station**: Purpose and role in FRC
- **Installation**:
- Downloading Driver Station
- Installation process
- System requirements
- **Initial Configuration**:
- Setting team number
- Network configuration
- Radio configuration (if applicable)
- **Driver Station Interface**:
- Main window overview
- Tabs: Basic, Advanced, Logs, etc.
- Status indicators and their meanings
- Robot state indicators
- **Robot Modes**:
- Disabled mode
- Autonomous mode
- Teleoperated mode
- Test mode
- **Communication Setup**:
- Connecting to robot
- Network troubleshooting
- Radio configuration
- USB connection
- **Using Driver Station**:
- Starting/stopping robot code
- Switching between modes
- Viewing telemetry
- Reading logs
- **Advanced Features**:
- Camera streaming
- Joystick configuration
- Match timer
- FMS (Field Management System) integration
- **Troubleshooting**:
- Connection issues
- Network problems
- Robot not responding
- Code deployment issues

**Code Examples:**

- None (software usage lesson)

**Key Concepts:**

- Robot state machine
- Network communication
- Competition workflow

---

## 6. smart-dashboard-basics.json

**Learning Objectives:**

- Install and launch SmartDashboard
- Understand SmartDashboard widgets and capabilities
- Display robot data and sensor readings
- Create interactive controls
- Customize dashboard layouts

**Content Structure:**

- **Introduction to SmartDashboard**: What it is and why it's useful
- **Installation and Launch**:
- Installing SmartDashboard
- Launching the application
- Connecting to robot (team number configuration)
- **SmartDashboard Interface**:
- Main window overview
- Widget panel
- Layout management
- **Displaying Data**:
- Adding widgets (Number, String, Boolean, etc.)
- Displaying sensor values
- Displaying motor speeds
- Displaying robot state
- Updating data from robot code
- **Interactive Controls**:
- Adding buttons
- Adding sliders
- Adding text input fields
- Reading values in robot code
- **Widget Types**:
- Basic widgets (Number, String, Boolean)
- Advanced widgets (Graph, Field, etc.)
- Camera stream widget
- **Layout Management**:
- Arranging widgets
- Saving layouts
- Loading layouts
- Sharing layouts with team
- **Robot Code Integration**:
- Using SmartDashboard.put methods
- Using SmartDashboard.get methods
- Best practices for dashboard updates
- **Advanced Features**:
- Field widget for robot visualization
- Graph widget for data plotting
- Camera streaming
- **Troubleshooting**:
- Connection issues
- Widgets not updating
- Performance considerations

**Code Examples:**

- SmartDashboard.putNumber() examples
- SmartDashboard.putString() examples
- SmartDashboard.putBoolean() examples
- SmartDashboard.getNumber() examples
- SmartDashboard.getBoolean() examples
- Complete subsystem example with dashboard updates
- Example of reading button state from dashboard

**Key Concepts:**

- Telemetry and monitoring
- Human-robot interface
- Real-time data visualization
- Dashboard design best practices

---

## Implementation Notes

Each lesson should follow the standard JSON structure used in the existing FRC curriculum:

- Title and sections array
- Mix of text, code, rules-box, and list content types
- Progressive difficulty from basic concepts to advanced usage
- Practical examples and code snippets
- Links to official documentation where appropriate
- Troubleshooting sections for common issues

### To-dos

- [ ] Create wpilib-setup.json lesson covering installation, components, and verification
- [ ] Create project-creation.json lesson covering project templates, structure, and deployment
- [ ] Create vs-code-setup.json lesson covering VS Code installation, WPILib extension, and development workflow
- [ ] Create gradle-build-system.json lesson covering Gradle basics, build.gradle structure, and dependency management
- [ ] Create driver-station-setup.json lesson covering Driver Station installation, interface, and robot communication
- [ ] Create smart-dashboard-basics.json lesson covering SmartDashboard installation, widgets, and robot code integration