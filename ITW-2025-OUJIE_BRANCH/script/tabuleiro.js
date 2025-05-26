function Difficulty(rows, columns, number_mines, time_limit, name, id) {
    this.rows = rows;
    this.columns = columns;
    this.number_mines = number_mines;
    this.time_limit = time_limit;
    this.name = name;
    this.id = id;
}

// 修改为3个难度级别
let DIFFICULTY = [
    new Difficulty(9, 9, 10, 300, "Easy", "easy"),      // 简单：9×9, 10雷
    new Difficulty(16, 16, 40, 600, "Medium", "medium"),   // 中级：16×16, 40雷
    new Difficulty(16, 30, 99, 900, "Hard", "hard")      // 困难：16×30, 99雷
];

let currentDifficultyIndex = 0;  // 当前难度索引，默认简单
let gameBoard = [];
let mineLocations = [];
let gameStarted = false;
let gameOver = false;
let firstClickMade = false; // 跟踪是否已经进行了第一次点击
let useBombImage = false;


// 🆕 生命模式相关变量
let livesMode = false;        // 是否为生命模式
let currentLives = 3;         // 当前生命数
let maxLives = 3;             // 最大生命数

// 禁用难度按钮
function disableDifficultyButtons() {
    const buttons = ['easyBtn', 'mediumBtn', 'hardBtn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = true;
            btn.classList.add('disabled');
        }
    });
}

// 启用难度按钮
function enableDifficultyButtons() {
    const buttons = ['easyBtn', 'mediumBtn', 'hardBtn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('disabled');
        }
    });
}

// 🆕 游戏模式切换函数 
function switchGameMode(isLivesMode) {

    const clickSound = document.getElementById('clickSound');
    if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.volume = 0.6;
        clickSound.play().catch(e => console.log(`Error playing click sound: ${e}`));
    }

    // 🎵 淡出停止背景音乐
    const fightSound = document.getElementById('fightSound');
    if (fightSound) {
        fadeOutAudio(fightSound, 800); // 800ms淡出
    }

    // 如果游戏正在进行，询问确认
    if (gameStarted && !gameOver) {
        if (!confirm('Switching the game mode will end the current game. Are you sure you want to continue?')) {
            return;
        }
        endGameWithoutSaving();
    }
    
    livesMode = isLivesMode;
    currentLives = maxLives;
    
    // 更新模式按钮样式
    updateModeButtons();
    
    // 更新生命显示
    updateLivesDisplay();
    
    // 重置游戏
    if (typeof resetGameTimer === 'function') {
        resetGameTimer();
    }
    
    console.log(`Switched to ${livesMode ? 'Lives Mode' : 'Classic Mode'}`);
}

// 🆕 更新模式按钮样式
function updateModeButtons() {
    const classicBtn = document.getElementById('classicModeBtn');
    const livesBtn = document.getElementById('livesModeBtn');
    
    if (classicBtn && livesBtn) {
        if (livesMode) {
            classicBtn.classList.remove('active');
            livesBtn.classList.add('active');
        } else {
            classicBtn.classList.add('active');
            livesBtn.classList.remove('active');
        }
    }
}

// 🆕 更新生命显示
function updateLivesDisplay() {
    const livesDisplay = document.getElementById('livesDisplay');
    const livesValue = document.getElementById('livesValue');
    
    if (livesDisplay && livesValue) {
        if (livesMode) {
            livesDisplay.style.display = 'inline-block';
            
            // 生成爱心显示
            let hearts = '';
            for (let i = 0; i < maxLives; i++) {
                if (i < currentLives) {
                    hearts += '💖';
                } else {
                    hearts += '🤍';
                }
            }
            livesValue.innerHTML = hearts;
        } else {
            livesDisplay.style.display = 'none';
        }
    }
}

// 🆕 失去一条生命
function loseLife(row, col) {
    currentLives--;
    
    // 显示地雷但不结束游戏
    const cellElement = getCellElement(row, col);
    if (cellElement) {
        cellElement.classList.add("mine");
        if (useBombImage) {
            cellElement.classList.add("bomb-image");
            cellElement.innerHTML = "";
        } else {
            cellElement.classList.remove("bomb-image");
            cellElement.innerHTML = "💣";
        }
        cellElement.style.backgroundColor = "#ff6666";
    }

    // 🎵 播放失去生命音效（前两次踩雷）
    const explosionSound = document.getElementById('trySound');
    if (explosionSound) {
        explosionSound.currentTime = 0;
        explosionSound.volume = 0.8;
        explosionSound.play().catch(e => console.log(`Error playing explosion sound: ${e}`));
    }
    
    // 更新生命显示
    updateLivesDisplay();
    
    // 添加失去生命动画
    const livesInfo = document.getElementById('livesDisplay');
    if (livesInfo) {
        livesInfo.classList.add('life_lost');
        setTimeout(() => {
            livesInfo.classList.remove('life_lost');
        }, 600);
    }
    
    if (currentLives <= 0) {
        // 🎵 淡出停止背景音乐并播放游戏结束音效
        const fightSound = document.getElementById('fightSound');
        if (fightSound) {
            fadeOutAudio(fightSound, 1000); // 1秒淡出
        }
        
        // 延迟播放失败音效，让淡出效果更明显
        setTimeout(() => {
            const loseSound = document.getElementById('loseSound');
            if (loseSound) {
                loseSound.currentTime = 0;
                loseSound.volume = 0.9;
                loseSound.play().catch(e => console.log(`Error playing lose sound: ${e}`));
            }
        }, 500); // 500ms后播放失败音效
        
        // 生命用尽，游戏结束
        endGame(false, 'Out of lives! Game over!');
    } else {
        // 显示失去生命的提示
        showTemporaryMessage(`💔 Lost a life! ${currentLives} lives left`, 2000);
    }
}

// 🆕 显示临时消息
function showTemporaryMessage(message, duration = 3000) {
    const messageElement = document.createElement('div');
    messageElement.className = 'temporary-message';
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, duration);
}

// 难度切换函数
function switchDifficulty(difficultyIndex) {
    // 如果游戏正在进行，阻止切换
    if (gameStarted && !gameOver) {
        console.log('Game in progress, cannot switch difficulty');
        return;
    }
    
    // 停止当前游戏
    if (typeof endGameWithoutSaving === 'function') {
        endGameWithoutSaving();
    }
    
    // 更新难度索引
    currentDifficultyIndex = difficultyIndex;
    const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
    
    // 重置游戏状态
    gameOver = false;
    gameStarted = false;
    firstClickMade = false;
    currentLives = maxLives; // 🆕 重置生命
    
    // 更新按钮状态
    updateDifficultyButtonStyles(difficultyIndex);
    
    // 重新创建游戏板
    createGameBoard();
    
    // 更新计数器
    if (typeof setTotalMines === 'function') {
        setTotalMines(currentDifficulty.number_mines);
    }
    
    // 重置计时器
    if (typeof resetGameTimer === 'function') {
        resetGameTimer();
    }
    
    // 🆕 更新生命显示
    updateLivesDisplay();
    
    console.log(`Switched to ${currentDifficulty.name} difficulty: ${currentDifficulty.rows}×${currentDifficulty.columns}, ${currentDifficulty.number_mines} mines`);
}

// 更新难度按钮样式
function updateDifficultyButtonStyles(activeIndex) {
    const buttons = ['easyBtn', 'mediumBtn', 'hardBtn'];
    buttons.forEach((btnId, index) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            if (index === activeIndex) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

// 创建游戏板
function createGameBoard() {
    const gameBoardElement = document.getElementById("gameBoard");
    const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    
    // 清空现有游戏板
    gameBoardElement.innerHTML = "";
    
    // 动态调整CSS网格
    gameBoardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameBoardElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    // 根据难度调整游戏板尺寸
    adjustGameBoardSize(currentDifficulty);
    
    // 创建格子
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
            
            gameBoardElement.appendChild(cell);
        }
    }
    
    initializeGameBoard();
    
    // 初始状态：游戏板不可交互
    gameBoardElement.classList.add("game-not-started");
}

// 调整游戏板尺寸
function adjustGameBoardSize(difficulty) {
    const gameBoardElement = document.getElementById("gameBoard");
    let cellSize;
    
    // 根据难度设置不同的格子大小
    if (difficulty.name === "Easy") {
        cellSize = 5; // 简单难度格子大一点
    } else if (difficulty.name === "Medium") {
        cellSize = 4; // 中级难度中等大小
    } else if (difficulty.name === "Hard") {
        cellSize = 4; // 困难难度格子小一点，适应更多格子
    }
    
    const boardWidth = difficulty.columns * cellSize;
    const boardHeight = difficulty.rows * cellSize;
    
    gameBoardElement.style.width = `${boardWidth}vh`;
    gameBoardElement.style.height = `${boardHeight}vh`;
}

// 开始游戏（当点击Start按钮时调用）
function startGame() {
    gameStarted = true;
    firstClickMade = false;
    currentLives = maxLives; // 🆕 重置生命
    disableDifficultyButtons(); // 禁用难度按钮
    
    // 🆕 更新生命显示
    updateLivesDisplay();
    
    console.log(`Game started, mode: ${livesMode ? 'Lives Mode' : 'Classic Mode'}, difficulty buttons disabled`);
}

// 游戏结束处理
function gameEndHandler() {
    gameStarted = false;
    gameOver = true;
}

window.addEventListener("DOMContentLoaded", () => {
    // 初始化为简单难度
    switchDifficulty(0);
    
    // 初始化游戏模式
    switchGameMode(false); // 默认经典模式
    
    // 添加难度按钮事件监听
    const easyBtn = document.getElementById('easyBtn');
    const mediumBtn = document.getElementById('mediumBtn');
    const hardBtn = document.getElementById('hardBtn');
    
    if (easyBtn) easyBtn.addEventListener('click', () => {
        // 播放按钮点击音效
        const clickSound = document.getElementById('clickSound');
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.volume = 0.6;
            clickSound.play().catch(e => console.log(`Error playing click sound: ${e}`));
        }
        switchDifficulty(0)
    });

    if (mediumBtn) mediumBtn.addEventListener('click', () => {
        // 播放按钮点击音效
        const clickSound = document.getElementById('clickSound');
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.volume = 0.6;
            clickSound.play().catch(e => console.log(`Error playing click sound: ${e}`));
        }
        switchDifficulty(1);
    });

    if (hardBtn) hardBtn.addEventListener('click', () => {
        // 播放按钮点击音效
        const clickSound = document.getElementById('clickSound');
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.volume = 0.6;
            clickSound.play().catch(e => console.log(`Error playing click sound: ${e}`));
        }
        switchDifficulty(2);
    });
});

// 重启按钮事件监听
document.addEventListener("DOMContentLoaded", () => {
    const restartButton = document.getElementById("restartButton");
    if (restartButton) {
        restartButton.addEventListener("click", function () {
            restartGame();
        });
    }
});

function restartGame() {
    // 隐藏重启按钮
    document.getElementById("restartButton").style.display = "none";
    
    // 重置游戏状态
    gameOver = false;
    gameStarted = false;
    firstClickMade = false;
    currentLives = maxLives; // 🆕 重置生命
    
    // 重新启用难度按钮
    enableDifficultyButtons();

    // 重新创建当前难度的游戏板
    createGameBoard();
    
    // 重新设置地雷总数到计数器
    const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
    if (typeof setTotalMines === 'function') {
        setTotalMines(currentDifficulty.number_mines);
    }
    
    // 显示开始按钮
    const startButton = document.getElementById("startButton");
    if (startButton) {
        startButton.style.display = "block";
    }
    
    // 🆕 更新生命显示
    updateLivesDisplay();
    
    console.log('Game restarted, difficulty buttons enabled');
}

function initializeGameBoard() {
    const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
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
                isQuestioned: false,  // 新增：是否为问号状态
                adjacentMines: 0
            };
        }
    }
    
    // 重要改变：游戏初始化时不再放置地雷
    // 地雷将在第一次点击后放置
    mineLocations = [];
    console.log('Game board initialized without mines. Mines will be placed after first click.');
}

// 新函数：在第一次点击后放置地雷，确保第一次点击的位置和周围不会有地雷
function placeMinesAfterFirstClick(firstClickRow, firstClickCol) {
    const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    const mineCount = currentDifficulty.number_mines;
    
    // 创建所有可能的位置列表
    let availablePositions = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            availablePositions.push([r, c]);
        }
    }
    
    // 关键：移除第一次点击的位置和其周围的所有位置（确保无风险开始）
    const forbiddenPositions = [];
    
    // 添加第一次点击的位置
    forbiddenPositions.push([firstClickRow, firstClickCol]);
    
    // 添加第一次点击位置周围的8个格子
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const nr = firstClickRow + dr;
            const nc = firstClickCol + dc;
            
            // 检查位置是否在游戏板范围内
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                forbiddenPositions.push([nr, nc]);
            }
        }
    }
    
    // 从可用位置中移除禁止位置
    availablePositions = availablePositions.filter(([r, c]) => {
        return !forbiddenPositions.some(([fr, fc]) => fr === r && fc === c);
    });
    
    console.log(`Number of forbidden positions for mine placement: ${forbiddenPositions.length}`);
    console.log(`Number of available positions for mine placement: ${availablePositions.length}`);
    console.log(`Number of mines to place: ${mineCount}`);
    
    // Check if enough positions to place mines
    if (availablePositions.length < mineCount) {
        console.error('Error: Not enough positions to place all mines!');
        alert('Error: The board is too small to place all mines!');
        return;
    }
    
    // 随机打乱可用位置
    for (let i = availablePositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    // 选择前 mineCount 个位置放置地雷
    mineLocations = [];
    for (let i = 0; i < mineCount && i < availablePositions.length; i++) {
        const [r, c] = availablePositions[i];
        gameBoard[r][c].hasMine = true;
        mineLocations.push([r, c]);
    }
    
    console.log(`Successfully placed ${mineLocations.length} mines`);
    console.log('Mine locations:', mineLocations);
    
    // 放置地雷后重新计算相邻地雷数量
    calculateAdjacentMines();
}

// 修改原来的 placeMines 函数（现在只在非第一次点击的重启中使用）
function placeMines() {
    // 这个函数现在基本不会被调用，因为我们在第一次点击后才放置地雷
    // 保留它是为了向后兼容
    console.log('placeMines() called - this should only happen during restart');
    
    const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
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
    const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    
    // 首先重置所有非雷格子的相邻地雷计数
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!gameBoard[r][c].hasMine) {
                gameBoard[r][c].adjacentMines = 0;
            }
        }
    }
    
    // 然后重新计算所有非雷格子的相邻地雷数量
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
    
    console.log('Adjacent mines calculated');
}

// 🆕 修改 handleCellClick 函数以支持无风险开始和生命模式
function handleCellClick(row, col) {

    // Verifica se o jogo já começou (se o tabuleiro tem a classe 'game-not-started', bloqueia o clique)
    const gameBoardElement = document.getElementById("gameBoard");
    if (gameBoardElement && gameBoardElement.classList.contains("game-not-started")) {
        return; // Jogo não iniciado, ignora clique
    }
    
    // Ignora se jogo acabou ou célula já foi revelada
    if (gameOver || gameBoard[row][col].isRevealed) return;
    
    // Ignora clique se célula está marcada com bandeira ou ponto de interrogação
    if (gameBoard[row][col].isFlagged || gameBoard[row][col].isQuestioned) return;
    
    // Na primeira jogada, coloca as minas depois do clique
    if (!firstClickMade) {
        console.log(`First click position: (${row}, ${col})`);
        placeMinesAfterFirstClick(row, col);
        firstClickMade = true;
        console.log('Mines placed, game officially started!');
    }
    
    const cellElement = getCellElement(row, col);

    
    gameBoard[row][col].isRevealed = true;
    cellElement.classList.add("revealed");

    const revealSound = document.getElementById('revealSound');
    if (revealSound) {
        revealSound.currentTime = 0;
        revealSound.volume = 1;
        revealSound.play().catch(e => console.log(`Error playing flag sound: ${e}`));
    }
    
    // Incrementa contador de células exploradas (se existir essa função)
    if (typeof addExploredCell === 'function') {
        addExploredCell();
    }
    
    if (gameBoard[row][col].hasMine) {
        // Se tem mina, dependendo do modo de jogo:
        if (livesMode && currentLives > 1) {
            // Modo vidas: perde vida mas continua
            loseLife(row, col);
        } else {
            // Modo clássico ou sem vidas: revela a mina e termina jogo
            cellElement.classList.add("mine");
            if (useBombImage) {
                cellElement.classList.add("bomb-image");
                cellElement.innerHTML = "";
            } else {
                cellElement.classList.remove("bomb-image");
                cellElement.innerHTML = "💣";
            }

            if (livesMode) {
                endGame(false, 'Out of lives! Game over!');
            } else {
                endGame(false);
            }
        }
    } else {
        // Se não tem mina, mostra o número de minas adjacentes ou revela células ao redor
        const adjacentMines = gameBoard[row][col].adjacentMines;
        if (adjacentMines > 0) {
            cellElement.textContent = adjacentMines;
            cellElement.classList.add(`adjacent-${adjacentMines}`);
        } else {
            revealSurroundingCells(row, col);
        }
        checkForWin();
    }
}


function handleRightClick(row, col) {
    // 检查游戏状态
    const gameBoardElement = document.getElementById("gameBoard");
    if (gameBoardElement && gameBoardElement.classList.contains("game-not-started")) {
        return; // 如果游戏未开始，不响应右键点击
    }
    
    if (gameOver || gameBoard[row][col].isRevealed) return;
    
    const cellElement = getCellElement(row, col);
    
    // 三种状态循环：未标记 → 旗帜 → 问号 → 未标记
    if (!gameBoard[row][col].isFlagged && !gameBoard[row][col].isQuestioned) {
        // 状态1：未标记 → 旗帜
        gameBoard[row][col].isFlagged = true;
        gameBoard[row][col].isQuestioned = false;
        cellElement.classList.add("flagged");
        cellElement.classList.remove("questioned");
        cellElement.innerHTML = "🚩";
        
        // 增加标记计数
        if (typeof addFlag === 'function') {
            addFlag();
        }
        // 播放旗子音效
        const switchSound = document.getElementById('switchSound');
        if (switchSound) {
            switchSound.currentTime = 0;
            switchSound.volume = 1;
            switchSound.play().catch(e => console.log(`Error playing flag sound: ${e}`));
        }


        
    } else if (gameBoard[row][col].isFlagged && !gameBoard[row][col].isQuestioned) {
        // 状态2：旗帜 → 问号
        gameBoard[row][col].isFlagged = false;
        gameBoard[row][col].isQuestioned = true;
        cellElement.classList.remove("flagged");
        cellElement.classList.add("questioned");
        cellElement.innerHTML = "❓";
        
        // 减少标记计数（从旗帜变为问号）
        if (typeof removeFlag === 'function') {
            removeFlag();
        }

        const switchSound= document.getElementById('switchSound');
        if (switchSound) {
            switchSound.currentTime = 0;
            switchSound.volume = 1;
            switchSound.play().catch(e => console.log(`Error playing flag sound: ${e}`));
        }
        
    } else if (!gameBoard[row][col].isFlagged && gameBoard[row][col].isQuestioned) {
        // 状态3：问号 → 未标记
        gameBoard[row][col].isFlagged = false;
        gameBoard[row][col].isQuestioned = false;
        cellElement.classList.remove("flagged");
        cellElement.classList.remove("questioned");
        cellElement.innerHTML = "";
        
        const switchSound = document.getElementById('switchSound');
        if (switchSound) {
            switchSound.currentTime = 0;
            switchSound.volume = 1;
            switchSound.play().catch(e => console.log(`Error playing flag sound: ${e}`));
        }

        // 问号变为未标记，计数器不变
    }
    
    checkForWin();
}
// TODO 
// funtion MakeNoise() {}


function revealSurroundingCells(row, col) {
    const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            
            const nr = row + dr;
            const nc = col + dc;
            
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && 
                !gameBoard[nr][nc].isRevealed && 
                !gameBoard[nr][nc].isFlagged && 
                !gameBoard[nr][nc].isQuestioned) {
                handleCellClick(nr, nc);
            }
        }
    }
}

function getCellElement(row, col) {
    return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

function checkForWin() {
    if (gameOver) return;
    
    const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    const totalCells = rows * cols;
    const totalMines = currentDifficulty.number_mines;
    
    let revealedCount = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (gameBoard[r][c].isRevealed && !gameBoard[r][c].hasMine) {
                revealedCount++;
            }
        }
    }
    
    if (revealedCount === totalCells - totalMines) {
        endGame(true);
    }
}

// 🆕 修改 endGame 函数支持自定义消息和生命模式存储
function endGame(isWin, customMessage = null) {
    gameOver = true;
    gameStarted = false;
    
    // 重新启用难度按钮
    gameEndHandler();
    
    // 停止计时器（如果存在的话）
    if (typeof stopGameTimer === 'function') {
        stopGameTimer();
    }
    
    // 隐藏End Game按钮
    const endButton = document.getElementById("endButton");
    if (endButton) {
        endButton.style.display = "none";
    }
    
    revealAllMines();
    document.getElementById("restartButton").style.display = "block";


    // 添加音效逻辑在这里 - 在弹出消息框之前
    // 🎵 停止背景音乐
    const fightSound = document.getElementById('fightSound');
    if (fightSound) {
        fadeOutAudio(fightSound, 800); // 800ms淡出
    }

    // 播放胜利或失败音效
    if (isWin) {
        // 播放胜利音效
        const winSound = document.getElementById('winSound');
        if (winSound) {
            winSound.currentTime = 0;
            winSound.volume = 0.9;
            winSound.play().catch(e => console.log(`Error playing win sound: ${e}`));
        }
    } else {
        // 播放失败音效
        const loseSound = document.getElementById('loseSound');
        if (loseSound) {
            loseSound.currentTime = 0;
            loseSound.volume = 0.9;
            loseSound.play().catch(e => console.log(`Error playing lose sound: ${e}`));
            document.getElementById("exSound").play(); // 播放爆炸音效
        }
    }
    
    setTimeout(() => {
        const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
        let message;
        
        if (customMessage) {
            message = customMessage;
        } else if (isWin) {
            const modeText = livesMode ? `Lives Mode` : 'Classic Mode';
            message = `🎉 Congratulations! You win!\nMode: ${modeText}\nDifficulty: ${currentDifficulty.name}`;
            if (livesMode) {
                message += `\nLives left: ${currentLives}`;
            }
        } else {
            const modeText = livesMode ? `Lives Mode` : 'Classic Mode';
            message = `💥 Game over!\nMode: ${modeText}\nDifficulty: ${currentDifficulty.name}`;
        }
        
        alert(message);
        
        // 🆕 保存成绩（包含生命模式数据）
        if (typeof saveTimerValue === 'function' && typeof gameSeconds !== 'undefined') {
            // 格式化时间
            const hours = Math.floor(gameSeconds / 3600);
            const minutes = Math.floor((gameSeconds % 3600) / 60);
            const secs = gameSeconds % 60;
            
            const formattedTime = [
                hours.toString().padStart(2, '0'),
                minutes.toString().padStart(2, '0'),
                secs.toString().padStart(2, '0')
            ].join(':');
            
            // 🆕 保存到对应的存储key（生命模式用单独的key）
            if (livesMode) {
                saveLivesModeScore(formattedTime, gameSeconds, isWin, currentDifficulty);
            } else {
                saveTimerValue(formattedTime, gameSeconds, isWin, currentDifficulty);
            }
            
            const modeText = livesMode ? 'Lives Mode' : 'Classic Mode';
            if (isWin) {
                console.log(`🏆 Player won in ${modeText} on ${currentDifficulty.name} difficulty! Time: ${formattedTime} (${gameSeconds} seconds)`);
            } else {
                console.log(`💥 Game lost in ${modeText} on ${currentDifficulty.name} difficulty, time: ${formattedTime} (${gameSeconds} seconds)`);
            }
        }
    }, 500);
}

// 🆕 生命模式专用保存函数
function saveLivesModeScore(formattedTime, totalSeconds, isWin, difficulty) {
    try {
        const currentPlayer = localStorage.getItem('current_player');
        
        // 生命模式数据对象
        const scoreData = {
            totalSeconds: totalSeconds,
            formattedTime: formattedTime,
            player: currentPlayer || 'anonymous',
            date: new Date().toISOString(),
            status: isWin ? 'win' : 'lost',
            isWin: isWin,
            difficulty: difficulty.name,
            difficultyId: difficulty.id,
            gameMode: 'lives',                    // 🆕 游戏模式标识
            gridSize: `${difficulty.rows}x${difficulty.columns}`,
            totalMines: difficulty.number_mines,
            finalLives: currentLives,             // 🆕 最终剩余生命
            livesLost: maxLives - currentLives,   // 🆕 失去的生命数
            exploredCells: typeof exploredCells !== 'undefined' ? exploredCells : 0,
            totalSafeCells: (difficulty.rows * difficulty.columns) - difficulty.number_mines,
            flagsUsed: typeof flagsUsed !== 'undefined' ? flagsUsed : 0
        };
        
        // 🆕 使用生命模式专用的存储key
        const storageKey = `minesweeper_lives_${difficulty.id}`;
        const existingScores = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existingScores.push(scoreData);
        localStorage.setItem(storageKey, JSON.stringify(existingScores));
        
        console.log(`Lives mode ${difficulty.name} difficulty score saved (${isWin ? 'win' : 'lose'}):`, scoreData);
        
    } catch (error) {
        console.error('Error saving lives mode score:', error);
    }
}

function revealAllMines() {
    mineLocations.forEach(([r, c]) => {
        const cellElement = getCellElement(r, c);
        
        if (!gameBoard[r][c].isRevealed) {
            cellElement.classList.add("revealed", "mine");
            if (useBombImage) {
                cellElement.classList.add("bomb-image");
                cellElement.innerHTML = "";
            } else {
                cellElement.classList.remove("bomb-image");
                cellElement.innerHTML = "💣";
            }
        }
    });
}

// 重置游戏板（不保存数据）
function resetGameBoard() {
    // 重置游戏状态
    gameOver = false;
    gameStarted = false;
    firstClickMade = false;
    currentLives = maxLives; // 🆕 重置生命
    
    // 重新启用难度按钮
    enableDifficultyButtons();

    // 重新创建当前难度的游戏板
    createGameBoard();
    
    // 🆕 更新生命显示
    updateLivesDisplay();
}

function toggleBombStyle() {
    useBombImage = !useBombImage;

    // Atualizar todas as minas reveladas
    mineLocations.forEach(([r, c]) => {
        const cell = getCellElement(r, c);
        if (cell && cell.classList.contains("mine")) {
            if (useBombImage) {
                cell.classList.add("bomb-image");
                cell.innerHTML = "";
            } else {
                cell.classList.remove("bomb-image");
                cell.innerHTML = "💣";
            }
        }
    });

    // Atualizar botão
    const btn = document.getElementById("toggleBombStyleBtn");
    if (btn) {
        btn.textContent = useBombImage ? "💣 Normal bombs" : "🐱 Cute cat bombs";
    }
}

