// Game state
const players = {
    red: { pieces: [-1, -1, -1, -1], start: 0, home: 52 },
    green: { pieces: [-1, -1, -1, -1], start: 13, home: 53 },
    blue: { pieces: [-1, -1, -1, -1], start: 26, home: 54 },
    yellow: { pieces: [-1, -1, -1, -1], start: 39, home: 55 }
};
let currentPlayer = 'red';
let diceRoll = 0;

// DOM elements
const board = document.getElementById('board');
const rollBtn = document.getElementById('roll');
const result = document.getElementById('result');
const status = document.getElementById('status');

// Path and home positions (simplified)
const path = Array.from({ length: 52 }, (_, i) => i);
const safeSpots = [0, 8, 13, 21, 26, 34, 39, 47];

function drawBoard() {
    board.innerHTML = '';
    // Draw path
    for (let i = 0; i < 52; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell path';
        if (safeSpots.includes(i)) cell.classList.add('safe');
        cell.textContent = i;
        board.appendChild(cell);
    }
    // Draw homes
    for (const color in players) {
        const home = document.createElement('div');
        home.className = `cell home-${color}`;
        home.textContent = color.charAt(0).toUpperCase();
        board.appendChild(home);
    }
    drawPieces();
}

function drawPieces() {
    // Clear existing pieces
    document.querySelectorAll('.piece').forEach(p => p.remove());

    for (const color in players) {
        players[color].pieces.forEach((pos, i) => {
            const piece = document.createElement('div');
            piece.className = `piece ${color}-piece`;
            piece.textContent = `${color.charAt(0).toUpperCase()}${i + 1}`;

            if (pos === -1) { // In home
                // Position in home area (simplified)
                const home = document.querySelector(`.home-${color}`);
                piece.style.top = `${home.offsetTop + 5 + (i * 25)}px`;
                piece.style.left = `${home.offsetLeft + 5}px`;
            } else { // On board
                const cell = board.children[pos];
                piece.style.top = `${cell.offsetTop + 5}px`;
                piece.style.left = `${cell.offsetLeft + 5}px`;
            }
            document.body.appendChild(piece);
        });
    }
}

function rollDice() {
    diceRoll = Math.floor(Math.random() * 6) + 1;
    result.textContent = `You rolled: ${diceRoll}`;
    status.textContent = `${currentPlayer}'s turn. Rolled a ${diceRoll}. Click a piece to move.`;
    // Add piece click listeners
    document.querySelectorAll(`.${currentPlayer}-piece`).forEach(p => {
        p.addEventListener('click', movePiece);
    });
}

function movePiece(event) {
    const pieceElement = event.target;
    const color = pieceElement.classList[1].split('-')[0];
    const pieceIndex = parseInt(pieceElement.textContent.slice(1)) - 1;

    const player = players[color];
    const currentPos = player.pieces[pieceIndex];

    if (currentPos === -1) {
        if (diceRoll === 6) {
            player.pieces[pieceIndex] = player.start;
        } else {
            status.textContent = 'You need a 6 to start.';
            return;
        }
    } else {
        const newPos = (currentPos + diceRoll) % 52;
        // Check for capture
        for (const oppColor in players) {
            if (oppColor !== color) {
                players[oppColor].pieces.forEach((oppPos, i) => {
                    if (oppPos === newPos && !safeSpots.includes(newPos)) {
                        players[oppColor].pieces[i] = -1; // Send to home
                        status.textContent = `Captured ${oppColor}'s piece!`;
                    }
                });
            }
        }
        player.pieces[pieceIndex] = newPos;
    }

    // End turn
    drawPieces();
    removePieceClickListeners();
    switchPlayer();
}

function removePieceClickListeners() {
    document.querySelectorAll('.piece').forEach(p => {
        p.removeEventListener('click', movePiece);
    });
}

function switchPlayer() {
    const playerColors = Object.keys(players);
    const currentIndex = playerColors.indexOf(currentPlayer);
    currentPlayer = playerColors[(currentIndex + 1) % playerColors.length];
    status.textContent = `${currentPlayer}'s turn. Roll the dice.`;
}

// Initial setup
rollBtn.addEventListener('click', rollDice);
drawBoard();
status.textContent = `${currentPlayer}'s turn. Roll the dice.`;
