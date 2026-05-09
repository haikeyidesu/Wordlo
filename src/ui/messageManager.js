/**
 * MessageManager class
 * Handles displaying messages to the user
 * Supports temporary and persistent messages with animations
 */
export class MessageManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentMessage = null;
    this.messageTimeout = null;
  }
  
  /**
   * Shows a message to the user
   * @param {string} message - The message text
   * @param {Object} options - Configuration options
   * @param {boolean} options.persistent - If true, message stays until cleared
   * @param {number} options.duration - Duration in ms for non-persistent messages
   */
  show(message, options = {}) {
    const { persistent = false, duration = 2000 } = options;
    
    // Clear any existing timeout
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    
    // Create and display message
    this._renderMessage(message);
    
    // Auto-clear for non-persistent messages
    if (!persistent) {
      this.messageTimeout = setTimeout(() => {
        this.clear();
      }, duration);
    }
  }
  
  /**
   * Clears the current message
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
   * @param {string} message - Error message
   */
  showError(message) {
    this.show(message, { duration: 2000 });
  }
  
  /**
   * Shows a success message
   * @param {string} message - Success message
   * @param {boolean} persistent - Whether to keep the message
   */
  showSuccess(message, persistent = false) {
    this.show(message, { persistent, duration: 3000 });
  }
  
  /**
   * Renders the message element
   * @param {string} message - Message text
   * @private
   */
  _renderMessage(message) {
    if (!this.container) {
      console.warn('Message container not found');
      return;
    }
    
    this.container.innerHTML = '';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = message;
    
    this.container.appendChild(messageDiv);
    this.currentMessage = message;
  }
}
