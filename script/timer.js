// Start the timer as soon as the page loads
document.addEventListener('DOMContentLoaded', function() {
    let seconds = 0;
    
    // Update the timer every second
    setInterval(function() {
        seconds++;
        
        // Calculate hours, minutes, and seconds
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        // Format the time with leading zeros
        const formattedTime = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
        
        // Update the timer display
        document.getElementById('timer').textContent = formattedTime;
    }, 1000);
});