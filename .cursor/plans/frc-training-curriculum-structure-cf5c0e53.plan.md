<!-- cf5c0e53-1ce0-469f-8730-b720224754c3 6c6bd004-baa2-4c79-b2ef-4d2300de2324 -->
# Command-Based Programming Lessons - Detailed Plan

## 1. command-based-intro.json

**Learning Objectives:**
- Understand what command-based programming is and why it's used
- Identify the core components (Commands, Subsystems, Scheduler)
- Understand the benefits of command-based architecture
- Know when to use command-based vs other programming patterns
- Understand the command lifecycle

**Content Structure:**
- **Introduction to Command-Based Programming**: What it is, why WPILib uses it, benefits
- **Command-Based Architecture Benefits**: Rules-box of advantages
- **Core Components**:
  - Commands (discrete actions)
  - Subsystems (robot hardware abstractions)
  - Command Scheduler (execution manager)
  - Robot Container (organization structure)
- **Command Lifecycle**: initialize(), execute(), isFinished(), end()
- **Command-Based vs Other Patterns**: Comparison with iterative/timed robot, advantages
- **When to Use Command-Based**: Use cases and scenarios
- **WPILib Command-Based Structure**: Package organization, naming conventions
- **Documentation Resources**: Links to WPILib command-based documentation

**Code Examples:**
- Simple command example (basic structure)
- Simple subsystem example
- Command lifecycle demonstration
- Comparison: iterative robot vs command-based robot

**Key Concepts:**
- Command-based architecture
- Separation of concerns
- Modularity and reusability
- Command lifecycle

---

## 2. subsystem-design.json

**Learning Objectives:**
- Design and implement subsystems properly
- Understand subsystem responsibilities
- Create hardware abstractions
- Implement subsystem methods for commands
- Understand subsystem state management

**Content Structure:**
- **Introduction to Subsystems**: What subsystems are, their role
- **Subsystem Design Principles**: Rules-box of design guidelines
- **Subsystem Responsibilities**:
  - Hardware abstraction
  - State management
  - Safety features
  - Encapsulation
- **Creating Subsystems**: Extending SubsystemBase, constructor patterns
- **Hardware Initialization**: Creating hardware objects, configuration
- **Subsystem Methods**: Public methods for commands to use
- **State Management**: Tracking subsystem state, position, velocity
- **Safety Features**: Default commands, safety limits
- **Subsystem Examples**: Drivetrain, arm, elevator, intake examples
- **Subsystem Best Practices**: Rules-box with tips
- **Common Subsystem Patterns**: Singleton vs multiple instances, organization

**Code Examples:**
- Basic subsystem structure (Drivetrain example)
- Subsystem with hardware (Arm with motor and encoder)
- Subsystem with state management (Elevator with position tracking)
- Multiple subsystem example (complete robot)

**Key Concepts:**
- Hardware abstraction
- Encapsulation
- State management
- Subsystem design patterns

---

## 3. command-creation.json

**Learning Objectives:**
- Create commands from scratch
- Understand command lifecycle methods
- Implement command requirements
- Handle command initialization and cleanup
- Create different types of commands (instant, timed, conditional)

**Content Structure:**
- **Introduction to Commands**: What commands are, their purpose
- **Command Structure**: Rules-box of essential components
- **Command Lifecycle Methods**:
  - initialize() - setup when command starts
  - execute() - called repeatedly while active
  - isFinished() - determines when command completes
  - end(boolean interrupted) - cleanup when command ends
- **Command Requirements**: addRequirements(), subsystem ownership
- **Types of Commands**:
  - Instant commands (complete immediately)
  - Timed commands (run for duration)
  - Conditional commands (complete based on condition)
  - Continuous commands (run until interrupted)
- **Command Parameters**: Passing data to commands, constructors
- **Command Examples**: Drive forward, move arm, intake game piece
- **Command Best Practices**: Rules-box with tips
- **Troubleshooting Command Issues**: Common problems and solutions

**Code Examples:**
- Basic command structure (DriveForwardCommand)
- Timed command (DriveForTime)
- Conditional command (MoveArmToPosition)
- Instant command (ToggleIntake)
- Command with parameters

**Key Concepts:**
- Command lifecycle
- Command requirements
- Command types
- Command patterns

---

## 4. command-scheduler.json

**Learning Objectives:**
- Understand how the command scheduler works
- Know when commands are scheduled and executed
- Understand command interruption and requirements
- Handle command conflicts and priorities
- Monitor scheduler state

**Content Structure:**
- **Introduction to Command Scheduler**: What it is, its role
- **Scheduler Responsibilities**: Rules-box of scheduler functions
- **How Scheduling Works**:
  - Command scheduling process
  - Execution order
  - Update cycle (20ms)
- **Command Execution**:
  - initialize() called once
  - execute() called repeatedly
  - isFinished() checked each cycle
  - end() called when finished or interrupted
- **Command Requirements and Interruption**:
  - Subsystem ownership
  - Interrupting commands
  - Requirement conflicts
- **Scheduler Methods**: schedule(), cancel(), cancelAll()
- **Monitoring Scheduler**: Getting active commands, debugging
- **Scheduler Best Practices**: Rules-box with tips
- **Troubleshooting Scheduler Issues**: Common problems and solutions

**Code Examples:**
- Scheduling commands manually
- Command interruption example
- Requirement conflict handling
- Monitoring active commands
- Scheduler debugging

**Key Concepts:**
- Command scheduling
- Execution cycle
- Command interruption
- Subsystem ownership

---

## 5. command-groups.json

**Learning Objectives:**
- Create sequential command groups
- Create parallel command groups
- Combine sequential and parallel groups
- Use command decorators
- Build complex autonomous routines

**Content Structure:**
- **Introduction to Command Groups**: What they are, why use them
- **Command Group Types**: Rules-box of group types
- **Sequential Command Groups**:
  - Commands execute one after another
  - Each command must finish before next starts
  - Use cases (autonomous routines)
- **Parallel Command Groups**:
  - Commands execute simultaneously
  - All commands run at same time
  - Use cases (multiple mechanisms)
- **Parallel Race Groups**:
  - Commands run in parallel
  - First to finish ends the group
  - Use cases (timeout scenarios)
- **Parallel Deadline Groups**:
  - Commands run in parallel
  - Group ends when deadline command finishes
  - Use cases (coordinated actions)
- **Nested Command Groups**: Groups within groups
- **Command Decorators**: withTimeout(), withInterrupt(), repeatedly()
- **Command Group Examples**: Autonomous routine, complex mechanism control
- **Command Group Best Practices**: Rules-box with tips
- **Troubleshooting Command Groups**: Common problems and solutions

**Code Examples:**
- Sequential command group (autonomous routine)
- Parallel command group (multiple mechanisms)
- Parallel race group (with timeout)
- Nested command groups
- Command decorators usage

**Key Concepts:**
- Sequential execution
- Parallel execution
- Command composition
- Autonomous routines

---

## 6. default-commands.json

**Learning Objectives:**
- Understand what default commands are
- Set default commands for subsystems
- Use default commands for teleop control
- Handle default command conflicts
- Design effective default commands

**Content Structure:**
- **Introduction to Default Commands**: What they are, their purpose
- **Default Command Benefits**: Rules-box of advantages
- **When Default Commands Run**:
  - When no other command requires the subsystem
  - Continuously during teleop
  - Automatic execution
- **Setting Default Commands**: setDefaultCommand() method
- **Default Command Design**:
  - Should run continuously
  - Should handle user input
  - Should be interruptible
- **Default Command Examples**: 
  - Drivetrain default (arcade drive)
  - Intake default (manual control)
  - Arm default (hold position)
- **Default Command Conflicts**: Handling when command requires subsystem
- **Default Command Best Practices**: Rules-box with tips
- **Troubleshooting Default Commands**: Common problems and solutions

**Code Examples:**
- Setting default command (drivetrain)
- Default command implementation (ArcadeDriveCommand)
- Multiple default commands (different subsystems)
- Default command with user input

**Key Concepts:**
- Default commands
- Continuous execution
- Subsystem ownership
- Teleop control

---

## 7. trigger-bindings.json

**Learning Objectives:**
- Use triggers to bind commands to inputs
- Create button bindings for commands
- Use trigger combinations
- Handle trigger events
- Organize trigger bindings

**Content Structure:**
- **Introduction to Triggers**: What they are, their purpose
- **Trigger Benefits**: Rules-box of advantages
- **Trigger Types**:
  - Button triggers (onTrue, onFalse, whileTrue, toggleOnTrue)
  - POV triggers (directional pad)
  - Axis triggers (analog inputs)
- **Creating Triggers**: From buttons, joysticks, other sources
- **Trigger Bindings**:
  - onTrue() - when button pressed
  - onFalse() - when button released
  - whileTrue() - while button held
  - toggleOnTrue() - toggle on press
- **Trigger Combinations**: and(), or(), negate()
- **Trigger Examples**: 
  - Button to command binding
  - Joystick trigger binding
  - POV hat binding
  - Complex trigger combinations
- **Organizing Triggers**: RobotContainer organization
- **Trigger Best Practices**: Rules-box with tips
- **Troubleshooting Triggers**: Common problems and solutions

**Code Examples:**
- Basic button trigger (onTrue)
- Multiple trigger types (whileTrue, toggleOnTrue)
- Trigger combinations (and, or)
- POV hat triggers
- Joystick axis triggers

**Key Concepts:**
- Trigger bindings
- Event-driven programming
- Input handling
- Command scheduling from inputs

---

## 8. robot-container.json

**Learning Objectives:**
- Understand the RobotContainer pattern
- Organize subsystems and commands
- Configure trigger bindings
- Set up default commands
- Structure robot code effectively

**Content Structure:**
- **Introduction to RobotContainer**: What it is, its purpose
- **RobotContainer Benefits**: Rules-box of advantages
- **RobotContainer Structure**:
  - Subsystem creation
  - Command creation
  - Trigger binding configuration
  - Default command setup
- **Creating RobotContainer**: Constructor pattern, organization
- **Subsystem Organization**: Creating and storing subsystems
- **Command Factory Methods**: Creating commands, parameterization
- **Trigger Configuration**: configureButtonBindings() method
- **Default Command Setup**: Setting default commands
- **RobotContainer Examples**: Complete robot container
- **RobotContainer Best Practices**: Rules-box with tips
- **Alternative Patterns**: When not to use RobotContainer

**Code Examples:**
- Basic RobotContainer structure
- RobotContainer with subsystems
- RobotContainer with trigger bindings
- Complete RobotContainer example
- RobotContainer organization patterns

**Key Concepts:**
- Code organization
- Dependency injection
- Configuration patterns
- Robot structure

---

---

## Implementation Notes

Each lesson should follow the standard JSON structure used in the existing FRC curriculum:
- Title and sections array
- Mix of text, code, rules-box, and link-grid content types
- Progressive difficulty from basic concepts to advanced usage
- Practical examples and code snippets using WPILib Java API
- Links to official WPILib documentation where appropriate
- Troubleshooting sections for common issues
- Best practices sections in rules-box format (9 or fewer items)

### Code Style Guidelines:
- Use WPILib Java API (edu.wpi.first.wpilibj2.command package)
- Follow WPILib coding conventions
- Include proper imports
- Use descriptive variable names
- Include comments for clarity
- Show both basic and advanced examples

### Documentation References:
- WPILib Command-Based Programming: https://docs.wpilib.org/en/stable/docs/software/commandbased/index.html
- Commands: https://docs.wpilib.org/en/stable/docs/software/commandbased/commands.html
- Subsystems: https://docs.wpilib.org/en/stable/docs/software/commandbased/subsystems.html
- Command Groups: https://docs.wpilib.org/en/stable/docs/software/commandbased/command-groups.html
- Trigger Bindings: https://docs.wpilib.org/en/stable/docs/software/commandbased/binding-commands-to-triggers.html

### To-dos:
- [ ] Create command-based-intro.json lesson covering command-based architecture and benefits
- [ ] Create subsystem-design.json lesson covering subsystem creation and design
- [ ] Create command-creation.json lesson covering command lifecycle and creation
- [ ] Create command-scheduler.json lesson covering scheduler operation and management
- [ ] Create command-groups.json lesson covering sequential and parallel groups
- [ ] Create default-commands.json lesson covering default command setup and usage
- [ ] Create trigger-bindings.json lesson covering trigger creation and binding
- [ ] Create robot-container.json lesson covering RobotContainer pattern and organization

### To-dos

- [ ] Create command-based-intro.json lesson covering command-based architecture, benefits, core components, and lifecycle
- [ ] Create subsystem-design.json lesson covering subsystem creation, hardware abstraction, state management, and design patterns
- [ ] Create command-creation.json lesson covering command lifecycle methods, requirements, and command types
- [ ] Create command-scheduler.json lesson covering scheduler operation, command execution, and interruption
- [ ] Create command-groups.json lesson covering sequential, parallel, race, and deadline groups
- [ ] Create default-commands.json lesson covering default command setup, usage, and conflicts
- [ ] Create trigger-bindings.json lesson covering trigger types, bindings, and combinations
- [ ] Create robot-container.json lesson covering RobotContainer pattern, organization, and structure
- [ ] Create command-requirements.json lesson covering requirements, subsystem ownership, and conflicts