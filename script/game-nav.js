// 游戏导航栏通用功能 - 可在所有游戏页面共用

// 在页面加载完成后初始化导航栏
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
    setupMobileMenu();
});

// 初始化导航栏，加载用户信息
function initializeNavbar() {
    displayUserInfo();
}

// 显示用户信息
function displayUserInfo() {
    const currentPlayer = localStorage.getItem('current_player');
    const usernameDisplay = document.getElementById('username-display');
    const avatarDisplay = document.getElementById('avatar-display');
    const mobileUsername = document.getElementById('mobile-username');
    const mobileAvatar = document.getElementById('mobile-avatar');
    
    if (currentPlayer) {
        // 获取用户完整信息
        const users = getUsers();
        const currentUser = users.find(user => user.username === currentPlayer);
        
        if (currentUser) {
            // 更新桌面版用户信息
            if (usernameDisplay) usernameDisplay.textContent = currentUser.username;
            if (mobileUsername) mobileUsername.textContent = currentUser.username;
            
            // 更新头像（如果有）
            if (currentUser.avatar) {
                if (avatarDisplay) {
                    avatarDisplay.src = currentUser.avatar;
                    avatarDisplay.alt = `${currentUser.username}'s avatar`;
                }
                if (mobileAvatar) {
                    mobileAvatar.src = currentUser.avatar;
                    mobileAvatar.alt = `${currentUser.username}'s avatar`;
                }
            }
            
            console.log("User info loaded:", currentUser.username);
        } else {
            if (usernameDisplay) usernameDisplay.textContent = "Guest";
            if (mobileUsername) mobileUsername.textContent = "Guest";
            console.log("User not found in localStorage");
        }
    } else {
        if (usernameDisplay) usernameDisplay.textContent = "Guest";
        if (mobileUsername) mobileUsername.textContent = "Guest";
        console.log("No current player found");
    }
}

// 设置移动端菜单交互
function setupMobileMenu() {
    const menuIcon = document.querySelector('.mobile-menu-icon');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuIcon && mobileMenu) {
        menuIcon.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            
            // 切换菜单图标样式（可选，创建X形状）
            const spans = this.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
            
            if (mobileMenu.classList.contains('active')) {
                // 菜单打开时，阻止背景滚动
                document.body.style.overflow = 'hidden';
            } else {
                // 菜单关闭时，恢复背景滚动
                document.body.style.overflow = '';
            }
        });
        
        // 点击菜单外区域关闭菜单
        document.addEventListener('click', function(event) {
            if (mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(event.target) && 
                !menuIcon.contains(event.target)) {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                
                // 恢复菜单图标
                const spans = menuIcon.querySelectorAll('span');
                spans.forEach(span => span.classList.remove('active'));
            }
        });
    }
}

// 获取所有用户
function getUsers() {
    const usersString = localStorage.getItem('minesweeper_users');
    return usersString ? JSON.parse(usersString) : [];
}