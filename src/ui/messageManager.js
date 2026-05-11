/**
 * Message Manager Module
 * 
 * Handles displaying messages to the user with support for
 * temporary and persistent notifications.
 * 
 * Design Patterns:
 * - Singleton-like: One instance per game session
 * - Command Pattern: Encapsulates message display logic
 * 
 * Features:
 * - Auto-dismissing temporary messages
 * - Persistent messages for important notifications
 * - Error and success message variants
 * - Animation support via CSS classes
 * 
 * Future Extensions:
 * - Add message queue for multiple simultaneous messages
 * - Add different message types (warning, info)
 * - Add accessibility features (ARIA live regions)
 * 
 * @module ui/messageManager
 */

/**
 * MessageManager class
 * 
 * Manages message display in a dedicated container element.
 * Handles automatic timeout cleanup and message lifecycle.
 * 
 * @example
 * const messages = new MessageManager(messageContainer);
 * messages.show('Loading...');
 * messages.showError('Invalid word!');
 * messages.showSuccess('You won!', true);
 */
export class MessageManager {
  /**
   * Creates a MessageManager instance
   * 
   * @param {HTMLElement} containerElement - DOM element to display messages in
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.currentMessage = null;
    this.messageTimeout = null;
  }
  
  /**
   * Shows a message to the user
   * 
   * Displays text in the message container with optional auto-dismiss.
   * Clears any existing message before showing new one.
   * 
   * @param {string} message - The message text to display
   * @param {Object} options - Configuration options
   * @param {boolean} [options.persistent=false] - If true, message stays until cleared
   * @param {number} [options.duration=2000] - Duration in ms for non-persistent messages
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  show(message, options = {}) {
    const { persistent = false, duration = 2000 } = options;
    
    // Clear any existing timeout to prevent race conditions
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    
    // Create and display message element
    this._renderMessage(message);
    
    // Auto-clear for non-persistent messages using setTimeout
    if (!persistent) {
      this.messageTimeout = setTimeout(() => {
        this.clear();
      }, duration);
    }
  }
  
  /**
   * Clears the current message
   * 
   * Removes message from DOM and cancels any pending timeout.
   * Safe to call even when no message is displayed.
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.currentMessage = null;
    
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
  }
  
  /**
   * Shows an error message
   * 
   * Convenience method for displaying error messages with default duration.
   * 
   * @param {string} message - Error message text
   * 
   * Time Complexity: O(1)
   */
  showError(message) {
    this.show(message, { duration: 2000 });
  }
  
  /**
   * Shows a success message
   * 
   * Convenience method for displaying success messages.
   * Can be persistent for game-ending notifications.
   * 
   * @param {string} message - Success message text
   * @param {boolean} [persistent=false] - Whether to keep the message until cleared
   * 
   * Time Complexity: O(1)
   */
  showSuccess(message, persistent = false) {
    this.show(message, { persistent, duration: 3000 });
  }
  
  /**
   * Renders the message DOM element
   * 
   * Creates and appends a message div with proper styling.
   * Clears any existing message before rendering new one.
   * 
   * @param {string} message - Message text to display
   * @private
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  _renderMessage(message) {
    if (!this.container) {
      console.warn('Message container not found');
      return;
    }
    
    // Clear existing message
    this.container.innerHTML = '';
    
    // Create new message element with animation class
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = message;
    
    this.container.appendChild(messageDiv);
    this.currentMessage = message;
  }
}
