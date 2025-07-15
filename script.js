class Player {
    constructor(color, startPosition, homeEntryIndex) {
        this.color = color;
        this.startPosition = startPosition;
        this.homeEntryIndex = homeEntryIndex;
        this.tokens = Array(4).fill("base");
        this.completed = 0;
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
            red: { startPosition: 0, homeEntryIndex: 50 },
            green: { startPosition: 13, homeEntryIndex: 11 },
            blue: { startPosition: 26, homeEntryIndex: 24 },
            yellow: { startPosition: 39, homeEntryIndex: 37 }
        };

        activePlayers.forEach(color => {
            this.players[color] = new Player(color, playerDefs[color].startPosition, playerDefs[color].homeEntryIndex);
        });

        this.currentPlayer = 'red';
        this.diceRoll = 0;
        this.gameover = false;
        this.safeSpots = [1, 9, 14, 22, 27, 35, 40, 48];
        this.boardLength = 52;
        this.homeLength = 6;
        this.boardSize = 600;
        this.cellSize = 40;
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
        this.addSimulateButton();
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
        // Grid-based coordinates, 40px cells, 10px border, centered on cell centers
        p[0] = { x: 300 * s, y: 570 * s }; // Red start (0), bottom center
        p[1] = { x: 260 * s, y: 570 * s }; p[2] = { x: 220 * s, y: 570 * s }; p[3] = { x: 180 * s, y: 570 * s };
        p[4] = { x: 140 * s, y: 570 * s }; p[5] = { x: 100 * s, y: 530 * s }; p[6] = { x: 100 * s, y: 490 * s };
        p[7] = { x: 100 * s, y: 450 * s }; p[8] = { x: 100 * s, y: 410 * s }; p[9] = { x: 100 * s, y: 370 * s };
        p[10] = { x: 100 * s, y: 330 * s }; p[11] = { x: 60 * s, y: 290 * s };
        p[12] = { x: 60 * s, y: 250 * s }; p[13] = { x: 100 * s, y: 250 * s }; // Green start (13)
        p[14] = { x: 140 * s, y: 250 * s }; p[15] = { x: 180 * s, y: 250 * s }; p[16] = { x: 220 * s, y: 250 * s };
        p[17] = { x: 260 * s, y: 250 * s }; p[18] = { x: 260 * s, y: 210 * s }; p[19] = { x: 260 * s, y: 170 * s };
        p[20] = { x: 260 * s, y: 130 * s }; p[21] = { x: 260 * s, y: 90 * s }; p[22] = { x: 260 * s, y: 50 * s };
        p[23] = { x: 300 * s, y: 50 * s };
        p[24] = { x: 340 * s, y: 50 * s }; p[25] = { x: 380 * s, y: 50 * s }; p[26] = { x: 420 * s, y: 50 * s }; // Blue start (26)
        p[27] = { x: 460 * s, y: 50 * s }; p[28] = { x: 500 * s, y: 50 * s }; p[29] = { x: 540 * s, y: 90 * s };
        p[30] = { x: 540 * s, y: 130 * s }; p[31] = { x: 540 * s, y: 170 * s }; p[32] = { x: 540 * s, y: 210 * s };
        p[33] = { x: 540 * s, y: 250 * s }; p[34] = { x: 540 * s, y: 290 * s }; p[35] = { x: 540 * s, y: 330 * s };
        p[36] = { x: 540 * s, y: 370 * s }; p[37] = { x: 500 * s, y: 410 * s }; p[38] = { x: 460 * s, y: 410 * s };
        p[39] = { x: 420 * s, y: 410 * s }; // Yellow start (39)
        p[40] = { x: 380 * s, y: 410 * s }; p[41] = { x: 340 * s, y: 450 * s }; p[42] = { x: 340 * s, y: 490 * s };
        p[43] = { x: 340 * s, y: 530 * s }; p[44] = { x: 340 * s, y: 570 * s }; p[45] = { x: 300 * s, y: 570 * s };
        p[46] = { x: 260 * s, y: 570 * s }; p[47] = { x: 220 * s, y: 570 * s }; p[48] = { x: 180 * s, y: 570 * s };
        p[49] = { x: 140 * s, y: 570 * s }; p[50] = { x: 100 * s, y: 570 * s }; p[51] = { x: 60 * s, y: 570 * s };
        return p;
    }

    generateHomePaths() {
        const s = this.boardSize / 600;
        return {
            red: [
                { x: 300 * s, y: 510 * s }, { x: 300 * s, y: 470 * s }, { x: 300 * s, y: 430 * s },
                { x: 300 * s, y: 390 * s }, { x: 300 * s, y: 350 * s }, { x: 300 * s, y: 310 * s }
            ],
            green: [
                { x: 100 * s, y: 290 * s }, { x: 140 * s, y: 290 * s }, { x: 180 * s, y: 290 * s },
                { x: 220 * s, y: 290 * s }, { x: 260 * s, y: 290 * s }, { x: 300 * s, y: 290 * s }
            ],
            blue: [
                { x: 380 * s, y: 90 * s }, { x: 380 * s, y: 130 * s }, { x: 380 * s, y: 170 * s },
                { x: 380 * s, y: 210 * s }, { x: 380 * s, y: 250 * s }, { x: 380 * s, y: 290 * s }
            ],
            yellow: [
                { x: 500 * s, y: 370 * s }, { x: 460 * s, y: 370 * s }, { x: 420 * s, y: 370 * s },
                { x: 380 * s, y: 370 * s }, { x: 340 * s, y: 370 * s }, { x: 300 * s, y: 370 * s }
            ]
        };
    }

    generateHomeBaseCoords() {
        const s = this.boardSize / 600;
        return {
            red: [
                { x: 60 * s, y: 450 * s }, { x: 150 * s, y: 450 * s },
                { x: 60 * s, y: 540 * s }, { x: 150 * s, y: 540 * s }
            ],
            green: [
                { x: 60 * s, y: 60 * s }, { x: 150 * s, y: 60 * s },
                { x: 60 * s, y: 150 * s }, { x: 150 * s, y: 150 * s }
            ],
            blue: [
                { x: 450 * s, y: 60 * s }, { x: 540 * s, y: 60 * s },
                { x: 450 * s, y: 150 * s }, { x: 540 * s, y: 150 * s }
            ],
            yellow: [
                { x: 450 * s, y: 450 * s }, { x: 540 * s, y: 450 * s },
                { x: 450 * s, y: 540 * s }, { x: 540 * s, y: 540 * s }
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
            cell.style.left = `${Math.round(p.x)}px`;
            cell.style.top = `${Math.round(p.y)}px`;
            cell.style.width = `${this.cellSize * s}px`;
            cell.style.height = `${this.cellSize * s}px`;
            board.appendChild(cell);
        });

        for (const color in this.homePaths) {
            this.homePaths[color].forEach((p, i) => {
                const cell = document.createElement('div');
                cell.className = `path-cell home-path-cell ${color}-path`;
                cell.style.left = `${Math.round(p.x)}px`;
                cell.style.top = `${Math.round(p.y)}px`;
                cell.style.width = `${this.cellSize * s}px`;
                cell.style.height = `${this.cellSize * s}px`;
                if (i === 5) {
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
        const s = boardRect.width / this.boardSize;

        for (const color in this.players) {
            const player = this.players[color];
            player.tokens.forEach((pos, i) => {
                if (typeof pos === "string" && pos.startsWith("home-") && parseInt(pos.split("-")[1]) === 5) return;
                const piece = document.createElement('div');
                piece.className = `piece ${color}-piece`;
                piece.dataset.color = color;
                piece.dataset.index = i;
                let coords;
                if (pos === "base") {
                    coords = this.homeBaseCoords[color][i];
                } else if (typeof pos === "string" && pos.startsWith("home-")) {
                    const homePos = parseInt(pos.split("-")[1]);
                    coords = this.homePaths[color][homePos];
                } else {
                    coords = this.path[pos];
                }
                piece.style.left = `${Math.round(coords.x * s)}px`;
                piece.style.top = `${Math.round(coords.y * s)}px`;
                piece.style.transform = `translate(-${Math.round(this.cellSize * s / 2)}px, -${Math.round(this.cellSize * s / 2)}px)`;
                this.boardContainer.appendChild(piece);
                console.log(`${color} piece ${i}: pos=${pos}, coords=(${Math.round(coords.x * s)}, ${Math.round(coords.y * s)})`);
            });
        }
    }

    rollDice() {
        if (this.gameover) return;
        this.diceRoll = Math.floor(Math.random() * 6) + 1;
        console.log(`Generated roll: ${this.diceRoll}`); // Initial roll
        console.log(`Before UI update: diceRoll=${this.diceRoll}`); // Before animation

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
            console.log(`After animation: diceRoll=${this.diceRoll}`); // After animation
            dice.classList.remove('rolling');
            dice.style.transform = rotations[this.diceRoll];
            this.result.textContent = `You rolled: ${this.diceRoll}`; // Explicit display
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
        return player.tokens.some((pos, i) => this.isValidMove(pos, i));
    }

    isValidMove(pos, tokenIndex) {
        const player = this.players[this.currentPlayer];
        if (pos === "base" && this.diceRoll !== 6) return false;
        if (pos === "base") return true;
        if (typeof pos === "number") {
            const newPosition = pos + this.diceRoll;
            if ((pos < player.homeEntryIndex && newPosition > player.homeEntryIndex) ||
                (player.homeEntryIndex < pos && newPosition >= this.boardLength + this.homeLength)) {
                const homePos = newPosition - player.homeEntryIndex - 1;
                return homePos < this.homeLength;
            }
            if (newPosition >= this.boardLength) return true;
            return true;
        }
        if (typeof pos === "string" && pos.startsWith("home-")) {
            const currentHomePos = parseInt(pos.split("-")[1]);
            return currentHomePos + this.diceRoll < this.homeLength;
        }
        return false;
    }

    highlightMovablePieces() {
        document.querySelectorAll('.piece.highlight').forEach(p => p.classList.remove('highlight'));
        const player = this.players[this.currentPlayer];
        player.tokens.forEach((pos, i) => {
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
        const tokenIndex = parseInt(pieceElement.dataset.index);
        const player = this.players[color];
        const currentPos = player.tokens[tokenIndex];

        console.log(`Move attempt: color=${color}, token=${tokenIndex}, pos=${currentPos}, roll=${this.diceRoll}`); // Debug roll
        if (!this.isValidMove(currentPos, tokenIndex)) {
            this.updateStatus('Invalid move! Select another piece.');
            return;
        }

        if (currentPos === "base") {
            if (this.diceRoll === 6) {
                player.tokens[tokenIndex] = player.startPosition;
                this.updateStatus(`<span style="color: ${color};">${this.capitalize(color)}</span> moved a piece to position ${player.startPosition}!`);
                this.handleCapture(player.startPosition, color);
                this.drawPieces();
                this.endTurn();
            } else {
                this.updateStatus('You need a 6 to start.');
            }
            return;
        }

        let newPosition;
        if (typeof currentPos === "number") {
            newPosition = currentPos + this.diceRoll;

            if ((currentPos < player.homeEntryIndex && newPosition > player.homeEntryIndex) ||
                (player.homeEntryIndex < currentPos && newPosition >= this.boardLength + this.homeLength)) {
                const homePos = newPosition - player.homeEntryIndex - 1;
                if (homePos < this.homeLength) {
                    player.tokens[tokenIndex] = `home-${homePos}`;
                    if (homePos === this.homeLength - 1) {
                        player.completed += 1;
                        this.updateStatus(`<span style="color: ${color};">${this.capitalize(color)}</span>'s piece reached the finish!`);
                        if (player.completed === 4) {
                            this.gameover = true;
                            this.showGameOver(color);
                        }
                    }
                }
            } else {
                if (newPosition >= this.boardLength) newPosition %= this.boardLength;
                player.tokens[tokenIndex] = newPosition;
                this.handleCapture(newPosition, color);
            }
        } else if (typeof currentPos === "string" && currentPos.startsWith("home-")) {
            const currentHomePos = parseInt(currentPos.split("-")[1]);
            const newHomePos = currentHomePos + this.diceRoll;
            if (newHomePos < this.homeLength) {
                player.tokens[tokenIndex] = `home-${newHomePos}`;
                if (newHomePos === this.homeLength - 1) {
                    player.completed += 1;
                    this.updateStatus(`<span style="color: ${color};">${this.capitalize(color)}</span>'s piece reached the finish!`);
                    if (player.completed === 4) {
                        this.gameover = true;
                        this.showGameOver(color);
                    }
                }
                this.drawPieces();
            }
        }

        if (!this.gameover) this.endTurn();
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
                player.tokens = player.tokens.map((p, i) => {
                    if (typeof p === "number" && p === pos) {
                        this.updateStatus(`<span style="color: ${attackerColor};">${this.capitalize(attackerColor)}</span> captured <span style="color: ${color};">${this.capitalize(color)}</span>'s piece!`);
                        console.log(`${attackerColor} captured ${color}'s piece at pos ${pos}`);
                        return "base";
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

    addSimulateButton() {
        const simulateBtn = document.createElement('button');
        simulateBtn.textContent = 'Simulate 100 Turns';
        simulateBtn.style.padding = '15px 30px';
        simulateBtn.style.fontSize = '1.2em';
        simulateBtn.style.marginTop = '10px';
        simulateBtn.style.backgroundColor = 'var(--blue)';
        simulateBtn.style.color = 'var(--text-light)';
        simulateBtn.style.border = 'none';
        simulateBtn.style.borderRadius = '10px';
        simulateBtn.style.cursor = 'pointer';
        simulateBtn.addEventListener('click', () => this.simulateTurns(100));
        this.gameContainer.appendChild(simulateBtn);
    }

    simulateTurns(numTurns) {
        console.log("Starting simulation of 100 turns...");
        let turn = 0;
        while (turn < numTurns && !this.gameover) {
            const player = this.players[this.currentPlayer];
            const roll = Math.floor(Math.random() * 6) + 1;
            console.log(`Turn ${turn + 1}: ${player.color} rolled ${roll}`);
            let moved = false;
            for (let i = 0; i < 4; i++) {
                if (this.moveToken(this.currentPlayer, i, roll)) {
                    moved = true;
                    break;
                }
            }
            if (!moved) {
                console.log(`${player.color} has no valid moves.`);
            }
            if (!moved && roll !== 6) {
                const playerColors = Object.keys(this.players);
                const currentIndex = playerColors.indexOf(this.currentPlayer);
                this.currentPlayer = playerColors[(currentIndex + 1) % playerColors.length];
            }
            turn++;
        }
        console.log("Simulation ended. Final state:");
        for (const color in this.players) {
            console.log(`${color}: tokens=${this.players[color].tokens}, completed=${this.players[color].completed}`);
        }
        if (this.gameover) {
            this.updateStatus(`Simulation ended: <span style="color: ${this.currentPlayer};">${this.capitalize(this.currentPlayer)}</span> wins!`);
        } else {
            this.updateStatus("Simulation ended without a winner.");
        }
    }

    moveToken(playerIndex, tokenIndex, roll) {
        const player = this.players[Object.keys(this.players)[playerIndex]];
        const currentPos = player.tokens[tokenIndex];

        if (currentPos === "base") {
            if (roll === 6) {
                player.tokens[tokenIndex] = player.startPosition;
                this.drawPieces();
                return true;
            }
            return false;
        }

        if (typeof currentPos === "number") {
            let newPosition = currentPos + roll;

            if ((currentPos < player.homeEntryIndex && newPosition > player.homeEntryIndex) ||
                (player.homeEntryIndex < currentPos && newPosition >= this.boardLength + this.homeLength)) {
                const homePos = newPosition - player.homeEntryIndex - 1;
                if (homePos >= this.homeLength) return false;
                player.tokens[tokenIndex] = `home-${homePos}`;
                if (homePos === this.homeLength - 1) {
                    player.completed += 1;
                    if (player.completed === 4) {
                        this.gameover = true;
                    }
                }
                this.drawPieces();
                return true;
            }

            if (newPosition >= this.boardLength) newPosition %= this.boardLength;

            for (let i = 0; i < Object.keys(this.players).length; i++) {
                if (i === playerIndex) continue;
                const opponent = this.players[Object.keys(this.players)[i]];
                for (let j = 0; j < 4; j++) {
                    if (opponent.tokens[j] === newPosition && !this.safeSpots.includes(newPosition)) {
                        opponent.tokens[j] = "base";
                        this.updateStatus(`<span style="color: ${player.color};">${this.capitalize(player.color)}</span> captured <span style="color: ${opponent.color};">${this.capitalize(opponent.color)}</span>'s piece!`);
                    }
                }
            }

            player.tokens[tokenIndex] = newPosition;
            this.drawPieces();
            return true;
        }

        if (typeof currentPos === "string" && currentPos.startsWith("home-")) {
            const pos = parseInt(currentPos.split("-")[1]);
            const newPos = pos + roll;
            if (newPos < this.homeLength) {
                player.tokens[tokenIndex] = `home-${newPos}`;
                if (newPos === this.homeLength - 1) {
                    player.completed += 1;
                    if (player.completed === 4) {
                        this.gameover = true;
                    }
                }
                this.drawPieces();
                return true;
            }
        }
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StartScreen();
});
