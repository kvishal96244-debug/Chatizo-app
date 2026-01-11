// Math Game for Chatizo

class MathGame {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = [];
        this.currentQuestion = null;
        this.scores = {};
        this.difficulty = 'easy';
        this.isActive = false;
        this.timeLimit = 30; // seconds
        this.timer = null;
        
        // Question database
        this.questions = {
            easy: [
                { question: "5 + 7 = ?", answer: 12, type: "addition" },
                { question: "15 - 8 = ?", answer: 7, type: "subtraction" },
                { question: "6 × 3 = ?", answer: 18, type: "multiplication" },
                { question: "24 ÷ 6 = ?", answer: 4, type: "division" },
                { question: "9 + 11 = ?", answer: 20, type: "addition" },
                { question: "30 - 14 = ?", answer: 16, type: "subtraction" },
                { question: "7 × 4 = ?", answer: 28, type: "multiplication" },
                { question: "36 ÷ 9 = ?", answer: 4, type: "division" },
                { question: "12 + 18 = ?", answer: 30, type: "addition" },
                { question: "25 - 13 = ?", answer: 12, type: "subtraction" }
            ],
            medium: [
                { question: "15 × 6 = ?", answer: 90, type: "multiplication" },
                { question: "72 ÷ 8 = ?", answer: 9, type: "division" },
                { question: "23 + 47 = ?", answer: 70, type: "addition" },
                { question: "85 - 29 = ?", answer: 56, type: "subtraction" },
                { question: "13 × 7 = ?", answer: 91, type: "multiplication" },
                { question: "121 ÷ 11 = ?", answer: 11, type: "division" },
                { question: "56 + 78 = ?", answer: 134, type: "addition" },
                { question: "150 - 67 = ?", answer: 83, type: "subtraction" },
                { question: "25 × 4 = ?", answer: 100, type: "multiplication" },
                { question: "144 ÷ 12 = ?", answer: 12, type: "division" }
            ],
            hard: [
                { question: "47 × 23 = ?", answer: 1081, type: "multiplication" },
                { question: "289 ÷ 17 = ?", answer: 17, type: "division" },
                { question: "156 + 278 = ?", answer: 434, type: "addition" },
                { question: "543 - 276 = ?", answer: 267, type: "subtraction" },
                { question: "34 × 45 = ?", answer: 1530, type: "multiplication" },
                { question: "576 ÷ 24 = ?", answer: 24, type: "division" },
                { question: "789 + 456 = ?", answer: 1245, type: "addition" },
                { question: "1000 - 567 = ?", answer: 433, type: "subtraction" },
                { question: "89 × 56 = ?", answer: 4984, type: "multiplication" },
                { question: "729 ÷ 27 = ?", answer: 27, type: "division" }
            ]
        };
    }
    
    // Add player to game
    addPlayer(player) {
        if (this.players.length >= 4) return false;
        
        this.players.push(player);
        this.scores[player.id] = 0;
        
        // Adjust game settings based on players
        this.adjustGameSettings();
        
        return true;
    }
    
    // Adjust game settings based on number of players
    adjustGameSettings() {
        if (this.players.length === 1) {
            this.difficulty = 'easy';
            this.timeLimit = 45;
        } else if (this.players.length === 2) {
            // For 2 players, ensure gender balance if possible
            const genders = this.players.map(p => p.gender);
            if (genders[0] === genders[1]) {
                // Try to add AI for balance
                this.addAIPlayer();
            }
            this.difficulty = 'medium';
            this.timeLimit = 35;
        } else {
            this.difficulty = 'hard';
            this.timeLimit = 25;
        }
    }
    
    // Add AI player for gender balance
    addAIPlayer() {
        const aiPlayer = {
            id: 'ai_' + Date.now(),
            name: this.players[0].gender === 'male' ? 'Priya' : 'Rohan',
            gender: this.players[0].gender === 'male' ? 'female' : 'male',
            isAI: true
        };
        
        this.players.push(aiPlayer);
        this.scores[aiPlayer.id] = 0;
    }
    
    // Start the game
    startGame() {
        if (this.players.length < 1) return false;
        
        this.isActive = true;
        this.currentRound = 1;
        this.totalRounds = 10;
        
        // Send game start message
        this.broadcastMessage(`🎮 Math Game Started! 🎮\nDifficulty: ${this.difficulty}\nPlayers: ${this.players.length}\nGet ready for the first question!`);
        
        // Start first question after delay
        setTimeout(() => {
            this.nextQuestion();
        }, 3000);
        
        return true;
    }
    
    // Get next question
    nextQuestion() {
        if (this.currentRound > this.totalRounds) {
            this.endGame();
            return;
        }
        
        const questions = this.questions[this.difficulty];
        this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        // Broadcast question
        this.broadcastMessage(`Question ${this.currentRound}/${this.totalRounds}\n${this.currentQuestion.question}\n⏱️ You have ${this.timeLimit} seconds!`);
        
        // Start timer
        this.startTimer();
        this.currentRound++;
    }
    
    // Start timer for current question
    startTimer() {
        let timeLeft = this.timeLimit;
        
        this.timer = setInterval(() => {
            timeLeft--;
            
            // Update time display every 5 seconds
            if (timeLeft === 15 || timeLeft === 10 || timeLeft <= 5) {
                this.broadcastMessage(`⏰ ${timeLeft} seconds remaining!`);
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.timer);
                this.revealAnswer();
                
                // Next question after delay
                setTimeout(() => {
                    this.nextQuestion();
                }, 3000);
            }
        }, 1000);
    }
    
    // Check answer
    checkAnswer(playerId, answer) {
        if (!this.isActive || !this.currentQuestion) return false;
        
        const isCorrect = parseInt(answer) === this.currentQuestion.answer;
        
        if (isCorrect) {
            // Calculate points based on response time
            const points = Math.floor(Math.random() * 50) + 50; // 50-100 points
            this.scores[playerId] += points;
            
            // Clear timer
            clearInterval(this.timer);
            
            // Find player name
            const player = this.players.find(p => p.id === playerId);
            this.broadcastMessage(`✅ ${player.name} answered correctly! +${points} points!`);
            
            // Next question after delay
            setTimeout(() => {
                this.nextQuestion();
            }, 3000);
        }
        
        return isCorrect;
    }
    
    // Reveal answer
    revealAnswer() {
        if (!this.currentQuestion) return;
        
        this.broadcastMessage(`The correct answer was: ${this.currentQuestion.answer}\n${this.getScoreboard()}`);
    }
    
    // Get current scoreboard
    getScoreboard() {
        let scoreboard = "📊 Current Scores:\n";
        
        // Sort players by score
        const sortedPlayers = [...this.players].sort((a, b) => this.scores[b.id] - this.scores[a.id]);
        
        sortedPlayers.forEach((player, index) => {
            scoreboard += `${index + 1}. ${player.name}: ${this.scores[player.id]} points\n`;
        });
        
        return scoreboard;
    }
    
    // End game
    endGame() {
        this.isActive = false;
        clearInterval(this.timer);
        
        // Determine winner
        const sortedPlayers = [...this.players].sort((a, b) => this.scores[b.id] - this.scores[a.id]);
        const winner = sortedPlayers[0];
        
        // Broadcast results
        let results = `🏆 Game Over! 🏆\n\n`;
        results += `🎖️ Winner: ${winner.name} with ${this.scores[winner.id]} points!\n\n`;
        results += this.getScoreboard();
        results += `\nThanks for playing! 👏`;
        
        this.broadcastMessage(results);
        
        // Update current game display
        document.getElementById('currentGame').innerHTML = `
            <strong>Math Challenge</strong><br>
            Winner: ${winner.name}<br>
            Score: ${this.scores[winner.id]} points
        `;
        
        // Reset after 10 seconds
        setTimeout(() => {
            document.getElementById('currentGame').innerHTML = 'None';
        }, 10000);
    }
    
    // Broadcast message to chat
    broadcastMessage(text) {
        addMessage({
            sender: 'Math Game',
            text: text,
            type: 'game',
            time: new Date()
        });
    }
}

// Game Manager
let activeMathGame = null;

// Join Math Game
function joinMathGame() {
    const roomId = 'math_' + Date.now();
    activeMathGame = new MathGame(roomId);
    
    // Add current user
    if (currentUser) {
        activeMathGame.addPlayer(currentUser);
    }
    
    // Start game
    if (activeMathGame.startGame()) {
        document.getElementById('currentGame').innerHTML = `
            <strong>Math Challenge</strong><br>
            Difficulty: ${activeMathGame.difficulty}<br>
            Players: ${activeMathGame.players.length}
        `;
        
        // Add join button for others
        addMessage({
            sender: 'System',
            text: `🎮 Math Game created! Others can join by typing "!joinmath"`,
            type: 'system',
            time: new Date()
        });
    }
}

// Handle math game command
function handleMathGameCommand(command, args) {
    if (!activeMathGame || !activeMathGame.isActive) return false;
    
    switch(command) {
        case '!joinmath':
            if (currentUser && activeMathGame.addPlayer(currentUser)) {
                addMessage({
                    sender: 'System',
                    text: `${currentUser.name} joined the math game!`,
                    type: 'system',
                    time: new Date()
                });
            }
            return true;
            
        case '!answer':
            if (args && args.length > 0) {
                const answer = args[0];
                const isCorrect = activeMathGame.checkAnswer(currentUser.id, answer);
                
                if (isCorrect) {
                    addMessage({
                        sender: currentUser.name,
                        text: `My answer: ${answer}`,
                        type: 'sent',
                        time: new Date()
                    });
                }
            }
            return true;
            
        case '!scores':
            addMessage({
                sender: 'Math Game',
                text: activeMathGame.getScoreboard(),
                type: 'game',
                time: new Date()
            });
            return true;
    }
    
    return false;
                                                             }
