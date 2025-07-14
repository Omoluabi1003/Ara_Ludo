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

class Game {
    constructor() {
        this.players = {
            red: new Player('red', 0, 50),
            green: new Player('green', 13, 11),
            blue: new Player('blue', 26, 24),
            yellow: new Player('yellow', 39, 37)
        };
        this.currentPlayer = 'red';
        this.diceRoll = 0;
        this.gameover = false;
        this.safeSpots = [0, 8, 13, 21, 26, 34, 39, 47];
        this.path = this.generatePath();
        this.homePaths = this.generateHomePaths();
        this.homeBaseCoords = this.generateHomeBaseCoords();

        this.rollBtn = document.getElementById('roll');
        this.result = document.getElementById('result');
        this.status = document.getElementById('status');
        this.boardContainer = document.getElementById('board-container');

        this.rollBtn.addEventListener('click', () => this.rollDice());
        this.drawPieces();
        this.updateStatus(`${this.capitalize(this.currentPlayer)}'s turn. Roll the dice.`);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    generatePath() {
        const p = [];
        // Red Path (bottom)
        p.push({ x: 240, y: 550 }); p.push({ x: 240, y: 510 }); p.push({ x: 240, y: 470 }); p.push({ x: 240, y: 430 }); p.push({ x: 240, y: 390 });
        p.push({ x: 190, y: 350 }); p.push({ x: 150, y: 350 }); p.push({ x: 110, y: 350 }); p.push({ x: 70, y: 350 }); p.push({ x: 30, y: 350 });
        p.push({ x: 30, y: 310 }); p.push({ x: 30, y: 270 });
        // Green Path (left)
        p.push({ x: 30, y: 230 }); p.push({ x: 70, y: 230 }); p.push({ x: 110, y: 230 }); p.push({ x: 150, y: 230 }); p.push({ x: 190, y: 230 });
        p.push({ x: 230, y: 190 }); p.push({ x: 230, y: 150 }); p.push({ x: 230, y: 110 }); p.push({ x: 230, y: 70 }); p.push({ x: 230, y: 30 });
        p.push({ x: 270, y: 30 }); p.push({ x: 310, y: 30 });
        // Blue Path (top)
        p.push({ x: 350, y: 30 }); p.push({ x: 350, y: 70 }); p.push({ x: 350, y: 110 }); p.push({ x: 350, y: 150 }); p.push({ x: 350, y: 190 });
        p.push({ x: 390, y: 230 }); p.push({ x: 430, y: 230 }); p.push({ x: 470, y: 230 }); p.push({ x: 510, y: 230 }); p.push({ x: 550, y: 230 });
        p.push({ x: 550, y: 270 }); p.push({ x: 550, y: 310 });
        // Yellow Path (right)
        p.push({ x: 550, y: 350 }); p.push({ x: 510, y: 350 }); p.push({ x: 470, y: 350 }); p.push({ x: 430, y: 350 }); p.push({ x: 390, y: 350 });
        p.push({ x: 350, y: 390 }); p.push({ x: 350, y: 430 }); p.push({ x: 350, y: 470 }); p.push({ x: 350, y: 510 }); p.push({ x: 350, y: 550 });
        p.push({ x: 310, y: 550 }); p.push({ x: 270, y: 550 });
        return p;
    }

    generateHomePaths() {
        return {
            red: [ { x: 270, y: 510 }, { x: 270, y: 470 }, { x: 270, y: 430 }, { x: 270, y: 390 }, { x: 270, y: 350 }, { x: 270, y: 310 } ],
            green: [ { x: 70, y: 270 }, { x: 110, y: 270 }, { x: 150, y: 270 }, { x: 190, y: 270 }, { x: 230, y: 270 }, { x: 270, y: 270 } ],
            blue: [ { x: 310, y: 70 }, { x: 310, y: 110 }, { x: 310, y: 150 }, { x: 310, y: 190 }, { x: 310, y: 230 }, { x: 310, y: 270 } ],
            yellow: [ { x: 510, y: 310 }, { x: 470, y: 310 }, { x: 430, y: 310 }, { x: 390, y: 310 }, { x: 350, y: 310 }, { x: 310, y: 310 } ]
        };
    }

    generateHomeBaseCoords() {
        return {
            red: [ { x: 60, y: 450 }, { x: 150, y: 450 }, { x: 60, y: 540 }, { x: 150, y: 540 } ],
            green: [ { x: 60, y: 60 }, { x: 150, y: 60 }, { x: 60, y: 150 }, { x: 150, y: 150 } ],
            blue: [ { x: 450, y: 60 }, { x: 540, y: 60 }, { x: 450, y: 150 }, { x: 540, y: 150 } ],
            yellow: [ { x: 450, y: 450 }, { x: 540, y: 450 }, { x: 450, y: 540 }, { x: 540, y: 540 } ]
        };
    }

    drawPieces() {
        this.boardContainer.querySelectorAll('.piece').forEach(p => p.remove());
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
                piece.style.left = `${coords.x}px`;
                piece.style.top = `${coords.y}px`;
                this.boardContainer.appendChild(piece);
            });
        }
    }

    rollDice() {
        if (this.gameover) return;
        this.diceRoll = Math.floor(Math.random() * 6) + 1;
        this.result.textContent = `You rolled: ${this.diceRoll}`;
        this.updateStatus(`${this.capitalize(this.currentPlayer)}'s turn. Rolled a ${this.diceRoll}. Click a piece to move.`);
        this.addPieceClickListeners();
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
            this.updateStatus(`${this.capitalize(color)} wins! Congratulations!`);
            this.rollBtn.disabled = true;
        } else {
            this.endTurn();
        }
    }

    handleCapture(pos, attackerColor) {
        if (this.safeSpots.includes(pos)) return;

        for (const color in this.players) {
            if (color !== attackerColor) {
                const player = this.players[color];
                player.pieces = player.pieces.map(p => {
                    if (p === pos) {
                        this.updateStatus(`${this.capitalize(attackerColor)} captured ${this.capitalize(color)}'s piece!`);
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
        if (!this.gameover) {
            this.switchPlayer();
        }
    }

    switchPlayer() {
        if (this.diceRoll !== 6) {
            const playerColors = Object.keys(this.players);
            const currentIndex = playerColors.indexOf(this.currentPlayer);
            this.currentPlayer = playerColors[(currentIndex + 1) % playerColors.length];
        }
        this.updateStatus(`${this.capitalize(this.currentPlayer)}'s turn. Roll the dice.`);
    }

    updateStatus(message) {
        this.status.textContent = message;
    }
}

new Game();
