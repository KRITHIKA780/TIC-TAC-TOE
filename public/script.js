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
let gameMode = 'local';
let gameActive = true;

let settings = {
    difficulty: 'quantum',
    sound: true,
    vibration: true
};

// Navigation
function showMainMenu() {
    mainMenu.classList.remove('hidden');
    gameView.classList.add('hidden');
    settingsModal.classList.add('hidden');
    document.getElementById('local-setup').classList.add('hidden');
}

function showLocalSetup() {
    document.getElementById('local-setup').classList.remove('hidden');
}

function startLocalWithNames() {
    const p1 = document.getElementById('p1-name').value.trim() || 'Player X';
    const p2 = document.getElementById('p2-name').value.trim() || 'Player O';

    if (p1 === p2) {
        alert("Please use unique names for each fighter!");
        return;
    }

    gameMode = 'local_2p';
    document.getElementById('local-setup').classList.add('hidden');
    initGame(p1, p2);
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
    statusMessage.textContent = `${p1.toUpperCase()}'S TURN`;

    // Reset active indicators
    document.querySelector('.player-x-card').classList.add('active');
    document.querySelector('.player-o-card').classList.remove('active');
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
        cell.classList.remove('x', 'o', 'winner');
        cell.style.borderColor = '';
        cell.style.background = '';
        cell.style.boxShadow = '';
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
    if (settings.vibration) navigator.vibrate?.(20);
    playSfx(currentTurn === 'X' ? 'move-x' : 'move-o');

    localBoard[index] = currentTurn;
    updateBoard();

    const winResult = checkWin(localBoard);
    if (winResult) {
        gameActive = false;
        const winnerSymbol = localBoard[winResult[0]];
        const winnerName = winnerSymbol === 'X' ? nameX.textContent : nameO.textContent;
        statusMessage.textContent = `${winnerName.toUpperCase()} DOMINATES!`;
        highlightWinningLine(winResult);
        playSfx('win');
    } else if (localBoard.every(c => c !== null)) {
        gameActive = false;
        statusMessage.textContent = "SYSTEM STALEMATE";
        playSfx('draw');
    } else {
        currentTurn = currentTurn === 'X' ? 'O' : 'X';
        const currentPlayerName = currentTurn === 'X' ? nameX.textContent : nameO.textContent;
        statusMessage.textContent = `${currentPlayerName.toUpperCase()}'S TURN`;

        // Update active player card UI
        document.querySelector('.player-x-card').classList.toggle('active', currentTurn === 'X');
        document.querySelector('.player-o-card').classList.toggle('active', currentTurn === 'O');
    }
}

function playSfx(type) {
    if (!settings.sound) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'move-x') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start();
        osc.stop(now + 0.1);
    } else if (type === 'move-o') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start();
        osc.stop(now + 0.1);
    } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start();
        osc.stop(now + 0.5);
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
    const winnerSymbol = localBoard[line[0]];
    const winnerColor = winnerSymbol === 'X' ? 'var(--neon-red)' : 'var(--neon-blue)';
    const rgb = winnerSymbol === 'X' ? '255, 60, 92' : '0, 242, 255';

    line.forEach(idx => {
        const cell = document.querySelector(`.cell[data-index="${idx}"]`);
        if (cell) {
            cell.style.borderColor = winnerColor;
            cell.style.background = `rgba(${rgb}, 0.2)`;
            cell.style.boxShadow = `0 0 30px ${winnerColor}`;
            cell.classList.add('winner');
        }
    });
}

// AI Logic (Minimax with Difficulty)
function makeAiMove() {
    let move;
    const diff = settings.difficulty;

    if (diff === 'novice') {
        move = getRandomMove();
    } else if (diff === 'expert') {
        // 40% chance of random move, 60% chance of best move
        move = Math.random() < 0.4 ? getRandomMove() : getBestMove(localBoard, 'O');
    } else {
        move = getBestMove(localBoard, 'O');
    }

    if (move !== -1) {
        makeMove(move);
    }
}

function getRandomMove() {
    const available = localBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
    return available[Math.floor(Math.random() * available.length)];
}

function getBestMove(board, aiSymbol) {
    let bestScore = -Infinity;
    let moves = [];

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = aiSymbol;
            let score = minimax(board, 0, false, aiSymbol);
            board[i] = null;

            if (score > bestScore) {
                bestScore = score;
                moves = [i];
            } else if (score === bestScore) {
                moves.push(i);
            }
        }
    }
    // Pick a random move among the best ones for less predictability
    return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : -1;
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

// Settings Handlers
document.getElementById('difficulty-select').addEventListener('change', (e) => {
    settings.difficulty = e.target.value;
});

document.getElementById('sound-toggle').addEventListener('click', function () {
    settings.sound = !settings.sound;
    this.classList.toggle('active', settings.sound);
    this.textContent = settings.sound ? 'ON' : 'OFF';
});

document.getElementById('vibe-toggle').addEventListener('click', function () {
    settings.vibration = !settings.vibration;
    this.classList.toggle('active', settings.vibration);
    this.textContent = settings.vibration ? 'ON' : 'OFF';
});

document.getElementById('reset-game').addEventListener('click', () => {
    const p1 = nameX.textContent;
    const p2 = nameO.textContent;
    initGame(p1, p2);
});
