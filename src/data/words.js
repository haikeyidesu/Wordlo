/**
 * Word List Data Module
 * 
 * Provides the dictionary of valid 5-letter words for the game.
 * Uses the 'word-list' npm package for a comprehensive, curated list of common English words.
 * 
 * @module data/words
 */

/**
 * Cached promise for loading words.
 * This ensures we only fetch the file once, even if createWordValidator is called multiple times.
 * @type {Promise<string[]>|null}
 */
let wordsCachePromise = null;

/**
 * Asynchronously loads and filters the word list by fetching the words.txt file.
 * 
 * Algorithm: Linear scan O(n) where n is total words in dictionary.
 * The filtering ensures:
 * - Exactly 5 characters (game requirement)
 * - Only alphabetic characters (no numbers/symbols)
 * - Lowercase only (for consistent comparison)
 * 
 * @returns {Promise<string[]>} Array of valid 5-letter words
 */
export async function loadWords() {
  if (wordsCachePromise) {
    return wordsCachePromise;
  }
  
  wordsCachePromise = (async () => {
    // Fetch the words file from the node_modules directory
    // Note: In production, you'd want to bundle this or serve it from a CDN
    let response;
    try {
      response = await fetch('./node_modules/word-list/words.txt');
    } catch (fetchError) {
      console.error('Fetch failed:', fetchError);
      throw new Error(`Failed to load words: Network error - ${fetchError.message}`);
    }
    
    if (!response.ok) {
      throw new Error(`Failed to load words: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    const allWords = content.split('\n').map(w => w.trim()).filter(w => w.length > 0);
    
    // Filter to only 5-letter lowercase English words
    return allWords
      .map(word => word.toLowerCase())                    // Normalize to lowercase
      .filter(word => /^[a-z]{5}$/.test(word));           // Keep only 5-letter alphabetic words
  })();
  
  return wordsCachePromise;
}

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
 * @param {Promise<string[]>|string[]} wordListPromise - Promise or array of valid words
 * @returns {Promise<Object>} Validator object with isValid, size, and getAll methods
 * 
 * @example
 * const validator = await createWordValidator(loadWords());
 * validator.isValid('hello'); // true
 * validator.isValid('xyz');   // false
 */
export async function createWordValidator(wordListPromise) {
  // Await the word list if it's a promise
  const wordList = await wordListPromise;
  
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
