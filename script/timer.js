let seconds = 0;
let timerInterval = null;

function startTimer() {
    timerInterval = setInterval(function () {
        seconds++;

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const formattedTime = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');

        document.getElementById('timer').textContent = formattedTime;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

document.addEventListener('DOMContentLoaded', function () {
    startTimer();
});
