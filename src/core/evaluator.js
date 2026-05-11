import { LetterState, GameConfig } from '../core/constants.js';

/**
 * WordEvaluator class
 * Implements the algorithm to evaluate a guess against the secret word
 * Uses a two-pass algorithm for correct handling of duplicate letters
 * 
 * Time Complexity: O(n) where n is word length (constant 5 in this case)
 * Space Complexity: O(n) for tracking letter counts
 */
export class WordEvaluator {
  /**
   * Evaluates a guess against the solution word
   * @param {string} guess - The guessed word
   * @param {string} solution - The secret word
   * @returns {Array<LetterState>} Array of states for each letter position
   */
  static evaluate(guess, solution) {
    const { WORD_LENGTH } = GameConfig;
    const result = Array(WORD_LENGTH).fill(LetterState.ABSENT);
    
    // Convert to arrays for easier manipulation
    const guessChars = guess.split('');
    const solutionChars = solution.split('');
    
    // Track available letters in solution for handling duplicates
    // Using a Map for O(1) lookup and update operations
    const availableLetters = new Map();
    
    // Count frequency of each letter in solution
    for (const char of solutionChars) {
      availableLetters.set(char, (availableLetters.get(char) || 0) + 1);
    }
    
    // First pass: Identify correct letters (green)
    // These take priority and consume the letter from available pool
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessChars[i] === solutionChars[i]) {
        result[i] = LetterState.CORRECT;
        availableLetters.set(guessChars[i], availableLetters.get(guessChars[i]) - 1);
      }
    }
    
    // Second pass: Identify present letters (yellow)
    // Only for positions not already marked as correct
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] !== LetterState.CORRECT) {
        const count = availableLetters.get(guessChars[i]) || 0;
        if (count > 0) {
          result[i] = LetterState.PRESENT;
          availableLetters.set(guessChars[i], count - 1);
        }
      }
    }
    
    return result;
  }
  
  /**
   * Checks if a guess matches the solution exactly
   * @param {string} guess - The guessed word
   * @param {string} solution - The secret word
   * @returns {boolean} True if guess matches solution
   */
  static isCorrect(guess, solution) {
    return guess === solution;
  }
  
  /**
   * Merges letter states, prioritizing more informative states
   * Priority: CORRECT > PRESENT > ABSENT
   * This is used for updating keyboard state across multiple guesses
   * @param {LetterState} currentState - Current known state
   * @param {LetterState} newState - Newly evaluated state
   * @returns {LetterState} The merged state
   */
  static mergeStates(currentState, newState) {
    if (newState === LetterState.CORRECT) {
      return LetterState.CORRECT;
    }
    if (newState === LetterState.PRESENT && currentState !== LetterState.CORRECT) {
      return LetterState.PRESENT;
    }
    if (currentState === undefined || currentState === null) {
      return newState;
    }
    return currentState;
  }
}
