//ITW 2024/25 - Grupo 36 - TP 25 - Oujie Wu 62228;  Ruben Pereira 58378; Viktoriia Ivanova 60882

// playerRadarChart.js
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('playerRadarChart').getContext('2d');

    // 从现有统计函数中提取数据（这只是个例子，真实值你需要从 getCurrentPlayerStats() 或 dom 中获取）
    const stats = {
        bestTime: 60, // 越小越好，反转处理
        totalGames: 25,
        gamesWon: 15,
        winRate: 60, // %
        avgTime: 90, // 越小越好，反转处理
        explorationRate: 75 // %
    };

    // 为雷达图标准化（0-100之间）
    const normalize = (value, max = 100, invert = false) => {
        const v = Math.min(value, max);
        return invert ? (100 - (v / max) * 100) : ((v / max) * 100);
    };

    const radarData = {
        labels: [
            'Best Time',
            'Total Games',
            'Games Won',
            'Win Rate',
            'Average Time',
            'Exploration Rate'
        ],
        datasets: [{
            label: 'Player Performance',
            data: [
                normalize(stats.bestTime, 180, true), // 3分钟封顶
                normalize(stats.totalGames, 100),
                normalize(stats.gamesWon, 100),
                normalize(stats.winRate),
                normalize(stats.avgTime, 180, true),
                normalize(stats.explorationRate)
            ],
            backgroundColor: 'rgba(0, 102, 204, 0.2)',
            borderColor: 'rgba(0, 102, 204, 1)',
            pointBackgroundColor: 'rgba(0, 102, 204, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(0, 102, 204, 1)'
        }]
    };

    new Chart(ctx, {
        type: 'radar',
        data: radarData,
        options: {
            scale: {
                ticks: {
                    beginAtZero: true,
                    max: 100,
                    backdropColor: 'transparent',
                    color: '#222',        // 提升对比度
                    font: {
                        weight: 'bold'
                    }
                },
                pointLabels: {
                    color: '#222',
                    font: {
                        size: 14,
                        weight: '600'
                    }
                },
                grid: {
                    color: 'rgba(0,0,0,0.1)' // 网格线柔和
                },
                angleLines: {
                    color: 'rgba(0,0,0,0.1)' // 网轴线柔和
                }
            },
            plugins: {
                legend: { display: false }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
});
