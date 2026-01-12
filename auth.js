class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.loadUser();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Gender selection
        document.querySelectorAll('.gender-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.gender-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                document.getElementById('gender').value = option.dataset.gender;
            });
        });
        
        // Form submission
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }
    
    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const gender = document.getElementById('gender').value;
        const age = document.getElementById('age').value || null;
        
        if (!username || !gender) {
            this.showNotification('Please enter your name and select gender', 'error');
            return;
        }
        
        this.currentUser = {
            id: this.generateUserId(),
            username,
            gender,
            age,
            joinedAt: new Date().toISOString(),
            coins: 100,
            points: 0,
            streak: 0,
            lastLogin: new Date().toISOString(),
            stats: {
                gamesPlayed: 0,
                correctAnswers: 0,
                totalTime: 0
            }
        };
        
        this.saveUser();
        this.showNotification(`Welcome ${username}! Let's play some math games!`, 'success');
        
        // Switch to main screen
        setTimeout(() => {
            document.getElementById('auth-screen').classList.remove('active');
            document.getElementById('main-screen').classList.add('active');
            this.updateUI();
        }, 1000);
    }
    
    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    saveUser() {
        localStorage.setItem('mathGameUser', JSON.stringify(this.currentUser));
        
        // Save to leaderboard
        this.updateLeaderboard();
    }
    
    loadUser() {
        const savedUser = localStorage.getItem('mathGameUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            document.getElementById('auth-screen').classList.remove('active');
            document.getElementById('main-screen').classList.add('active');
            this.updateUI();
        }
    }
    
    updateUI() {
        if (!this.currentUser) return;
        
        document.getElementById('current-username').textContent = this.currentUser.username;
        document.getElementById('current-gender').textContent = this.currentUser.gender === 'male' ? 'Male' : 
                                                              this.currentUser.gender === 'female' ? 'Female' : 'Other';
        
        document.getElementById('coins').textContent = this.currentUser.coins;
        document.getElementById('points').textContent = this.currentUser.points;
        document.getElementById('streak').textContent = this.currentUser.streak;
        
        // Update stats
        document.getElementById('today-games').textContent = this.currentUser.stats.gamesPlayed;
        document.getElementById('today-correct').textContent = this.currentUser.stats.correctAnswers;
        document.getElementById('today-time').textContent = Math.floor(this.currentUser.stats.totalTime / 60) + 'm';
    }
    
    updateLeaderboard() {
        let leaderboard = JSON.parse(localStorage.getItem('mathLeaderboard') || '[]');
        
        // Check if user already exists in leaderboard
        const existingUserIndex = leaderboard.findIndex(u => u.id === this.currentUser.id);
        
        if (existingUserIndex > -1) {
            leaderboard[existingUserIndex] = this.currentUser;
        } else {
            leaderboard.push(this.currentUser);
        }
        
        // Sort by points
        leaderboard.sort((a, b) => b.points - a.points);
        
        // Keep only top 10
        leaderboard = leaderboard.slice(0, 10);
        
        localStorage.setItem('mathLeaderboard', JSON.stringify(leaderboard));
        this.displayLeaderboard();
    }
    
    displayLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('mathLeaderboard') || '[]');
        const container = document.getElementById('leaderboard');
        container.innerHTML = '';
        
        leaderboard.forEach((user, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="rank">${index + 1}</span>
                <span class="name">${user.username}</span>
                <span class="score">${user.points} pts</span>
            `;
            container.appendChild(item);
        });
    }
    
    logout() {
        localStorage.removeItem('mathGameUser');
        this.currentUser = null;
        document.getElementById('main-screen').classList.remove('active');
        document.getElementById('auth-screen').classList.add('active');
        
        // Reset form
        document.getElementById('auth-form').reset();
        document.querySelectorAll('.gender-option').forEach(opt => {
            opt.classList.remove('selected');
        });
    }
    
    updateStats(gameType, score, timeSpent, correctAnswers) {
        if (!this.currentUser) return;
        
        this.currentUser.stats.gamesPlayed++;
        this.currentUser.stats.correctAnswers += correctAnswers;
        this.currentUser.stats.totalTime += timeSpent;
        
        // Update points and coins
        this.currentUser.points += score;
        this.currentUser.coins += Math.floor(score / 10);
        
        // Update streak
        const today = new Date().toDateString();
        const lastLogin = new Date(this.currentUser.lastLogin).toDateString();
        
        if (today === lastLogin) {
            this.currentUser.streak++;
        } else {
            this.currentUser.streak = 1;
        }
        
        this.currentUser.lastLogin = new Date().toISOString();
        
        this.saveUser();
        this.updateUI();
    }
    
    showNotification(message, type = 'info') {
        // This will be implemented in notifications.js
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Make it available globally
window.authManager = authManager;
