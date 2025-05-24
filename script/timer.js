// 简单独立的计时器 - 不依赖任何其他文件
let gameSeconds = 0;           // 游戏秒数
let gameTimerInterval = null;  // 计时器间隔
let gameHasStarted = false;    // 游戏是否已开始

// 地雷和标记相关变量
let totalMines = 10;           // 总地雷数量（默认简单难度）
let flagsUsed = 0;             // 已使用的标记数量
let exploredCells = 0;         // 已探索的格子数量
let totalSafeCells = 71;       // 总安全格子数量 (9×9-10，默认简单难度)

// 启动计时器
function startGameTimer() {
    // 如果已经在运行，就不重复启动
    if (gameTimerInterval) return;
    
    gameTimerInterval = setInterval(function() {
        gameSeconds++;
        updateTimerDisplay();
    }, 1000); // 每秒更新一次
}

// 停止计时器
function stopGameTimer() {
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }
}

// 重置计时器和计数器
function resetGameTimer() {
    stopGameTimer();
    gameSeconds = 0;
    gameHasStarted = false;
    flagsUsed = 0;
    exploredCells = 0;
    updateTimerDisplay();
    updateMineCounters();
}

// 更新计时器显示
function updateTimerDisplay() {
    const hours = Math.floor(gameSeconds / 3600);
    const minutes = Math.floor((gameSeconds % 3600) / 60);
    const secs = gameSeconds % 60;
    
    const timeString = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].join(':');
    
    // 更新页面显示
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = timeString;
    }
}

// 更新地雷计数器显示
function updateMineCounters() {
    const totalMinesElement = document.getElementById('totalMines');
    const flagsLeftElement = document.getElementById('flagsLeft');
    const exploredCellsElement = document.getElementById('exploredCells');
    const totalSafeCellsElement = document.getElementById('totalSafeCells');
    
    if (totalMinesElement) {
        totalMinesElement.textContent = totalMines;
    }
    
    if (flagsLeftElement) {
        const flagsLeft = totalMines - flagsUsed;
        flagsLeftElement.textContent = flagsLeft;
        
        // 如果标记数量超过地雷数量，显示负数并改变颜色
        if (flagsLeft < 0) {
            flagsLeftElement.style.color = '#ff0000';
            flagsLeftElement.parentElement.style.borderColor = '#ff0000';
        } else {
            flagsLeftElement.style.color = '#0000cc';
            flagsLeftElement.parentElement.style.borderColor = '#4444ff';
        }
    }
    
    if (exploredCellsElement) {
        exploredCellsElement.textContent = exploredCells;
    }
    
    if (totalSafeCellsElement) {
        totalSafeCellsElement.textContent = totalSafeCells;
    }
}

// 增加标记使用计数
function addFlag() {
    flagsUsed++;
    updateMineCounters();
}

// 减少标记使用计数
function removeFlag() {
    flagsUsed--;
    updateMineCounters();
}

// 设置地雷总数和安全格子数
function setTotalMines(count) {
    totalMines = count;
    // 计算总安全格子数 (总格子数 - 地雷数)
    const currentDifficulty = DIFFICULTY && DIFFICULTY[currentDifficultyIndex] ? DIFFICULTY[currentDifficultyIndex] : {rows: 9, columns: 9};
    totalSafeCells = (currentDifficulty.rows * currentDifficulty.columns) - count;
    updateMineCounters();
}

// 增加探索格子计数
function addExploredCell() {
    exploredCells++;
    updateMineCounters();
}

// 检查游戏是否可以开始计时
function checkAndStartTimer() {
    if (!gameHasStarted) {
        gameHasStarted = true;
        startGameTimer();
    }
}

// 结束游戏但不保存数据
function endGameWithoutSaving() {
    // 停止计时器
    stopGameTimer();
    
    // 重置所有状态
    gameSeconds = 0;
    gameHasStarted = false;
    flagsUsed = 0;
    exploredCells = 0;
    
    // 更新显示
    updateTimerDisplay();
    updateMineCounters();
    
    // 显示开始按钮
    const startButton = document.getElementById('startButton');
    const endButton = document.getElementById('endButton');
    
    if (startButton) {
        startButton.style.display = 'block';
    }
    
    if (endButton) {
        endButton.style.display = 'none';
    }
    
    // 添加游戏板的禁用状态（显示蒙版）
    const gameBoard = document.getElementById('gameBoard');
    if (gameBoard) {
        gameBoard.classList.add('game-not-started');
    }
    
    // 通知tabuleiro.js重置游戏板
    if (typeof resetGameBoard === 'function') {
        resetGameBoard();
    }
    
    console.log('Game ended, no data saved');
}

// ========== 分难度存储系统 ==========

// 保存玩家成绩到localStorage（按难度分类存储）
function saveTimerValue(formattedTime, totalSeconds, isWin = true, difficulty = null) {
    try {
        // 获取当前玩家和难度
        const currentPlayer = localStorage.getItem('current_player');
        const currentDifficulty = difficulty || (DIFFICULTY && DIFFICULTY[currentDifficultyIndex] ? DIFFICULTY[currentDifficultyIndex] : {name: "未知", id: "unknown"});
        
        // 创建成绩数据对象
        const scoreData = {
            totalSeconds: totalSeconds,              // 总秒数
            formattedTime: formattedTime,            // 格式化时间 HH:MM:SS
            player: currentPlayer || 'anonymous',    // 玩家名称，如果没有则为匿名
            date: new Date().toISOString(),          // 游戏日期
            status: isWin ? 'win' : 'lost',         // 游戏状态：win/lost
            isWin: isWin,                            // 是否获胜（保持向后兼容）
            difficulty: currentDifficulty.name,     // 难度名称
            difficultyId: currentDifficulty.id,     // 难度ID
            gridSize: `${currentDifficulty.rows}x${currentDifficulty.columns}`, // 网格大小
            totalMines: currentDifficulty.number_mines,  // 地雷总数
            exploredCells: exploredCells,            // 已探索的格子数量
            totalSafeCells: totalSafeCells,          // 总安全格子数量
            flagsUsed: flagsUsed                     // 使用的标记数量
        };
        
        // 获取现有的成绩记录（按难度分类）
        const existingScores = getPlayerScoresByDifficulty(currentDifficulty.id);
        
        // 添加新的成绩记录
        existingScores.push(scoreData);
        
        // 保存回localStorage（按难度分类存储）
        const storageKey = `minesweeper_PlayerScore_${currentDifficulty.id}`;
        localStorage.setItem(storageKey, JSON.stringify(existingScores));
        
        console.log(`${currentDifficulty.name} difficulty score saved (${isWin ? 'Win' : 'Loss'}):`, scoreData);
        
        // 可选：显示成功消息（如果有showSuccess函数可用）
        if (typeof showSuccess === 'function') {
            const statusText = isWin ? 'Win' : 'Loss';
            showSuccess(`${currentDifficulty.name} ${statusText} score saved: ${formattedTime}`);
        }
        
    } catch (error) {
        console.error('Error saving player score:', error);
        
        // Optional: show error message (if showError function available)
        if (typeof showError === 'function') {
            showError('Failed to save score');
        }
    
    }
}

// 按难度获取玩家成绩记录
function getPlayerScoresByDifficulty(difficultyId) {
    const storageKey = `minesweeper_PlayerScore_${difficultyId}`;
    const scoresString = localStorage.getItem(storageKey);
    return scoresString ? JSON.parse(scoresString) : [];
}

// 获取所有难度的玩家成绩记录
function getAllPlayerScores() {
    const allScores = [];
    const difficulties = ['easy', 'medium', 'hard'];
    
    difficulties.forEach(difficultyId => {
        const scores = getPlayerScoresByDifficulty(difficultyId);
        allScores.push(...scores);
    });
    
    return allScores;
}

// 获取指定难度的胜利排行榜
function getWinLeaderboardByDifficulty(difficultyId, limit = 10) {
    const scores = getPlayerScoresByDifficulty(difficultyId);
    return scores
        .filter(score => score.status === 'win')
        .sort((a, b) => a.totalSeconds - b.totalSeconds)
        .slice(0, limit);
}

// 获取当前玩家在指定难度的最佳时间
function getBestTimeByDifficulty(difficultyId) {
    const currentPlayer = localStorage.getItem('current_player');
    if (!currentPlayer) return null;
    
    const scores = getPlayerScoresByDifficulty(difficultyId);
    const playerWins = scores.filter(score => 
        score.player === currentPlayer && score.status === 'win'
    );
    
    if (playerWins.length === 0) return null;
    
    return playerWins.reduce((best, current) => 
        current.totalSeconds < best.totalSeconds ? current : best
    );
}

// 获取当前玩家在指定难度的统计
function getCurrentPlayerStatsByDifficulty(difficultyId) {
    const currentPlayer = localStorage.getItem('current_player');
    if (!currentPlayer) return null;
    
    const scores = getPlayerScoresByDifficulty(difficultyId);
    const playerScores = scores.filter(score => score.player === currentPlayer);
    const wins = playerScores.filter(score => score.status === 'win');
    const losses = playerScores.filter(score => score.status === 'lost');
    const totalGames = wins.length + losses.length;
    
    return {
        difficulty: difficultyId,
        totalGames: totalGames,
        wins: wins.length,
        losses: losses.length,
        winRate: totalGames > 0 ? ((wins.length / totalGames) * 100).toFixed(1) : 0,
        bestTime: wins.length > 0 ? wins.reduce((best, current) => 
            current.totalSeconds < best.totalSeconds ? current : best
        ) : null
    };
}

// 清除指定难度的成绩记录
function clearPlayerScoresByDifficulty(difficultyId) {
    const storageKey = `minesweeper_PlayerScore_${difficultyId}`;
    localStorage.removeItem(storageKey);
    console.log(`${difficultyId} difficulty scores cleared`);
}

// 清除所有难度的成绩记录
function clearAllDifficultyScores() {
    const difficulties = ['easy', 'medium', 'hard'];
    difficulties.forEach(difficultyId => {
        clearPlayerScoresByDifficulty(difficultyId);
    });
    console.log('All difficulty score records cleared');
}

// ========== 兼容性函数（保持向后兼容） ==========

// 获取所有玩家成绩记录（旧版兼容）
function getPlayerScores() {
    // 首先尝试获取新版分难度数据
    const newScores = getAllPlayerScores();
    if (newScores.length > 0) {
        return newScores;
    }
    
    // 如果没有新数据，尝试获取旧版数据
    const scoresString = localStorage.getItem('minesweeper_PlayerScore');
    return scoresString ? JSON.parse(scoresString) : [];
}

// 获取最后一个成绩记录
function getLastScore() {
    const allScores = getAllPlayerScores();
    if (allScores.length === 0) return null;
    
    // 按日期排序，返回最新的
    allScores.sort((a, b) => new Date(b.date) - new Date(a.date));
    return allScores[0];
}

// 获取当前玩家的成绩记录
function getCurrentPlayerScores() {
    const currentPlayer = localStorage.getItem('current_player');
    if (!currentPlayer) return [];
    
    const allScores = getAllPlayerScores();
    return allScores.filter(score => score.player === currentPlayer);
}

// 获取当前玩家的胜利记录
function getCurrentPlayerWins() {
    const currentPlayer = localStorage.getItem('current_player');
    if (!currentPlayer) return [];
    
    const allScores = getAllPlayerScores();
    return allScores.filter(score => score.player === currentPlayer && score.status === 'win');
}

// 获取当前玩家的失败记录
function getCurrentPlayerLosses() {
    const currentPlayer = localStorage.getItem('current_player');
    if (!currentPlayer) return [];
    
    const allScores = getAllPlayerScores();
    return allScores.filter(score => score.player === currentPlayer && score.status === 'lost');
}

// 获取当前玩家的游戏统计
function getCurrentPlayerStats() {
    const wins = getCurrentPlayerWins();
    const losses = getCurrentPlayerLosses();
    const totalGames = wins.length + losses.length;
    
    return {
        totalGames: totalGames,
        wins: wins.length,
        losses: losses.length,
        winRate: totalGames > 0 ? ((wins.length / totalGames) * 100).toFixed(1) : 0,
        bestTime: wins.length > 0 ? wins.reduce((best, current) => 
            current.totalSeconds < best.totalSeconds ? current : best
        ) : null
    };
}

// 获取当前玩家的最佳（最短）胜利时间
function getBestTime() {
    const playerWins = getCurrentPlayerWins();
    if (playerWins.length === 0) return null;
    
    return playerWins.reduce((best, current) => 
        current.totalSeconds < best.totalSeconds ? current : best
    );
}

// 清除所有成绩记录（包括新旧版本）
function clearPlayerScores() {
    // 清除旧版记录
    localStorage.removeItem('minesweeper_PlayerScore');
    
    // 清除新版分难度记录
    clearAllDifficultyScores();
    
    console.log('All player score records cleared');
}

// 获取胜利排行榜（按时间排序，所有难度混合）
function getWinLeaderboard(limit = 10) {
    const allScores = getAllPlayerScores();
    // 只显示胜利记录，按时间从短到长排序
    return allScores
        .filter(score => score.status === 'win')
        .sort((a, b) => a.totalSeconds - b.totalSeconds)
        .slice(0, limit);
}

// 获取全部排行榜（包含胜负状态）
function getAllGamesLeaderboard(limit = 10) {
    const allScores = getAllPlayerScores();
    // 按日期排序，最新的在前
    return allScores
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
}

// ========== 页面加载完成后的初始化 ==========

document.addEventListener('DOMContentLoaded', function() {
    // 初始化显示
    updateTimerDisplay();
    updateMineCounters();
    
    // 监听Start按钮点击
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', function() {
            // 隐藏开始按钮
            startButton.style.display = 'none';
            
            // 显示结束游戏按钮
            const endButton = document.getElementById('endButton');
            if (endButton) {
                endButton.style.display = 'block';
            }
            
            // 移除游戏板的禁用状态（移除蒙版）
            const gameBoard = document.getElementById('gameBoard');
            if (gameBoard) {
                gameBoard.classList.remove('game-not-started');
            }
            
            // ✅ 新增：调用开始游戏函数，禁用难度按钮
            if (typeof startGame === 'function') {
                startGame();
            }
            
            // 开始计时
            checkAndStartTimer();
        });
    }
    
    // 监听End按钮点击
    const endButton = document.getElementById('endButton');
    if (endButton) {
        endButton.addEventListener('click', function() {
            // 确认是否要结束游戏
            if (confirm('Are you sure you want to end the current game? Game data will NOT be saved.')) {
                endGameWithoutSaving();
            }
        });
    }
    
    // 监听重启按钮点击
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.addEventListener('click', function() {
            // 重置计时器和计数器
            resetGameTimer();
            
            // 显示开始按钮
            if (startButton) {
                startButton.style.display = 'block';
            }
            
            // 隐藏结束和重启按钮
            if (endButton) {
                endButton.style.display = 'none';
            }
            restartButton.style.display = 'none';
            
            // 添加游戏板的禁用状态（显示蒙版）
            const gameBoard = document.getElementById('gameBoard');
            if (gameBoard) {
                gameBoard.classList.add('game-not-started');
            }
        });
    }
});