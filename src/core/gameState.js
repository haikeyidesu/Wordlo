/**
 * Game State Module
 * 
 * Manages the complete state of a Wordle game session.
 * Implements encapsulation principles with a clean, controlled API.
 * 
 * Design Patterns:
 * - Encapsulation: Internal state is private, accessed via methods
 * - State Pattern: Tracks game lifecycle (PLAYING, WON, LOST)
 * - Observer-ready: State changes can trigger UI updates
 * 
 * Data Structures:
 * - guesses[]: Array storing guess history with evaluations
 * - keyboardState: Map for O(1) letter state lookups
 * 
 * Future Extensions:
 * - Add undo/redo by storing state snapshots
 * - Multiplayer sync by serializing state to JSON
 * - Analytics by tracking guess patterns
 * 
 * @module core/gameState
 */

import { GameConfig, GameStatus } from '../core/constants.js';
import { WordEvaluator } from '../core/evaluator.js';

/**
 * GameState class
 * 
 * Central authority for game logic and state management.
 * All game mutations flow through this class, ensuring consistency.
 * 
 * Invariants maintained:
 * - currentGuess never exceeds WORD_LENGTH
 * - guesses count never exceeds MAX_GUESSES
 * - keyboardState always reflects best known state per letter
 */
export class GameState {
  /**
   * Creates a new game state instance
   * 
   * @param {string} secretWord - The target word to guess
   * @param {Object} wordValidator - Validator object with isValid() method
   * 
   * @example
   * const validator = createWordValidator(WORDS);
   * const gameState = new GameState('HELLO', validator);
   */
  constructor(secretWord, wordValidator) {
    this.secretWord = secretWord;
    this.wordValidator = wordValidator;
    
    // Mutable game state
    this.guesses = [];                          // Array of {word, evaluation}
    this.currentGuess = '';                     // Current incomplete guess
    this.status = GameStatus.PLAYING;           // Game lifecycle state
    
    // Keyboard state: Maps each letter to its best known state
    // Used to update virtual keyboard colors across multiple guesses
    // Example: {'H': 'correct', 'E': 'present', 'L': 'absent'}
    this.keyboardState = new Map();
  }
  
  /**
   * Adds a letter to the current guess
   * 
   * Validation:
   * - Only allowed when game is in PLAYING state
   * - Only allowed if guess hasn't reached max length
   * 
   * @param {string} letter - Single letter to add (case-insensitive)
   * @returns {boolean} True if letter was added, false if rejected
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  addLetter(letter) {
    // Guard clause: Check game state
    if (this.status !== GameStatus.PLAYING) {
      return false;
    }
    
    // Guard clause: Check word length limit
    if (this.currentGuess.length >= GameConfig.WORD_LENGTH) {
      return false;
    }
    
    // Normalize to lowercase and append
    this.currentGuess += letter.toLowerCase();
    return true;
  }
  
  /**
   * Removes the last letter from the current guess
   * 
   * Implements backspace functionality.
   * Safe to call on empty guess (returns false, no error).
   * 
   * @returns {boolean} True if letter was removed, false if nothing to remove
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  deleteLetter() {
    // Guard clause: Check game state
    if (this.status !== GameStatus.PLAYING) {
      return false;
    }
    
    // Guard clause: Check if there's anything to delete
    if (this.currentGuess.length === 0) {
      return false;
    }
    
    // Remove last character using slice
    // Alternative: this.currentGuess.pop() if using array
    this.currentGuess = this.currentGuess.slice(0, -1);
    return true;
  }
  
  /**
   * Submits the current guess for evaluation
   * 
   * This is the main game action method. It:
   * 1. Validates the guess (length, dictionary)
   * 2. Evaluates against secret word
   * 3. Updates internal state (guesses, keyboard)
   * 4. Checks win/lose conditions
   * 5. Returns structured result
   * 
   * @returns {Object} Result object with structure:
   *   - success: boolean - Whether submission was valid
   *   - reason?: string - Why it failed (if success=false)
   *   - evaluation?: Array - Letter states (if success=true)
   *   - gameStatus?: GameStatus - Updated game state
   * 
   * Time Complexity: O(n) where n is word length
   * Space Complexity: O(n) for evaluation array
   */
  submitGuess() {
    // Guard clause: Check game state
    if (this.status !== GameStatus.PLAYING) {
      return { success: false, reason: 'game_over' };
    }
    
    // Validation: Check word length
    if (this.currentGuess.length !== GameConfig.WORD_LENGTH) {
      return { success: false, reason: 'not_enough_letters' };
    }
    
    // Validation: Check if word exists in dictionary
    if (!this.wordValidator.isValid(this.currentGuess)) {
      return { success: false, reason: 'invalid_word' };
    }
    
    // Evaluate the guess using the two-pass algorithm
    const evaluation = WordEvaluator.evaluate(this.currentGuess, this.secretWord);
    
    // Store the guess with its evaluation for history/replay
    this.guesses.push({
      word: this.currentGuess,
      evaluation: evaluation
    });
    
    // Update keyboard state with new information from this guess
    this._updateKeyboardState(this.currentGuess, evaluation);
    
    // Check win condition: Exact match
    if (WordEvaluator.isCorrect(this.currentGuess, this.secretWord)) {
      this.status = GameStatus.WON;
      this.currentGuess = '';  // Clear current guess
      return { 
        success: true, 
        evaluation, 
        gameStatus: GameStatus.WON 
      };
    }
    
    // Check lose condition: Out of guesses
    if (this.guesses.length >= GameConfig.MAX_GUESSES) {
      this.status = GameStatus.LOST;
      this.currentGuess = '';  // Clear current guess
      return { 
        success: true, 
        evaluation, 
        gameStatus: GameStatus.LOST 
      };
    }
    
    // Continue playing: Clear current guess for next attempt
    this.currentGuess = '';
    return { 
      success: true, 
      evaluation, 
      gameStatus: GameStatus.PLAYING 
    };
  }
  
  /**
   * Updates the keyboard state based on the latest evaluation
   * 
   * Uses merge logic to preserve more informative states.
   * Example: If 'E' was yellow before and is now green, upgrade to green.
   * Never downgrade states (green -> yellow or yellow -> gray).
   * 
   * @private
   * @param {string} guess - The guessed word
   * @param {Array<LetterState>} evaluation - Evaluation results for each letter
   * 
   * Time Complexity: O(n) where n is word length
   * Space Complexity: O(1) - updates existing map entries
   */
  _updateKeyboardState(guess, evaluation) {
    // Iterate through each letter and its evaluation
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      const newState = evaluation[i];
      const currentState = this.keyboardState.get(letter);
      
      // Merge states using priority logic (CORRECT > PRESENT > ABSENT)
      const mergedState = WordEvaluator.mergeStates(currentState, newState);
      
      // Update the map with the best known state
      this.keyboardState.set(letter, mergedState);
    }
  }
  
  /**
   * Gets the current incomplete guess string
   * 
   * @returns {string} Current guess being typed
   * 
   * Time Complexity: O(1)
   */
  getCurrentGuess() {
    return this.currentGuess;
  }
  
  /**
   * Gets all submitted guesses with their evaluations
   * 
   * @returns {Array<Object>} Array of {word, evaluation} objects
   * 
   * Time Complexity: O(1) - returns reference
   * Note: Caller should not mutate returned array
   */
  getGuesses() {
    return this.guesses;
  }
  
  /**
   * Gets the current game status
   * 
   * @returns {GameStatus} Current state: PLAYING, WON, or LOST
   * 
   * Time Complexity: O(1)
   */
  getStatus() {
    return this.status;
  }
  
  /**
   * Gets the keyboard state for UI rendering
   * 
   * Returns a copy to prevent external mutation of internal state.
   * 
   * @returns {Map<string, LetterState>} Copy of keyboard letter states
   * 
   * Time Complexity: O(k) where k is unique letters guessed
   * Space Complexity: O(k) for the copy
   */
  getKeyboardState() {
    return new Map(this.keyboardState);
  }
  
  /**
   * Gets the number of remaining attempts
   * 
   * @returns {number} How many more guesses are allowed
   * 
   * Time Complexity: O(1)
   */
  getRemainingAttempts() {
    return GameConfig.MAX_GUESSES - this.guesses.length;
  }
  
  /**
   * Checks if the game has ended
   * 
   * @returns {boolean} True if game is WON or LOST
   * 
   * Time Complexity: O(1)
   */
  isGameOver() {
    return this.status === GameStatus.WON || this.status === GameStatus.LOST;
  }
  
  /**
   * Resets the game state for a new game
   * 
   * Reuses the same instance instead of creating new one.
   * More memory-efficient for single-page applications.
   * 
   * @param {string} newSecretWord - New target word for next game
   * 
   * Time Complexity: O(k) where k is size of keyboardState (to clear)
   * Space Complexity: O(1) - reuses existing structures
   */
  reset(newSecretWord) {
    this.secretWord = newSecretWord;
    this.guesses = [];
    this.currentGuess = '';
    this.status = GameStatus.PLAYING;
    this.keyboardState.clear();  // Efficient Map clear operation
  }
}
