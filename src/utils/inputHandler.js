/**
 * Input Handler Module
 * 
 * Manages all user input from both physical and virtual keyboards.
 * Implements the Command Pattern for clean separation of input handling.
 * 
 * Design Patterns:
 * - Command Pattern: Input actions are delegated to callback functions
 * - Observer Pattern: Callbacks can be updated dynamically
 * - Single Responsibility: Only handles input, not game logic
 * 
 * Features:
 * - Physical keyboard event listeners
 * - Virtual keyboard click handlers
 * - Input enable/disable control
 * - Event cleanup for memory management
 * 
 * Future Extensions:
 * - Add touch gesture support for mobile
 * - Add voice input handler
 * - Add international keyboard layouts
 * 
 * @module utils/inputHandler
 */

/**
 * InputHandler class
 * 
 * Centralized input management for consistent user experience.
 * Decouples input detection from game logic through callbacks.
 * 
 * Usage:
 * const handler = new InputHandler({
 *   onLetter: (letter) => gameState.addLetter(letter),
 *   onEnter: () => gameState.submitGuess(),
 *   onBackspace: () => gameState.deleteLetter()
 * });
 * handler.enable();
 */
export class InputHandler {
  /**
   * Creates an InputHandler instance
   * 
   * @param {Object} options - Configuration object with callbacks
   * @param {Function} options.onLetter - Called when a letter key is pressed
   * @param {Function} options.onEnter - Called when Enter is pressed
   * @param {Function} options.onBackspace - Called when Backspace is pressed
   * 
   * @example
   * const handler = new InputHandler({
   *   onLetter: (letter) => console.log('Letter:', letter),
   *   onEnter: () => console.log('Submit guess'),
   *   onBackspace: () => console.log('Delete letter')
   * });
   */
  constructor(options = {}) {
    // Callback functions - follow Command pattern
    this.onLetter = options.onLetter || (() => {});
    this.onEnter = options.onEnter || (() => {});
    this.onBackspace = options.onBackspace || (() => {});
    
    // Input state flag
    this.enabled = true;
    
    // Bind event handler to maintain 'this' context
    // Critical for proper event listener removal later
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }
  
  /**
   * Enables input handling
   * 
   * Attaches physical keyboard event listener.
   * Call this when game starts or resumes.
   * 
   * Time Complexity: O(1)
   * Side Effects: Adds DOM event listener
   */
  enable() {
    this.enabled = true;
    document.addEventListener('keydown', this._handleKeyDown);
  }
  
  /**
   * Disables input handling
   * 
   * Removes physical keyboard event listener.
   * Call this when game ends or during animations.
   * 
   * Time Complexity: O(1)
   * Side Effects: Removes DOM event listener
   */
  disable() {
    this.enabled = false;
    document.removeEventListener('keydown', this._handleKeyDown);
  }
  
  /**
   * Handles physical keyboard events
   * 
   * Processes keydown events and routes to appropriate callbacks.
   * Prevents default browser behavior for game keys.
   * 
   * Key mappings:
   * - A-Z: Letter input
   * - Enter: Submit guess
   * - Backspace: Delete letter
   * 
   * @param {KeyboardEvent} event - The keyboard event from browser
   * @private
   * 
   * Time Complexity: O(1)
   */
  _handleKeyDown(event) {
    // Guard clause: Ignore if disabled
    if (!this.enabled) return;
    
    // Normalize key to lowercase for consistent handling
    const key = event.key.toLowerCase();
    
    // Route to appropriate handler based on key type
    if (key === 'enter') {
      // Prevent form submission or other default behavior
      event.preventDefault();
      this.onEnter();
    } else if (key === 'backspace') {
      // Prevent browser back navigation
      event.preventDefault();
      this.onBackspace();
    } else if (/^[a-z]$/.test(key)) {
      // Single letter input (regex ensures only a-z)
      event.preventDefault();
      this.onLetter(key);
    }
    // All other keys are ignored (numbers, symbols, function keys, etc.)
  }
  
  /**
   * Handles virtual keyboard input
   * 
   * Called when user clicks on-screen keyboard keys.
   * Same routing logic as physical keyboard but without events.
   * 
   * @param {string} key - The key identifier ('a'-'z', 'enter', 'backspace')
   * 
   * Time Complexity: O(1)
   */
  handleVirtualInput(key) {
    // Guard clause: Ignore if disabled
    if (!this.enabled) return;
    
    // Route to appropriate handler
    if (key === 'enter') {
      this.onEnter();
    } else if (key === 'backspace') {
      this.onBackspace();
    } else {
      // Assume it's a letter
      this.onLetter(key);
    }
  }
  
  /**
   * Updates the callback functions
   * 
   * Allows dynamic reconfiguration of input handlers.
   * Useful for changing behavior during different game states.
   * 
   * @param {Object} callbacks - New callback functions
   * @param {Function} [callbacks.onLetter] - New letter callback
   * @param {Function} [callbacks.onEnter] - New enter callback
   * @param {Function} [callbacks.onBackspace] - New backspace callback
   * 
   * Time Complexity: O(1)
   */
  updateCallbacks(callbacks) {
    // Update only provided callbacks (partial updates allowed)
    if (callbacks.onLetter) this.onLetter = callbacks.onLetter;
    if (callbacks.onEnter) this.onEnter = callbacks.onEnter;
    if (callbacks.onBackspace) this.onBackspace = callbacks.onBackspace;
  }
  
  /**
   * Cleans up event listeners
   * 
   * Call this before destroying the InputHandler instance
   * to prevent memory leaks.
   * 
   * Time Complexity: O(1)
   * Side Effects: Removes DOM event listener
   */
  destroy() {
    this.disable();
  }
}
