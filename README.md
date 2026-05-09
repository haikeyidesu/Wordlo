# Wordlo - Development

A refactored Wordle clone built with modern JavaScript, following software design principles and best practices.

## Project Structure

```
/workspace
├── index.html              # Main HTML entry point
├── index.js                # Main application entry (Game facade)
├── style.css               # Styles
├── package.json            # Project configuration
└── src/
    ├── core/               # Core game logic
    │   ├── constants.js    # Game constants and enums
    │   ├── evaluator.js    # Word evaluation algorithm
    │   └── gameState.js    # Game state management
    ├── data/               # Data layer
    │   └── words.js        # Word list and validator
    ├── ui/                 # UI rendering components
    │   ├── boardRenderer.js     # Board rendering
    │   ├── keyboardRenderer.js  # Keyboard rendering
    │   └── messageManager.js    # Message display
    └── utils/              # Utility classes
        ├── inputHandler.js      # Input management
        └── wordSelector.js      # Word selection logic
```

## Design Principles Applied

### 1. **Single Responsibility Principle (SRP)**
Each class has one responsibility:
- `BoardRenderer` - Only handles board DOM operations
- `KeyboardRenderer` - Only handles keyboard DOM operations
- `GameState` - Only manages game state logic
- `WordEvaluator` - Only evaluates guesses

### 2. **Separation of Concerns**
- **Data Layer** (`src/data/`): Word lists and validation
- **Core Logic** (`src/core/`): Game rules and state
- **UI Layer** (`src/ui/`): Rendering and display
- **Utilities** (`src/utils/`): Helper functions

### 3. **Encapsulation**
- Game state is encapsulated in `GameState` class
- Internal methods marked as private (convention with `_` prefix)
- Public API through well-defined methods

### 4. **Dependency Injection**
- Components receive dependencies via constructor
- Easy to mock for testing
- Loose coupling between modules

### 5. **Facade Pattern**
- `Game` class provides simplified interface
- Hides complexity of component interactions

## Data Structures & Algorithms

### 1. **Set for O(1) Word Validation**
```javascript
const wordSet = new Set(wordList);
// O(1) lookup vs O(n) with array.includes()
```

### 2. **Map for Letter State Tracking**
```javascript
const keyboardState = new Map();
// Efficient key-value storage for letter states
```

### 3. **Two-Pass Evaluation Algorithm**
```javascript
// Pass 1: Mark correct letters (green)
// Pass 2: Mark present letters (yellow)
// Handles duplicate letters correctly
```

### 4. **Fisher-Yates Shuffle**
Used in `WordSelector` for random word selection.

### 5. **Seeded Random Number Generator**
Linear Congruential Generator (LCG) for reproducible randomness
(enables future daily challenges feature).

## Future Development Ready

### Animations
- Animation timing centralized in `GameConfig`
- `BoardRenderer.revealRow()` returns Promise for async handling
- Easy to extend with CSS transitions or Web Animations API

### Multiplayer Mode
- `WordSelector.selectForDate()` enables daily challenges
- Seeded random allows synchronized word selection
- `GameState` can be serialized for network sync
- Clean separation makes adding WebSocket layer straightforward

### Additional Features Easily Addable
- Statistics tracking (add `StatsManager` in `src/utils/`)
- Hard mode (extend `GameState` with validation rules)
- Custom word lists (inject via `WordSelector.setWordList()`)
- Themes (add `ThemeManager` in `src/ui/`)

## Usage

```bash
# Start local server
npx http-server .

# Or with Python
python -m http.server 8000
```

## Testing (Future)

The modular structure enables easy unit testing:

```javascript
// Example test structure
import { WordEvaluator } from './src/core/evaluator.js';
import { GameState } from './src/core/gameState.js';

describe('WordEvaluator', () => {
  it('should mark correct letters', () => {
    // Test code here
  });
});
```

## Code Quality

- **JSDoc comments** for all public methods
- **ES6 modules** for clean imports/exports
- **Const/Let** instead of var
- **Arrow functions** for callbacks
- **Async/Await** for asynchronous operations
- **Error handling** with meaningful messages
