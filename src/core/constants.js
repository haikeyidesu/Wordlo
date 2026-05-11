/**
 * Letter State Enum
 * Represents the state of a letter after evaluation
 */
export const LetterState = {
  CORRECT: 'correct',    // Green - correct letter, correct position
  PRESENT: 'present',    // Yellow - correct letter, wrong position
  ABSENT: 'absent'       // Gray/Red - letter not in word
};

/**
 * Game Status Enum
 */
export const GameStatus = {
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost'
};

/**
 * Constants for game configuration
 */
export const GameConfig = {
  WORD_LENGTH: 5,
  MAX_GUESSES: 6,
  ANIMATION_DELAY_MS: 300,
  FLIP_ANIMATION_DURATION_MS: 500
};

/**
 * Keyboard layout configuration
 */
export const KEYBOARD_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
];
