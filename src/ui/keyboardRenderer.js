/**
 * Keyboard Renderer Module
 * 
 * Handles rendering and state management of the virtual keyboard.
 * Implements observer pattern principles for efficient state updates.
 * 
 * Design Patterns:
 * - Observer Pattern: Key elements observe state changes
 * - Singleton-like: One instance per game session
 * 
 * Features:
 * - Dynamic keyboard generation from layout config
 * - State-based key coloring (correct, present, absent)
 * - Click event delegation for virtual input
 * - State priority system (never downgrades key states)
 * 
 * Performance:
 * - O(1) key element lookup via Map
 * - Batch updates from keyboard state map
 * 
 * Future Extensions:
 * - Add haptic feedback on mobile
 * - Add keyboard shortcuts tooltip
 * - Support alternative layouts (AZERTY, QWERTZ, Dvorak)
 * 
 * @module ui/keyboardRenderer
 */

import { KEYBOARD_LAYOUT } from '../core/constants.js';

/**
 * KeyboardRenderer class
 * 
 * Manages the virtual keyboard DOM representation and state visualization.
 * Maintains a Map of key elements for O(1) access during updates.
 * 
 * State Priority System:
 * - CORRECT (green) > PRESENT (yellow) > ABSENT (gray)
 * - Once a key reaches a state, it can only upgrade, never downgrade
 * 
 * @example
 * const keyboard = new KeyboardRenderer(keyboardContainer);
 * keyboard.render();
 * keyboard.updateKeyState('a', 'correct');
 */
export class KeyboardRenderer {
  /**
   * Creates a KeyboardRenderer instance
   * 
   * @param {HTMLElement} containerElement - DOM element to render keyboard into
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1) - Map is initialized empty
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.keyElements = new Map(); // Maps letters to their DOM elements for O(1) access
  }
  
  /**
   * Renders the virtual keyboard based on the layout configuration
   * 
   * Creates the complete keyboard structure:
   * - Multiple rows as defined in KEYBOARD_LAYOUT
   * - Special handling for 'enter' and 'backspace' keys
   * - Stores references to letter keys for efficient updates
   * 
   * Time Complexity: O(k) where k is total number of keys
   * Space Complexity: O(l) where l is number of letter keys (stored in Map)
   */
  render() {
    if (!this.container) {
      console.warn('Keyboard container not found');
      return;
    }
    
    this.container.innerHTML = '';
    this.keyElements.clear();
    
    // Build keyboard row by row from configuration
    KEYBOARD_LAYOUT.forEach((rowKeys, rowIndex) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';
      rowDiv.dataset.row = rowIndex;
      
      // Create each key in the row
      rowKeys.forEach(key => {
        const keyDiv = this._createKeyElement(key);
        rowDiv.appendChild(keyDiv);
      });
      
      this.container.appendChild(rowDiv);
    });
  }
  
  /**
   * Creates an individual key element
   * 
   * Handles special formatting for 'enter' and 'backspace' keys.
   * Stores letter key references in Map for O(1) state updates.
   * 
   * @param {string} key - The key identifier ('a'-'z', 'enter', 'backspace')
   * @returns {HTMLElement} The created key DOM element
   * @private
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1) per key
   */
  _createKeyElement(key) {
    const keyDiv = document.createElement('div');
    keyDiv.className = 'key';
    keyDiv.dataset.key = key;
    
    // Handle special keys with custom display and sizing
    if (key === 'backspace') {
      keyDiv.textContent = '⌫';  // Unicode backspace symbol
      keyDiv.classList.add('large');  // Wider key for better UX
    } else if (key === 'enter') {
      keyDiv.textContent = 'ENTER';
      keyDiv.classList.add('large');  // Wider key for better UX
    } else {
      // Letter keys: uppercase display
      keyDiv.textContent = key.toUpperCase();
    }
    
    // Store reference for O(1) access during state updates
    // Only letter keys need state tracking (not enter/backspace)
    if (key !== 'enter' && key !== 'backspace') {
      this.keyElements.set(key, keyDiv);
    }
    
    return keyDiv;
  }
  
  /**
   * Updates a key's visual state based on evaluation
   * 
   * Implements state priority system:
   * - CORRECT (green) > PRESENT (yellow) > ABSENT (gray)
   * - Never downgrades: once green, always green
   * 
   * @param {string} key - The letter key to update
   * @param {LetterState} state - The state to apply ('correct', 'present', 'absent')
   * 
   * Time Complexity: O(1) - Map lookup and comparison
   * Space Complexity: O(1)
   */
  updateKeyState(key, state) {
    const keyElement = this.keyElements.get(key.toLowerCase());
    if (!keyElement) return;
    
    const currentState = keyElement.dataset.state;
    
    // Apply state with priority logic (never downgrade)
    // CORRECT > PRESENT > ABSENT
    if (state === 'correct') {
      keyElement.dataset.state = 'correct';
    } else if (state === 'present' && currentState !== 'correct') {
      keyElement.dataset.state = 'present';
    } else if (state === 'absent' && currentState !== 'correct' && currentState !== 'present') {
      keyElement.dataset.state = 'absent';
    }
  }
  
  /**
   * Updates multiple keys from a keyboard state map
   * 
   * Batch update method for efficiency when restoring game state.
   * Iterates through map and applies individual updates.
   * 
   * @param {Map<string, LetterState>} keyboardState - Map of letter to state
   * 
   * Time Complexity: O(k) where k is number of unique letters in state map
   * Space Complexity: O(1)
   */
  updateFromStateMap(keyboardState) {
    keyboardState.forEach((state, letter) => {
      this.updateKeyState(letter, state);
    });
  }
  
  /**
   * Resets all keys to default (uncolored) state
   * 
   * Clears state from all letter keys.
   * Called when starting a new game.
   * 
   * Time Complexity: O(k) where k is number of letter keys
   * Space Complexity: O(1)
   */
  reset() {
    this.keyElements.forEach(keyElement => {
      delete keyElement.dataset.state;
    });
  }
  
  /**
   * Gets the DOM element for a specific key
   * 
   * @param {string} key - The key identifier
   * @returns {HTMLElement|null} The key element or null if not found
   * 
   * Time Complexity: O(1) - Map lookup
   * Space Complexity: O(1)
   */
  getKeyElement(key) {
    return this.keyElements.get(key.toLowerCase()) || null;
  }
  
  /**
   * Adds click event listeners to all keyboard keys
   * 
   * Sets up event delegation for virtual keyboard input.
   * Calls callback with key identifier when any key is clicked.
   * 
   * @param {Function} callback - Function(key) called on key click
   * 
   * Time Complexity: O(k) where k is total number of keys
   * Space Complexity: O(1)
   */
  addClickListeners(callback) {
    // Add listeners to letter keys
    this.keyElements.forEach((keyElement, key) => {
      keyElement.addEventListener('click', () => callback(key));
    });
    
    // Add listeners to special keys (enter and backspace)
    const enterKey = this.container.querySelector('[data-key="enter"]');
    const backspaceKey = this.container.querySelector('[data-key="backspace"]');
    
    if (enterKey) {
      enterKey.addEventListener('click', () => callback('enter'));
    }
    if (backspaceKey) {
      backspaceKey.addEventListener('click', () => callback('backspace'));
    }
  }
}
