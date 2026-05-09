/**
 * Board Renderer Module
 * 
 * Handles all visual rendering of the game board.
 * Manages tile creation, updates, and reveal animations.
 * 
 * Design Patterns:
 * - Renderer Pattern: Separates rendering logic from game state
 * - Promise-based Animations: Async/await for animation sequencing
 * 
 * Features:
 * - Dynamic tile generation based on config
 * - Staggered reveal animations
 * - State-based styling (correct, present, absent)
 * - Row highlighting for active guess
 * 
 * Future Extensions:
 * - Add 3D flip animations with CSS transforms
 * - Add confetti animation on win
 * - Add shake animation on invalid guess
 * 
 * @module ui/boardRenderer
 */

import { GameConfig } from '../core/constants.js';

/**
 * BoardRenderer class
 * 
 * Manages the DOM representation of the guess grid.
 * Maintains reference to all tiles for efficient updates.
 * 
 * Board Structure:
 * - MAX_GUESSES rows (typically 6)
 * - WORD_LENGTH columns (typically 5)
 * - Each tile can show a letter and have a state
 */
export class BoardRenderer {
  /**
   * Creates a BoardRenderer instance
   * 
   * @param {HTMLElement} containerElement - DOM element to render board into
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.tileElements = []; // 2D array: [row][col] for O(1) tile access
  }
  
  /**
   * Renders the initial game board
   * 
   * Creates the complete grid structure:
   * - MAX_GUESSES rows
   * - WORD_LENGTH tiles per row
   * - Proper CSS classes and IDs for styling
   * 
   * Time Complexity: O(rows * cols) = O(1) since dimensions are fixed
   * Space Complexity: O(rows * cols) for tile element references
   */
  render() {
    // Guard clause: Check container exists
    if (!this.container) {
      console.warn('Board container not found');
      return;
    }
    
    // Clear any existing content
    this.container.innerHTML = '';
    this.tileElements = [];
    
    // Build grid row by row
    for (let row = 0; row < GameConfig.MAX_GUESSES; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      rowDiv.id = `row-${row}`;  // Unique ID for targeting
      
      const rowTiles = [];
      for (let col = 0; col < GameConfig.WORD_LENGTH; col++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.id = `tile-${row}-${col}`;  // Unique ID for targeting
        rowDiv.appendChild(tile);
        rowTiles.push(tile);
      }
      
      this.container.appendChild(rowDiv);
      this.tileElements.push(rowTiles);
    }
  }
  
  /**
   * Updates a specific tile with a letter
   * 
   * Sets letter content and active state.
   * Used during typing to show current guess.
   * 
   * @param {number} row - Row index (0 to MAX_GUESSES-1)
   * @param {number} col - Column index (0 to WORD_LENGTH-1)
   * @param {string} letter - Letter to display (empty string to clear)
   * 
   * Time Complexity: O(1)
   */
  updateTile(row, col, letter) {
    const tile = this._getTile(row, col);
    if (!tile) return;
    
    // Set letter content
    tile.textContent = letter || '';
    
    // Toggle active state for visual feedback
    if (letter) {
      tile.dataset.state = 'active';  // CSS hook for styling
    } else {
      delete tile.dataset.state;
    }
  }
  
  /**
   * Updates the entire current row with a guess
   * 
   * Convenience method to update all tiles in a row at once.
   * Called as user types each letter.
   * 
   * @param {number} row - Row index
   * @param {string} guess - The guess string (up to WORD_LENGTH chars)
   * 
   * Time Complexity: O(n) where n is word length
   */
  updateRow(row, guess) {
    for (let col = 0; col < GameConfig.WORD_LENGTH; col++) {
      this.updateTile(row, col, guess[col] || '');
    }
  }
  
  /**
   * Reveals a row with animation and color feedback
   * 
   * Main animation method. Performs:
   * 1. Staggered tile flips (left to right)
   * 2. Color application based on evaluation
   * 3. Callback for each tile reveal (keyboard updates)
   * 
   * Animation timing:
   * - Each tile starts ANIMATION_DELAY_MS after previous
   * - Each flip takes FLIP_ANIMATION_DURATION_MS
   * 
   * @param {number} row - Row index
   * @param {Array<string>} evaluation - Array of letter states
   * @param {Function} onTileReveal - Callback(tileIndex, state) for each reveal
   * @returns {Promise} Resolves when all animations complete
   * 
   * Time Complexity: O(n) where n is word length
   */
  async revealRow(row, evaluation, onTileReveal) {
    const tiles = this.tileElements[row];
    const { ANIMATION_DELAY_MS } = GameConfig;
    
    return new Promise(resolve => {
      // Schedule each tile's reveal with staggered delay
      tiles.forEach((tile, index) => {
        setTimeout(() => {
          // Add flip animation class
          tile.classList.add('flip');
          
          // Apply evaluation state (correct/present/absent)
          tile.dataset.state = evaluation[index];
          
          // Trigger callback for keyboard update
          if (onTileReveal) {
            onTileReveal(index, evaluation[index]);
          }
        }, index * ANIMATION_DELAY_MS);
      });
      
      // Resolve after all animations complete
      setTimeout(
        resolve, 
        (GameConfig.WORD_LENGTH - 1) * ANIMATION_DELAY_MS + GameConfig.FLIP_ANIMATION_DURATION_MS
      );
    });
  }
  
  /**
   * Clears a row
   * 
   * Removes all letters from specified row.
   * Used when resetting or clearing current guess.
   * 
   * @param {number} row - Row index
   * 
   * Time Complexity: O(n) where n is word length
   */
  clearRow(row) {
    for (let col = 0; col < GameConfig.WORD_LENGTH; col++) {
      this.updateTile(row, col, '');
    }
  }
  
  /**
   * Gets a tile element by position
   * 
   * Bounds-checked access to tile elements.
   * Returns null for invalid coordinates instead of throwing.
   * 
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {HTMLElement|null} The tile element or null if out of bounds
   * @private
   * 
   * Time Complexity: O(1)
   */
  _getTile(row, col) {
    // Validate coordinates
    if (row < 0 || row >= GameConfig.MAX_GUESSES || col < 0 || col >= GameConfig.WORD_LENGTH) {
      return null;
    }
    return this.tileElements[row][col];
  }
  
  /**
   * Highlights the current row (optional visual feedback)
   * 
   * Adds/removes 'active' class for visual distinction.
   * Can be used to show which row is currently being played.
   * 
   * @param {number} row - Row index
   * @param {boolean} active - Whether to highlight (true) or unhighlight (false)
   * 
   * Time Complexity: O(1)
   */
  highlightRow(row, active = true) {
    const rowElement = this.container.querySelector(`#row-${row}`);
    if (rowElement) {
      if (active) {
        rowElement.classList.add('active');
      } else {
        rowElement.classList.remove('active');
      }
    }
  }
  
  /**
   * Resets the entire board
   * 
   * Clears all tiles and removes animation classes.
   * Called when starting a new game.
   * 
   * Time Complexity: O(rows * cols) = O(1)
   */
  reset() {
    this.tileElements.forEach(row => {
      row.forEach(tile => {
        tile.textContent = '';
        delete tile.dataset.state;
        tile.classList.remove('flip');
      });
    });
  }
}
