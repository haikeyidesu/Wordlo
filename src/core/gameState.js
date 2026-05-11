import { GameConfig, GameStatus } from '../core/constants.js';
import { WordEvaluator } from '../core/evaluator.js';

/**
 * GameState class
 * Manages the game state using encapsulation principles
 * Provides a clean API for game operations
 */
export class GameState {
  constructor(secretWord, wordValidator) {
    this.secretWord = secretWord;
    this.wordValidator = wordValidator;
    this.guesses = [];
    this.currentGuess = '';
    this.status = GameStatus.PLAYING;
    this.keyboardState = new Map(); // Tracks letter states across guesses
  }
  
  /**
   * Adds a letter to the current guess
   * @param {string} letter - The letter to add
   * @returns {boolean} True if letter was added successfully
   */
  addLetter(letter) {
    if (this.status !== GameStatus.PLAYING) {
      return false;
    }
    
    if (this.currentGuess.length >= GameConfig.WORD_LENGTH) {
      return false;
    }
    
    this.currentGuess += letter.toLowerCase();
    return true;
  }
  
  /**
   * Removes the last letter from the current guess
   * @returns {boolean} True if letter was removed successfully
   */
  deleteLetter() {
    if (this.status !== GameStatus.PLAYING) {
      return false;
    }
    
    if (this.currentGuess.length === 0) {
      return false;
    }
    
    this.currentGuess = this.currentGuess.slice(0, -1);
    return true;
  }
  
  /**
   * Submits the current guess for evaluation
   * @returns {Object} Result object with success status and evaluation data
   */
  submitGuess() {
    if (this.status !== GameStatus.PLAYING) {
      return { success: false, reason: 'game_over' };
    }
    
    if (this.currentGuess.length !== GameConfig.WORD_LENGTH) {
      return { success: false, reason: 'not_enough_letters' };
    }
    
    if (!this.wordValidator.isValid(this.currentGuess)) {
      return { success: false, reason: 'invalid_word' };
    }
    
    // Evaluate the guess
    const evaluation = WordEvaluator.evaluate(this.currentGuess, this.secretWord);
    
    // Store the guess with its evaluation
    this.guesses.push({
      word: this.currentGuess,
      evaluation: evaluation
    });
    
    // Update keyboard state with new information
    this._updateKeyboardState(this.currentGuess, evaluation);
    
    // Check win condition
    if (WordEvaluator.isCorrect(this.currentGuess, this.secretWord)) {
      this.status = GameStatus.WON;
      this.currentGuess = '';
      return { 
        success: true, 
        evaluation, 
        gameStatus: GameStatus.WON 
      };
    }
    
    // Check lose condition (out of guesses)
    if (this.guesses.length >= GameConfig.MAX_GUESSES) {
      this.status = GameStatus.LOST;
      this.currentGuess = '';
      return { 
        success: true, 
        evaluation, 
        gameStatus: GameStatus.LOST 
      };
    }
    
    // Continue playing
    this.currentGuess = '';
    return { 
      success: true, 
      evaluation, 
      gameStatus: GameStatus.PLAYING 
    };
  }
  
  /**
   * Updates the keyboard state based on the latest evaluation
   * Uses merge logic to preserve more informative states
   * @private
   */
  _updateKeyboardState(guess, evaluation) {
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      const newState = evaluation[i];
      const currentState = this.keyboardState.get(letter);
      
      const mergedState = WordEvaluator.mergeStates(currentState, newState);
      this.keyboardState.set(letter, mergedState);
    }
  }
  
  /**
   * Gets the current guess string
   * @returns {string} Current guess
   */
  getCurrentGuess() {
    return this.currentGuess;
  }
  
  /**
   * Gets all previous guesses
   * @returns {Array<Object>} Array of guess objects
   */
  getGuesses() {
    return this.guesses;
  }
  
  /**
   * Gets the current game status
   * @returns {GameStatus} Current status
   */
  getStatus() {
    return this.status;
  }
  
  /**
   * Gets the keyboard state for UI rendering
   * @returns {Map<string, LetterState>} Keyboard letter states
   */
  getKeyboardState() {
    return new Map(this.keyboardState);
  }
  
  /**
   * Gets the number of remaining attempts
   * @returns {number} Remaining guesses
   */
  getRemainingAttempts() {
    return GameConfig.MAX_GUESSES - this.guesses.length;
  }
  
  /**
   * Checks if the game is over
   * @returns {boolean} True if game has ended
   */
  isGameOver() {
    return this.status === GameStatus.WON || this.status === GameStatus.LOST;
  }
  
  /**
   * Resets the game state for a new game
   * @param {string} newSecretWord - New secret word
   */
  reset(newSecretWord) {
    this.secretWord = newSecretWord;
    this.guesses = [];
    this.currentGuess = '';
    this.status = GameStatus.PLAYING;
    this.keyboardState.clear();
  }
}
