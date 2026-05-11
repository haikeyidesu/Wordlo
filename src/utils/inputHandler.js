/**
 * InputHandler class
 * Manages keyboard input from both physical and virtual keyboards
 * Uses the Command pattern for handling input actions
 */
export class InputHandler {
  constructor(options = {}) {
    this.onLetter = options.onLetter || (() => {});
    this.onEnter = options.onEnter || (() => {});
    this.onBackspace = options.onBackspace || (() => {});
    this.enabled = true;
    
    // Bind event handlers
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }
  
  /**
   * Enables input handling
   */
  enable() {
    this.enabled = true;
    document.addEventListener('keydown', this._handleKeyDown);
  }
  
  /**
   * Disables input handling
   */
  disable() {
    this.enabled = false;
    document.removeEventListener('keydown', this._handleKeyDown);
  }
  
  /**
   * Handles physical keyboard events
   * @param {KeyboardEvent} event - The keyboard event
   * @private
   */
  _handleKeyDown(event) {
    if (!this.enabled) return;
    
    const key = event.key.toLowerCase();
    
    if (key === 'enter') {
      event.preventDefault();
      this.onEnter();
    } else if (key === 'backspace') {
      event.preventDefault();
      this.onBackspace();
    } else if (/^[a-z]$/.test(key)) {
      event.preventDefault();
      this.onLetter(key);
    }
  }
  
  /**
   * Handles virtual keyboard input
   * @param {string} key - The key that was clicked
   */
  handleVirtualInput(key) {
    if (!this.enabled) return;
    
    if (key === 'enter') {
      this.onEnter();
    } else if (key === 'backspace') {
      this.onBackspace();
    } else {
      this.onLetter(key);
    }
  }
  
  /**
   * Updates the callback functions
   * @param {Object} callbacks - New callback functions
   */
  updateCallbacks(callbacks) {
    if (callbacks.onLetter) this.onLetter = callbacks.onLetter;
    if (callbacks.onEnter) this.onEnter = callbacks.onEnter;
    if (callbacks.onBackspace) this.onBackspace = callbacks.onBackspace;
  }
  
  /**
   * Cleans up event listeners
   */
  destroy() {
    this.disable();
  }
}
