/**
 * Word List Data Module
 * 
 * Provides the dictionary of valid 5-letter words for the game.
 * Uses the 'word-list' npm package for a comprehensive, curated list of common English words.
 * 
 * @module data/words
 */

import wordList from 'word-list';

/**
 * Filters the imported word list to include only valid 5-letter lowercase English words.
 * 
 * Algorithm: Linear scan O(n) where n is total words in dictionary.
 * The filtering ensures:
 * - Exactly 5 characters (game requirement)
 * - Only alphabetic characters (no numbers/symbols)
 * - Lowercase only (for consistent comparison)
 */
export const WORDS = wordList
  .filter(word => typeof word === 'string')           // Ensure it's a string
  .map(word => word.toLowerCase())                    // Normalize to lowercase
  .filter(word => /^[a-z]{5}$/.test(word));           // Keep only 5-letter alphabetic words

/**
 * Creates an optimized word validator using Set data structure.
 * 
 * Design Pattern: Factory Function
 * Returns a validator object with O(1) lookup time instead of O(n) array search.
 * 
 * Data Structure: Hash Set
 * - Provides constant-time O(1) membership testing
 * - More efficient than Array.includes() which is O(n)
 * - Memory-efficient for large word lists
 * 
 * @param {string[]} wordList - Array of valid words
 * @returns {Object} Validator object with isValid, size, and getAll methods
 * 
 * @example
 * const validator = createWordValidator(WORDS);
 * validator.isValid('hello'); // true
 * validator.isValid('xyz');   // false
 */
export function createWordValidator(wordList) {
  // Convert array to Set for O(1) lookup performance
  // Time Complexity: O(n) to build, O(1) per query
  // Space Complexity: O(n) to store all words
  const wordSet = new Set(wordList.map(w => w.toLowerCase()));
  
  return {
    /**
     * Checks if a word exists in the valid word list
     * @param {string} word - The word to validate
     * @returns {boolean} True if word is valid, false otherwise
     */
    isValid: (word) => wordSet.has(word.toLowerCase()),
    
    /**
     * Returns the total count of valid words in the dictionary
     * @returns {number} Size of the word list
     */
    size: wordSet.size,
    
    /**
     * Returns all valid words as an array
     * Useful for iteration or debugging
     * @returns {string[]} Array of all valid words
     */
    getAll: () => Array.from(wordSet)
  };
}
