// 创建模拟的localStorage数据
function initializeMockData() {
    // 检查是否已有数据，如果没有就创建模拟数据
    if (!localStorage.getItem('minesweeper_player_stats')) {
        const mockStats = {
            'alice@example.com': {
                username: 'Alice',
                email: 'alice@example.com',
                totalGames: 45,
                gamesWon: 32,
                bestTime: 89.5,
                totalTime: 3450.2,
                lastPlayed: '2024-05-20',
                difficulty: {
                    easy: { games: 20, wins: 18, bestTime: 89.5, totalTime: 1200 },
                    medium: { games: 15, wins: 10, bestTime: 145.3, totalTime: 1500 },
                    hard: { games: 10, wins: 4, bestTime: 267.8, totalTime: 750.2 }
                }
            },
            'bob@example.com': {
                username: 'Bob',
                email: 'bob@example.com',
                totalGames: 38,
                gamesWon: 25,
                bestTime: 95.2,
                totalTime: 2890.5,
                lastPlayed: '2024-05-19',
                difficulty: {
                    easy: { games: 18, wins: 16, bestTime: 95.2, totalTime: 1100 },
                    medium: { games: 12, wins: 7, bestTime: 158.7, totalTime: 1200 },
                    hard: { games: 8, wins: 2, bestTime: 289.4, totalTime: 590.5 }
                }
            },
            'charlie@example.com': {
                username: 'Charlie',
                email: 'charlie@example.com',
                totalGames: 52,
                gamesWon: 41,
                bestTime: 76.3,
                totalTime: 4200.8,
                lastPlayed: '2024-05-21',
                difficulty: {
                    easy: { games: 25, wins: 23, bestTime: 76.3, totalTime: 1500 },
                    medium: { games: 17, wins: 13, bestTime: 134.2, totalTime: 1800 },
                    hard: { games: 10, wins: 5, bestTime: 245.6, totalTime: 900.8 }
                }
            },
            'diana@example.com': {
                username: 'Diana',
                email: 'diana@example.com',
                totalGames: 29,
                gamesWon: 18,
                bestTime: 102.7,
                totalTime: 2350.3,
                lastPlayed: '2024-05-18',
                difficulty: {
                    easy: { games: 15, wins: 12, bestTime: 102.7, totalTime: 900 },
                    medium: { games: 10, wins: 5, bestTime: 178.9, totalTime: 1000 },
                    hard: { games: 4, wins: 1, bestTime: 312.5, totalTime: 450.3 }
                }
            },
            '321eve@example.com': {
                username: 'Eve',
                email: 'eve@example.com',
                totalGames: 67,
                gamesWon: 48,
                bestTime: 3.9,
                totalTime: 5420.1,
                lastPlayed: '2024-05-22',
                difficulty: {
                    easy: { games: 30, wins: 27, bestTime: 68.9, totalTime: 1800 },
                    medium: { games: 22, wins: 16, bestTime: 125.4, totalTime: 2200 },
                    hard: { games: 15, wins: 5, bestTime: 234.7, totalTime: 1420.1 }
                }
            },
            '444eve@example.com': {
                username: 'Ev3d21e',
                email: 'eve@example.com',
                totalGames: 67,
                gamesWon: 48,
                bestTime: 2.9,
                totalTime: 5420.1,
                lastPlayed: '2024-05-22',
                difficulty: {
                    easy: { games: 30, wins: 27, bestTime: 68.9, totalTime: 1800 },
                    medium: { games: 22, wins: 16, bestTime: 125.4, totalTime: 2200 },
                    hard: { games: 15, wins: 5, bestTime: 234.7, totalTime: 1420.1 }
                }
            },
            'e555ve@example.com': {
                username: 'Ev1231e',
                email: 'eve@example.com',
                totalGames: 67,
                gamesWon: 48,
                bestTime: 1.9,
                totalTime: 5420.1,
                lastPlayed: '2024-05-22',
                difficulty: {
                    easy: { games: 30, wins: 27, bestTime: 68.9, totalTime: 1800 },
                    medium: { games: 22, wins: 16, bestTime: 125.4, totalTime: 2200 },
                    hard: { games: 15, wins: 5, bestTime: 234.7, totalTime: 1420.1 }
                }
            },
            'e14125ve@example.com': {
                username: 'Evedsa',
                email: 'eve@example.com',
                totalGames: 67,
                gamesWon: 48,
                bestTime: 68.9,
                totalTime: 5420.1,
                lastPlayed: '2024-05-22',
                difficulty: {
                    easy: { games: 30, wins: 27, bestTime: 68.9, totalTime: 1800 },
                    medium: { games: 22, wins: 16, bestTime: 125.4, totalTime: 2200 },
                    hard: { games: 15, wins: 5, bestTime: 234.7, totalTime: 1420.1 }
                }
            }
        };
        
        localStorage.setItem('minesweeper_player_stats', JSON.stringify(mockStats));
        console.log('Mock player statistics data created');
    }
}

// 获取玩家统计数据
function getPlayerStats() {
    const statsString = localStorage.getItem('minesweeper_player_stats');
    return statsString ? JSON.parse(statsString) : {};
}

// 保存玩家统计数据
function savePlayerStats(stats) {
    localStorage.setItem('minesweeper_player_stats', JSON.stringify(stats));
}

// 获取当前玩家数据
function getCurrentPlayerStats() {
    const currentPlayer = localStorage.getItem('current_player');
    const allStats = getPlayerStats();
    
    if (currentPlayer) {
        // 查找匹配用户名的玩家
        const playerData = Object.values(allStats).find(player => 
            player.username === currentPlayer
        );
        return playerData || null;
    }
    return null;
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

// 生成排行榜
function generateLeaderboard(sortBy = 'bestTime') {
    const allStats = getPlayerStats();
    const players = Object.values(allStats);
    
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
    
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (leaderboardBody) {
        leaderboardBody.innerHTML = '';
        
        players.forEach((player, index) => {
            const row = document.createElement('tr');
            const rank = index + 1;
            
            // 为前三名添加特殊样式
            if (rank <= 3) {
                row.classList.add(`rank-${rank}`);
            }
            
            const winRate = calculateWinRate(player.gamesWon, player.totalGames);
            const bestTimeDisplay = player.gamesWon > 0 ? formatTime(player.bestTime) : '-';
            
            row.innerHTML = `
                <td>${rank}</td>
                <td>${player.username}</td>
                <td>${bestTimeDisplay}</td>
                <td>${player.gamesWon}</td>
                <td>${winRate}%</td>
            `;
            
            leaderboardBody.appendChild(row);
        });
    }
}

// 显示难度统计
function displayDifficultyStats(difficulty = 'easy') {
    const playerStats = getCurrentPlayerStats();
    const difficultyContent = document.getElementById('difficultyContent');
    
    if (difficultyContent) {
        if (playerStats && playerStats.difficulty && playerStats.difficulty[difficulty]) {
            const diffStats = playerStats.difficulty[difficulty];
            const winRate = calculateWinRate(diffStats.wins, diffStats.games);
            const avgTime = diffStats.games > 0 ? diffStats.totalTime / diffStats.games : 0;
            
            difficultyContent.innerHTML = `
                <div class="difficulty-info">
                    <div class="difficulty-stat">
                        <span class="label">Total Games</span>
                        <span class="value">${diffStats.games}</span>
                    </div>
                    <div class="difficulty-stat">
                        <span class="label">Games Won</span>
                        <span class="value">${diffStats.wins}</span>
                    </div>
                    <div class="difficulty-stat">
                        <span class="label">Win Rate</span>
                        <span class="value">${winRate}%</span>
                    </div>
                    <div class="difficulty-stat">
                        <span class="label">Best Time</span>
                        <span class="value">${formatTime(diffStats.bestTime)}</span>
                    </div>
                    <div class="difficulty-stat">
                        <span class="label">Average Time</span>
                        <span class="value">${formatTime(avgTime)}</span>
                    </div>
                    <div class="difficulty-stat">
                        <span class="label">Total Time</span>
                        <span class="value">${formatTime(diffStats.totalTime)}</span>
                    </div>
                </div>
            `;
        } else {
            difficultyContent.innerHTML = `
                <div class="difficulty-info">
                    <div class="difficulty-stat">
                        <span class="label">No data available</span>
                        <span class="value">-</span>
                    </div>
                </div>
            `;
        }
    }
}

// 设置难度按钮事件
function setupDifficultyButtons() {
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            // 给当前按钮添加active类
            this.classList.add('active');
            
            // 显示对应难度的统计
            const difficulty = this.dataset.difficulty;
            displayDifficultyStats(difficulty);
        });
    });
}

// 更新玩家统计（供游戏结束时调用）
function updatePlayerStats(playerEmail, gameData) {
    const allStats = getPlayerStats();
    
    if (!allStats[playerEmail]) {
        allStats[playerEmail] = {
            username: gameData.username,
            email: playerEmail,
            totalGames: 0,
            gamesWon: 0,
            bestTime: Infinity,
            totalTime: 0,
            lastPlayed: new Date().toISOString().split('T')[0],
            difficulty: {
                easy: { games: 0, wins: 0, bestTime: Infinity, totalTime: 0 },
                medium: { games: 0, wins: 0, bestTime: Infinity, totalTime: 0 },
                hard: { games: 0, wins: 0, bestTime: Infinity, totalTime: 0 }
            }
        };
    }
    
    const player = allStats[playerEmail];
    const difficulty = gameData.difficulty || 'easy';
    
    // 更新总体统计
    player.totalGames++;
    player.totalTime += gameData.time;
    player.lastPlayed = new Date().toISOString().split('T')[0];
    
    // 更新难度统计
    if (!player.difficulty[difficulty]) {
        player.difficulty[difficulty] = { games: 0, wins: 0, bestTime: Infinity, totalTime: 0 };
    }
    
    player.difficulty[difficulty].games++;
    player.difficulty[difficulty].totalTime += gameData.time;
    
    // 如果游戏获胜
    if (gameData.won) {
        player.gamesWon++;
        player.difficulty[difficulty].wins++;
        
        // 更新最佳时间
        if (gameData.time < player.bestTime) {
            player.bestTime = gameData.time;
        }
        if (gameData.time < player.difficulty[difficulty].bestTime) {
            player.difficulty[difficulty].bestTime = gameData.time;
        }
    }
    
    savePlayerStats(allStats);
    console.log('Player stats updated:', player);
}

// 设置排序控件事件
function setupSortControls() {
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            generateLeaderboard(this.value);
        });
    }
}

// ====== 3D轮播功能 ======
let currentSlide = 0;
const totalSlides = 3;
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

// 自动轮播（可选）
function startAutoPlay(interval = 5000) {
    setInterval(() => {
        if (!isAnimating) {
            nextSlide();
        }
    }, interval);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Statistics page loaded');
    
    // 初始化模拟数据
    initializeMockData();
    
    // 显示当前玩家统计
    displayCurrentPlayerStats();
    
    // 生成排行榜（默认按最佳时间排序）
    generateLeaderboard('bestTime');
    
    // 设置排序控件
    setupSortControls();
    
    // 设置难度按钮事件
    setupDifficultyButtons();
    
    // 显示默认难度统计
    displayDifficultyStats('easy');
    
    // 设置3D轮播
    setup3DCarousel();
    
    // 可选：启用自动轮播（取消注释下面这行）
    // startAutoPlay(8000);
});

// 导出函数供其他页面使用
window.updatePlayerStats = updatePlayerStats;
window.getPlayerStats = getPlayerStats;