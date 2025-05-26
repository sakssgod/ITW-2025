//ITW 2024/25 - Grupo 36 - TP 25 - Oujie Wu 62228;  Ruben Pereira 58378; Viktoriia Ivanova 60882

// game-sounds.js
const SoundManager = {
    // 音效状态
    isMuted: false,
    volume: 0.7,
    
    // 初始化
    init: function() {
        // 加载保存的音效设置
        this.loadSettings();
        
        // 预加载所有音效
        this.preloadSounds();
        
        // 创建音效控制按钮
        this.createSoundToggle();
    },
    
    // 预加载所有音效
    preloadSounds: function() {
        const sounds = document.querySelectorAll('audio');
        sounds.forEach(sound => {
            sound.load();
            sound.volume = this.volume;
        });
    },
    
    // 创建音效控制按钮
    createSoundToggle: function() {
        const toggle = document.createElement('div');
        toggle.className = 'sound-toggle';
        toggle.innerHTML = this.isMuted ? '🔇' : '🔊';
        
        toggle.addEventListener('click', () => {
            this.toggleMute();
            toggle.innerHTML = this.isMuted ? '🔇' : '🔊';
        });
        
        document.body.appendChild(toggle);
    },
    
    // 播放指定音效
    play: function(soundId) {
        if (this.isMuted) return;
        
        const sound = document.getElementById(soundId);
        if (sound) {
            // 重置播放位置，允许快速连续播放
            sound.currentTime = 0;
            sound.volume = this.volume;
            sound.play().catch(e => console.log(`Error playing sound: ${e}`));
        }
    },
    
    // 切换静音
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        this.saveSettings();
    },
    
    // 设置音量
    setVolume: function(volume) {
        this.volume = volume;
        
        const sounds = document.querySelectorAll('audio');
        sounds.forEach(sound => {
            sound.volume = volume;
        });
        
        this.saveSettings();
    },
    
    // 保存设置
    saveSettings: function() {
        localStorage.setItem('minesweeper_sound_muted', this.isMuted);
        localStorage.setItem('minesweeper_sound_volume', this.volume);
    },
    
    // 加载设置
    loadSettings: function() {
        const muted = localStorage.getItem('minesweeper_sound_muted');
        const volume = localStorage.getItem('minesweeper_sound_volume');
        
        if (muted !== null) this.isMuted = (muted === 'true');
        if (volume !== null) this.volume = parseFloat(volume);
    }
};

// 确保在用户首次交互后启用音频（解决移动设备限制）
document.addEventListener('click', function enableAudio() {
    // 预加载所有音频
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        audio.load();
        // 尝试短暂播放来解锁音频
        audio.volume = 0;
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = SoundManager.volume;
        }).catch(e => console.log('Audio preload failed:', e));
    });
    
    // 只运行一次
    document.removeEventListener('click', enableAudio);
}, { once: true });

// 页面加载完成后初始化音效管理器
document.addEventListener('DOMContentLoaded', function() {
    SoundManager.init();
});