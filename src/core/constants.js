/**
 * Core Constants Module
 * 
 * Defines all immutable configuration values and enumerations used throughout the game.
 * Centralizing constants ensures consistency and makes future modifications easier.
 * 
 * Design Principle: Single Source of Truth
 * - All magic numbers and string literals are defined here
 * - Easy to tweak game balance (e.g., word length, max guesses)
 * - Type safety through enumerated objects
 * 
 * @module core/constants
 */

/**
 * Letter State Enumeration
 * 
 * Represents the evaluation result of each letter in a guess.
 * Used for both board tile coloring and keyboard key updates.
 * 
 * States follow Wordle rules:
 * - CORRECT (Green): Letter exists in solution at this exact position
 * - PRESENT (Yellow): Letter exists in solution but at different position
 * - ABSENT (Gray/Red): Letter does not exist in solution
 * 
 * @readonly
 * @enum {string}
 */
export const LetterState = {
  CORRECT: 'correct',    // Green - correct letter, correct position
  PRESENT: 'present',    // Yellow - correct letter, wrong position
  ABSENT: 'absent'       // Gray/Red - letter not in word
};

/**
 * Game Status Enumeration
 * 
 * Tracks the current state of the game lifecycle.
 * Used to control input handling and UI updates.
 * 
 * State Machine:
 * PLAYING -> WON (correct guess)
 * PLAYING -> LOST (out of guesses)
 * 
 * @readonly
 * @enum {string}
 */
export const GameStatus = {
  PLAYING: 'playing',  // Game in progress, accepting input
  WON: 'won',          // Player guessed correctly
  LOST: 'lost'         // Player failed to guess
};

/**
 * Game Configuration Object
 * 
 * Contains all tunable game parameters.
 * Modify these values to change game difficulty or behavior.
 * 
 * Performance Considerations:
 * - WORD_LENGTH affects algorithm complexity O(n) where n=5
 * - MAX_GUESSES determines board size and memory usage
 * - Animation delays balance UX responsiveness vs visual clarity
 * 
 * @readonly
 * @type {Object}
 * @property {number} WORD_LENGTH - Number of letters in target word
 * @property {number} MAX_GUESSES - Maximum attempts allowed
 * @property {number} ANIMATION_DELAY_MS - Delay between tile reveals (stagger effect)
 * @property {number} FLIP_ANIMATION_DURATION_MS - Duration of flip animation
 */
export const GameConfig = {
  WORD_LENGTH: 5,                    // Standard Wordle word length
  MAX_GUESSES: 6,                    // Standard Wordle attempt limit
  ANIMATION_DELAY_MS: 300,           // Stagger delay for row reveal animation
  FLIP_ANIMATION_DURATION_MS: 500    // CSS flip animation duration
};

/**
 * Keyboard Layout Configuration
 * 
 * Defines the QWERTY keyboard arrangement for the virtual keyboard.
 * Each sub-array represents one row of keys.
 * 
 * Special Keys:
 * - 'enter': Submit guess
 * - 'backspace': Delete last letter
 * 
 * Layout is configurable to support alternative keyboard layouts
 * (e.g., AZERTY, QWERTZ) for internationalization.
 * 
 * @readonly
 * @type {Array<Array<string>>}
 */
export const KEYBOARD_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],  // Top row
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],        // Home row
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']  // Bottom row
];
