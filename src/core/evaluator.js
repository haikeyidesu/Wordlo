/**
 * Word Evaluator Module
 * 
 * Implements the core algorithm for evaluating player guesses against the secret word.
 * Uses a two-pass algorithm to correctly handle duplicate letters per Wordle rules.
 * 
 * Algorithm Complexity:
 * - Time: O(n) where n is word length (constant 5 in this game)
 * - Space: O(k) where k is unique letters in solution (max 26)
 * 
 * Design Patterns:
 * - Static Class: No instantiation needed, pure functions only
 * - Strategy Pattern: Encapsulates evaluation logic separately from game state
 * 
 * Future Extensions:
 * - Could support different evaluation modes (hard mode, variants)
 * - Could be extracted to WebAssembly for performance in multiplayer
 * 
 * @module core/evaluator
 */

import { LetterState, GameConfig } from '../core/constants.js';

/**
 * WordEvaluator class
 * 
 * Provides static methods for evaluating guesses and managing letter states.
 * The two-pass algorithm ensures correct handling of duplicate letters:
 * 
 * Example: Secret = "HELLO", Guess = "HILLS"
 * - First 'L' in guess: CORRECT (position 3)
 * - Second 'L' in guess: ABSENT (only 2 L's in HELLO, both accounted for)
 * 
 * This matches official Wordle behavior.
 */
export class WordEvaluator {
  /**
   * Evaluates a guess against the solution word using two-pass algorithm
   * 
   * Algorithm Steps:
   * 1. Count letter frequencies in solution (Map for O(1) lookup)
   * 2. First pass: Mark exact matches (CORRECT) and consume from count
   * 3. Second pass: Mark present letters (PRESENT) from remaining count
   * 4. Unmarked letters remain ABSENT
   * 
   * @param {string} guess - The player's guessed word (must be 5 letters)
   * @param {string} solution - The secret target word (must be 5 letters)
   * @returns {Array<LetterState>} Array of 5 states, one per letter position
   * 
   * @example
   * // Secret: "APPLE", Guess: "PAPER"
   * // Returns: [PRESENT, CORRECT, ABSENT, PRESENT, ABSENT]
   * //          P      A       S        E       R
   */
  static evaluate(guess, solution) {
    const { WORD_LENGTH } = GameConfig;
    
    // Initialize result array with ABSENT (default state)
    // Time: O(n), Space: O(n)
    const result = Array(WORD_LENGTH).fill(LetterState.ABSENT);
    
    // Convert strings to arrays for index-based manipulation
    // This allows us to modify individual positions
    const guessChars = guess.split('');
    const solutionChars = solution.split('');
    
    // Track available letters in solution for handling duplicates
    // Using Map for O(1) lookup, insert, and update operations
    // Alternative: Could use object literal, but Map is more semantically correct
    const availableLetters = new Map();
    
    // Build frequency map of solution letters
    // Time: O(n) where n = WORD_LENGTH
    for (const char of solutionChars) {
      availableLetters.set(char, (availableLetters.get(char) || 0) + 1);
    }
    
    // FIRST PASS: Identify exact matches (CORRECT/green)
    // These take priority and consume the letter from available pool
    // Time: O(n)
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessChars[i] === solutionChars[i]) {
        result[i] = LetterState.CORRECT;
        // Decrement count since this letter instance is now matched
        availableLetters.set(guessChars[i], availableLetters.get(guessChars[i]) - 1);
      }
    }
    
    // SECOND PASS: Identify present letters (PRESENT/yellow)
    // Only for positions not already marked as CORRECT
    // Time: O(n)
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] !== LetterState.CORRECT) {
        const count = availableLetters.get(guessChars[i]) || 0;
        if (count > 0) {
          result[i] = LetterState.PRESENT;
          // Decrement count to prevent over-matching duplicates
          availableLetters.set(guessChars[i], count - 1);
        }
      }
    }
    
    return result;
  }
  
  /**
   * Checks if a guess matches the solution exactly
   * 
   * Simple string comparison for win condition check.
   * Time: O(n) where n is word length
   * 
   * @param {string} guess - The guessed word
   * @param {string} solution - The secret word
   * @returns {boolean} True if guess matches solution exactly
   */
  static isCorrect(guess, solution) {
    return guess === solution;
  }
  
  /**
   * Merges letter states, prioritizing more informative states
   * 
   * State Priority Hierarchy:
   * CORRECT (green) > PRESENT (yellow) > ABSENT (gray)
   * 
   * This ensures that if a letter was previously marked as yellow
   * but later found to be green, we upgrade to green (never downgrade).
   * 
   * Used for updating keyboard state across multiple guesses.
   * 
   * @param {LetterState} currentState - Current known state for this letter
   * @param {LetterState} newState - Newly evaluated state from latest guess
   * @returns {LetterState} The merged (highest priority) state
   * 
   * @example
   * mergeStates(PRESENT, CORRECT) -> CORRECT  // Upgrade
   * mergeStates(CORRECT, PRESENT) -> CORRECT  // Don't downgrade
   * mergeStates(ABSENT, PRESENT)  -> PRESENT  // New information
   */
  static mergeStates(currentState, newState) {
    // CORRECT is highest priority - always upgrade to it
    if (newState === LetterState.CORRECT) {
      return LetterState.CORRECT;
    }
    
    // PRESENT is medium priority - upgrade if not already CORRECT
    if (newState === LetterState.PRESENT && currentState !== LetterState.CORRECT) {
      return LetterState.PRESENT;
    }
    
    // Handle undefined/null initial state
    if (currentState === undefined || currentState === null) {
      return newState;
    }
    
    // Default: keep current state (covers ABSENT case)
    return currentState;
  }
}
