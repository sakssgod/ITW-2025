//ITW 2024/25 - Grupo 36 - TP 25 - Oujie Wu 62228;  Ruben Pereira 58378; Viktoriia Ivanova 60882

// 键盘控制器 - 为扫雷游戏提供键盘操作功能
// 需要在 tabuleiro.js 之后加载

// ========== 键盘控制状态变量 ==========
let keyboardMode = false;           // 是否启用键盘模式
let keyboardCursor = {              // 键盘光标位置
    row: 0,
    col: 0
};
let cursorElement = null;           // 光标高亮元素

// ========== 键盘模式切换 ==========

// 切换键盘模式
function toggleKeyboardMode() {
    keyboardMode = !keyboardMode;
    updateKeyboardModeUI();
    
    if (keyboardMode) {
        enableKeyboardMode();
    } else {
        disableKeyboardMode();
    }
    
    console.log(`Keyboard mode ${keyboardMode ? 'enabled' : 'disabled'}`);
}

// 启用键盘模式
function enableKeyboardMode() {
    // 初始化光标位置到游戏板中心
    resetKeyboardCursor();
    
    // 创建光标高亮元素
    createCursorHighlight();
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyboardInput);
    
    // 更新光标显示
    updateCursorPosition();
    
    console.log('Keyboard controls activated: WASD to move, J to explore, K to flag');
}

// 禁用键盘模式
function disableKeyboardMode() {
    // 移除键盘事件监听
    document.removeEventListener('keydown', handleKeyboardInput);
    
    // 移除光标高亮元素
    removeCursorHighlight();
    
    console.log('Keyboard controls deactivated');
}

// ========== 光标管理 ==========

// 重置键盘光标到游戏板中心
function resetKeyboardCursor() {
    const boardSize = getCurrentBoardSize();
    if (boardSize) {
        keyboardCursor.row = Math.floor(boardSize.rows / 2);
        keyboardCursor.col = Math.floor(boardSize.columns / 2);
    } else {
        keyboardCursor.row = 0;
        keyboardCursor.col = 0;
    }
}

// 获取当前游戏板尺寸
function getCurrentBoardSize() {
    // 与 tabuleiro.js 交互，获取当前难度的游戏板尺寸
    if (typeof DIFFICULTY !== 'undefined' && typeof currentDifficultyIndex !== 'undefined') {
        const currentDifficulty = DIFFICULTY[currentDifficultyIndex];
        return {
            rows: currentDifficulty.rows,
            columns: currentDifficulty.columns
        };
    }
    return null;
}

// 移动光标
function moveCursor(direction) {
    const boardSize = getCurrentBoardSize();
    if (!boardSize) {
        console.log('Cannot get board size');
        return;
    }
    
    const oldRow = keyboardCursor.row;
    const oldCol = keyboardCursor.col;
    
    console.log(`Moving cursor ${direction} from (${oldRow}, ${oldCol}), board size: ${boardSize.rows}x${boardSize.columns}`);
    
    switch (direction) {
        case 'up':      // W
            keyboardCursor.row = Math.max(0, keyboardCursor.row - 1);
            break;
        case 'down':    // S
            keyboardCursor.row = Math.min(boardSize.rows - 1, keyboardCursor.row + 1);
            break;
        case 'left':    // A
            keyboardCursor.col = Math.max(0, keyboardCursor.col - 1);
            break;
        case 'right':   // D
            keyboardCursor.col = Math.min(boardSize.columns - 1, keyboardCursor.col + 1);
            break;
    }
    
    // 如果位置有变化，更新显示
    if (oldRow !== keyboardCursor.row || oldCol !== keyboardCursor.col) {
        updateCursorPosition();
        console.log(`✅ Cursor moved to (${keyboardCursor.row}, ${keyboardCursor.col})`);
    } else {
        console.log(`🚫 Cursor blocked at boundary (${keyboardCursor.row}, ${keyboardCursor.col})`);
    }
}

// ========== 视觉反馈 ==========

// 创建光标高亮元素
function createCursorHighlight() {
    if (cursorElement) {
        removeCursorHighlight();
    }
    
    cursorElement = document.createElement('div');
    cursorElement.id = 'keyboard-cursor';
    cursorElement.className = 'keyboard-cursor-highlight';
    
    // 添加到游戏板容器
    const gameBoard = document.getElementById('gameBoard');
    if (gameBoard) {
        gameBoard.appendChild(cursorElement);
    }
}

// 移除光标高亮元素
function removeCursorHighlight() {
    if (cursorElement && cursorElement.parentNode) {
        cursorElement.parentNode.removeChild(cursorElement);
        cursorElement = null;
    }
}

// 更新光标位置显示
function updateCursorPosition() {
    if (!cursorElement || !keyboardMode) {
        console.log('Cannot update cursor position:', {
            cursorElement: !!cursorElement,
            keyboardMode: keyboardMode
        });
        return;
    }
    
    // 获取目标格子元素
    const targetCell = getCellElement ? getCellElement(keyboardCursor.row, keyboardCursor.col) : null;
    if (!targetCell) {
        console.log('Target cell not found:', keyboardCursor);
        return;
    }
    
    // 获取游戏板元素
    const gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) {
        console.log('Game board not found');
        return;
    }
    
    // ✅ 新方法：直接基于格子在网格中的位置计算
    const boardSize = getCurrentBoardSize();
    if (!boardSize) return;
    
    // 获取游戏板的样式
    const boardStyles = window.getComputedStyle(gameBoard);
    const boardRect = gameBoard.getBoundingClientRect();
    
    // 计算单个格子的实际尺寸
    const cellWidth = boardRect.width / boardSize.columns;
    const cellHeight = boardRect.height / boardSize.rows;
    
    // 计算光标位置（基于网格坐标）
    const left = keyboardCursor.col * cellWidth;
    const top = keyboardCursor.row * cellHeight;
    
    // 设置光标样式
    cursorElement.style.position = 'absolute';
    cursorElement.style.left = `${left}px`;
    cursorElement.style.top = `${top}px`;
    cursorElement.style.width = `${cellWidth}px`;
    cursorElement.style.height = `${cellHeight}px`;
    cursorElement.style.display = 'block';
    cursorElement.style.zIndex = '15';
    cursorElement.style.pointerEvents = 'none';
    
    console.log('Cursor position updated:', {
        row: keyboardCursor.row,
        col: keyboardCursor.col,
        left: left.toFixed(1),
        top: top.toFixed(1),
        cellWidth: cellWidth.toFixed(1),
        cellHeight: cellHeight.toFixed(1),
        boardSize: boardSize
    });
}

// ========== 键盘输入处理 ==========

// 处理键盘输入
function handleKeyboardInput(event) {
    // 只在键盘模式启用且游戏进行中时响应
    if (!keyboardMode) return;
    
    // 检查游戏状态（如果游戏未开始或已结束，不响应操作键）
    const gameBoardElement = document.getElementById("gameBoard");
    const isGameActive = !gameBoardElement.classList.contains("game-not-started") && 
                        (typeof gameOver === 'undefined' || !gameOver);
    
    // 防止默认行为
    const key = event.key.toLowerCase();
    
    switch (key) {
        case 'w':
            event.preventDefault();
            moveCursor('up');
            break;
        case 'a':
            event.preventDefault();
            moveCursor('left');
            break;
        case 's':
            event.preventDefault();
            moveCursor('down');
            break;
        case 'd':
            event.preventDefault();
            moveCursor('right');
            break;
        case 'j':
            event.preventDefault();
            if (isGameActive) {
                performLeftClick();
            }
            break;
        case 'k':
            event.preventDefault();
            if (isGameActive) {
                performRightClick();
            }
            break;
        case 'escape':
            event.preventDefault();
            toggleKeyboardMode(); // ESC键快速切换键盘模式
            break;
    }
}

// 执行左键点击（探索格子）
function performLeftClick() {
    if (typeof handleCellClick === 'function') {
        handleCellClick(keyboardCursor.row, keyboardCursor.col);
        console.log(`Left click at (${keyboardCursor.row}, ${keyboardCursor.col})`);
    } else {
        console.error('handleCellClick function not found');
    }
}

// 执行右键点击（标记格子）
function performRightClick() {
    if (typeof handleRightClick === 'function') {
        handleRightClick(keyboardCursor.row, keyboardCursor.col);
        console.log(`Right click at (${keyboardCursor.row}, ${keyboardCursor.col})`);
    } else {
        console.error('handleRightClick function not found');
    }
}

// ========== UI 更新 ==========

// 更新键盘模式UI状态
function updateKeyboardModeUI() {
    const keyboardBtn = document.getElementById('keyboardModeBtn');
    const statusDisplay = document.getElementById('keyboardStatus');
    
    if (keyboardBtn) {
        if (keyboardMode) {
            keyboardBtn.classList.add('active');
            keyboardBtn.innerHTML = '⌨️ Keyboard ON';
        } else {
            keyboardBtn.classList.remove('active');
            keyboardBtn.innerHTML = '⌨️ Keyboard OFF';
        }
    }
    
    if (statusDisplay) {
        if (keyboardMode) {
            statusDisplay.textContent = 'WASD:Move, J:Explore, K:Flag, ESC:Exit';
            statusDisplay.style.display = 'block';
        } else {
            statusDisplay.style.display = 'none';
        }
    }
}

// ========== 外部接口函数 ==========

// 重置键盘光标（供其他脚本调用）
function resetKeyboardCursorExternal() {
    if (keyboardMode) {
        resetKeyboardCursor();
        updateCursorPosition();
    }
}

// 强制禁用键盘模式（供其他脚本调用）
function forceDisableKeyboardMode() {
    if (keyboardMode) {
        keyboardMode = false;
        disableKeyboardMode();
        updateKeyboardModeUI();
    }
}

// 检查键盘模式状态（供其他脚本查询）
function isKeyboardModeActive() {
    return keyboardMode;
}

// ========== 初始化 ==========

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Keyboard controller initialized');
    
    // 等待一会儿确保其他脚本加载完成
    setTimeout(() => {
        // 检查依赖函数是否存在
        if (typeof handleCellClick === 'undefined' || typeof handleRightClick === 'undefined') {
            console.warn('Warning: tabuleiro.js functions not found. Make sure keyboardController.js loads after tabuleiro.js');
        }
        
        // 初始化UI状态
        updateKeyboardModeUI();
        
        // 监听游戏重启，重置光标位置
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            const originalRestart = restartButton.onclick;
            restartButton.addEventListener('click', function() {
                setTimeout(() => {
                    resetKeyboardCursorExternal();
                }, 100);
            });
        }
        
    }, 100);
});

// ========== 窗口大小变化时更新光标位置 ==========
window.addEventListener('resize', function() {
    if (keyboardMode && cursorElement) {
        updateCursorPosition();
    }
});