// Main Application Controller
class MathGameApp {
    constructor() {
        this.soundEnabled = true;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkFirstTimeUser();
        this.setupRewards();
        this.setupLogout();
    }
    
    setupEventListeners() {
        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('click', () => {
            this.toggleSound();
        });
        
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            if (window.authManager) {
                window.authManager.logout();
            }
        });
        
        // Reward claim buttons
        document.querySelectorAll('.claim-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.claimReward(e.target.dataset.reward);
            });
        });
        
        // Check for achievements periodically
        setInterval(() => {
            this.checkAchievements();
        }, 30000);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('sound-toggle');
        
        if (this.soundEnabled) {
            soundBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            window.showNotification("Sound enabled", "success");
        } else {
            soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            window.showNotification("Sound disabled", "info");
        }
    }
    
    checkFirstTimeUser() {
        const user = JSON.parse(localStorage.getItem('mathGameUser'));
        const firstTime = !localStorage.getItem('hasVisitedBefore');
        
        if (firstTime && user) {
            localStorage.setItem('hasVisitedBefore', 'true');
            
            // Show welcome notification
            setTimeout(() => {
                window.showNotification(
                    `Welcome to Math Masti, ${user.username}! 🎉 Start playing games and chat with AI friend!`,
                    'success'
                );
                
                // Show tutorial tip
                setTimeout(() => {
                    window.showNotification(
                        "💡 Tip: Try saying 'hello' to AI or click Quick Math to start playing!",
                        'info',
                        8000
                    );
                }, 2000);
            }, 1000);
        }
    }
    
    setupRewards() {
        // Check and update reward buttons
        this.updateRewardButtons();
    }
    
    updateRewardButtons() {
        document.querySelectorAll('.claim-btn').forEach(btn => {
            const rewardId = btn.dataset.reward;
            const isClaimed = window.storageManager ? 
                window.storageManager.isRewardClaimed(rewardId) : false;
            
            if (isClaimed) {
                btn.textContent = 'Claimed';
                btn.disabled = true;
                btn.style.background = '#6c757d';
            }
        });
    }
    
    claimReward(rewardId) {
        if (!window.storageManager) return;
        
        if (window.storageManager.isRewardClaimed(rewardId)) {
            window.showNotification("Reward already claimed!", "error");
            return;
        }
        
        const user = JSON.parse(localStorage.getItem('mathGameUser'));
        if (!user) return;
        
        let rewardAmount = 0;
        let rewardMessage = "";
        
        switch(rewardId) {
            case '5games':
                if (user.stats.gamesPlayed >= 5) {
                    rewardAmount = 50;
                    rewardMessage = "5 games played reward!";
                    window.storageManager.claimReward(rewardId);
                } else {
                    window.showNotification(`Play ${5 - user.stats.gamesPlayed} more games to claim this reward`, "warning");
                    return;
                }
                break;
                
            case '100points':
                if (user.points >= 100) {
                    rewardAmount = 100;
                    rewardMessage = "100 points milestone reward!";
                    window.storageManager.claimReward(rewardId);
                } else {
                    window.showNotification(`Need ${100 - user.points} more points to claim this reward`, "warning");
                    return;
                }
                break;
                
            case '3streak':
                if (user.streak >= 3) {
                    rewardAmount = 75;
                    rewardMessage = "3-day streak reward!";
                    window.storageManager.claimReward(rewardId);
                } else {
                    window.showNotification(`Maintain streak for ${3 - user.streak} more days to claim this reward`, "warning");
                    return;
                }
                break;
        }
        
        if (rewardAmount > 0) {
            // Add coins to user
            user.coins += rewardAmount;
            localStorage.setItem('mathGameUser', JSON.stringify(user));
            
            // Update UI
            window.authManager.updateUI();
            this.updateRewardButtons();
            
            // Show notification
            window.showNotification(
                `🎁 ${rewardMessage} ${rewardAmount} coins added to your account!`,
                'success'
            );
            
            // Play reward sound
            if (this.soundEnabled) {
                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
                audio.volume = 0.4;
                audio.play();
            }
        }
    }
    
    checkAchievements() {
        const user = JSON.parse(localStorage.getItem('mathGameUser'));
        if (!user) return;
        
        const achievements = [];
        
        // Check for various achievements
        if (user.stats.gamesPlayed >= 10 && !user.achieved10Games) {
            achievements.push({
                title: "Game Enthusiast 🎮",
                message: "Played 10 games! You're getting hooked!",
                type: "games"
            });
            user.achieved10Games = true;
        }
        
        if (user.points >= 500 && !user.achieved500Points) {
            achievements.push({
                title: "Math Master 🧠",
                message: "Scored 500 points! You're a math wizard!",
                type: "points"
            });
            user.achieved500Points = true;
        }
        
        if (user.streak >= 7 && !user.achieved7DayStreak) {
            achievements.push({
                title: "Consistency King/Queen 👑",
                message: "7-day streak! You're unstoppable!",
                type: "streak"
            });
            user.achieved7DayStreak = true;
        }
        
        if (user.stats.correctAnswers >= 100 && !user.achieved100Correct) {
            achievements.push({
                title: "Perfect Score 🎯",
                message: "100 correct answers! Amazing accuracy!",
                type: "accuracy"
            });
            user.achieved100Correct = true;
        }
        
        // Save user achievements
        localStorage.setItem('mathGameUser', JSON.stringify(user));
        
        // Show achievements
        achievements.forEach(achievement => {
            window.notificationSystem.showAchievement(
                achievement.title,
                achievement.message
            );
            
            // Also send congratulatory message from AI
            if (window.aiBot) {
                setTimeout(() => {
                    window.aiBot.addMessageToChat(
                        `Congratulations ${user.username}! ${achievement.message} 🎉`,
                        'ai'
                    );
                }, 1000);
            }
        });
    }
    
    setupLogout() {
        // Already handled in auth.js
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MathGameApp();
    window.app = app;
    
    // Add CSS for typing indicator
    const style = document.createElement('style');
    style.textContent = `
        .typing {
            display: inline-flex;
            align-items: center;
            height: 20px;
        }
        
        .typing span {
            height: 8px;
            width: 8px;
            margin: 0 1px;
            background-color: #6c757d;
            border-radius: 50%;
            display: inline-block;
            opacity: 0.4;
        }
        
        .typing span:nth-child(1) {
            animation: typing 1s infinite;
        }
        
        .typing span:nth-child(2) {
            animation: typing 1s infinite 0.2s;
        }
        
        .typing span:nth-child(3) {
            animation: typing 1s infinite 0.4s;
        }
        
        @keyframes typing {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});

// Export data function (for debugging)
window.exportData = () => {
    if (window.storageManager) {
        window.storageManager.exportData();
    }
};

// Import data function
window.importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        if (window.storageManager) {
            window.storageManager.importData(e);
        }
    };
    input.click();
};

// Clear all data function
window.clearAllData = () => {
    if (window.storageManager) {
        window.storageManager.clearAllData();
    }
};
