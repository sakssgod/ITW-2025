// ==================== 游戏模式系统 ====================

// 游戏模式定义
const GAME_MODES = {
    CLASSIC: {
        id: 'classic',
        name: 'Classic',
        displayName: '经典模式',
        description: '传统扫雷游戏',
        icon: '🎯',
        color: '#4CAF50'
    },
    TIME_ATTACK: {
        id: 'time_attack', 
        name: 'TimeAttack',
        displayName: '倒计时模式',
        description: '在限定时间内完成游戏',
        icon: '⏰',
        color: '#FF9800'
    },
    LIVES: {
        id: 'lives',
        name: 'Lives', 
        displayName: '生命模式',
        description: '3条生命，踩雷扣命但继续游戏',
        icon: '💖',
        color: '#E91E63'
    },
    ENERGY: {
        id: 'energy',
        name: 'Energy',
        displayName: '能量模式', 
        description: '能量系统，不同地雷扣不同能量',
        icon: '⚡',
        color: '#9C27B0'
    },
    STEP_TIMER: {
        id: 'step_timer',
        name: 'StepTimer',
        displayName: '限时每步',
        description: '每一步都有时间限制',
        icon: '🏃',
        color: '#FF5722'
    }
};

// 地雷类型定义（用于能量模式）
const MINE_TYPES = {
    NORMAL: { id: 'normal', damage: 20, symbol: '💣', color: '#f44336' },
    HEAVY: { id: 'heavy', damage: 35, symbol: '💥', color: '#d32f2f' },
    MEGA: { id: 'mega', damage: 50, symbol: '🧨', color: '#b71c1c' }
};

// 游戏模式特定配置
const MODE_CONFIGS = {
    time_attack: {
        easy: { timeLimit: 180 },    // 3分钟
        medium: { timeLimit: 300 },  // 5分钟  
        hard: { timeLimit: 480 }     // 8分钟
    },
    lives: {
        maxLives: 3,
        heartSymbol: '💖',
        emptyHeartSymbol: '🤍'
    },
    energy: {
        maxEnergy: 100,
        mineDistribution: {
            normal: 0.6,   // 60% 普通地雷
            heavy: 0.3,    // 30% 重型地雷
            mega: 0.1      // 10% 超级地雷
        }
    },
    step_timer: {
        stepTimeLimit: 10  // 每步10秒
    }
};

// 全局游戏状态
let currentGameMode = GAME_MODES.CLASSIC;
let gameState = {
    // 通用状态
    isGameActive: false,
    isPaused: false,
    
    // 倒计时模式
    timeRemaining: 0,
    timeLimitInterval: null,
    
    // 生命模式  
    currentLives: 3,
    maxLives: 3,
    
    // 能量模式
    currentEnergy: 100,
    maxEnergy: 100,
    mineTypes: {},
    
    // 限时每步模式
    stepTimeRemaining: 10,
    stepTimerInterval: null,
    currentStep: 0
};

// ==================== 模式切换系统 ====================

function switchGameMode(modeId) {
    // 如果游戏正在进行，询问确认
    if (gameState.isGameActive) {
        if (!confirm('切换游戏模式将结束当前游戏，确定继续吗？')) {
            return;
        }
        endCurrentGame();
    }
    
    // 切换模式
    currentGameMode = GAME_MODES[modeId.toUpperCase()];
    
    // 重置游戏状态
    resetGameState();
    
    // 更新UI
    updateModeUI();
    updateGameModeButtons();
    
    console.log(`切换到${currentGameMode.displayName}`);
}

function resetGameState() {
    // 清除所有定时器
    clearAllTimers();
    
    // 重置基础状态
    gameState.isGameActive = false;
    gameState.isPaused = false;
    
    // 根据模式重置特定状态
    switch(currentGameMode.id) {
        case 'time_attack':
            const difficulty = DIFFICULTY[currentDifficultyIndex];
            const timeConfig = MODE_CONFIGS.time_attack[difficulty.id];
            gameState.timeRemaining = timeConfig ? timeConfig.timeLimit : 300;
            break;
            
        case 'lives':
            gameState.currentLives = MODE_CONFIGS.lives.maxLives;
            gameState.maxLives = MODE_CONFIGS.lives.maxLives;
            break;
            
        case 'energy':
            gameState.currentEnergy = MODE_CONFIGS.energy.maxEnergy;
            gameState.maxEnergy = MODE_CONFIGS.energy.maxEnergy;
            break;
            
        case 'step_timer':
            gameState.stepTimeRemaining = MODE_CONFIGS.step_timer.stepTimeLimit;
            gameState.currentStep = 0;
            break;
    }
    
    // 更新显示
    updateModeSpecificUI();
}

function clearAllTimers() {
    if (gameState.timeLimitInterval) {
        clearInterval(gameState.timeLimitInterval);
        gameState.timeLimitInterval = null;
    }
    if (gameState.stepTimerInterval) {
        clearInterval(gameState.stepTimerInterval);
        gameState.stepTimerInterval = null;
    }
}

// ==================== UI 更新系统 ====================

function updateModeUI() {
    // 更新模式显示区域
    const modeDisplayElement = document.getElementById('currentModeDisplay');
    if (modeDisplayElement) {
        modeDisplayElement.innerHTML = `
            <div class="mode-info">
                <span class="mode-icon">${currentGameMode.icon}</span>
                <span class="mode-name">${currentGameMode.displayName}</span>
            </div>
        `;
        modeDisplayElement.style.backgroundColor = currentGameMode.color + '20';
        modeDisplayElement.style.borderColor = currentGameMode.color;
    }
    
    // 显示/隐藏模式特定UI元素
    showModeSpecificElements();
}

function showModeSpecificElements() {
    // 隐藏所有模式特定元素
    const elements = ['timeLimitDisplay', 'livesDisplay', 'energyDisplay', 'stepTimerDisplay'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // 显示当前模式的元素
    switch(currentGameMode.id) {
        case 'time_attack':
            const timeLimitDisplay = document.getElementById('timeLimitDisplay');
            if (timeLimitDisplay) timeLimitDisplay.style.display = 'block';
            break;
            
        case 'lives':
            const livesDisplay = document.getElementById('livesDisplay'); 
            if (livesDisplay) livesDisplay.style.display = 'block';
            break;
            
        case 'energy':
            const energyDisplay = document.getElementById('energyDisplay');
            if (energyDisplay) energyDisplay.style.display = 'block';
            break;
            
        case 'step_timer':
            const stepTimerDisplay = document.getElementById('stepTimerDisplay');
            if (stepTimerDisplay) stepTimerDisplay.style.display = 'block';
            break;
    }
}

function updateModeSpecificUI() {
    switch(currentGameMode.id) {
        case 'time_attack':
            updateTimeLimitDisplay();
            break;
        case 'lives':
            updateLivesDisplay();
            break;
        case 'energy':
            updateEnergyDisplay();
            break;
        case 'step_timer':
            updateStepTimerDisplay();
            break;
    }
}

// ==================== 倒计时模式 ====================

function startTimeLimitCountdown() {
    if (gameState.timeLimitInterval) return;
    
    gameState.timeLimitInterval = setInterval(() => {
        gameState.timeRemaining--;
        updateTimeLimitDisplay();
        
        if (gameState.timeRemaining <= 0) {
            clearInterval(gameState.timeLimitInterval);
            gameState.timeLimitInterval = null;
            endGame(false, '时间用完了！');
        }
    }, 1000);
}

function updateTimeLimitDisplay() {
    const element = document.getElementById('timeLimitValue');
    if (element) {
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        element.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // 时间不足时改变颜色
        if (gameState.timeRemaining <= 30) {
            element.style.color = '#f44336';  // 红色警告
        } else if (gameState.timeRemaining <= 60) {
            element.style.color = '#ff9800';  // 橙色提醒
        } else {
            element.style.color = '#4caf50';  // 绿色正常
        }
    }
}

// ==================== 生命模式 ====================

function loseLife() {
    gameState.currentLives--;
    updateLivesDisplay();
    
    if (gameState.currentLives <= 0) {
        endGame(false, '生命用尽！');
    } else {
        // 显示失去生命的提示，但继续游戏
        showTemporaryMessage(`失去一条生命！剩余 ${gameState.currentLives} 条生命`, 2000);
    }
}

function updateLivesDisplay() {
    const element = document.getElementById('livesValue');
    if (element) {
        let heartsHTML = '';
        for (let i = 0; i < gameState.maxLives; i++) {
            if (i < gameState.currentLives) {
                heartsHTML += MODE_CONFIGS.lives.heartSymbol;
            } else {
                heartsHTML += MODE_CONFIGS.lives.emptyHeartSymbol;
            }
        }
        element.innerHTML = heartsHTML;
    }
}

// ==================== 能量模式 ====================

function setupEnergyModeMinePlacement() {
    // 重新分配地雷类型
    const totalMines = mineLocations.length;
    const distribution = MODE_CONFIGS.energy.mineDistribution;
    
    gameState.mineTypes = {};
    
    let assignedMines = 0;
    
    // 分配超级地雷
    const megaCount = Math.floor(totalMines * distribution.mega);
    for (let i = 0; i < megaCount && assignedMines < totalMines; i++) {
        const [r, c] = mineLocations[assignedMines];
        gameState.mineTypes[`${r}-${c}`] = MINE_TYPES.MEGA;
        assignedMines++;
    }
    
    // 分配重型地雷
    const heavyCount = Math.floor(totalMines * distribution.heavy);
    for (let i = 0; i < heavyCount && assignedMines < totalMines; i++) {
        const [r, c] = mineLocations[assignedMines];
        gameState.mineTypes[`${r}-${c}`] = MINE_TYPES.HEAVY;
        assignedMines++;
    }
    
    // 剩余的都是普通地雷
    for (let i = assignedMines; i < totalMines; i++) {
        const [r, c] = mineLocations[i];
        gameState.mineTypes[`${r}-${c}`] = MINE_TYPES.NORMAL;
    }
    
    console.log('能量模式地雷分配完成:', gameState.mineTypes);
}

function handleEnergyModeMineHit(row, col) {
    const mineKey = `${row}-${col}`;
    const mineType = gameState.mineTypes[mineKey] || MINE_TYPES.NORMAL;
    
    gameState.currentEnergy -= mineType.damage;
    if (gameState.currentEnergy < 0) gameState.currentEnergy = 0;
    
    updateEnergyDisplay();
    
    // 显示伤害信息
    showDamageEffect(row, col, mineType);
    
    if (gameState.currentEnergy <= 0) {
        endGame(false, '能量耗尽！');
    } else {
        showTemporaryMessage(`踩到${mineType.symbol}！损失 ${mineType.damage} 能量，剩余 ${gameState.currentEnergy}`, 2000);
    }
}

function updateEnergyDisplay() {
    const element = document.getElementById('energyValue');
    const barElement = document.getElementById('energyBar');
    
    if (element) {
        element.textContent = `${gameState.currentEnergy}/${gameState.maxEnergy}`;
    }
    
    if (barElement) {
        const percentage = (gameState.currentEnergy / gameState.maxEnergy) * 100;
        barElement.style.width = `${percentage}%`;
        
        // 根据能量值改变颜色
        if (percentage > 60) {
            barElement.style.backgroundColor = '#4caf50';  // 绿色
        } else if (percentage > 30) {
            barElement.style.backgroundColor = '#ff9800';  // 橙色
        } else {
            barElement.style.backgroundColor = '#f44336';  // 红色
        }
    }
}

function showDamageEffect(row, col, mineType) {
    const cellElement = getCellElement(row, col);
    if (cellElement) {
        // 添加特殊的地雷样式
        cellElement.innerHTML = mineType.symbol;
        cellElement.style.backgroundColor = mineType.color;
        cellElement.style.color = 'white';
        
        // 添加震动效果
        cellElement.classList.add('damage-shake');
        setTimeout(() => {
            cellElement.classList.remove('damage-shake');
        }, 500);
    }
}

// ==================== 限时每步模式 ====================

function startStepTimer() {
    if (gameState.stepTimerInterval) return;
    
    gameState.stepTimeRemaining = MODE_CONFIGS.step_timer.stepTimeLimit;
    updateStepTimerDisplay();
    
    gameState.stepTimerInterval = setInterval(() => {
        gameState.stepTimeRemaining--;
        updateStepTimerDisplay();
        
        if (gameState.stepTimeRemaining <= 0) {
            // 时间用完，随机点击一个未探索的格子
            handleTimeoutClick();
            resetStepTimer();
        }
    }, 1000);
}

function resetStepTimer() {
    clearInterval(gameState.stepTimerInterval);
    gameState.stepTimerInterval = null;
    gameState.stepTimeRemaining = MODE_CONFIGS.step_timer.stepTimeLimit;
    gameState.currentStep++;
    
    if (gameState.isGameActive) {
        startStepTimer();
    }
}

function handleTimeoutClick() {
    const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;
    
    // 找到所有未探索的格子
    const availableCells = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!gameBoard[r][c].isRevealed && !gameBoard[r][c].isFlagged && !gameBoard[r][c].isQuestioned) {
                availableCells.push([r, c]);
            }
        }
    }
    
    if (availableCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        const [r, c] = availableCells[randomIndex];
        
        showTemporaryMessage('时间用完！自动点击', 1000);
        setTimeout(() => {
            handleCellClick(r, c);
        }, 500);
    }
}

function updateStepTimerDisplay() {
    const element = document.getElementById('stepTimerValue');
    if (element) {
        element.textContent = `${gameState.stepTimeRemaining}s`;
        
        // 时间不足时改变颜色
        if (gameState.stepTimeRemaining <= 3) {
            element.style.color = '#f44336';
        } else if (gameState.stepTimeRemaining <= 5) {
            element.style.color = '#ff9800';
        } else {
            element.style.color = '#4caf50';
        }
    }
    
    const stepElement = document.getElementById('currentStepValue');
    if (stepElement) {
        stepElement.textContent = gameState.currentStep;
    }
}

// ==================== 工具函数 ====================

function showTemporaryMessage(message, duration = 3000) {
    // 创建临时消息元素
    const messageElement = document.createElement('div');
    messageElement.className = 'temporary-message';
    messageElement.textContent = message;
    messageElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 18px;
        font-weight: bold;
        z-index: 1000;
        animation: fadeInOut 0.3s ease;
    `;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, duration);
}

function updateGameModeButtons() {
    // 更新游戏模式选择按钮的状态
    Object.values(GAME_MODES).forEach(mode => {
        const button = document.getElementById(`${mode.id}ModeBtn`);
        if (button) {
            if (mode.id === currentGameMode.id) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    });
}

function endCurrentGame() {
    gameState.isGameActive = false;
    clearAllTimers();
    
    // 调用原始的结束游戏函数
    if (typeof endGameWithoutSaving === 'function') {
        endGameWithoutSaving();
    }
}

// ==================== 集成到现有系统 ====================

// 修改原始的 handleCellClick 函数，添加模式特定逻辑
function handleCellClickWithModes(row, col) {
    // 限时每步模式：重置步数计时器
    if (currentGameMode.id === 'step_timer' && gameState.isGameActive) {
        resetStepTimer();
    }
    
    // 调用原始的点击处理
    const originalResult = handleCellClick(row, col);
    
    // 如果踩到地雷，根据模式处理
    if (gameBoard[row][col].hasMine && gameBoard[row][col].isRevealed) {
        switch(currentGameMode.id) {
            case 'lives':
                loseLife();
                return; // 不结束游戏，继续
                
            case 'energy':
                handleEnergyModeMineHit(row, col);
                return; // 根据能量决定是否结束
                
            case 'classic':
            case 'time_attack':
            case 'step_timer':
            default:
                // 正常结束游戏
                break;
        }
    }
    
    return originalResult;
}

// 修改游戏开始函数
function startGameWithModes() {
    gameState.isGameActive = true;
    
    // 根据模式启动特定功能
    switch(currentGameMode.id) {
        case 'time_attack':
            startTimeLimitCountdown();
            break;
            
        case 'energy':
            // 在地雷放置后设置能量模式
            if (firstClickMade) {
                setupEnergyModeMinePlacement();
            }
            break;
            
        case 'step_timer':
            startStepTimer();
            break;
    }
    
    // 调用原始开始函数
    if (typeof startGame === 'function') {
        startGame();
    }
}

// ==================== 成绩系统扩展 ====================

function saveGameModeScore(formattedTime, totalSeconds, isWin, difficulty, additionalData = {}) {
    const scoreData = {
        totalSeconds: totalSeconds,
        formattedTime: formattedTime,
        player: localStorage.getItem('current_player') || 'anonymous',
        date: new Date().toISOString(),
        status: isWin ? 'win' : 'lost',
        isWin: isWin,
        difficulty: difficulty.name,
        difficultyId: difficulty.id,
        gameMode: currentGameMode.id,
        gameModeName: currentGameMode.displayName,
        ...additionalData
    };
    
    // 按游戏模式和难度分类存储
    const storageKey = `minesweeper_${currentGameMode.id}_${difficulty.id}`;
    const existingScores = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingScores.push(scoreData);
    localStorage.setItem(storageKey, JSON.stringify(existingScores));
    
    console.log(`${currentGameMode.displayName} - ${difficulty.name} 成绩已保存:`, scoreData);
}

// ==================== 初始化 ====================

function initializeGameModes() {
    // 设置默认模式
    currentGameMode = GAME_MODES.CLASSIC;
    resetGameState();
    updateModeUI();
    updateGameModeButtons();
    
    console.log('游戏模式系统初始化完成');
}

// 导出主要函数供外部调用
window.GameModes = {
    switchGameMode,
    resetGameState,
    handleCellClickWithModes,
    startGameWithModes,
    saveGameModeScore,
    initializeGameModes,
    getCurrentMode: () => currentGameMode,
    getGameState: () => gameState
};