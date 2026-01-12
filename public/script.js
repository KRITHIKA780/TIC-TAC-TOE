// Views
const mainMenu = document.getElementById('main-menu');
const gameView = document.getElementById('game-view');
const settingsModal = document.getElementById('settings-modal');

// UI Elements
const boardElement = document.getElementById('board');
const statusMessage = document.getElementById('status-message');
const nameX = document.getElementById('name-x');
const nameO = document.getElementById('name-o');

// Game State
let localBoard = Array(9).fill(null);
let currentTurn = 'X';
let gameMode = 'local'; // 'local' or 'ai'
let gameActive = true;

// Navigation
function showMainMenu() {
    mainMenu.classList.remove('hidden');
    gameView.classList.add('hidden');
    settingsModal.classList.add('hidden');
}

function startLocalGame() {
    gameMode = 'local';
    initGame('Player 1', 'Player 2');
}

function startAiGame() {
    gameMode = 'ai';
    initGame('Human', 'Quantum Bot');
}

function initGame(p1, p2) {
    mainMenu.classList.add('hidden');
    gameView.classList.remove('hidden');
    localBoard = Array(9).fill(null);
    currentTurn = 'X';
    gameActive = true;

    nameX.textContent = p1;
    nameO.textContent = p2;
    renderBoard(localBoard);
    statusMessage.textContent = `${p1.toUpperCase()} TURN`;
}

function toggleSettings() {
    settingsModal.classList.toggle('hidden');
}

// Game Functions
function renderBoard(board) {
    boardElement.innerHTML = '';
    board.forEach((val, idx) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = idx;
        cell.textContent = val || '';
        if (val) cell.classList.add(val.toLowerCase());
        cell.addEventListener('click', () => handleCellClick(idx));
        boardElement.appendChild(cell);
    });
}

function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const idx = cell.dataset.index;
        const val = localBoard[idx];
        cell.textContent = val || '';
        cell.classList.remove('x', 'o');
        if (val) cell.classList.add(val.toLowerCase());
    });
}

function handleCellClick(index) {
    if (!gameActive || localBoard[index]) return;

    makeMove(index);

    if (gameMode === 'ai' && gameActive && currentTurn === 'O') {
        setTimeout(makeAiMove, 600);
    }
}

function makeMove(index) {
    localBoard[index] = currentTurn;
    updateBoard();

    const winResult = checkWin(localBoard);
    if (winResult) {
        gameActive = false;
        const winnerName = currentTurn === 'X' ? nameX.textContent : nameO.textContent;
        statusMessage.textContent = `${winnerName.toUpperCase()} WINS!`;
        highlightWinningLine(winResult);
    } else if (localBoard.every(c => c !== null)) {
        gameActive = false;
        statusMessage.textContent = "STALEMATE!";
    } else {
        currentTurn = currentTurn === 'X' ? 'O' : 'X';
        const currentPlayerName = currentTurn === 'X' ? nameX.textContent : nameO.textContent;
        statusMessage.textContent = `${currentPlayerName.toUpperCase()} TURN`;
    }
}

function checkWin(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (const line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
    }
    return null;
}

function highlightWinningLine(line) {
    line.forEach(idx => {
        const cell = document.querySelector(`.cell[data-index="${idx}"]`);
        if (cell) {
            cell.style.background = 'rgba(255, 60, 92, 0.4)';
            cell.style.boxShadow = '0 0 20px var(--neon-red)';
        }
    });
}

// AI Logic (Minimax)
function makeAiMove() {
    const bestMove = getBestMove(localBoard, 'O');
    if (bestMove !== -1) {
        makeMove(bestMove);
    }
}

function getBestMove(board, aiSymbol) {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = aiSymbol;
            let score = minimax(board, 0, false, aiSymbol);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing, aiSymbol) {
    const opponentSymbol = aiSymbol === 'X' ? 'O' : 'X';
    const winLine = checkWin(board);

    if (winLine) {
        const winnerSymbol = board[winLine[0]];
        return winnerSymbol === aiSymbol ? 10 - depth : depth - 10;
    }
    if (board.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = aiSymbol;
                let score = minimax(board, depth + 1, false, aiSymbol);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = opponentSymbol;
                let score = minimax(board, depth + 1, true, aiSymbol);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

document.getElementById('reset-game').addEventListener('click', () => {
    const p1 = nameX.textContent;
    const p2 = nameO.textContent;
    initGame(p1, p2);
});
