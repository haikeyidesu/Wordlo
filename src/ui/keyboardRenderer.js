import { KEYBOARD_LAYOUT } from '../core/constants.js';

/**
 * KeyboardRenderer class
 * Handles rendering and updating the virtual keyboard
 * Uses observer pattern principles for state updates
 */
export class KeyboardRenderer {
  constructor(containerElement) {
    this.container = containerElement;
    this.keyElements = new Map(); // Maps letters to their DOM elements
  }
  
  /**
   * Renders the keyboard based on the layout configuration
   */
  render() {
    if (!this.container) {
      console.warn('Keyboard container not found');
      return;
    }
    
    this.container.innerHTML = '';
    this.keyElements.clear();
    
    KEYBOARD_LAYOUT.forEach((rowKeys, rowIndex) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';
      rowDiv.dataset.row = rowIndex;
      
      rowKeys.forEach(key => {
        const keyDiv = this._createKeyElement(key);
        rowDiv.appendChild(keyDiv);
      });
      
      this.container.appendChild(rowDiv);
    });
  }
  
  /**
   * Creates a individual key element
   * @param {string} key - The key identifier
   * @returns {HTMLElement} The key DOM element
   * @private
   */
  _createKeyElement(key) {
    const keyDiv = document.createElement('div');
    keyDiv.className = 'key';
    keyDiv.dataset.key = key;
    
    // Handle special keys
    if (key === 'backspace') {
      keyDiv.textContent = '⌫';
      keyDiv.classList.add('large');
    } else if (key === 'enter') {
      keyDiv.textContent = 'ENTER';
      keyDiv.classList.add('large');
    } else {
      keyDiv.textContent = key.toUpperCase();
    }
    
    // Store reference for quick access
    if (key !== 'enter' && key !== 'backspace') {
      this.keyElements.set(key, keyDiv);
    }
    
    return keyDiv;
  }
  
  /**
   * Updates a key's visual state
   * @param {string} key - The key to update
   * @param {string} state - The state to apply (correct, present, absent)
   */
  updateKeyState(key, state) {
    const keyElement = this.keyElements.get(key.toLowerCase());
    if (!keyElement) {
      return;
    }
    
    const currentState = keyElement.dataset.state;
    
    // Priority: correct > present > absent
    // Don't downgrade states
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
   * @param {Map<string, string>} keyboardState - Map of letter to state
   */
  updateFromStateMap(keyboardState) {
    keyboardState.forEach((state, letter) => {
      this.updateKeyState(letter, state);
    });
  }
  
  /**
   * Resets all keys to default state
   */
  reset() {
    this.keyElements.forEach(keyElement => {
      delete keyElement.dataset.state;
    });
  }
  
  /**
   * Gets the DOM element for a specific key
   * @param {string} key - The key identifier
   * @returns {HTMLElement|null} The key element or null
   */
  getKeyElement(key) {
    return this.keyElements.get(key.toLowerCase()) || null;
  }
  
  /**
   * Adds click event listener to all keys
   * @param {Function} callback - Function to call when a key is clicked
   */
  addClickListeners(callback) {
    this.keyElements.forEach((keyElement, key) => {
      keyElement.addEventListener('click', () => callback(key));
    });
    
    // Also handle enter and backspace
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
