// Word lists - 5 letter words
const WORDS = [
  'apple', 'beach', 'brain', 'bread', 'brush', 'chair', 'chest', 'chord',
  'click', 'clock', 'cloud', 'dance', 'diary', 'drink', 'drive', 'earth',
  'feast', 'field', 'fruit', 'glass', 'grape', 'green', 'ghost', 'heart',
  'house', 'juice', 'light', 'lemon', 'melon', 'money', 'music', 'night',
  'party', 'piano', 'pilot', 'plane', 'plant', 'plate', 'phone', 'power',
  'radio', 'river', 'robot', 'shirt', 'shoes', 'skirt', 'snake', 'space',
  'spoon', 'stack', 'stage', 'star', 'stone', 'storm', 'table', 'tiger',
  'toast', 'touch', 'tower', 'track', 'trade', 'train', 'treat', 'truck',
  'uncle', 'union', 'unity', 'value', 'video', 'visit', 'voice', 'waste',
  'watch', 'water', 'while', 'white', 'woman', 'world', 'write', 'youth'
];

// Game state
let secretWord = '';
let currentGuess = '';
let guesses = [];
let gameOver = false;
let currentRow = 0;

// Initialize the game
function initGame() {
  // Pick a random word
  secretWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  console.log('Secret word:', secretWord); // For debugging
  
  // Create the board
  createBoard();
  
  // Create the keyboard
  createKeyboard();
  
  // Add event listeners
  document.addEventListener('keydown', handleKeyPress);
}

// Create the game board (6 rows x 5 columns)
function createBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('div');
    row.className = 'row';
    row.id = `row-${i}`;
    
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${i}-${j}`;
      row.appendChild(tile);
    }
    
    board.appendChild(row);
  }
}

// Create the virtual keyboard
function createKeyboard() {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';
  
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
  ];
  
  rows.forEach((rowKeys, index) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';
    
    rowKeys.forEach(key => {
      const keyDiv = document.createElement('div');
      keyDiv.className = 'key';
      keyDiv.textContent = key === 'backspace' ? '⌫' : key.toUpperCase();
      keyDiv.dataset.key = key;
      
      if (key === 'enter' || key === 'backspace') {
        keyDiv.classList.add('large');
      }
      
      keyDiv.addEventListener('click', () => handleKeyClick(key));
      rowDiv.appendChild(keyDiv);
    });
    
    keyboard.appendChild(rowDiv);
  });
}

// Handle physical keyboard input
function handleKeyPress(event) {
  if (gameOver) return;
  
  const key = event.key.toLowerCase();
  
  if (key === 'enter') {
    submitGuess();
  } else if (key === 'backspace') {
    deleteLetter();
  } else if (/^[a-z]$/.test(key)) {
    addLetter(key);
  }
}

// Handle virtual keyboard click
function handleKeyClick(key) {
  if (gameOver) return;
  
  if (key === 'enter') {
    submitGuess();
  } else if (key === 'backspace') {
    deleteLetter();
  } else {
    addLetter(key);
  }
}

// Add a letter to the current guess
function addLetter(letter) {
  if (currentGuess.length < 5) {
    currentGuess += letter;
    updateCurrentRow();
  }
}

// Delete the last letter from the current guess
function deleteLetter() {
  if (currentGuess.length > 0) {
    currentGuess = currentGuess.slice(0, -1);
    updateCurrentRow();
  }
}

// Update the current row display
function updateCurrentRow() {
  const rowId = `row-${currentRow}`;
  const row = document.getElementById(rowId);
  const tiles = row.querySelectorAll('.tile');
  
  tiles.forEach((tile, index) => {
    tile.textContent = currentGuess[index] || '';
    if (currentGuess[index]) {
      tile.dataset.state = 'active';
    } else {
      delete tile.dataset.state;
    }
  });
}

// Submit the current guess
function submitGuess() {
  if (currentGuess.length !== 5) {
    showMessage('Not enough letters');
    return;
  }
  
  if (!WORDS.includes(currentGuess)) {
    showMessage('Not in word list');
    return;
  }
  
  // Store the guess
  guesses.push(currentGuess);
  
  // Reveal the guess with animation
  revealGuess();
}

// Reveal the guess with color feedback
function revealGuess() {
  const row = document.getElementById(`row-${currentRow}`);
  const tiles = row.querySelectorAll('.tile');
  const guess = currentGuess;
  const solution = secretWord;
  
  // Track which letters have been matched
  const solutionLetters = solution.split('');
  const result = Array(5).fill('absent');
  
  // First pass: mark correct letters (green)
  for (let i = 0; i < 5; i++) {
    if (guess[i] === solutionLetters[i]) {
      result[i] = 'correct';
      solutionLetters[i] = null; // Mark as used
    }
  }
  
  // Second pass: mark present letters (yellow)
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 'correct' && solutionLetters.includes(guess[i])) {
      result[i] = 'present';
      const index = solutionLetters.indexOf(guess[i]);
      solutionLetters[index] = null; // Mark as used
    }
  }
  
  // Animate each tile with delay
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add('flip');
      tile.dataset.state = result[index];
      
      // Update keyboard colors
      const keyElement = document.querySelector(`.key[data-key="${guess[index]}"]`);
      if (keyElement) {
        const currentState = keyElement.dataset.state;
        if (result[index] === 'correct') {
          keyElement.dataset.state = 'correct';
        } else if (result[index] === 'present' && currentState !== 'correct') {
          keyElement.dataset.state = 'present';
        } else if (result[index] === 'absent' && currentState !== 'correct' && currentState !== 'present') {
          keyElement.dataset.state = 'absent';
        }
      }
    }, index * 300);
  });
  
  // Check win/lose after animation
  setTimeout(() => {
    if (guess === solution) {
      showMessage('Excellent! You won!', true);
      gameOver = true;
    } else if (currentRow === 5) {
      showMessage(`Game over! The word was "${secretWord}"`, true);
      gameOver = true;
    } else {
      currentRow++;
      currentGuess = '';
    }
  }, 5 * 300 + 200);
}

// Show a message to the user
function showMessage(message, isFinal = false) {
  const container = document.getElementById('message-container');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.textContent = message;
  
  container.innerHTML = '';
  container.appendChild(messageDiv);
  
  if (!isFinal) {
    setTimeout(() => {
      container.innerHTML = '';
    }, 2000);
  }
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);