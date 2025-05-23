let seconds = 0;
let timerInterval = null;
let currentFormattedTime = '00:00:00';

function startTimer() {
    timerInterval = setInterval(function () {
        seconds++;

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        currentFormattedTime = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');

        document.getElementById('timer').textContent = currentFormattedTime;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    
    // Save the timer value to localStorage when stopped
    saveTimerValue(currentFormattedTime, seconds);
}

function saveTimerValue(formattedTime, totalSeconds) {
    try {
        // Get current player (if you want to associate timer with specific player)
        const currentPlayer = localStorage.getItem('current_player');
        
        // Create timer data object
        const timerData = {
            totalSeconds: totalSeconds,
            player: currentPlayer || 'anonymous'
        };
        
        // Get existing timer records
        const existingTimers = getTimerRecords();
        
        // Add new timer record
        existingTimers.push(timerData);
        
        // Save back to localStorage
        localStorage.setItem('minesweeper_timers', JSON.stringify(existingTimers));
        
        console.log('Timer saved:', timerData);
        
        // Optional: Show success message (if you have the showSuccess function available)
        if (typeof showSuccess === 'function') {
            showSuccess(`Timer saved: ${totalSeconds} seconds`);
        }
        
    } catch (error) {
        console.error('Error saving timer:', error);
        
        // Optional: Show error message (if you have the showError function available)
        if (typeof showError === 'function') {
            showError('Failed to save timer');
        }
    }
}

function getTimerRecords() {
    const timersString = localStorage.getItem('minesweeper_timers');
    return timersString ? JSON.parse(timersString) : [];
}

function getLastTimerValue() {
    const timers = getTimerRecords();
    return timers.length > 0 ? timers[timers.length - 1] : null;
}

function getAllTimerRecords() {
    return getTimerRecords();
}

// Optional: Function to get timer records for current player only
function getCurrentPlayerTimers() {
    const currentPlayer = localStorage.getItem('current_player');
    if (!currentPlayer) return [];
    
    const allTimers = getTimerRecords();
    return allTimers.filter(timer => timer.player === currentPlayer);
}

// Optional: Function to clear all timer records
function clearTimerRecords() {
    localStorage.removeItem('minesweeper_timers');
    console.log('All timer records cleared');
}

// Optional: Function to get best (shortest) time for current player
function getBestTime() {
    const playerTimers = getCurrentPlayerTimers();
    if (playerTimers.length === 0) return null;
    
    return playerTimers.reduce((best, current) => 
        current.totalSeconds < best.totalSeconds ? current : best
    );
}

document.addEventListener('DOMContentLoaded', function () {
    startTimer();
});