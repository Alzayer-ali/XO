// Game state variables
let board = ['', '', '', '', '', '', '', '', '']; // Represents the 9 cells (logical state)
let currentPlayer = 'X';
let gameActive = true; // Flag to indicate if the game is ongoing
let gameMode = 'player-vs-player'; // Default game mode

// Arrays to track moves for each player (indices of the board)
// These arrays track the indices of the cells where the player has placed their markers.
let xMoves = [];
let oMoves = []; // O will be the computer in player-vs-computer mode

// Winning conditions (indices of the board array)
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Get DOM elements
const gameBoard = document.getElementById('gameBoard');
const messageBox = document.getElementById('messageBox');
const resetButton = document.getElementById('resetButton');
const gameModeSelect = document.getElementById('gameMode');

// Function to initialize the board display
function initializeBoard() {
    gameBoard.innerHTML = ''; // Clear any existing cells
    board = ['', '', '', '', '', '', '', '', '']; // Reset logical board state
    xMoves = []; // Reset X moves history
    oMoves = []; // Reset O moves history
    gameActive = true; // Set game to active
    currentPlayer = 'X'; // Start with Player X

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'rounded-md');
        cell.dataset.index = i; // Store the cell index
        cell.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cell);
    }
    updateMessage(`دور اللاعب ${currentPlayer}`);

    // If in player-vs-computer mode and computer is O, computer makes the first move if it's O's turn initially (which it isn't)
    // However, if we later decide computer starts, this is where we'd call computerMove()
}

// Function to update the message box
function updateMessage(message) {
    messageBox.textContent = message;
}

// Function to handle a cell click
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.index);

    // Check if the cell is already filled OR if the game is not active
    // Use textContent to check if the cell is visibly empty
    if (clickedCell.textContent !== '' || !gameActive) {
        return;
    }

    // In player-vs-computer mode, only allow click if it's human player's turn (X)
    if (gameMode === 'player-vs-computer' && currentPlayer === 'O') {
        return; // Do nothing if it's the computer's turn
    }


    // Place the marker and update the display
    placeMarker(clickedCell, clickedCellIndex);
    checkGameStatus();

    // If in player-vs-computer mode and game is still active, trigger computer's move
    if (gameMode === 'player-vs-computer' && gameActive) {
        // A small delay before computer moves for better user experience
        setTimeout(computerMove, 500);
    }
}

 // Function to get available empty cells
function getEmptyCells() {
    const emptyCells = [];
    for (let i = 0; i < board.length; i++) {
        // Check the actual cell content, not just the board array
        const cell = document.querySelector(`.cell[data-index="${i}"]`);
        if (cell.textContent === '') {
            emptyCells.push(i);
        }
    }
    return emptyCells;
}


// Simple AI logic for computer's move
function computerMove() {
    // If game is not active, do nothing
    if (!gameActive) {
        return;
    }

    const emptyCells = getEmptyCells();

    if (emptyCells.length === 0) {
        // Should be caught by checkGameStatus, but good safeguard
        return;
    }

    let move = -1;

    // Simple AI Strategy:
    // 1. Check if computer can win
    // 2. Check if player can win and block
    // 3. Take center if available
    // 4. Take a random corner
    // 5. Take a random edge

    const computerMarker = currentPlayer; // Which is 'O' in this mode
    const playerMarker = 'X';

    // Helper function to check for a potential winning/blocking move
    function findWinningMove(checkBoard, marker) {
        for (let i = 0; i < winningConditions.length; i++) {
            const condition = winningConditions[i];
            // Create a temporary board state considering only visible markers for this check
            const currentVisibleBoard = board.map((val, idx) => {
                 const cell = document.querySelector(`.cell[data-index="${idx}"]`);
                 return cell.textContent === '' ? '' : cell.textContent;
            });

            let markersInCondition = condition.map(index => currentVisibleBoard[index]);
            let emptyCount = markersInCondition.filter(m => m === '').length;
            let markerCount = markersInCondition.filter(m => m === marker).length;

            if (emptyCount === 1 && markerCount === 2) {
                // Found a potential win/block
                const emptyIndexInCondition = condition[markersInCondition.indexOf('')];
                // Check if this cell is actually empty on the visible board
                 const cell = document.querySelector(`.cell[data-index="${emptyIndexInCondition}"]`);
                 if (cell.textContent === '') {
                    return emptyIndexInCondition;
                 }
            }
        }
        return -1; // No winning/blocking move found
    }

    // 1. Check if computer can win
    move = findWinningMove(board, computerMarker); // Pass the logical board state
    if (move !== -1) {
         const cell = document.querySelector(`.cell[data-index="${move}"]`);
         placeMarker(cell, move);
         checkGameStatus();
         return;
    }

    // 2. Check if player can win and block
    move = findWinningMove(board, playerMarker); // Pass the logical board state
     if (move !== -1) {
         const cell = document.querySelector(`.cell[data-index="${move}"]`);
         placeMarker(cell, move);
         checkGameStatus();
         return;
     }

    // 3. Take center if available (index 4)
    const centerIndex = 4;
     const centerCell = document.querySelector(`.cell[data-index="${centerIndex}"]`);
    if (centerCell.textContent === '') {
        move = centerIndex;
         placeMarker(centerCell, move);
         checkGameStatus();
         return;
    }

    // 4. Take a random corner if available (indices 0, 2, 6, 8)
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => {
         const cell = document.querySelector(`.cell[data-index="${index}"]`);
         return cell.textContent === '';
    });
    if (availableCorners.length > 0) {
        move = availableCorners[Math.floor(Math.random() * availableCorners.length)];
         const cell = document.querySelector(`.cell[data-index="${move}"]`);
         placeMarker(cell, move);
         checkGameStatus();
         return;
    }

    // 5. Take a random edge if available (indices 1, 3, 5, 7)
    const edges = [1, 3, 5, 7];
     const availableEdges = edges.filter(index => {
         const cell = document.querySelector(`.cell[data-index="${index}"]`);
         return cell.textContent === '';
     });
    if (availableEdges.length > 0) {
         move = availableEdges[Math.floor(Math.random() * availableEdges.length)];
         const cell = document.querySelector(`.cell[data-index="${move}"]`);
         placeMarker(cell, move);
         checkGameStatus();
         return;
    }

    // If no strategic move, pick any random empty cell (shouldn't reach here with the above logic)
    if (emptyCells.length > 0) {
         move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
         const cell = document.querySelector(`.cell[data-index="${move}"]`);
         placeMarker(cell, move);
         checkGameStatus();
    }
}


// Function to place the marker on the board and update the cell's content
function placeMarker(cell, index) {
    // Add the current move to the player's history
    if (currentPlayer === 'X') {
        xMoves.push(index);

        // If player X has 4 or more moves, remove the oldest one (the first in the array)
        // This happens first to make space for the new move and potential transparency.
        if (xMoves.length >= 4) {
            const moveToRemoveIndex = xMoves.shift(); // Remove and get the first move index
            const moveToRemoveCell = document.querySelector(`.cell[data-index="${moveToRemoveIndex}"]`);
            if (moveToRemoveCell) {
                // Clear the cell content and remove classes
                moveToRemoveCell.textContent = '';
                moveToRemoveCell.classList.remove('x', 'o', 'semi-transparent'); // Remove all relevant classes
                 // Update the logical board state for the cleared cell
                 board[moveToRemoveIndex] = '';
            }
        }

        // If player X has 3 or more moves (after potential removal), make the oldest *remaining* one semi-transparent
        if (xMoves.length >= 3) {
            // The oldest remaining move is now at index 0
            const oldestMoveIndex = xMoves[0];
            const oldestMoveCell = document.querySelector(`.cell[data-index="${oldestMoveIndex}"]`);
            if (oldestMoveCell) {
                oldestMoveCell.classList.add('semi-transparent');
            }
        }


    } else { // currentPlayer === 'O'
        oMoves.push(index);

         // If player O has 4 or more moves, remove the oldest one (the first in the array)
         // This happens first to make space for the new move and potential transparency.
        if (oMoves.length >= 4) {
            const moveToRemoveIndex = oMoves.shift(); // Remove and get the first move index
            const moveToRemoveCell = document.querySelector(`.cell[data-index="${moveToRemoveIndex}"]`);
             if (moveToRemoveCell) {
                // Clear the cell content and remove classes
                moveToRemoveCell.textContent = '';
                moveToRemoveCell.classList.remove('x', 'o', 'semi-transparent'); // Remove all relevant classes
                 // Update the logical board state for the cleared cell
                 board[moveToRemoveIndex] = '';
             }
        }

         // If player O has 3 or more moves (after potential removal), make the oldest *remaining* one semi-transparent
        if (oMoves.length >= 3) {
            // The oldest remaining move is now at index 0
            const oldestMoveIndex = oMoves[0];
            const oldestMoveCell = document.querySelector(`.cell[data-index="${oldestMoveIndex}"]`);
            if (oldestMoveCell) {
                oldestMoveCell.classList.add('semi-transparent');
            }
        }
    }

    // Update the clicked cell's content and class
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase()); // Add class for styling (x or o)
     // Update the logical board state for the placed marker
     board[index] = currentPlayer; // Keep this updated too
}

// Function to check for win or draw
function checkGameStatus() {
    let roundWon = false;

    // Check all winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let pos1 = winCondition[0];
        let pos2 = winCondition[1];
        let pos3 = winCondition[2];

        // Get the cell elements
        const cell1 = document.querySelector(`.cell[data-index="${pos1}"]`);
        const cell2 = document.querySelector(`.cell[data-index="${pos2}"]`);
        const cell3 = document.querySelector(`.cell[data-index="${pos3}"]`);

        // Check if the cells in the winning condition have the same *visible* marker and are not empty
        if (cell1.textContent !== '' && cell1.textContent === cell2.textContent && cell2.textContent === cell3.textContent) {
            roundWon = true;
            break; // A winning condition is met
        }
    }


    if (roundWon) {
        updateMessage(`اللاعب ${currentPlayer} فاز! 🎉`);
        gameActive = false; // End the game
        // Optional: Add a class to winning cells for highlighting
         // Find the winning condition again to apply highlighting
         // (Need to iterate through conditions again or store the winning one)
         for (let i = 0; i < winningConditions.length; i++) {
             const winCondition = winningConditions[i];
             const cell1 = document.querySelector(`.cell[data-index="${winCondition[0]}"]`);
             const cell2 = document.querySelector(`.cell[data-index="${winCondition[1]}"]`);
             const cell3 = document.querySelector(`.cell[data-index="${winCondition[2]}"]`);

             if (cell1.textContent === currentPlayer && cell2.textContent === currentPlayer && cell3.textContent === currentPlayer) {
                 cell1.style.backgroundColor = '#10b981'; // emerald-500 example highlight on dark
                 cell2.style.backgroundColor = '#10b981'; // emerald-500 example highlight on dark
                 cell3.style.backgroundColor = '#10b981'; // emerald-500 example highlight on dark
                 break;
             }
         }

        return;
    }

    // Check for a draw (if the board is full and no one has won)
    // Check if all *visible* cells are filled.
    let allCellsFilled = true;
    for(let i = 0; i < 9; i++) {
        const cell = document.querySelector(`.cell[data-index="${i}"]`);
        if (cell.textContent === '') {
            allCellsFilled = false;
            break;
        }
    }

    if (allCellsFilled) {
        updateMessage('تعادل! 🤝');
        gameActive = false; // End the game
        return;
    }

    // If no win or draw, switch to the next player
    switchPlayer();
}

// Function to switch the current player
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateMessage(`دور اللاعب ${currentPlayer}`);
}

// Function to reset the game
function resetGame() {
    gameMode = gameModeSelect.value; // Get the selected mode
    initializeBoard(); // Re-initialize the board display and reset variables
    // If in player-vs-computer mode and computer is O, and O starts, trigger computer move
    // Currently, X always starts, so no need to trigger computer move here.
}

// Add event listeners
resetButton.addEventListener('click', resetGame);
gameModeSelect.addEventListener('change', resetGame); // Reset game when mode changes

// Initialize the game when the page loads
initializeBoard();