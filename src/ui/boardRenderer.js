import { GameConfig } from '../core/constants.js';

/**
 * BoardRenderer class
 * Handles rendering and updating the game board
 * Supports animations for revealing guesses
 */
export class BoardRenderer {
  constructor(containerElement) {
    this.container = containerElement;
    this.tileElements = []; // 2D array: [row][col]
  }
  
  /**
   * Renders the initial game board
   */
  render() {
    if (!this.container) {
      console.warn('Board container not found');
      return;
    }
    
    this.container.innerHTML = '';
    this.tileElements = [];
    
    for (let row = 0; row < GameConfig.MAX_GUESSES; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      rowDiv.id = `row-${row}`;
      
      const rowTiles = [];
      for (let col = 0; col < GameConfig.WORD_LENGTH; col++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.id = `tile-${row}-${col}`;
        rowDiv.appendChild(tile);
        rowTiles.push(tile);
      }
      
      this.container.appendChild(rowDiv);
      this.tileElements.push(rowTiles);
    }
  }
  
  /**
   * Updates a specific tile with a letter
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {string} letter - Letter to display
   */
  updateTile(row, col, letter) {
    const tile = this._getTile(row, col);
    if (!tile) return;
    
    tile.textContent = letter || '';
    
    if (letter) {
      tile.dataset.state = 'active';
    } else {
      delete tile.dataset.state;
    }
  }
  
  /**
   * Updates the entire current row with a guess
   * @param {number} row - Row index
   * @param {string} guess - The guess string
   */
  updateRow(row, guess) {
    for (let col = 0; col < GameConfig.WORD_LENGTH; col++) {
      this.updateTile(row, col, guess[col] || '');
    }
  }
  
  /**
   * Reveals a row with animation and color feedback
   * @param {number} row - Row index
   * @param {Array<string>} evaluation - Array of letter states
   * @param {Function} onTileReveal - Callback for each tile reveal (for keyboard updates)
   * @returns {Promise} Resolves when animation completes
   */
  async revealRow(row, evaluation, onTileReveal) {
    const tiles = this.tileElements[row];
    const { ANIMATION_DELAY_MS } = GameConfig;
    
    return new Promise(resolve => {
      tiles.forEach((tile, index) => {
        setTimeout(() => {
          tile.classList.add('flip');
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
   * @param {number} row - Row index
   */
  clearRow(row) {
    for (let col = 0; col < GameConfig.WORD_LENGTH; col++) {
      this.updateTile(row, col, '');
    }
  }
  
  /**
   * Gets a tile element by position
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {HTMLElement|null} The tile element
   * @private
   */
  _getTile(row, col) {
    if (row < 0 || row >= GameConfig.MAX_GUESSES || col < 0 || col >= GameConfig.WORD_LENGTH) {
      return null;
    }
    return this.tileElements[row][col];
  }
  
  /**
   * Highlights the current row (optional visual feedback)
   * @param {number} row - Row index
   * @param {boolean} active - Whether to highlight
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
