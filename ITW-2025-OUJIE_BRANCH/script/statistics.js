// ====== 真实数据获取函数 ======

// 获取生命模式数据
function getLivesModeData(difficulty) {
    const storageKey = `minesweeper_lives_${difficulty}`;
    const dataString = localStorage.getItem(storageKey);
    return dataString ? JSON.parse(dataString) : [];
}

// 获取经典模式数据
function getClassicModeData(difficulty) {
    const storageKey = `minesweeper_PlayerScore_${difficulty}`;
    const dataString = localStorage.getItem(storageKey);
    return dataString ? JSON.parse(dataString) : [];
}

// 获取所有难度的数据
function getAllGameData() {
    const difficulties = ['easy', 'medium', 'hard'];
    const allData = {
        lives: {},
        classic: {}
    };
    
    difficulties.forEach(diff => {
        allData.lives[diff] = getLivesModeData(diff);
        allData.classic[diff] = getClassicModeData(diff);
    });
    
    return allData;
}

// 获取当前玩家数据
function getCurrentPlayerStats() {
    const currentPlayer = localStorage.getItem('current_player');
    if (!currentPlayer) return null;
    
    const allData = getAllGameData();
    const playerStats = {
        username: currentPlayer,
        totalGames: 0,
        gamesWon: 0,
        bestTime: Infinity,
        totalTime: 0,
        difficulty: {
            easy: { games: 0, wins: 0, bestTime: Infinity, totalTime: 0, livesGames: 0, livesWins: 0 },
            medium: { games: 0, wins: 0, bestTime: Infinity, totalTime: 0, livesGames: 0, livesWins: 0 },
            hard: { games: 0, wins: 0, bestTime: Infinity, totalTime: 0, livesGames: 0, livesWins: 0 }
        }
    };
    
    // 处理每个难度的数据
    ['easy', 'medium', 'hard'].forEach(diff => {
        // 经典模式数据
        const classicGames = allData.classic[diff].filter(game => game.player === currentPlayer);
        const classicWins = classicGames.filter(game => game.isWin);
        
        // 生命模式数据
        const livesGames = allData.lives[diff].filter(game => game.player === currentPlayer);
        const livesWins = livesGames.filter(game => game.isWin);
        
        // 统计经典模式
        playerStats.difficulty[diff].games = classicGames.length;
        playerStats.difficulty[diff].wins = classicWins.length;
        playerStats.difficulty[diff].totalTime = classicGames.reduce((sum, game) => sum + (game.totalSeconds || 0), 0);
        
        // 统计生命模式
        playerStats.difficulty[diff].livesGames = livesGames.length;
        playerStats.difficulty[diff].livesWins = livesWins.length;
        
        // 计算最佳时间（包括两种模式）
        const allWins = [...classicWins, ...livesWins];
        if (allWins.length > 0) {
            const bestGame = allWins.reduce((best, current) => 
                current.totalSeconds < best.totalSeconds ? current : best
            );
            playerStats.difficulty[diff].bestTime = bestGame.totalSeconds;
        }
        
        // 累计总体统计
        playerStats.totalGames += classicGames.length + livesGames.length;
        playerStats.gamesWon += classicWins.length + livesWins.length;
        playerStats.totalTime += playerStats.difficulty[diff].totalTime;
        
        // 更新全局最佳时间
        if (playerStats.difficulty[diff].bestTime < playerStats.bestTime) {
            playerStats.bestTime = playerStats.difficulty[diff].bestTime;
        }
    });
    
    // 如果没有获胜记录，将bestTime设为0
    if (playerStats.bestTime === Infinity) {
        playerStats.bestTime = 0;
    }
    
    return playerStats;
}

// 格式化时间显示
function formatTime(seconds) {
    if (!seconds || seconds === 0) return '-';
    
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return minutes > 0 ? `${minutes}:${secs.padStart(4, '0')}` : `${secs}s`;
}

// 计算胜率
function calculateWinRate(gamesWon, totalGames) {
    if (totalGames === 0) return 0;
    return ((gamesWon / totalGames) * 100).toFixed(1);
}

// 计算探索率
function calculateExplorationRate(exploredCells, totalSafeCells) {
    if (!totalSafeCells || totalSafeCells === 0) return 0;
    return ((exploredCells / totalSafeCells) * 100).toFixed(1);
}

// 显示当前玩家统计
function displayCurrentPlayerStats() {
    const playerStats = getCurrentPlayerStats();
    
    if (playerStats) {
        document.getElementById('playerName').textContent = playerStats.username;
        document.getElementById('bestTime').textContent = formatTime(playerStats.bestTime);
        document.getElementById('totalGames').textContent = playerStats.totalGames;
        document.getElementById('gamesWon').textContent = playerStats.gamesWon;
        document.getElementById('winRate').textContent = calculateWinRate(playerStats.gamesWon, playerStats.totalGames) + '%';
        
        const avgTime = playerStats.totalGames > 0 ? playerStats.totalTime / playerStats.totalGames : 0;
        document.getElementById('avgTime').textContent = formatTime(avgTime);
    } else {
        // 如果没有当前玩家或数据，显示默认值
        document.getElementById('playerName').textContent = 'Guest';
        document.getElementById('bestTime').textContent = '-';
        document.getElementById('totalGames').textContent = '0';
        document.getElementById('gamesWon').textContent = '0';
        document.getElementById('winRate').textContent = '0%';
        document.getElementById('avgTime').textContent = '-';
    }
}

// ====== 经典模式排行榜 ======
function generateClassicLeaderboard(sortBy = 'bestTime') {
    const allData = getAllGameData();
    const playerMap = new Map();
    
    // 只收集经典模式的数据
    ['easy', 'medium', 'hard'].forEach(diff => {
        allData.classic[diff].forEach(game => {
            if (!playerMap.has(game.player)) {
                playerMap.set(game.player, {
                    username: game.player,
                    totalGames: 0,
                    gamesWon: 0,
                    bestTime: Infinity,
                    totalTime: 0
                });
            }
            
            const playerData = playerMap.get(game.player);
            playerData.totalGames++;
            playerData.totalTime += game.totalSeconds || 0;
            
            if (game.isWin) {
                playerData.gamesWon++;
                if (game.totalSeconds < playerData.bestTime) {
                    playerData.bestTime = game.totalSeconds;
                }
            }
        });
    });
    
    generateLeaderboardTable(playerMap, sortBy, 'classicLeaderboardBody', '🏆');
}

// ====== 生命模式排行榜 ======
function generateLivesLeaderboard(sortBy = 'bestTime') {
    const allData = getAllGameData();
    const playerMap = new Map();
    
    // 只收集生命模式的数据
    ['easy', 'medium', 'hard'].forEach(diff => {
        allData.lives[diff].forEach(game => {
            if (!playerMap.has(game.player)) {
                playerMap.set(game.player, {
                    username: game.player,
                    totalGames: 0,
                    gamesWon: 0,
                    bestTime: Infinity,
                    totalTime: 0
                });
            }
            
            const playerData = playerMap.get(game.player);
            playerData.totalGames++;
            playerData.totalTime += game.totalSeconds || 0;
            
            if (game.isWin) {
                playerData.gamesWon++;
                if (game.totalSeconds < playerData.bestTime) {
                    playerData.bestTime = game.totalSeconds;
                }
            }
        });
    });
    
    generateLeaderboardTable(playerMap, sortBy, 'livesLeaderboardBody', '💖');
}

// ====== 综合排行榜 ======
function generateOverallLeaderboard(sortBy = 'bestTime') {
    const allData = getAllGameData();
    const playerMap = new Map();
    
    // 收集所有模式的数据
    ['easy', 'medium', 'hard'].forEach(diff => {
        // 处理经典模式数据
        allData.classic[diff].forEach(game => {
            if (!playerMap.has(game.player)) {
                playerMap.set(game.player, {
                    username: game.player,
                    totalGames: 0,
                    gamesWon: 0,
                    bestTime: Infinity,
                    totalTime: 0,
                    classicGames: 0,
                    livesGames: 0,
                    classicWins: 0,
                    livesWins: 0
                });
            }
            
            const playerData = playerMap.get(game.player);
            playerData.totalGames++;
            playerData.classicGames++;
            playerData.totalTime += game.totalSeconds || 0;
            
            if (game.isWin) {
                playerData.gamesWon++;
                playerData.classicWins++;
                if (game.totalSeconds < playerData.bestTime) {
                    playerData.bestTime = game.totalSeconds;
                }
            }
        });
        
        // 处理生命模式数据
        allData.lives[diff].forEach(game => {
            if (!playerMap.has(game.player)) {
                playerMap.set(game.player, {
                    username: game.player,
                    totalGames: 0,
                    gamesWon: 0,
                    bestTime: Infinity,
                    totalTime: 0,
                    classicGames: 0,
                    livesGames: 0,
                    classicWins: 0,
                    livesWins: 0
                });
            }
            
            const playerData = playerMap.get(game.player);
            playerData.totalGames++;
            playerData.livesGames++;
            playerData.totalTime += game.totalSeconds || 0;
            
            if (game.isWin) {
                playerData.gamesWon++;
                playerData.livesWins++;
                if (game.totalSeconds < playerData.bestTime) {
                    playerData.bestTime = game.totalSeconds;
                }
            }
        });
    });
    
    generateLeaderboardTable(playerMap, sortBy, 'overallLeaderboardBody', '🏅', true);
}

// ====== 失败游戏排行榜 ======
function generateFailedLeaderboard(mode = 'classic') {
    const allData = getAllGameData();
    const playerMap = new Map();
    const dataSource = mode === 'classic' ? allData.classic : allData.lives;
    
    ['easy', 'medium', 'hard'].forEach(diff => {
        dataSource[diff].forEach(game => {
            if (!game.isWin) { // 只统计失败的游戏
                if (!playerMap.has(game.player)) {
                    playerMap.set(game.player, {
                        username: game.player,
                        totalFailedGames: 0,
                        totalExploredCells: 0,
                        totalTime: 0,
                        bestExplorationRate: 0,
                        bestTimeEfficiency: Infinity
                    });
                }
                
                const playerData = playerMap.get(game.player);
                playerData.totalFailedGames++;
                
                const exploredCells = game.exploredCells || 0;
                const totalSafeCells = game.totalSafeCells || 1;
                const explorationRate = (exploredCells / totalSafeCells) * 100;
                
                playerData.totalExploredCells += exploredCells;
                
                // 记录最佳探索率
                if (explorationRate > playerData.bestExplorationRate) {
                    playerData.bestExplorationRate = explorationRate;
                }
                
                // 记录最佳时间效率（探索率相同时比较时间）
                if (explorationRate >= playerData.bestExplorationRate && 
                    game.totalSeconds < playerData.bestTimeEfficiency) {
                    playerData.bestTimeEfficiency = game.totalSeconds;
                }
                
                playerData.totalTime += game.totalSeconds || 0;
            }
        });
    });
    
    const players = Array.from(playerMap.values());
    
    // 按探索率和时间效率排序
    players.sort((a, b) => {
        // 主要按最佳探索率排序（越高越好）
        if (Math.abs(a.bestExplorationRate - b.bestExplorationRate) > 0.1) {
            return b.bestExplorationRate - a.bestExplorationRate;
        }
        // 探索率相近时按时间效率排序（越短越好）
        return a.bestTimeEfficiency - b.bestTimeEfficiency;
    });
    
    const tableBodyId = mode === 'classic' ? 'classicFailedLeaderboardBody' : 'livesFailedLeaderboardBody';
    const leaderboardBody = document.getElementById(tableBodyId);
    
    if (leaderboardBody) {
        leaderboardBody.innerHTML = '';
        
        if (players.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
                    No failed game data available.
                </td>
            `;
            leaderboardBody.appendChild(row);
            return;
        }
        
        players.forEach((player, index) => {
            const row = document.createElement('tr');
            const rank = index + 1;
            
            // 为前三名添加特殊样式
            if (rank <= 3) {
                row.classList.add(`rank-${rank}`);
            }
            
            const avgTime = player.totalFailedGames > 0 ? player.totalTime / player.totalFailedGames : 0;
            
            row.innerHTML = `
                <td>${rank}</td>
                <td>${player.username}</td>
                <td>${player.bestExplorationRate.toFixed(1)}%</td>
                <td>${formatTime(player.bestTimeEfficiency === Infinity ? avgTime : player.bestTimeEfficiency)}</td>
                <td>${player.totalFailedGames}</td>
            `;
            
            row.title = `Best exploration: ${player.bestExplorationRate.toFixed(1)}%\nAverage time: ${formatTime(avgTime)}`;
            
            leaderboardBody.appendChild(row);
        });
    }
}

// ====== 通用排行榜表格生成函数 ======
function generateLeaderboardTable(playerMap, sortBy, tableBodyId, icon = '', showModeIcons = false) {
    const players = Array.from(playerMap.values());
    
    // 处理没有获胜记录的玩家
    players.forEach(player => {
        if (player.bestTime === Infinity) {
            player.bestTime = 0;
        }
    });
    
    // 根据不同的排序方式
    players.sort((a, b) => {
        // 如果没有获胜记录，排在最后（除非按总游戏数排序）
        if (sortBy !== 'totalGames') {
            if (a.gamesWon === 0 && b.gamesWon === 0) return 0;
            if (a.gamesWon === 0) return 1;
            if (b.gamesWon === 0) return -1;
        }
        
        switch(sortBy) {
            case 'bestTime':
                return a.bestTime - b.bestTime; // 时间越短越好
            case 'gamesWon':
                return b.gamesWon - a.gamesWon; // 获胜次数越多越好
            case 'winRate':
                const winRateA = a.totalGames > 0 ? (a.gamesWon / a.totalGames) : 0;
                const winRateB = b.totalGames > 0 ? (b.gamesWon / b.totalGames) : 0;
                return winRateB - winRateA; // 胜率越高越好
            case 'totalGames':
                return b.totalGames - a.totalGames; // 总游戏数越多越好
            default:
                return a.bestTime - b.bestTime;
        }
    });
    
    const leaderboardBody = document.getElementById(tableBodyId);
    if (leaderboardBody) {
        leaderboardBody.innerHTML = '';
        
        if (players.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
                    No game data available. Start playing to see statistics!
                </td>
            `;
            leaderboardBody.appendChild(row);
            return;
        }
        
        players.forEach((player, index) => {
            const row = document.createElement('tr');
            const rank = index + 1;
            
            // 为前三名添加特殊样式
            if (rank <= 3) {
                row.classList.add(`rank-${rank}`);
            }
            
            const winRate = calculateWinRate(player.gamesWon, player.totalGames);
            const bestTimeDisplay = player.gamesWon > 0 ? formatTime(player.bestTime) : '-';
            
            // 添加模式标识（仅用于综合排行榜）
            let modeIcons = '';
            if (showModeIcons) {
                if (player.classicWins > 0) modeIcons += '🏆';
                if (player.livesWins > 0) modeIcons += '💖';
            }
            
            row.innerHTML = `
                <td>${rank}</td>
                <td>${icon} ${player.username} ${modeIcons}</td>
                <td>${bestTimeDisplay}</td>
                <td>${player.gamesWon}</td>
                <td>${winRate}%</td>
            `;
            
            // 添加tooltip显示详细信息
            if (showModeIcons && player.classicGames !== undefined) {
                row.title = `Classic: ${player.classicGames} games, ${player.classicWins} wins\nLives: ${player.livesGames} games, ${player.livesWins} wins`;
            }
            
            leaderboardBody.appendChild(row);
        });
    }
}

// ====== 难度统计显示 ======
function displayDifficultyStats(difficulty = 'easy', mode = 'classic') {
    const playerStats = getCurrentPlayerStats();
    const contentId = mode === 'classic' ? 'classicDifficultyContent' : 'livesDifficultyContent';
    const difficultyContent = document.getElementById(contentId);
    
    if (difficultyContent) {
        if (playerStats && playerStats.difficulty && playerStats.difficulty[difficulty]) {
            const diffStats = playerStats.difficulty[difficulty];
            
            // 根据模式选择数据
            let totalGames, totalWins, totalTime;
            if (mode === 'classic') {
                totalGames = diffStats.games;
                totalWins = diffStats.wins;
                totalTime = diffStats.totalTime;
            } else {
                totalGames = diffStats.livesGames;
                totalWins = diffStats.livesWins;
                totalTime = 0; // 生命模式的时间统计需要从原始数据获取
            }
            
            const winRate = calculateWinRate(totalWins, totalGames);
            const avgTime = totalGames > 0 ? totalTime / totalGames : 0;
            
            // 获取该难度的详细数据用于额外统计
            const allData = getAllGameData();
            const dataSource = mode === 'classic' ? allData.classic : allData.lives;
            
            const playerGames = dataSource[difficulty].filter(game => 
                game.player === playerStats.username
            );
            
            // 计算平均探索率
            const avgExplorationRate = playerGames.length > 0 ? 
                (playerGames.reduce((sum, game) => sum + parseFloat(game.explorationRate || 0), 0) / playerGames.length).toFixed(1) : 0;
            
            // 生命模式特有统计
            let modeSpecificStats = '';
            if (mode === 'lives') {
                const avgLivesLost = playerGames.length > 0 ? 
                    (playerGames.reduce((sum, game) => sum + (game.livesLost || 0), 0) / playerGames.length).toFixed(1) : 0;
                
                const totalLivesTime = playerGames.reduce((sum, game) => sum + (game.totalSeconds || 0), 0);
                const avgLivesTime = playerGames.length > 0 ? totalLivesTime / playerGames.length : 0;
                
                modeSpecificStats = `
                    <div class="difficulty-stat">
                        <span class="label">Avg Lives Lost</span>
                        <span class="value">${avgLivesLost}</span>
                    </div>
                    <div class="difficulty-stat">
                        <span class="label">Average Time</span>
                        <span class="value">${formatTime(avgLivesTime)}</span>
                    </div>
                `;
            } else {
                modeSpecificStats = `
                    <div class="difficulty-stat">
                        <span class="label">Average Time</span>
                        <span class="value">${formatTime(avgTime)}</span>
                    </div>
                `;
            }
            
            difficultyContent.innerHTML = `
                <div class="difficulty-info">
                    <div class="difficulty-stat">
                        <span class="label">Total Games</span>
                        <span class="value">${totalGames}</span>
                    </div>
                    <div class="difficulty-stat">
                        <span class="label">Games Won</span>
                        <span class="value">${totalWins}</span>
                    </div>
                    <div class="difficulty-stat">
                        <span class="label">Win Rate</span>
                        <span class="value">${winRate}%</span>
                    </div>
                    <div class="difficulty-stat">
                        <span class="label">Best Time</span>
                        <span class="value">${formatTime(diffStats.bestTime)}</span>
                    </div>
                    ${modeSpecificStats}
                    <div class="difficulty-stat">
                        <span class="label">Avg Exploration</span>
                        <span class="value">${avgExplorationRate}%</span>
                    </div>
                </div>
            `;
        } else {
            const modeText = mode === 'classic' ? 'Classic' : 'Lives';
            difficultyContent.innerHTML = `
                <div class="difficulty-info">
                    <div class="difficulty-stat">
                        <span class="label">No data available</span>
                        <span class="value">Start playing ${modeText} ${difficulty} mode!</span>
                    </div>
                </div>
            `;
        }
    }
}

// ====== 事件处理设置 ======

// 设置难度按钮事件（分经典和生命模式）
function setupDifficultyButtons() {
    // 经典模式难度按钮
    const classicButtons = document.querySelectorAll('.classic-btn');
    classicButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除同组按钮的active类
            classicButtons.forEach(btn => btn.classList.remove('active'));
            // 给当前按钮添加active类
            this.classList.add('active');
            
            // 显示对应难度的统计
            const difficulty = this.dataset.difficulty;
            displayDifficultyStats(difficulty, 'classic');
        });
    });
    
    // 生命模式难度按钮
    const livesButtons = document.querySelectorAll('.lives-btn');
    livesButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除同组按钮的active类
            livesButtons.forEach(btn => btn.classList.remove('active'));
            // 给当前按钮添加active类
            this.classList.add('active');
            
            // 显示对应难度的统计
            const difficulty = this.dataset.difficulty;
            displayDifficultyStats(difficulty, 'lives');
        });
    });
}

// 设置排序控件事件
function setupSortControls() {
    // 经典模式排序
    const classicSortSelect = document.getElementById('classicSortBy');
    if (classicSortSelect) {
        classicSortSelect.addEventListener('change', function() {
            generateClassicLeaderboard(this.value);
        });
    }
    
    // 生命模式排序
    const livesSortSelect = document.getElementById('livesSortBy');
    if (livesSortSelect) {
        livesSortSelect.addEventListener('change', function() {
            generateLivesLeaderboard(this.value);
        });
    }
    
    // 综合排行榜排序
    const overallSortSelect = document.getElementById('overallSortBy');
    if (overallSortSelect) {
        overallSortSelect.addEventListener('change', function() {
            generateOverallLeaderboard(this.value);
        });
    }
}

// 初始化模拟数据（现在只用于演示，如果没有真实数据的话）
function initializeMockData() {
    // 检查是否有真实数据
    const allData = getAllGameData();
    const hasData = ['easy', 'medium', 'hard'].some(diff => 
        allData.classic[diff].length > 0 || allData.lives[diff].length > 0
    );
    
    // 如果没有真实数据，创建一些示例数据
    if (!hasData) {
        console.log('No real game data found, creating demo data...');
        
        const demoClassicData = [
            {
                totalSeconds: 89.5,
                formattedTime: "01:29.5",
                player: "DemoPlayer1",
                date: new Date().toISOString(),
                status: "win",
                isWin: true,
                difficulty: "Easy",
                difficultyId: "easy",
                gameMode: "classic",
                explorationRate: "85.2",
                exploredCells: 65,
                totalSafeCells: 71
            },
            {
                totalSeconds: 145.3,
                formattedTime: "02:25.3",
                player: "DemoPlayer2",
                date: new Date().toISOString(),
                status: "win",
                isWin: true,
                difficulty: "Medium",
                difficultyId: "medium",
                gameMode: "classic",
                explorationRate: "92.1",
                exploredCells: 200,
                totalSafeCells: 216
            },
            {
                totalSeconds: 65.8,
                formattedTime: "01:05.8",
                player: "DemoPlayer1",
                date: new Date().toISOString(),
                status: "lost",
                isWin: false,
                difficulty: "Easy",
                difficultyId: "easy",
                gameMode: "classic",
                explorationRate: "45.2",
                exploredCells: 32,
                totalSafeCells: 71
            }
        ];
        
        const demoLivesData = [
            {
                totalSeconds: 120.7,
                formattedTime: "02:00.7",
                player: "DemoPlayer3",
                date: new Date().toISOString(),
                status: "win",
                isWin: true,
                difficulty: "Easy",
                difficultyId: "easy",
                gameMode: "lives",
                explorationRate: "100.0",
                exploredCells: 71,
                totalSafeCells: 71,
                livesLost: 2,
                finalLives: 1
            }
        ];
        
        // 保存示例数据
        localStorage.setItem('minesweeper_PlayerScore_easy', JSON.stringify([demoClassicData[0], demoClassicData[2]]));
        localStorage.setItem('minesweeper_PlayerScore_medium', JSON.stringify([demoClassicData[1]]));
        localStorage.setItem('minesweeper_lives_easy', JSON.stringify([demoLivesData[0]]));
        
        console.log('Demo data created');
    }
}

// ====== 3D轮播功能 ======
let currentSlide = 0;
const totalSlides = 7; // 更新为7个slides
let isAnimating = false;

// 更新3D轮播显示
function updateCarousel3D() {
    if (isAnimating) return;
    
    const slides = document.querySelectorAll('.carousel-3d-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    console.log(`Switching to slide ${currentSlide}`);
    isAnimating = true;
    
    // 移除所有状态类
    slides.forEach(slide => {
        slide.classList.remove('active', 'prev', 'next', 'hidden');
    });
    
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });
    
    // 设置当前幻灯片状态
    slides.forEach((slide, index) => {
        const slideIndex = parseInt(slide.dataset.slide);
        
        if (slideIndex === currentSlide) {
            slide.classList.add('active');
        } else if (slideIndex === (currentSlide - 1 + totalSlides) % totalSlides) {
            slide.classList.add('prev');
        } else if (slideIndex === (currentSlide + 1) % totalSlides) {
            slide.classList.add('next');
        } else {
            slide.classList.add('hidden');
        }
    });
    
    // 更新指示器
    if (indicators[currentSlide]) {
        indicators[currentSlide].classList.add('active');
    }
    
    // 动画结束后重置状态
    setTimeout(() => {
        isAnimating = false;
    }, 800);
}

// 切换到上一个幻灯片
function prevSlide() {
    if (isAnimating) return;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel3D();
}

// 切换到下一个幻灯片
function nextSlide() {
    if (isAnimating) return;
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel3D();
}

// 切换到指定幻灯片
function goToSlide(slideIndex) {
    if (isAnimating || slideIndex === currentSlide) return;
    currentSlide = slideIndex;
    updateCarousel3D();
}

// 设置3D轮播控件
function setup3DCarousel() {
    const prevBtn = document.getElementById('prevTable');
    const nextBtn = document.getElementById('nextTable');
    const indicators = document.querySelectorAll('.indicator');
    
    console.log('Setting up 3D carousel');
    console.log('Prev button:', prevBtn);
    console.log('Next button:', nextBtn);
    console.log('Indicators:', indicators.length);
    
    // 设置箭头按钮事件
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Previous button clicked');
            prevSlide();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Next button clicked');
            nextSlide();
        });
    }
    
    // 设置指示器点击事件
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`Indicator ${index} clicked`);
            goToSlide(index);
        });
    });
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            console.log('Left arrow pressed');
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            console.log('Right arrow pressed');
            nextSlide();
        }
    });
    
    // 触摸滑动支持
    let startX = 0;
    let endX = 0;
    
    const carousel = document.querySelector('.table-carousel-3d');
    if (carousel) {
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) { // 最小滑动距离
                if (diff > 0) {
                    nextSlide(); // 向左滑动，显示下一个
                } else {
                    prevSlide(); // 向右滑动，显示上一个
                }
            }
        });
    }
    
    // 初始化显示
    updateCarousel3D();
}

// ====== 数据导出和调试功能 ======

// 获取所有统计数据（调试用）
function getAllStats() {
    console.log('=== All Game Statistics ===');
    console.log('Lives Mode Data:');
    ['easy', 'medium', 'hard'].forEach(diff => {
        const data = getLivesModeData(diff);
        console.log(`  ${diff}:`, data);
    });
    
    console.log('Classic Mode Data:');
    ['easy', 'medium', 'hard'].forEach(diff => {
        const data = getClassicModeData(diff);
        console.log(`  ${diff}:`, data);
    });
    
    console.log('Current Player Stats:', getCurrentPlayerStats());
}

// 清除所有数据（调试用）
function clearAllStats() {
    if (confirm('Are you sure you want to clear all game statistics? This cannot be undone!')) {
        ['easy', 'medium', 'hard'].forEach(diff => {
            localStorage.removeItem(`minesweeper_lives_${diff}`);
            localStorage.removeItem(`minesweeper_PlayerScore_${diff}`);
        });
        console.log('All statistics cleared!');
        location.reload(); // 刷新页面
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced Statistics page loaded - using real game data');
    
    // 初始化演示数据（仅在没有真实数据时）
    initializeMockData();
    
    // 显示当前玩家统计
    displayCurrentPlayerStats();
    
    // 生成所有排行榜（默认按最佳时间排序）
    generateClassicLeaderboard('bestTime');
    generateLivesLeaderboard('bestTime');
    generateOverallLeaderboard('bestTime');
    generateFailedLeaderboard('classic');
    generateFailedLeaderboard('lives');
    
    // 设置排序控件
    setupSortControls();
    
    // 设置难度按钮事件
    setupDifficultyButtons();
    
    // 显示默认难度统计
    displayDifficultyStats('easy', 'classic');
    displayDifficultyStats('easy', 'lives');
    
    // 设置3D轮播
    setup3DCarousel();
    
    // 调试：将统计函数暴露到全局
    window.getAllStats = getAllStats;
    window.clearAllStats = clearAllStats;
    
    console.log('Use getAllStats() to see all data, clearAllStats() to reset');
});

// 导出函数供其他页面使用
window.updatePlayerStats = function(playerEmail, gameData) {
    console.log('updatePlayerStats called with:', playerEmail, gameData);
    // 这个函数现在主要由游戏页面的timer.js处理
};
window.getPlayerStats = getAllGameData;