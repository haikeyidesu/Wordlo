/**
 * WordSelector class
 * Handles random word selection with optional seeding for reproducibility
 * Useful for future features like daily challenges or multiplayer sync
 */
export class WordSelector {
  constructor(wordList) {
    this.wordList = wordList;
  }
  
  /**
   * Selects a random word from the list
   * @param {number} seed - Optional seed for reproducible randomness
   * @returns {string} Selected word
   */
  selectRandom(seed = null) {
    if (this.wordList.length === 0) {
      throw new Error('Word list is empty');
    }
    
    if (seed !== null) {
      // Use seeded random for reproducibility (future: daily challenges)
      const index = this._seededRandom(seed, this.wordList.length);
      return this.wordList[index];
    }
    
    // True random selection
    const randomIndex = Math.floor(Math.random() * this.wordList.length);
    return this.wordList[randomIndex];
  }
  
  /**
   * Selects a word for a specific date (for daily challenges)
   * @param {Date} date - The date to generate word for
   * @returns {string} Selected word
   */
  selectForDate(date = new Date()) {
    // Create a seed from the date (YYYYMMDD format)
    const seed = parseInt(
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0')
    );
    
    return this.selectRandom(seed);
  }
  
  /**
   * Seeded random number generator (Linear Congruential Generator)
   * Provides reproducible randomness for same seed
   * @param {number} seed - The seed value
   * @param {number} max - Maximum value (exclusive)
   * @returns {number} Random integer between 0 and max-1
   * @private
   */
  _seededRandom(seed, max) {
    // LCG parameters (same as glibc)
    const a = 1103515245;
    const c = 12345;
    const m = Math.pow(2, 31);
    
    // Generate next value in sequence
    const next = (a * seed + c) % m;
    
    // Map to range [0, max)
    return Math.floor((next / m) * max);
  }
  
  /**
   * Gets multiple unique random words
   * @param {number} count - Number of words to select
   * @returns {Array<string>} Array of unique words
   */
  selectMultiple(count) {
    if (count > this.wordList.length) {
      throw new Error(`Cannot select ${count} words from list of ${this.wordList.length}`);
    }
    
    const shuffled = [...this.wordList];
    
    // Fisher-Yates shuffle for first 'count' elements
    for (let i = 0; i < count; i++) {
      const j = Math.floor(Math.random() * (shuffled.length - i)) + i;
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }
  
  /**
   * Updates the word list
   * @param {Array<string>} newWordList - New list of words
   */
  setWordList(newWordList) {
    this.wordList = newWordList;
  }
  
  /**
   * Gets the size of the word list
   * @returns {number} Word list size
   */
  getSize() {
    return this.wordList.length;
  }
}
