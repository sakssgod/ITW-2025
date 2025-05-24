function getUsers() {
    const usersString = localStorage.getItem('minesweeper_users');
    return usersString ? JSON.parse(usersString) : [];
}

function saveUsers(users) {
    localStorage.setItem('minesweeper_users', JSON.stringify(users));
}

function showError(message) {
  
    const existingError = document.getElementById('error-container');
    if (existingError) {
        existingError.remove();
    }
    
   
    const container = document.createElement('div');
    container.id = 'error-container';
    container.className = 'message-container';
    
  
    const errorMsg = document.createElement('div');
    errorMsg.id = 'error-message';
    errorMsg.textContent = message;
    errorMsg.className = 'message-base error-message';
    

    container.appendChild(errorMsg);
    

    const inputGroup = document.querySelector('.input-group');
    if (inputGroup) {
        inputGroup.after(container);
    } else {
        document.body.appendChild(container);
    }
    
   
    setTimeout(() => {
        errorMsg.classList.add('message-fadeout');
        setTimeout(() => container.remove(), 300);
    }, 2700);
}

function showSuccess(message) {
  
    const existingMsg = document.getElementById('success-container');
    if (existingMsg) {
        existingMsg.remove();
    }
    
  
    const container = document.createElement('div');
    container.id = 'success-container';
    container.className = 'message-container';
    
 
    const successMsg = document.createElement('div');
    successMsg.id = 'success-message';
    successMsg.textContent = message;
    successMsg.className = 'message-base success-message';
    

    container.appendChild(successMsg);
    

    const inputGroup = document.querySelector('.input-group');
    if (inputGroup) {
        inputGroup.after(container);
    } else {
        document.body.appendChild(container);
    }
    

    setTimeout(() => {
        successMsg.classList.add('message-fadeout');
        setTimeout(() => container.remove(), 300);
    }, 1700);
}


function setupRegistration() {
    if (!document.getElementById('passwordc')) return;
    
    console.log("Registration setup initiated");
    
    const submitLink = document.querySelector('.button-link');
    if (submitLink) {
        console.log("Submit button found");
        
        submitLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Registration button clicked");
            
            // 获取所有表单数据
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const birthdate = document.getElementById('birthdate').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('passwordc').value;
            
            // 获取选中的头像
            const selectedAvatar = getSelectedAvatar();
            
            // 验证所有字段
            if (!username || !email || !birthdate || !password || !confirmPassword) {
                showError("Please fill in all fields");
                return;
            }
            
            if (!selectedAvatar) {
                showError("Please select an avatar");
                return;
            }
            
            if (password !== confirmPassword) {
                showError("Passwords don't match");
                return;
            }
            
            // 验证邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError("Please enter a valid email address");
                return;
            }
            
            // 验证出生日期（必须是过去的日期）
            const today = new Date();
            const birthDate = new Date(birthdate);
            if (birthDate >= today) {
                showError("Please enter a valid birth date");
                return;
            }
            
            try {
                const users = getUsers();
                console.log("Current users:", users);
                
                // 检查用户名是否已存在
                if (users.some(user => user.username === username)) {
                    showError("Username already exists");
                    return;
                }
                
                // 检查邮箱是否已存在
                if (users.some(user => user.email === email)) {
                    showError("Email already exists");
                    return;
                }
                
                // 创建新用户对象
                const newUser = {
                    username: username,
                    email: email,
                    birthdate: birthdate,
                    avatar: selectedAvatar,
                    password: password,
                    score: 0,
                    gamesPlayed: 0,
                    gamesWon: 0,
                    totalTime: 0,
                    registrationDate: new Date().toISOString()
                };
                
                users.push(newUser);
                saveUsers(users);
                console.log("User saved:", newUser);
                
                // 显示成功消息
                showSuccess("Account created successfully! Please login.");
                
                // 跳转到登录页面而不是直接登录
                setTimeout(() => {
                    window.location.href = '../html/login_page.html';
                }, 1500);
                
            } catch (error) {
                console.error("Error during registration:", error);
                showError("An error occurred. Please try again.");
            }
        });
    } else {
        console.error("Submit button not found");
    }
}


function setupLogin() {
    // 检查是否在登录页面（有密码字段但没有确认密码字段）
    if (!document.getElementById('password') || document.getElementById('passwordc')) return;
    
    console.log("Login setup initiated");
    
    // 使用 ID 选择器来精确定位 Log In 按钮
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Login button clicked");
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showError("Please enter both username and password");
                return;
            }
            
            try {
                const users = getUsers();
                console.log("Users for login:", users);
                const user = users.find(u => u.username === username && u.password === password);
                
                if (user) {
                    localStorage.setItem('current_player', username);
                    showSuccess("Login successful!");
                    
                    setTimeout(() => {
                        window.location.href = '../html/home_page2.html';
                    }, 1000);
                    
                } else {
                    showError("Invalid username or password");
                }
            } catch (error) {
                console.error("Error during login:", error);
                showError("An error occurred. Please try again.");
            }
        });
    } else {
        console.log("Login button not found - might be on a different page");
    }
    
    const forgotLink = document.getElementById('forget');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert("Password recovery not implemented yet!");
        });
    }
}


// function displayCurrentPlayer() {
//     const currentPlayer = localStorage.getItem('current_player');
    
//     if (currentPlayer && window.location.href.includes('home_page2.html')) {
//         console.log("Displaying current player:", currentPlayer);
        
        
//         const playerContainer = document.createElement('div');
//         playerContainer.className = 'player-container';
        
      
//         const playerInfo = document.createElement('div');
//         playerInfo.textContent = `Player: ${currentPlayer}`;
//         playerInfo.className = 'player-info';
//         playerContainer.appendChild(playerInfo);
        
        
//         const logoutBtn = document.createElement('button');
//         logoutBtn.textContent = 'Logout';
//         logoutBtn.className = 'button-link';  
//         playerContainer.appendChild(logoutBtn);
        
       
//         document.body.appendChild(playerContainer);
        
//         logoutBtn.addEventListener('click', function() {
//             window.location.href = '../html/home_page.html';
//         });
//     }
// }


function checkLocalStorage() {
    console.log("LocalStorage check:");
    console.log("Current player:", localStorage.getItem('current_player'));
    console.log("All users:", localStorage.getItem('minesweeper_users'));
}


document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    checkLocalStorage();
    setupRegistration();
    setupLogin();
    displayCurrentPlayer();
});