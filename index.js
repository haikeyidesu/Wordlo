/**
 * Wordlo - A Wordle Clone
 * 
 * Game Logic Implementation
 * Following good design patterns and data structures
 */

// ============================================
// DATA: Word Lists (Simple implementation)
// ============================================

const WORD_LIST = [
    'APPLE',
    'BEACH',
    'BRAIN',
    'BREAD',
    'BRUSH',
    'CHAIR',
    'CHEST',
    'CHORD',
    'CLICK',
    'CLOCK',
    'CLOUD',
    'DANCE',
    'DIARY',
    'DRINK',
    'DRIVE',
    'EARTH',
    'FEAST',
    'FIELD',
    'FRUIT',
    'GLASS',
    'GRAPE',
    'GREEN',
    'GHOST',
    'HEART',
    'HOUSE',
    'JUICE',
    'LIGHT',
    'LEMON',
    'MELON',
    'MONEY',
    'MUSIC',
    'NIGHT',
    'OCEAN',
    'PARTY',
    'PIANO',
    'PILOT',
    'PHONE',
    'PLANE',
    'PLATE',
    'RADIO',
    'RIVER',
    'ROBOT',
    'SHIRT',
    'SHOES',
    'SKIRT',
    'SMILE',
    'SNAKE',
    'SPACE',
    'SPOON',
    'STORM',
    'TABLE',
    'TOAST',
    'TIGER',
    'TRAIN',
    'WATER',
    'WATCH',
    'WHALE',
    'WORLD',
    'WRITE',
    'YOUTH',
    'ABUSE',
    'ADULT',
    'AGENT',
    'ANGER',
    'AWARD',
    'BASIS',
    'BEACH',
    'BIRTH',
    'BLOCK',
    'BLOOD',
    'BOARD',
    'BRAIN',
    'BREAD',
    'BREAK',
    'BROWN',
    'BUYER',
    'CAUSE',
    'CHAIN',
    'CHAIR',
    'CHEST',
    'CHIEF',
    'CHILD',
    'CHINA',
    'CLAIM',
    'CLASS',
    'CLOCK',
    'COACH',
    'COAST',
    'COURT',
    'COVER',
    'CREAM',
    'CRIME',
    'CROSS',
    'CROWD',
    'CROWN',
    'CYCLE',
    'DANCE',
    'DEATH',
    'DEPTH',
    'DOUBT',
    'DRAFT',
    'DRAMA',
    'DREAM',
    'DRESS',
    'DRINK',
    'DRIVE',
    'EARTH',
    'ENEMY',
    'ENTRY',
    'ERROR',
    'EVENT',
    'FAITH',
    'FAULT',
    'FIELD',
    'FIGHT',
    'FINAL',
    'FLOOR',
    'FOCUS',
    'FORCE',
    'FRAME',
    'FRANK',
    'FRONT',
    'FRUIT',
    'GLASS',
    'GRANT',
    'GRASS',
    'GREEN',
    'GROUP',
    'GUIDE',
    'HEART',
    'HENRY',
    'HORSE',
    'HOTEL',
    'HOUSE',
    'IMAGE',
    'INDEX',
    'INPUT',
    'ISSUE',
    'JAPAN',
    'JONES',
    'JUDGE',
    'KNIFE',
    'LAURA',
    'LAYER',
    'LEVEL',
    'LEWIS',
    'LIGHT',
    'LIMIT',
    'LUNCH',
    'MAJOR',
    'MARCH',
    'MATCH',
    'METAL',
    'MODEL',
    'MONEY',
    'MONTH',
    'MOTOR',
    'MOUTH',
    'MUSIC',
    'NIGHT',
    'NOISE',
    'NORTH',
    'NOVEL',
    'NURSE',
    'OFFER',
    'ORDER',
    'OTHER',
    'OWNER',
    'PANEL',
    'PAPER',
    'PARTY',
    'PEACE',
    'PETER',
    'PHASE',
    'PHONE',
    'PIECE',
    'PILOT',
    'PITCH',
    'PLACE',
    'PLANE',
    'PLANT',
    'PLATE',
    'POINT',
    'POUND',
    'POWER',
    'PRESS',
    'PRICE',
    'PRIDE',
    'PRIZE',
    'PROOF',
    'QUEEN',
    'RADIO',
    'RANGE',
    'RATIO',
    'REPLY',
    'RIGHT',
    'RIVER',
    'ROUND',
    'ROUTE',
    'RUGBY',
    'SCALE',
    'SCENE',
    'SCOPE',
    'SCORE',
    'SENSE',
    'SHAPE',
    'SHARE',
    'SHEEP',
    'SHEET',
    'SHIFT',
    'SHIRT',
    'SHOCK',
    'SIGHT',
    'SIMON',
    'SKILL',
    'SLEEP',
    'SMILE',
    'SMITH',
    'SMOKE',
    'SOUND',
    'SOUTH',
    'SPACE',
    'SPEED',
    'SPITE',
    'SPORT',
    'SQUAD',
    'STAFF',
    'STAGE',
    'START',
    'STATE',
    'STEAM',
    'STEEL',
    'STOCK',
    'STONE',
    'STORE',
    'STUDY',
    'STUFF',
    'STYLE',
    'SUGAR',
    'TABLE',
    'TASTE',
    'TERRY',
    'THEME',
    'THING',
    'TITLE',
    'TOTAL',
    'TOUCH',
    'TOWER',
    'TRACK',
    'TRADE',
    'TRAIN',
    'TREND',
    'TRIAL',
    'TRUST',
    'TRUTH',
    'UNCLE',
    'UNION',
    'UNITY',
    'VALUE',
    'VIDEO',
    'VISIT',
    'VOICE',
    'WASTE',
    'WATCH',
    'WATER',
    'WHILE',
    'WHITE',
    'WHOLE',
    'WOMAN',
    'WORLD',
    'YOUTH'
];

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const GAME_CONFIG = {
    wordLength: 5,
    maxGuesses: 6,
    animationDelay: 300 // ms for tile flip animation
};

const KEYBOARD_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

// ============================================
// ENUMS: Tile States
// ============================================

const TileState = {
    DEFAULT: 'default',
    CORRECT: 'correct',   // Green - right letter, right position
    PRESENT: 'present',   // Yellow - right letter, wrong position
    ABSENT: 'absent'      // Grey/Red - letter not in word
};

// ============================================
// CLASS: WordloGame
// Main game controller following Singleton pattern concept
// ============================================

class WordloGame {
    constructor() {
        // Game state
        this.secretWord = '';
        this.currentGuess = '';
        this.guesses = [];
        this.gameStatus = 'playing'; // 'playing', 'won', 'lost'
        
        // DOM elements
        this.boardElement = null;
        this.keyboardElement = null;
        this.messageElement = null;
        
        // Initialize the game
        this.init();
    }
    
    /**
     * Initialize the game
     */
    init() {
        // Get DOM elements
        this.boardElement = document.getElementById('board');
        this.keyboardElement = document.getElementById('keyboard');
        this.messageElement = document.getElementById('message');
        
        // Select a random word from the list
        this.selectSecretWord();
        
        // Create the game board
        this.createBoard();
        
        // Create the keyboard
        this.createKeyboard();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('Wordlo game initialized! Secret word selected.');
    }
    
    /**
     * Select a random secret word from the word list
     */
    selectSecretWord() {
        const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
        this.secretWord = WORD_LIST[randomIndex];
        console.log('Debug - Secret word:', this.secretWord);
    }
    
    /**
     * Create the game board grid
     */
    createBoard() {
        this.boardElement.innerHTML = '';
        
        // Create 6 rows (max guesses) with 5 tiles each
        for (let i = 0; i < GAME_CONFIG.maxGuesses; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            row.id = `row-${i}`;
            
            // Create 5 tiles per row
            for (let j = 0; j < GAME_CONFIG.wordLength; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.id = `row-${i}-tile-${j}`;
                row.appendChild(tile);
            }
            
            this.boardElement.appendChild(row);
        }
    }
    
    /**
     * Create the virtual keyboard
     */
    createKeyboard() {
        this.keyboardElement.innerHTML = '';
        
        KEYBOARD_LAYOUT.forEach((rowKeys, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            
            rowKeys.forEach(key => {
                const keyElement = document.createElement('div');
                keyElement.className = 'key';
                keyElement.textContent = key;
                keyElement.dataset.key = key;
                
                // Add special styling for large keys
                if (key === 'ENTER' || key === 'BACKSPACE') {
                    keyElement.classList.add('large');
                }
                
                // Add click handler for virtual keyboard
                keyElement.addEventListener('click', () => {
                    this.handleKeyPress(key);
                });
                
                rowElement.appendChild(keyElement);
            });
            
            this.keyboardElement.appendChild(rowElement);
        });
    }
    
    /**
     * Set up keyboard event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (this.gameStatus !== 'playing') {
                return;
            }
            
            const key = event.key.toUpperCase();
            
            // Handle Enter key
            if (key === 'ENTER') {
                this.submitGuess();
                return;
            }
            
            // Handle Backspace
            if (key === 'BACKSPACE') {
                this.deleteLetter();
                return;
            }
            
            // Handle letter keys (A-Z only)
            if (/^[A-Z]$/.test(key)) {
                this.addLetter(key);
            }
        });
    }
    
    /**
     * Handle key press from virtual keyboard or physical keyboard
     */
    handleKeyPress(key) {
        if (this.gameStatus !== 'playing') {
            return;
        }
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else if (/^[A-Z]$/.test(key)) {
            this.addLetter(key);
        }
    }
    
    /**
     * Add a letter to the current guess
     */
    addLetter(letter) {
        if (this.currentGuess.length < GAME_CONFIG.wordLength) {
            this.currentGuess += letter;
            this.updateCurrentRow();
        }
    }
    
    /**
     * Delete the last letter from the current guess
     */
    deleteLetter() {
        if (this.currentGuess.length > 0) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateCurrentRow();
        }
    }
    
    /**
     * Update the current row display based on current guess
     */
    updateCurrentRow() {
        const currentRowIndex = this.guesses.length;
        const rowElement = document.getElementById(`row-${currentRowIndex}`);
        
        // Update each tile in the current row
        for (let i = 0; i < GAME_CONFIG.wordLength; i++) {
            const tile = rowElement.children[i];
            tile.textContent = this.currentGuess[i] || '';
            
            // Add active class to show current position
            if (i === this.currentGuess.length - 1 && this.currentGuess.length > 0) {
                tile.classList.add('active');
            } else {
                tile.classList.remove('active');
            }
        }
    }
    
    /**
     * Submit the current guess for evaluation
     */
    submitGuess() {
        // Validate guess length
        if (this.currentGuess.length !== GAME_CONFIG.wordLength) {
            this.showMessage('Not enough letters');
            return;
        }
        
        // Check if word is in our word list (optional validation)
        if (!WORD_LIST.includes(this.currentGuess)) {
            this.showMessage('Not in word list');
            return;
        }
        
        // Evaluate the guess
        const result = this.evaluateGuess(this.currentGuess, this.secretWord);
        
        // Animate and reveal the tiles
        this.revealTiles(result);
        
        // Store the guess
        this.guesses.push(this.currentGuess);
        
        // Check game status
        if (this.currentGuess === this.secretWord) {
            this.gameStatus = 'won';
            setTimeout(() => {
                this.showMessage('🎉 Congratulations! You won!');
            }, GAME_CONFIG.animationDelay * GAME_CONFIG.wordLength + 500);
        } else if (this.guesses.length >= GAME_CONFIG.maxGuesses) {
            this.gameStatus = 'lost';
            setTimeout(() => {
                this.showMessage(`Game Over! The word was: ${this.secretWord}`);
            }, GAME_CONFIG.animationDelay * GAME_CONFIG.wordLength + 500);
        }
        
        // Reset current guess for next round
        this.currentGuess = '';
    }
    
    /**
     * Evaluate a guess against the secret word
     * Returns an array of TileState for each letter
     */
    evaluateGuess(guess, secret) {
        const result = new Array(GAME_CONFIG.wordLength).fill(TileState.ABSENT);
        
        // Convert strings to arrays for easier manipulation
        const guessLetters = guess.split('');
        const secretLetters = secret.split('');
        
        // First pass: Find correct letters (green)
        for (let i = 0; i < GAME_CONFIG.wordLength; i++) {
            if (guessLetters[i] === secretLetters[i]) {
                result[i] = TileState.CORRECT;
                guessLetters[i] = null; // Mark as processed
                secretLetters[i] = null; // Mark as matched
            }
        }
        
        // Second pass: Find present letters (yellow)
        for (let i = 0; i < GAME_CONFIG.wordLength; i++) {
            if (guessLetters[i] !== null) {
                const foundIndex = secretLetters.indexOf(guessLetters[i]);
                if (foundIndex !== -1) {
                    result[i] = TileState.PRESENT;
                    secretLetters[foundIndex] = null; // Mark as matched
                }
            }
        }
        
        return result;
    }
    
    /**
     * Reveal tiles with animation and update keyboard
     */
    revealTiles(result) {
        const currentRowIndex = this.guesses.length;
        const guess = this.guesses[this.guesses.length - 1] || this.currentGuess;
        
        result.forEach((state, index) => {
            setTimeout(() => {
                const tile = document.getElementById(`row-${currentRowIndex}-tile-${index}`);
                const letter = guess[index];
                
                // Add the appropriate class based on state
                tile.classList.add(state);
                
                // Update the corresponding key on the keyboard
                this.updateKeyState(letter, state);
                
            }, index * GAME_CONFIG.animationDelay);
        });
    }
    
    /**
     * Update keyboard key colors based on guess results
     */
    updateKeyState(letter, state) {
        const keyElement = document.querySelector(`.key[data-key="${letter}"]`);
        if (!keyElement) return;
        
        // Priority: CORRECT > PRESENT > ABSENT
        const currentState = keyElement.classList.contains('correct') ? TileState.CORRECT :
                            keyElement.classList.contains('present') ? TileState.PRESENT :
                            keyElement.classList.contains('absent') ? TileState.ABSENT : null;
        
        // Don't downgrade from correct to present/absent
        if (currentState === TileState.CORRECT) {
            return;
        }
        
        // Don't downgrade from present to absent
        if (currentState === TileState.PRESENT && state === TileState.ABSENT) {
            return;
        }
        
        // Remove all state classes and add the new one
        keyElement.classList.remove('correct', 'present', 'absent');
        keyElement.classList.add(state);
    }
    
    /**
     * Show a message to the user
     */
    showMessage(text) {
        this.messageElement.textContent = text;
        this.messageElement.classList.add('show');
        
        setTimeout(() => {
            this.messageElement.classList.remove('show');
        }, 2000);
    }
    
    /**
     * Reset the game for a new round
     */
    reset() {
        this.secretWord = '';
        this.currentGuess = '';
        this.guesses = [];
        this.gameStatus = 'playing';
        
        this.selectSecretWord();
        this.createBoard();
        
        // Reset keyboard
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('correct', 'present', 'absent');
        });
        
        console.log('Game reset! New secret word selected.');
    }
}

// ============================================
// GAME INITIALIZATION
// ============================================

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new WordloGame();
});
