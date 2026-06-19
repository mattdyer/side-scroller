# Agent Instructions
- Try to avoid thinking in circles
  1. Action is better than a lot of thinking
  2. Make changes run tests
  3. Do this over and over until the project is done

## Core Workflow
- **Testing First**: Write and run tests before writing any code (follow the red/green loop).
- **Testing Command**: `npm test` (uses Vitest).
- **Test Loop**: 
  1. Write a failing test.
  2. Write code that passes the test.
  3. Run `npm test` to verify.

## Development Context
- **Tech Stack**: JavaScript (ES Modules), Vitest for testing.
- **Game Engine**: Custom physics/rendering in `game.js`.
- **Level System**: JSON-based level loading (e.g., `assets/levels/level1.json`).
- **Key Mechanics**:
  - Jumping on enemies kills them and increases score.
  - Collision with enemies from the side triggers `gameover`.
  - Gravity and ground level logic are defined in `config` in `game.js`.

## Implementation Details
- **Architecture**: Aim for an Entity Component System (ECS) pattern for expansion.
- **Physics**: Decouple collision logic from rendering to enable headless testing.
'
