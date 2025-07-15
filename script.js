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
    constructor(onStartGame) {
        this.startScreen = document.getElementById('start-screen');
        this.playerSelectionButtons = document.querySelectorAll('.player-option');
        this.startGameButton = document.getElementById('start-game');
        this.onStartGame = onStartGame;
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
            this.onStartGame(this.numPlayers);
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
        this.boardSize = 600; // Base size, will be used for scaling
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
        this.updateStatus(`It's <span style="color: ${this.currentPlayer};">${this.capitalize(this.currentPlayer)}</span>'s turn. Let's roll!`);
        this.updatePlayerTurnIndicator();

        window.addEventListener('resize', () => {
            this.drawBoard();
            this.drawPieces();
        });
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    generatePath() {
        const s = this.boardSize / 600; // scaling factor
        const p = [];
        // Red Path (bottom)
        p.push({ x: 240*s, y: 550*s }); p.push({ x: 240*s, y: 510*s }); p.push({ x: 240*s, y: 470*s }); p.push({ x: 240*s, y: 430*s }); p.push({ x: 240*s, y: 390*s });
        p.push({ x: 190*s, y: 350*s }); p.push({ x: 150*s, y: 350*s }); p.push({ x: 110*s, y: 350*s }); p.push({ x: 70*s, y: 350*s }); p.push({ x: 30*s, y: 350*s });
        p.push({ x: 30*s, y: 310*s }); p.push({ x: 30*s, y: 270*s });
        // Green Path (left)
        p.push({ x: 30*s, y: 230*s }); p.push({ x: 70*s, y: 230*s }); p.push({ x: 110*s, y: 230*s }); p.push({ x: 150*s, y: 230*s }); p.push({ x: 190*s, y: 230*s });
        p.push({ x: 230*s, y: 190*s }); p.push({ x: 230*s, y: 150*s }); p.push({ x: 230*s, y: 110*s }); p.push({ x: 230*s, y: 70*s }); p.push({ x: 230*s, y: 30*s });
        p.push({ x: 270*s, y: 30*s }); p.push({ x: 310*s, y: 30*s });
        // Blue Path (top)
        p.push({ x: 350*s, y: 30*s }); p.push({ x: 350*s, y: 70*s }); p.push({ x: 350*s, y: 110*s }); p.push({ x: 350*s, y: 150*s }); p.push({ x: 350*s, y: 190*s });
        p.push({ x: 390*s, y: 230*s }); p.push({ x: 430*s, y: 230*s }); p.push({ x: 470*s, y: 230*s }); p.push({ x: 510*s, y: 230*s }); p.push({ x: 550*s, y: 230*s });
        p.push({ x: 550*s, y: 270*s }); p.push({ x: 550*s, y: 310*s });
        // Yellow Path (right)
        p.push({ x: 550*s, y: 350*s }); p.push({ x: 510*s, y: 350*s }); p.push({ x: 470*s, y: 350*s }); p.push({ x: 430*s, y: 350*s }); p.push({ x: 390*s, y: 350*s });
        p.push({ x: 350*s, y: 390*s }); p.push({ x: 350*s, y: 430*s }); p.push({ x: 350*s, y: 470*s }); p.push({ x: 350*s, y: 510*s }); p.push({ x: 350*s, y: 550*s });
        p.push({ x: 310*s, y: 550*s }); p.push({ x: 270*s, y: 550*s });
        return p;
    }

    generateHomePaths() {
        const s = this.boardSize / 600; // scaling factor
        return {
            red: [ { x: 270*s, y: 510*s }, { x: 270*s, y: 470*s }, { x: 270*s, y: 430*s }, { x: 270*s, y: 390*s }, { x: 270*s, y: 350*s }, { x: 270*s, y: 310*s } ],
            green: [ { x: 70*s, y: 270*s }, { x: 110*s, y: 270*s }, { x: 150*s, y: 270*s }, { x: 190*s, y: 270*s }, { x: 230*s, y: 270*s }, { x: 270*s, y: 270*s } ],
            blue: [ { x: 310*s, y: 70*s }, { x: 310*s, y: 110*s }, { x: 310*s, y: 150*s }, { x: 310*s, y: 190*s }, { x: 310*s, y: 230*s }, { x: 310*s, y: 270*s } ],
            yellow: [ { x: 510*s, y: 310*s }, { x: 470*s, y: 310*s }, { x: 430*s, y: 310*s }, { x: 390*s, y: 310*s }, { x: 350*s, y: 310*s }, { x: 310*s, y: 310*s } ]
        };
    }

    generateHomeBaseCoords() {
        const s = this.boardSize / 600; // scaling factor
        return {
            red: [ { x: 60*s, y: 450*s }, { x: 150*s, y: 450*s }, { x: 60*s, y: 540*s }, { x: 150*s, y: 540*s } ],
            green: [ { x: 60*s, y: 60*s }, { x: 150*s, y: 60*s }, { x: 60*s, y: 150*s }, { x: 150*s, y: 150*s } ],
            blue: [ { x: 450*s, y: 60*s }, { x: 540*s, y: 60*s }, { x: 450*s, y: 150*s }, { x: 540*s, y: 150*s } ],
            yellow: [ { x: 450*s, y: 450*s }, { x: 540*s, y: 450*s }, { x: 450*s, y: 540*s }, { x: 540*s, y: 540*s } ]
        };
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
                this.boardContainer.appendChild(piece);
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
            3: 'rotateY(-180deg)',
            4: 'rotateY(90deg)',
            5: 'rotateX(-90deg)',
            6: 'rotateX(90deg)'
        };

        dice.classList.add('rolling');

        setTimeout(() => {
            dice.classList.remove('rolling');
            const rotations = {
                1: 'rotateY(0deg)',
                2: 'rotateY(-90deg)',
                3: 'rotateY(-180deg)',
                4: 'rotateY(90deg)',
                5: 'rotateX(-90deg)',
                6: 'rotateX(90deg)'
            };
            dice.style.transform = rotations[this.diceRoll];
            this.result.textContent = `You rolled: ${this.diceRoll}`;
            this.updateStatus(`${this.capitalize(this.currentPlayer)}'s turn. Rolled a ${this.diceRoll}. Click a piece to move.`);
            this.highlightMovablePieces();
            this.addPieceClickListeners();
        }, 1500);
    }

    highlightMovablePieces() {
        document.querySelectorAll('.piece.highlight').forEach(p => p.classList.remove('highlight'));
        const player = this.players[this.currentPlayer];
        player.pieces.forEach((pos, i) => {
            if (pos !== 58) { // Not finished
                const pieceElement = document.querySelector(`.piece[data-color="${this.currentPlayer}"][data-index="${i}"]`);
                if (pieceElement) {
                    pieceElement.classList.add('highlight');
                }
            }
        });
    }

    addPieceClickListeners() {
        document.querySelectorAll(`.${this.currentPlayer}-piece`).forEach(p => {
            p.addEventListener('click', (e) => this.movePiece(e));
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

        // From base
        if (currentPos === -1) {
            if (this.diceRoll === 6) {
                player.pieces[pieceIndex] = player.startPos;
                this.handleCapture(player.startPos, color);
                this.endTurn();
            } else {
                this.updateStatus('You need a 6 to start.');
            }
            return;
        }

        // --- Main Path and Home Path Logic ---
        const homeEntry = player.homeEntryPos;
        const distToHomeEntry = (homeEntry - currentPos + 52) % 52;

        if (currentPos < 52 && this.diceRoll > distToHomeEntry) { // Entering home path
            const homePathPos = 51 + (this.diceRoll - distToHomeEntry);
            if (homePathPos < 58) {
                player.pieces[pieceIndex] = homePathPos;
            } else if (homePathPos === 58) {
                player.pieces[pieceIndex] = 58; // Finished
            }
        } else if (currentPos >= 52) { // Already in home path
            const newHomePos = currentPos + this.diceRoll;
            if (newHomePos < 58) {
                player.pieces[pieceIndex] = newHomePos;
            } else if (newHomePos === 58) {
                player.pieces[pieceIndex] = 58; // Finished
            }
        } else { // Standard move on main path
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
        this.updateStatus(`Congratulations ${this.capitalize(winner)}!`);
    }

    handleCapture(pos, attackerColor) {
        if (this.safeSpots.includes(pos)) return;

        for (const color in this.players) {
            if (color !== attackerColor) {
                const player = this.players[color];
                player.pieces = player.pieces.map(p => {
                    if (p === pos) {
                        this.updateStatus(`<span style="color: ${attackerColor};">${this.capitalize(attackerColor)}</span> captured <span style="color: ${color};">${this.capitalize(color)}</span>'s piece!`);
                        return -1; // Send back to base
                    }
                    return p;
                });
            }
        }
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
        if (this.diceRoll !== 6) {
            const playerColors = Object.keys(this.players);
            const currentIndex = playerColors.indexOf(this.currentPlayer);
            this.currentPlayer = playerColors[(currentIndex + 1) % playerColors.length];
        } else {
            this.updateStatus(`It's <span style="color: ${this.currentPlayer};">${this.capitalize(this.currentPlayer)}</span>'s turn again! Roll the dice.`);
        }
        this.updatePlayerTurnIndicator();
    }

    updatePlayerTurnIndicator() {
        document.body.className = `current-player-${this.currentPlayer}`;
         if (this.diceRoll !== 6) {
            this.updateStatus(`It's <span style="color: ${this.currentPlayer};">${this.capitalize(this.currentPlayer)}</span>'s turn. Roll the dice.`);
        }
    }

    updateStatus(message) {
        this.status.innerHTML = message;
    }

    drawBoard() {
        const board = document.getElementById('board');
        board.innerHTML = ''; // Clear existing board
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

        this.path.forEach(p => {
            const cell = document.createElement('div');
            cell.className = 'path-cell';
            cell.style.left = `${p.x * s}px`;
            cell.style.top = `${p.y * s}px`;
            cell.style.width = `${40 * s}px`;
            cell.style.height = `${40 * s}px`;
            board.appendChild(cell);
        });

        for (const color in this.homePaths) {
            this.homePaths[color].forEach(p => {
                const cell = document.createElement('div');
                cell.className = `path-cell home-path-cell ${color}-path`;
                cell.style.left = `${p.x * s}px`;
                cell.style.top = `${p.y * s}px`;
                cell.style.width = `${40 * s}px`;
                cell.style.height = `${40 * s}px`;
                board.appendChild(cell);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const startScreen = new StartScreen(numPlayers => {
        new Game(numPlayers);
    });
});
