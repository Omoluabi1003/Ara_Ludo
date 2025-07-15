class Player {
    constructor(color, startPos, homeEntryPos) {
        this.color = color;
        this.pieces = [-1, -1, -1, -1]; // -1: base, 52-57: home path, 58: finished
        this.startPos = startPos;
        this.homeEntryPos = homeEntryPos;
    }

    get finishedPieces() {
        return this.pieces.filter(p => p === 58).length;
    }
}

class StartScreen {
    constructor() {
        this.startScreen = document.getElementById('start-screen');
        this.playerSelectionButtons = document.querySelectorAll('.player-option');
        this.startGameButton = document.getElementById('start-game');
        this.numPlayers = 4;

        this.playerSelectionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.playerSelectionButtons.forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected');
                this.numPlayers = parseInt(e.target.dataset.players);
            });
        });

        this.startGameButton.addEventListener('click', () => {
            this.startScreen.style.display = 'none';
            new Game(this.numPlayers);
        });
    }
}

class Game {
    constructor(numPlayers) {
        this.gameContainer = document.getElementById('game-container');
        this.gameContainer.style.display = 'flex';

        const playerColors = ['red', 'green', 'blue', 'yellow'];
        const activePlayers = playerColors.slice(0, numPlayers);

        this.players = {};
        const playerDefs = {
            red: { startPos: 0, homeEntryPos: 50 },
            green: { startPos: 13, homeEntryPos: 11 },
            blue: { startPos: 26, homeEntryPos: 24 },
            yellow: { startPos: 39, homeEntryPos: 37 }
        };

        activePlayers.forEach(color => {
            this.players[color] = new Player(color, playerDefs[color].startPos, playerDefs[color].homeEntryPos);
        });

        this.currentPlayer = 'red';
        this.diceRoll = 0;
        this.gameover = false;
        this.safeSpots = [0, 8, 13, 21, 26, 34, 39, 47];
        this.boardSize = 600;
        this.path = this.generatePath();
        this.homePaths = this.generateHomePaths();
        this.homeBaseCoords = this.generateHomeBaseCoords();

        this.rollBtn = document.getElementById('roll');
        this.result = document.getElementById('result');
        this.status = document.getElementById('status');
        this.boardContainer = document.getElementById('board-container');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.winnerMessage = document.getElementById('winner-message');

        this.rollBtn.addEventListener('click', () => this.rollDice());
        this.drawBoard();
        this.drawPieces();
        this.updateStatus(`It's <span style="color: ${this.currentPlayer};">${this.capitalize(this.currentPlayer)}</span>'s turn. Roll the dice!`);
        this.updatePlayerTurnIndicator();

        window.addEventListener('resize', () => {
            this.drawBoard();
            this.drawPieces();
        });

        const restartBtn = document.createElement('button');
        restartBtn.textContent = 'Restart Game';
        restartBtn.id = 'restart-game';
        restartBtn.style.padding = '15px 30px';
        restartBtn.style.fontSize = '1.2em';
        restartBtn.style.marginTop = '20px';
        restartBtn.style.backgroundColor = 'var(--green)';
        restartBtn.style.color = 'var(--text-light)';
        restartBtn.style.border = 'none';
        restartBtn.style.borderRadius = '10px';
        restartBtn.style.cursor = 'pointer';
        restartBtn.addEventListener('click', () => location.reload());
        this.gameOverOverlay.appendChild(restartBtn);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    generatePath() {
        const s = this.boardSize / 600;
        const p = [];
        // Red Path (bottom, positions 0-11)
        p[0] = { x: 270*s, y: 550*s }; // Red start (0), adjusted to fix offset
        p[1] = { x: 240*s, y: 550*s }; p[2] = { x: 240*s, y: 510*s }; p[3] = { x: 240*s, y: 470*s }; p[4] = { x: 240*s, y: 430*s };
        p[5] = { x: 240*s, y: 390*s }; p[6] = { x: 190*s, y: 350*s }; p[7] = { x: 150*s, y: 350*s }; p[8] = { x: 110*s, y: 350*s };
        p[9] = { x: 70*s, y: 350*s }; p[10] = { x: 30*s, y: 350*s }; p[11] = { x: 30*s, y: 310*s };
        // Green Path (left, positions 12-23)
        p[12] = { x: 30*s, y: 270*s }; // Adjusted for Green start (13)
        p[13] = { x: 30*s, y: 230*s }; // Green start (13)
        p[14] = { x: 70*s, y: 230*s }; p[15] = { x: 110*s, y: 230*s }; p[16] = { x: 150*s, y: 230*s };
        p[17] = { x: 190*s, y: 230*s }; p[18] = { x: 230*s, y: 190*s }; p[19] = { x: 230*s, y: 150*s };
        p[20] = { x: 230*s, y: 110*s }; p[21] = { x: 230*s, y: 70*s }; p[22] = { x: 230*s, y: 30*s };
        p[23] = { x: 270*s, y: 30*s };
        // Blue Path (top, positions 24-35)
        p[24] = { x: 310*s, y: 30*s }; // Adjusted for Blue start (26)
        p[25] = { x: 350*s, y: 30*s }; // Blue start (26)
        p[26] = { x: 350*s, y: 70*s }; p[27] = { x: 350*s, y: 110*s }; p[28] = { x: 350*s, y: 150*s };
        p[29] = { x: 350*s, y: 190*s }; p[30] = { x: 390*s, y: 230*s }; p[31] = { x: 430*s, y: 230*s };
        p[32] = { x: 470*s, y: 230*s }; p[33] = { x: 510*s, y: 230*s }; p[34] = { x: 550*s, y: 230*s };
        p[35] = { x: 550*s, y: 270*s };
        // Yellow Path (right, positions 36-47)
        p[36] = { x: 550*s, y: 310*s }; // Adjusted for Yellow start (39)
        p[37] = { x: 550*s, y: 350*s }; // Yellow start (39)
        p[38] = { x: 510*s, y: 350*s }; p[39] = { x: 470*s, y: 350*s }; p[40] = { x: 430*s, y: 350*s };
        p[41] = { x: 390*s, y: 350*s }; p[42] = { x: 350*s, y: 390*s }; p[43] = { x: 350*s, y: 430*s };
        p[44] = { x: 350*s, y: 470*s }; p[45] = { x: 350*s, y: 510*s }; p[46] = { x: 350*s, y: 550*s };
        p[47] = { x: 310*s, y: 550*s };
        // Complete the circle (positions 48-51)
        p[48] = { x: 270*s, y: 550*s }; p[49] = { x: 270*s, y: 510*s }; p[50] = { x: 270*s, y: 470*s }; p[51] = { x: 270*s, y: 430*s };
        return p;
    }

    generateHomePaths() {
        const s = this.boardSize / 600;
        return {
            red: [
                { x: 270*s, y: 510*s }, // Adjusted to align with path
                { x: 270*s, y: 470*s }, { x: 270*s, y: 430*s }, { x: 270*s, y: 390*s },
                { x: 270*s, y: 350*s }, { x: 270*s, y: 310*s }
            ],
            green: [
                { x: 70*s, y: 270*s }, // Adjusted to align with path
                { x: 110*s, y: 270*s }, { x: 150*s, y: 270*s }, { x: 190*s, y: 270*s },
                { x: 230*s, y: 270*s }, { x: 270*s, y: 270*s }
            ],
            blue: [
                { x: 310*s, y: 70*s }, // Adjusted to align with path
                { x: 310*s, y: 110*s }, { x: 310*s, y: 150*s }, { x: 310*s, y: 190*s },
                { x: 310*s, y: 230*s }, { x: 310*s, y: 270*s }
            ],
            yellow: [
                { x: 510*s, y: 310*s }, // Adjusted to align with path
                { x: 470*s, y: 310*s }, { x: 430*s, y: 310*s }, { x: 390*s, y: 310*s },
                { x: 350*s, y: 310*s }, { x: 310*s, y: 310*s }
            ]
        };
    }

    generateHomeBaseCoords() {
        const s = this.boardSize / 600;
        return {
            red: [
                { x: 60*s, y: 450*s }, { x: 150*s, y: 450*s },
                { x: 60*s, y: 540*s }, { x: 150*s, y: 540*s }
            ],
            green: [
                { x: 60*s, y: 60*s }, { x: 150*s, y: 60*s },
                { x: 60*s, y: 150*s }, { x: 150*s, y: 150*s }
            ],
            blue: [
                { x: 450*s, y: 60*s }, { x: 540*s, y: 60*s },
                { x: 450*s, y: 150*s }, { x: 540*s, y: 150*s }
            ],
            yellow: [
                { x: 450*s, y: 450*s }, { x: 540*s, y: 450*s },
                { x: 450*s, y: 540*s }, { x: 540*s, y: 540*s }
            ]
        };
    }

    drawBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        const s = this.boardContainer.getBoundingClientRect().width / this.boardSize;

        const homeBases = {
            red: { x: 0, y: this.boardSize * 0.6 * s },
            green: { x: 0, y: 0 },
            blue: { x: this.boardSize * 0.6 * s, y: 0 },
            yellow: { x: this.boardSize * 0.6 * s, y: this.boardSize * 0.6 * s }
        };

        for (const color in homeBases) {
            const base = document.createElement('div');
            base.className = `home-base ${color}-base`;
            base.style.left = `${homeBases[color].x}px`;
            base.style.top = `${homeBases[color].y}px`;
            base.style.width = `${this.boardSize * 0.4 * s}px`;
            base.style.height = `${this.boardSize * 0.4 * s}px`;
            board.appendChild(base);
        }

        this.path.forEach((p, i) => {
            const cell = document.createElement('div');
            cell.className = `path-cell ${this.safeSpots.includes(i) ? 'safe-spot' : ''}`;
            cell.style.left = `${p.x * s}px`;
            cell.style.top = `${p.y * s}px`;
            cell.style.width = `${40 * s}px`;
            cell.style.height = `${40 * s}px`;
            board.appendChild(cell);
        });

        for (const color in this.homePaths) {
            this.homePaths[color].forEach((p, i) => {
                const cell = document.createElement('div');
                cell.className = `path-cell home-path-cell ${color}-path`;
                cell.style.left = `${p.x * s}px`;
                cell.style.top = `${p.y * s}px`;
                cell.style.width = `${40 * s}px`;
                cell.style.height = `${40 * s}px`;
                if (i === 5) { // Last cell in home path (finish)
                    cell.style.backgroundColor = `var(--${color})`;
                    cell.style.border = '2px solid var(--text-dark)';
                }
                board.appendChild(cell);
            });
        }

        const triangle = document.createElement('div');
        triangle.className = 'center-triangle';
        triangle.style.left = `${this.boardSize * 0.4 * s}px`;
        triangle.style.top = `${this.boardSize * 0.4 * s}px`;
        triangle.style.width = `${this.boardSize * 0.2 * s}px`;
        triangle.style.height = `${this.boardSize * 0.2 * s}px`;
        board.appendChild(triangle);
    }

    drawPieces() {
        this.boardContainer.querySelectorAll('.piece').forEach(p => p.remove());
        const boardRect = this.boardContainer.getBoundingClientRect();
        const scale = boardRect.width / this.boardSize;

        for (const color in this.players) {
            const player = this.players[color];
            player.pieces.forEach((pos, i) => {
                if (pos === 58) return;
                const piece = document.createElement('div');
                piece.className = `piece ${color}-piece`;
                piece.dataset.color = color;
                piece.dataset.index = i;
                let coords;
                if (pos === -1) {
                    coords = this.homeBaseCoords[color][i];
                } else if (pos >= 52) {
                    coords = this.homePaths[color][pos - 52];
                } else {
                    coords = this.path[pos];
                }
                piece.style.left = `${coords.x * scale}px`;
                piece.style.top = `${coords.y * scale}px`;
                piece.style.transform = 'translate(-50%, -50%)';
                this.boardContainer.appendChild(piece);
                console.log(`${color} piece ${i}: pos=${pos}, coords=(${coords.x * scale}, ${coords.y * scale})`);
            });
        }
    }

    rollDice() {
        if (this.gameover) return;
        this.diceRoll = Math.floor(Math.random() * 6) + 1;

        const dice = document.getElementById('dice');
        const rotations = {
            1: 'rotateY(0deg)',
            2: 'rotateY(-90deg)',
            3: 'rotateY(180deg)',
            4: 'rotateY(90deg)',
            5: 'rotateX(90deg)',
            6: 'rotateX(-90deg)'
        };

        dice.classList.add('rolling');

        setTimeout(() => {
            dice.classList.remove('rolling');
            dice.style.transform = rotations[this.diceRoll];
            this.result.textContent = `You rolled: ${this.diceRoll}`;
            this.updateStatus(`${this.capitalize(this.currentPlayer)} rolled a ${this.diceRoll}. Select a piece to move.`);
            if (this.hasValidMoves()) {
                this.highlightMovablePieces();
                this.addPieceClickListeners();
            } else {
                this.updateStatus(`${this.capitalize(this.currentPlayer)} has no valid moves. Click Roll to continue.`);
                this.rollBtn.addEventListener('click', () => this.endTurn(), { once: true });
            }
        }, 1500);
    }

    hasValidMoves() {
        const player = this.players[this.currentPlayer];
        return player.pieces.some((pos, i) => this.isValidMove(pos, i));
    }

    isValidMove(pos, pieceIndex) {
        const player = this.players[this.currentPlayer];
        if (pos === 58) return false;
        if (pos === -1 && this.diceRoll !== 6) return false;
        if (pos === -1) return true;
        const homeEntry = player.homeEntryPos;
        const distToHomeEntry = (homeEntry - pos + 52) % 52;
        if (pos < 52 && this.diceRoll > distToHomeEntry) {
            const homePathPos = 51 + (this.diceRoll - distToHomeEntry);
            return homePathPos <= 58;
        }
        if (pos >= 52) {
            return pos + this.diceRoll <= 58;
        }
        return true;
    }

    highlightMovablePieces() {
        document.querySelectorAll('.piece.highlight').forEach(p => p.classList.remove('highlight'));
        const player = this.players[this.currentPlayer];
        player.pieces.forEach((pos, i) => {
            if (this.isValidMove(pos, i)) {
                const pieceElement = document.querySelector(`.piece[data-color="${this.currentPlayer}"][data-index="${i}"]`);
                if (pieceElement) {
                    pieceElement.classList.add('highlight');
                }
            }
        });
    }

    addPieceClickListeners() {
        document.querySelectorAll(`.${this.currentPlayer}-piece`).forEach(p => {
            p.addEventListener('click', (e) => this.movePiece(e), { once: true });
        });
    }

    removePieceClickListeners() {
        const pieces = document.querySelectorAll('.piece');
        pieces.forEach(p => {
            const newPiece = p.cloneNode(true);
            p.parentNode.replaceChild(newPiece, p);
        });
    }

    movePiece(event) {
        const pieceElement = event.target;
        const color = pieceElement.dataset.color;
        const pieceIndex = parseInt(pieceElement.dataset.index);
        const player = this.players[color];
        const currentPos = player.pieces[pieceIndex];

        if (!this.isValidMove(currentPos, pieceIndex)) {
            this.updateStatus('Invalid move! Select another piece.');
            return;
        }

        if (currentPos === -1) {
            if (this.diceRoll === 6) {
                player.pieces[pieceIndex] = player.startPos;
                this.updateStatus(`<span style="color: ${color};">${this.capitalize(color)}</span> moved a piece to position ${player.startPos}!`);
                console.log(`${color} piece ${pieceIndex} moved to startPos=${player.startPos}, coords=(${this.path[player.startPos].x}, ${this.path[player.startPos].y})`);
                this.handleCapture(player.startPos, color);
                this.drawPieces();
                this.endTurn();
            } else {
                this.updateStatus('You need a 6 to start.');
            }
            return;
        }

        const homeEntry = player.homeEntryPos;
        const distToHomeEntry = (homeEntry - currentPos + 52) % 52;

        if (currentPos < 52 && this.diceRoll > distToHomeEntry) {
            const homePathPos = 51 + (this.diceRoll - distToHomeEntry);
            if (homePathPos <= 58) {
                player.pieces[pieceIndex] = homePathPos;
                if (homePathPos === 58) {
                    this.updateStatus(`<span style="color: ${color};">${this.capitalize(color)}</span>'s piece reached the finish!`);
                }
            }
        } else if (currentPos >= 52) {
            const newHomePos = currentPos + this.diceRoll;
            if (newHomePos <= 58) {
                player.pieces[pieceIndex] = newHomePos;
                if (newHomePos === 58) {
                    this.updateStatus(`<span style="color: ${color};">${this.capitalize(color)}</span>'s piece reached the finish!`);
                }
            }
        } else {
            const newPos = (currentPos + this.diceRoll) % 52;
            player.pieces[pieceIndex] = newPos;
            this.handleCapture(newPos, color);
        }

        if (player.finishedPieces === 4) {
            this.gameover = true;
            this.showGameOver(color);
        } else {
            this.endTurn();
        }
    }

    showGameOver(winner) {
        this.winnerMessage.textContent = `${this.capitalize(winner)} Wins!`;
        this.gameOverOverlay.style.display = 'flex';
        this.rollBtn.disabled = true;
        this.updateStatus(`Congratulations <span style="color: ${winner};">${this.capitalize(winner)}</span>!`);
    }

    handleCapture(pos, attackerColor) {
        if (this.safeSpots.includes(pos)) {
            console.log(`No capture at pos ${pos} (safe spot)`);
            return;
        }

        for (const color in this.players) {
            if (color !== attackerColor) {
                const player = this.players[color];
                player.pieces = player.pieces.map(p => {
                    if (p === pos && p < 52) {
                        this.updateStatus(`<span style="color: ${attackerColor};">${this.capitalize(attackerColor)}</span> captured <span style="color: ${color};">${this.capitalize(color)}</span>'s piece!`);
                        console.log(`${attackerColor} captured ${color}'s piece at pos ${pos}`);
                        return -1;
                    }
                    return p;
                });
            }
        }
        this.drawPieces();
    }

    endTurn() {
        this.drawPieces();
        this.removePieceClickListeners();
        document.querySelectorAll('.piece.highlight').forEach(p => p.classList.remove('highlight'));
        if (!this.gameover) {
            this.switchPlayer();
        }
    }

    switchPlayer() {
        const playerColors = Object.keys(this.players);
        if (this.diceRoll !== 6) {
            const currentIndex = playerColors.indexOf(this.currentPlayer);
            this.currentPlayer = playerColors[(currentIndex + 1) % playerColors.length];
            this.updateStatus(`It's <span style="color: ${this.currentPlayer};">${this.capitalize(this.currentPlayer)}</span>'s turn. Roll the dice.`);
        } else {
            this.updateStatus(`It's <span style="color: ${this.currentPlayer};">${this.capitalize(this.currentPlayer)}</span>'s turn again! Roll the dice.`);
        }
        this.updatePlayerTurnIndicator();
    }

    updatePlayerTurnIndicator() {
        document.body.className = `current-player-${this.currentPlayer}`;
    }

    updateStatus(message) {
        this.status.innerHTML = message;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StartScreen();
});
