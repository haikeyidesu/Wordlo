/**
 * Main entry point for the Wordle game
 * Initializes and coordinates all game components
 * Follows the Facade pattern to simplify game initialization
 */

// Import core modules
import { GameConfig, GameStatus } from './src/core/constants.js';
import { GameState } from './src/core/gameState.js';
import { WordEvaluator } from './src/core/evaluator.js';

// Import data modules
import { createWordValidator, loadWords } from './src/data/words.js';

// Import UI modules
import { BoardRenderer } from './src/ui/boardRenderer.js';
import { KeyboardRenderer } from './src/ui/keyboardRenderer.js';
import { MessageManager } from './src/ui/messageManager.js';

// Import utility modules
import { InputHandler } from './src/utils/inputHandler.js';
import { WordSelector } from './src/utils/wordSelector.js';

/**
 * Game class
 * Main controller that orchestrates all game components
 */
class Game {
  constructor() {
    // DOM elements
    this.boardContainer = document.getElementById('board');
    this.keyboardContainer = document.getElementById('keyboard');
    this.messageContainer = document.getElementById('message-container');
    
    // Initialize UI components (will be fully initialized after async setup)
    this.boardRenderer = new BoardRenderer(this.boardContainer);
    this.keyboardRenderer = new KeyboardRenderer(this.keyboardContainer);
    this.messageManager = new MessageManager(this.messageContainer);
    
    // Game state (initialized in startNewGame)
    this.gameState = null;
    this.wordValidator = null;
    this.wordSelector = null;
    
    // Input handler
    this.inputHandler = new InputHandler({
      onLetter: (letter) => this.handleLetter(letter),
      onEnter: () => this.handleEnter(),
      onBackspace: () => this.handleBackspace()
    });
    
    // Current row being played
    this.currentRow = 0;
    
    // Loading state
    this.isLoading = true;
  }
  
  /**
   * Asynchronously initializes the game by loading the word list
   */
  async initialize() {
    try {
      // Show loading message
      this.messageManager.show('Loading words...', { persistent: true });
      
      // Load words asynchronously and create validator
      const wordsPromise = loadWords();
      this.wordValidator = await createWordValidator(wordsPromise);
      
      // Create word selector with loaded words
      const allWords = await wordsPromise;
      this.wordSelector = new WordSelector(allWords);
      
      console.log(`Loaded ${this.wordValidator.size} words`);
      
      // Clear loading message
      this.messageManager.clear();
      
      this.isLoading = false;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.messageManager.show('Error loading words. Please refresh.', { persistent: true });
      this.isLoading = true;
      return false;
    }
  }
  
  /**
   * Starts a new game
   */
  startNewGame() {
    if (this.isLoading) {
      console.warn('Game is still loading...');
      return;
    }
    
    // Select a new secret word
    const secretWord = this.wordSelector.selectRandom();
    console.log('Secret word:', secretWord); // For debugging
    
    // Initialize game state
    this.gameState = new GameState(secretWord, this.wordValidator);
    this.currentRow = 0;
    
    // Render UI components
    this.boardRenderer.render();
    this.keyboardRenderer.render();
    
    // Set up keyboard listeners
    this.keyboardRenderer.addClickListeners((key) => {
      this.inputHandler.handleVirtualInput(key);
    });
    
    // Enable input
    this.inputHandler.enable();
    
    // Clear any messages
    this.messageManager.clear();
    
    console.log(`New game started. Word list size: ${this.wordValidator.size}`);
  }
  
  /**
   * Handles letter input
   * @param {string} letter - The letter to add
   */
  handleLetter(letter) {
    if (this.gameState.isGameOver()) return;
    
    const added = this.gameState.addLetter(letter);
    if (added) {
      this.boardRenderer.updateRow(this.currentRow, this.gameState.getCurrentGuess());
    }
  }
  
  /**
   * Handles backspace input
   */
  handleBackspace() {
    if (this.gameState.isGameOver()) return;
    
    const deleted = this.gameState.deleteLetter();
    if (deleted) {
      this.boardRenderer.updateRow(this.currentRow, this.gameState.getCurrentGuess());
    }
  }
  
  /**
   * Handles enter/submit input
   */
  async handleEnter() {
    if (this.gameState.isGameOver()) return;
    
    const result = this.gameState.submitGuess();
    
    if (!result.success) {
      this._handleFailedSubmit(result.reason);
      return;
    }
    
    // Reveal the guess with animation
    await this._revealCurrentGuess(result.evaluation);
    
    // Handle game end conditions
    if (result.gameStatus === GameStatus.WON) {
      this.messageManager.showSuccess('Excellent! You won!', true);
      this.inputHandler.disable();
    } else if (result.gameStatus === GameStatus.LOST) {
      this.messageManager.show(`Game over! The word was "${this.gameState.secretWord}"`, true);
      this.inputHandler.disable();
    } else {
      // Continue to next row
      this.currentRow++;
    }
  }
  
  /**
   * Handles failed guess submission
   * @param {string} reason - Reason for failure
   * @private
   */
  _handleFailedSubmit(reason) {
    switch (reason) {
      case 'not_enough_letters':
        this.messageManager.showError('Not enough letters');
        break;
      case 'invalid_word':
        this.messageManager.showError('Not in word list');
        break;
      case 'game_over':
        // Silently ignore - game is already over
        break;
      default:
        this.messageManager.showError('Invalid guess');
    }
  }
  
  /**
   * Reveals the current guess with animation
   * @param {Array<string>} evaluation - Letter evaluation results
   * @private
   */
  async _revealCurrentGuess(evaluation) {
    const guess = this.gameState.getGuesses()[this.currentRow].word;
    
    await this.boardRenderer.revealRow(this.currentRow, evaluation, (index, state) => {
      // Update keyboard as each tile is revealed
      this.keyboardRenderer.updateKeyState(guess[index], state);
    });
  }
  
  /**
   * Gets current game statistics
   * @returns {Object} Game stats
   */
  getStats() {
    return {
      guessesUsed: this.gameState.getGuesses().length,
      remainingAttempts: this.gameState.getRemainingAttempts(),
      status: this.gameState.getStatus(),
      secretWord: this.gameState.secretWord // Only for debugging
    };
  }
}

// Initialize and start the game when DOM is ready
let game = null;

window.addEventListener('DOMContentLoaded', async () => {
  game = new Game();
  
  // Initialize the game (load words asynchronously)
  const initialized = await game.initialize();
  
  if (initialized) {
    game.startNewGame();
  }
  
  // Expose game instance for debugging (can be removed in production)
  window.game = game;
});

// Export for potential module usage
export { Game };