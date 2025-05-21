function Difficulty(rows, columns, number_mines, time_limit) {
    this.rows = rows;
    this.columns = columns;
    this.number_mines = number_mines;
    this.time_limit = time_limit;
}
let DIFFICULTY = [
    new Difficulty(15, 15, 30, 300)
];
let gameBoard = [];
let mineLocations = [];
let gameStarted = false;
let gameOver = false;

window.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("gameBoard");
    const currentDifficulty = DIFFICULTY[0];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            cell.addEventListener("click", function() {
                handleCellClick(r, c);
            });
            
            cell.addEventListener("contextmenu", function(e) {
                e.preventDefault(); 
                handleRightClick(r, c);
            });
            
            gameBoard.appendChild(cell);
        }
    }
    initializeGameBoard();
});

document.getElementById("restartButton").addEventListener("click", function () {
    restartGame();
});

function restartGame() {
    document.getElementById("restartButton").style.display = "none";
    stopTimer();
    seconds = 0;
    document.getElementById('timer').textContent = "00:00:00";
    gameOver = false;
    gameStarted = false;

    const boardElement = document.getElementById("gameBoard");
    boardElement.innerHTML = "";

    const currentDifficulty = DIFFICULTY[0];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.addEventListener("click", function () {
                handleCellClick(r, c);
            });

            cell.addEventListener("contextmenu", function (e) {
                e.preventDefault();
                handleRightClick(r, c);
            });

            boardElement.appendChild(cell);
        }
    }

    initializeGameBoard();
    startTimer();
}


function initializeGameBoard() {
    const currentDifficulty = DIFFICULTY[0];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    
    gameBoard = new Array(rows);
    for (let r = 0; r < rows; r++) {
        gameBoard[r] = new Array(cols);
        for (let c = 0; c < cols; c++) {
            gameBoard[r][c] = {
                hasMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            };
        }
    }
    placeMines();
    calculateAdjacentMines();
}

function placeMines() {
    const currentDifficulty = DIFFICULTY[0];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    const mineCount = currentDifficulty.number_mines;
    
    let positions = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            positions.push([r, c]);
        }
    }
    
    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    mineLocations = [];
    for (let i = 0; i < mineCount && i < positions.length; i++) {
        const [r, c] = positions[i];
        gameBoard[r][c].hasMine = true;
        mineLocations.push([r, c]);
    }
}

function calculateAdjacentMines() {
    const currentDifficulty = DIFFICULTY[0];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (gameBoard[r][c].hasMine) continue;
            
            let count = 0;
            
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    
                    const nr = r + dr;
                    const nc = c + dc;
                    
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        if (gameBoard[nr][nc].hasMine) {
                            count++;
                        }
                    }
                }
            }
            
            gameBoard[r][c].adjacentMines = count;
        }
    }
}

function handleCellClick(row, col) {
    if (gameOver || gameBoard[row][col].isRevealed) return;
    
    // Não faça nada se a célula estiver com bandeira
    if (gameBoard[row][col].isFlagged) return;
    
    const cellElement = getCellElement(row, col);
    
    gameBoard[row][col].isRevealed = true;
    cellElement.classList.add("revealed");
    
    if (gameBoard[row][col].hasMine) {
        cellElement.classList.add("mine");
        cellElement.innerHTML = "💣";
        
        endGame(false);
    } else {
        const adjacentMines = gameBoard[row][col].adjacentMines;
        if (adjacentMines > 0) {
            cellElement.textContent = adjacentMines;
            cellElement.classList.add(`adjacent-${adjacentMines}`);
        } else {
            revealSurroundingCells(row, col);
        }
        
        // Verificar se o jogador venceu após cada clique
        checkForWin();
    }
}

function handleRightClick(row, col) {
    if (gameOver || gameBoard[row][col].isRevealed) return;
    
    const cellElement = getCellElement(row, col);
    
    if (gameBoard[row][col].isFlagged) {
        // Remover a bandeira
        gameBoard[row][col].isFlagged = false;
        cellElement.classList.remove("flagged");
        cellElement.innerHTML = "";
    } else {
        // Colocar a bandeira
        gameBoard[row][col].isFlagged = true;
        cellElement.classList.add("flagged");
        cellElement.innerHTML = "🚩";
    }
    
    // Verificar se o jogador venceu após colocar ou remover uma bandeira
    checkForWin();
}

function revealSurroundingCells(row, col) {
    const currentDifficulty = DIFFICULTY[0];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            
            const nr = row + dr;
            const nc = col + dc;
            
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !gameBoard[nr][nc].isRevealed && !gameBoard[nr][nc].isFlagged) {
                handleCellClick(nr, nc);
            }
        }
    }
}

function getCellElement(row, col) {
    return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

// Função para verificar se o jogador venceu
function checkForWin() {
    if (gameOver) return;
    
    const currentDifficulty = DIFFICULTY[0];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    const totalCells = rows * cols;
    const totalMines = currentDifficulty.number_mines;
    
    // Verificar se todas as células sem minas foram reveladas
    let revealedCount = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (gameBoard[r][c].isRevealed && !gameBoard[r][c].hasMine) {
                revealedCount++;
            }
        }
    }
    
    // Se o número de células reveladas for igual ao número total de células menos o número de minas,
    // então o jogador venceu
    if (revealedCount === totalCells - totalMines) {
        endGame(true);
    }
}

// End the game
function endGame(isWin) {
    gameOver = true;
    stopTimer();    
    revealAllMines();
    document.getElementById("restartButton").style.display = "block";
    setTimeout(() => {
        if (isWin) {
            alert("Parabéns! Você venceu!");
        } else {
            alert("Game Over! Você acertou uma mina!");
        }
    }, 500);
}

function revealAllMines() {
    mineLocations.forEach(([r, c]) => {
        const cellElement = getCellElement(r, c);
        
        if (!gameBoard[r][c].isRevealed) {
            cellElement.classList.add("revealed", "mine");
            cellElement.innerHTML = "💣";
        }
    });
}