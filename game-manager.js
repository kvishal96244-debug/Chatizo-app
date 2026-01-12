class GameManager {
    constructor() {
        this.currentGame = null;
        this.gameActive = false;
        this.timer = null;
        this.timeLeft = 60;
        this.score = 0;
        this.currentQuestion = null;
        this.gameHistory = [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadGameHistory();
    }
    
    setupEventListeners() {
        // Game selection
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const gameType = btn.dataset.game;
                this.startGame(gameType);
            });
        });
        
        // Close game
        document.getElementById('close-game').addEventListener('click', () => {
            this.endGame();
        });
        
        // Game controls
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });
        
        document.getElementById('skip-btn').addEventListener('click', () => {
            this.skipQuestion();
        });
        
        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextQuestion();
        });
        
        // Difficulty change
        document.getElementById('difficulty').addEventListener('change', (e) => {
            if (this.gameActive) {
                this.updateDifficulty(e.target.value);
            }
        });
    }
    
    startGame(gameType) {
        this.currentGame = gameType;
        this.gameActive = true;
        this.score = 0;
        
        // Set time based on game type
        switch(gameType) {
            case 'quick-math':
                this.timeLeft = 60;
                break;
            case 'memory':
                this.timeLeft = 45;
                break;
            case 'speed':
                this.timeLeft = 90;
                break;
            default:
                this.timeLeft = 120;
        }
        
        // Update UI
        document.getElementById('active-game-area').classList.remove('hidden');
        document.querySelector('.games-container').classList.add('hidden');
        
        // Set game title
        const titles = {
            'quick-math': 'Quick Math',
            'puzzle': 'Math Puzzle',
            'memory': 'Memory Math',
            'speed': 'Speed Challenge'
        };
        
        document.getElementById('current-game-title').textContent = titles[gameType];
        document.getElementById('timer').textContent = this.timeLeft;
        document.getElementById('game-score').querySelector('span').textContent = this.score;
        
        // Start timer
        this.startTimer();
        
        // Generate first question
        this.generateQuestion();
        
        // Play sound
        this.playSound('click');
    }
    
    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            
            if (this.timeLeft <= 10) {
                document.getElementById('timer').style.color = '#ff416c';
            }
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    generateQuestion() {
        const difficulty = document.getElementById('difficulty').value;
        this.currentQuestion = this.createQuestion(difficulty);
        
        document.getElementById('game-question').innerHTML = `<h1>${this.currentQuestion.question}</h1>`;
        
        // Generate options
        const optionsContainer = document.getElementById('game-options');
        optionsContainer.innerHTML = '';
        
        this.currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.addEventListener('click', () => this.checkAnswer(option));
            optionsContainer.appendChild(button);
        });
        
        // Reset UI
        document.getElementById('feedback-text').textContent = '';
        document.getElementById('next-btn').classList.add('hidden');
        
        // Update hint availability
        this.updateHintButton();
    }
    
    createQuestion(difficulty) {
        let num1, num2, operation, answer;
        
        switch(difficulty) {
            case 'easy':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                break;
            case 'medium':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                break;
            case 'hard':
                num1 = Math.floor(Math.random() * 100) + 1;
                num2 = Math.floor(Math.random() * 100) + 1;
                break;
            case 'expert':
                num1 = Math.floor(Math.random() * 200) + 1;
                num2 = Math.floor(Math.random() * 200) + 1;
                break;
        }
        
        const operations = ['+', '-', '×', '÷'];
        const opIndex = Math.floor(Math.random() * operations.length);
        operation = operations[opIndex];
        
        switch(operation) {
            case '+':
                answer = num1 + num2;
                break;
            case '-':
                // Ensure positive result
                if (num1 < num2) [num1, num2] = [num2, num1];
                answer = num1 - num2;
                break;
            case '×':
                // For easier difficulties, use smaller numbers
                if (difficulty === 'easy') {
                    num1 = Math.floor(Math.random() * 10) + 1;
                    num2 = Math.floor(Math.random() * 10) + 1;
                }
                answer = num1 * num2;
                break;
            case '÷':
                // Ensure integer division
                num2 = Math.floor(Math.random() * 10) + 1;
                num1 = num2 * (Math.floor(Math.random() * 10) + 1);
                answer = num1 / num2;
                break;
        }
        
        // Generate wrong options
        const options = [answer];
        while (options.length < 4) {
            let wrongAnswer;
            const variance = Math.floor(Math.random() * 10) + 1;
            
            if (Math.random() > 0.5) {
                wrongAnswer = answer + variance;
            } else {
                wrongAnswer = Math.max(1, answer - variance);
            }
            
            if (!options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }
        }
        
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        
        return {
            question: `${num1} ${operation} ${num2} = ?`,
            answer: answer,
            options: options,
            difficulty: difficulty,
            operation: operation
        };
    }
    
    checkAnswer(selectedAnswer) {
        const isCorrect = parseFloat(selectedAnswer) === this.currentQuestion.answer;
        
        // Disable all buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            if (parseFloat(btn.textContent) === this.currentQuestion.answer) {
                btn.classList.add('correct');
            } else if (parseFloat(btn.textContent) === parseFloat(selectedAnswer) && !isCorrect) {
                btn.classList.add('wrong');
            }
        });
        
        // Update score
        if (isCorrect) {
            this.score += this.getPointsForDifficulty();
            this.playSound('correct');
            document.getElementById('feedback-text').textContent = this.getRandomCorrectMessage();
            document.getElementById('feedback-text').style.color = '#00b09b';
        } else {
            this.playSound('wrong');
            document.getElementById('feedback-text').textContent = this.getRandomWrongMessage();
            document.getElementById('feedback-text').style.color = '#ff416c';
        }
        
        // Update score display
        document.getElementById('game-score').querySelector('span').textContent = this.score;
        
        // Show next button
        document.getElementById('next-btn').classList.remove('hidden');
        
        // Save to history
        this.saveQuestionResult(isCorrect);
    }
    
    getPointsForDifficulty() {
        const difficulties = {
            'easy': 5,
            'medium': 10,
            'hard': 20,
            'expert': 40
        };
        return difficulties[this.currentQuestion.difficulty] || 10;
    }
    
    getRandomCorrectMessage() {
        const messages = [
            "Shabaash! Bilkul sahi! 🎉",
            "Waah! Tum to maths ke king/queen ho! 👑",
            "Excellent! Aise hi chalta raho! ✨",
            "Bohot badhiya! Tumhari samajh bohot tej hai! 💡",
            "Perfect answer! Tum to genius ho! 🧠"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    getRandomWrongMessage() {
        const messages = [
            "Koi baat nahi, try again! 😊",
            "Chhodo, agla sahi karenge! 💪",
            "Thoda soch ke batana! 🤔",
            "Almost there! Try once more! ✨",
            "Don't worry, even Einstein made mistakes! 😄"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    showHint() {
        if (!this.currentQuestion) return;
        
        const hintCost = 5;
        const user = JSON.parse(localStorage.getItem('mathGameUser'));
        
        if (user.coins < hintCost) {
            window.showNotification("Not enough coins for hint!", "error");
            return;
        }
        
        // Deduct coins
        user.coins -= hintCost;
        localStorage.setItem('mathGameUser', JSON.stringify(user));
        window.authManager.updateUI();
        
        // Show hint
        let hint = "";
        const answer = this.currentQuestion.answer;
        
        switch(this.currentQuestion.operation) {
            case '+':
                hint = `Hint: Try adding the numbers carefully. Answer is around ${answer}`;
                break;
            case '-':
                hint = `Hint: Subtract smaller from larger. Answer is around ${answer}`;
                break;
            case '×':
                hint = `Hint: Multiply step by step. Answer ends with ${answer % 10}`;
                break;
            case '÷':
                hint = `Hint: Divide completely. Answer is ${answer}`;
                break;
        }
        
        document.getElementById('feedback-text').textContent = hint;
        document.getElementById('feedback-text').style.color = '#ffa62e';
        
        // Disable hint button
        document.getElementById('hint-btn').disabled = true;
        
        window.showNotification(`Hint used! ${hintCost} coins deducted`, "info");
    }
    
    updateHintButton() {
        const user = JSON.parse(localStorage.getItem('mathGameUser'));
        const hintBtn = document.getElementById('hint-btn');
        
        if (user && user.coins >= 5) {
            hintBtn.disabled = false;
            hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Hint (5 coins)';
        } else {
            hintBtn.disabled = true;
            hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> No coins for hint';
        }
    }
    
    skipQuestion() {
        if (this.currentQuestion) {
            this.saveQuestionResult(false);
        }
        this.generateQuestion();
    }
    
    nextQuestion() {
        this.generateQuestion();
    }
    
    updateDifficulty(newDifficulty) {
        if (this.gameActive) {
            window.showNotification(`Difficulty changed to ${newDifficulty}`, "info");
        }
    }
    
    endGame() {
        clearInterval(this.timer);
        this.gameActive = false;
        
        // Save game results
        this.saveGameResult();
        
        // Update user stats
        if (window.authManager && window.authManager.currentUser) {
            window.authManager.updateStats(
                this.currentGame,
                this.score,
                60 - this.timeLeft,
                this.gameHistory.filter(q => q.correct).length
            );
        }
        
        // Show final score
        window.showNotification(
            `Game Over! Your score: ${this.score} points. You earned ${Math.floor(this.score / 10)} coins!`,
            "success"
        );
        
        // Reset UI
        document.getElementById('active-game-area').classList.add('hidden');
        document.querySelector('.games-container').classList.remove('hidden');
        
        // Play game over sound
        this.playSound('click');
    }
    
    saveQuestionResult(isCorrect) {
        this.gameHistory.push({
            question: this.currentQuestion.question,
            answer: this.currentQuestion.answer,
            userAnswer: document.querySelector('.option-btn.wrong') ? 
                       parseFloat(document.querySelector('.option-btn.wrong').textContent) : this.currentQuestion.answer,
            correct: isCorrect,
            timestamp: new Date().toISOString(),
            difficulty: this.currentQuestion.difficulty
        });
    }
    
    saveGameResult() {
        const gameResult = {
            gameType: this.currentGame,
            score: this.score,
            timeSpent: 60 - this.timeLeft,
            totalQuestions: this.gameHistory.length,
            correctAnswers: this.gameHistory.filter(q => q.correct).length,
            difficulty: document.getElementById('difficulty').value,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        let allResults = JSON.parse(localStorage.getItem('gameResults') || '[]');
        allResults.push(gameResult);
        
        // Keep only last 50 games
        if (allResults.length > 50) {
            allResults = allResults.slice(-50);
        }
        
        localStorage.setItem('gameResults', JSON.stringify(allResults));
        
        // Also save to storage manager
        if (window.storageManager) {
            window.storageManager.saveGameStats({
                gamesPlayed: 1,
                correctAnswers: gameResult.correctAnswers,
                timePlayed: gameResult.timeSpent,
                score: gameResult.score
            });
        }
    }
    
    loadGameHistory() {
        const savedResults = localStorage.getItem('gameResults');
        if (savedResults) {
            this.allGameHistory = JSON.parse(savedResults);
        } else {
            this.allGameHistory = [];
        }
    }
    
    playSound(type) {
        const audio = document.getElementById(`${type}-sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
    }
}

// Initialize game manager
const gameManager = new GameManager();
window.gameManager = gameManager;
