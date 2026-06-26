# Game Expansion Plan: Pixel Zombie Side-Scroller

## Phase 1: Core Engine & Architecture Refactor
- [x] Setup Code Linting / Static checking
- [x] **Unit Testing**:
    - [x] Setup **Vitest** or **Jest** in the repository.
    - [x] Write tests for:
        - All code written for the game
        - Player movement physics.
        - Enemy collision/death logic.
        - Power-up duration and effect logic.
    - [X] **Headless Browser Testing**:
        - [X] Setup **Playwright**.
           - [X] Create automation scripts to:
          - Verify level transitions.
          - Simulate "Jump on Zombie" action to verify score increase.
          - Verify "Fall in Pit" triggers Game Over.
- [x] **Level Loading System**: Implement a JSON-based level loader to support 10+ distinct level configurations.
- [X] **Physics Engine Decoupling**: Separate collision logic from rendering to allow for headless testing.
- [x] **Entity Component System (ECS)**: Refactor Player, Zombie, and Power-ups into a common `Entity` class for easier expansion.
- [x] **Collision Expansion**: Add detection for "Pits" (falling out of bounds) and "Spikes" (instant damage).


## Phase 2: Environment, Level Design, General Game Setup
- [x] **Level Schema Definition**: Define a structure for platforms, gaps, and hazards.
- [ ] **Obstacle Implementation**:
    - [x] **Pits**: Trigger `gameover` state when player Y-coordinate exceeds ground level.
    - [x] **Spikes**: Static hazards that trigger damage.
    - [x] **Moving Platforms**: Platforms that follow a predefined path.
- [x] **Level Progression**: Implement a level transition system (Level 1 $\rightarrow$ Level 2, etc.).
- [ ] **Create 10 levels for the game**
- [ ] **UI/UX**: Add Main Menu With Start Game Option, Level Selection, and High Score persistence.


## Phase 3: Enemy & Power-up Expansion
- [ ] **Advanced Enemy Types**:
    - [x] **Flyer**: Enemies that hover and move vertically.
    - [x] **Ranged Zombie**: Enemies that fire projectiles.
- [ ] **Power-up System**:
    - [x] **Speed Boost**: Temporary increase to `moveSpeed`.
    - [x] **Shield**: Temporary immunity to enemy collisions.
    - [x] **Double Jump**: Ability to jump once more mid-air.


## Phase 4: The Grand Finale (Boss Fight)
- [x] **Boss Entity**: A large, multi-phase entity with a health bar.
- [ ] **Boss Patterns**: Implement phases (e.g., Prime 1: Melee, Phase 2: Projectiles).
- [x] **Victory Condition**: Final level completion logic.


## Phase 5: Polish & Content
- [ ] **Asset Generation**: Generate all pixel art for 10 levels' worth of variety.
- [ ] **Audio Integration**: Implement SFX for jumping, hitting enemies, and power-ups.
