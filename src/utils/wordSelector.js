/**
 * Word Selector Module
 * 
 * Handles random word selection with optional seeding for reproducibility.
 * Implements efficient shuffling algorithms for fair word distribution.
 * 
 * Design Patterns:
 * - Strategy Pattern: Different selection strategies (random, seeded, date-based)
 * - Factory-like: Creates reproducible word selections
 * 
 * Algorithms:
 * - Fisher-Yates Shuffle: O(n) unbiased shuffling
 * - Linear Congruential Generator: Deterministic pseudo-random numbers
 * 
 * Use Cases:
 * - Random game: selectRandom()
 * - Daily challenge: selectForDate(date)
 * - Multiplayer sync: selectRandom(seed) with shared seed
 * 
 * Future Extensions:
 * - Add weighted selection for difficulty levels
 * - Add word category filtering (nouns, verbs, etc.)
 * - Add anti-repetition logic (don't repeat recent words)
 * 
 * @module utils/wordSelector
 */

/**
 * WordSelector class
 * 
 * Provides multiple word selection strategies for different game modes.
 * Maintains internal word list reference for efficient access.
 * 
 * @example
 * const selector = new WordSelector(WORDS);
 * const word = selector.selectRandom();
 * const dailyWord = selector.selectForDate(new Date());
 */
export class WordSelector {
  /**
   * Creates a WordSelector instance
   * 
   * @param {Array<string>} wordList - Array of valid words to select from
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1) - stores reference, not copy
   */
  constructor(wordList) {
    this.wordList = wordList;
  }
  
  /**
   * Selects a random word from the list
   * 
   * Two modes:
   * - Without seed: Uses Math.random() for true randomness
   * - With seed: Uses LCG for reproducible results
   * 
   * @param {number|null} seed - Optional seed for reproducible randomness
   * @returns {string} Selected word
   * @throws {Error} If word list is empty
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   * 
   * @example
   * selector.selectRandom();        // Random word
   * selector.selectRandom(12345);   // Deterministic word for seed 12345
   */
  selectRandom(seed = null) {
    // Guard clause: Check for empty list
    if (this.wordList.length === 0) {
      throw new Error('Word list is empty');
    }
    
    if (seed !== null) {
      // Use seeded random for reproducibility (future: daily challenges, multiplayer)
      const index = this._seededRandom(seed, this.wordList.length);
      return this.wordList[index];
    }
    
    // True random selection using built-in PRNG
    const randomIndex = Math.floor(Math.random() * this.wordList.length);
    return this.wordList[randomIndex];
  }
  
  /**
   * Selects a word for a specific date (for daily challenges)
   * 
   * Converts date to numeric seed (YYYYMMDD format) ensuring:
   * - Same date always produces same word globally
   * - Different dates produce different words
   * 
   * @param {Date} [date=new Date()] - The date to generate word for
   * @returns {string} Selected word
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   * 
   * @example
   * selector.selectForDate(new Date('2024-01-15'));  // Word for Jan 15, 2024
   */
  selectForDate(date = new Date()) {
    // Create deterministic seed from date components
    // Format: YYYYMMDD as integer (e.g., 20240115)
    const seed = parseInt(
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0')
    );
    
    return this.selectRandom(seed);
  }
  
  /**
   * Seeded random number generator using Linear Congruential Generator (LCG)
   * 
   * LCG Formula: next = (a * seed + c) mod m
   * Parameters chosen from glibc for good statistical properties:
   * - a = 1103515245 (multiplier)
   * - c = 12345 (increment)
   * - m = 2^31 (modulus)
   * 
   * Provides reproducible randomness: same seed always produces same sequence.
   * Critical for daily challenges and multiplayer synchronization.
   * 
   * @param {number} seed - The seed value
   * @param {number} max - Maximum value (exclusive)
   * @returns {number} Random integer between 0 and max-1
   * @private
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  _seededRandom(seed, max) {
    // LCG parameters (same as glibc for proven randomness)
    const a = 1103515245;
    const c = 12345;
    const m = Math.pow(2, 31);  // 2^31
    
    // Generate next value in pseudo-random sequence
    const next = (a * seed + c) % m;
    
    // Map from [0, m) to [0, max)
    return Math.floor((next / m) * max);
  }
  
  /**
   * Gets multiple unique random words
   * 
   * Uses partial Fisher-Yates shuffle for efficiency:
   * - Only shuffles first 'count' elements
   * - Guarantees no duplicates in result
   * - More efficient than full shuffle when count << list size
   * 
   * @param {number} count - Number of unique words to select
   * @returns {Array<string>} Array of unique random words
   * @throws {Error} If count exceeds list size
   * 
   * Time Complexity: O(count) - partial shuffle
   * Space Complexity: O(n) - creates copy of list for shuffling
   * 
   * @example
   * selector.selectMultiple(5);  // Get 5 unique random words
   */
  selectMultiple(count) {
    // Guard clause: Validate count
    if (count > this.wordList.length) {
      throw new Error(`Cannot select ${count} words from list of ${this.wordList.length}`);
    }
    
    // Create working copy for shuffling
    const shuffled = [...this.wordList];
    
    // Partial Fisher-Yates shuffle
    // Only need to shuffle first 'count' positions
    for (let i = 0; i < count; i++) {
      // Pick random index from remaining unshuffled portion
      const j = Math.floor(Math.random() * (shuffled.length - i)) + i;
      
      // Swap current position with random choice
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Return first 'count' elements (now randomly selected)
    return shuffled.slice(0, count);
  }
  
  /**
   * Updates the word list
   * 
   * Allows dynamic word list changes without recreating selector.
   * Useful for:
   * - Custom word packs
   * - Difficulty-based filtering
   * - User-generated content
   * 
   * @param {Array<string>} newWordList - New list of words
   * 
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  setWordList(newWordList) {
    this.wordList = newWordList;
  }
  
  /**
   * Gets the size of the word list
   * 
   * @returns {number} Current word list length
   * 
   * Time Complexity: O(1)
   */
  getSize() {
    return this.wordList.length;
  }
}
