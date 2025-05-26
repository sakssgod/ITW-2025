

document.addEventListener('DOMContentLoaded', function() {
    console.log("Home page 2 loaded");
    displayUserInfo();
});

function displayUserInfo() {
    const currentPlayer = localStorage.getItem('current_player');
    const userInfoSpan = document.getElementById('user-info');
    
    if (currentPlayer) {

        const users = getUsers();
        const currentUser = users.find(user => user.username === currentPlayer);
        
        if (currentUser && currentUser.avatar) {

            userInfoSpan.innerHTML = `&nbsp;${currentUser.username}&nbsp;<img src="${currentUser.avatar}" alt="Avatar" class="inline-avatar">`;
            console.log("User info loaded:", currentUser.username, currentUser.avatar);
        } else if (currentUser) {

            userInfoSpan.innerHTML = `&nbsp;${currentUser.username}`;
            console.log("User loaded without avatar:", currentUser.username);
        } else {
            userInfoSpan.innerHTML = "&nbsp;Guest";
            console.log("User not found in localStorage");
        }
    } else {
        userInfoSpan.innerHTML = "&nbsp;Guest";
        console.log("No current player found");
        

        setTimeout(() => {
            window.location.href = '../html/home_page.html';
        }, 2000);
    }
}
