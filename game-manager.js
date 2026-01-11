// Game Manager for Chatizo

class GameManager {
    constructor() {
        this.activeGames = new Map();
        this.availableGames = [
            {
                id: 'math',
                name: 'Math Challenge',
                icon: 'fas fa-calculator',
                description: 'Test your math skills with quick calculations',
                minPlayers: 1,
                maxPlayers: 4,
                color: '#ff6b6b'
            },
            {
                id: 'trivia',
                name: 'Quick Trivia',
                icon: 'fas fa-brain',
                description: 'Answer fun trivia questions',
                minPlayers: 2,
                maxPlayers: 4,
                color: '#4ecdc4'
            },
            {
                id: 'flirt',
                name: 'Romantic Quiz',
                icon: 'fas fa-heart',
                description: 'Romantic and flirty questions game',
                minPlayers: 2,
                maxPlayers: 2,
                color: '#ff9ff3'
            },
            {
                id: 'truth',
                name: 'Truth or Dare',
                icon: 'fas fa-question-circle',
                description: 'Classic truth or dare game',
                minPlayers: 2,
                maxPlayers: 6,
                color: '#54a0ff'
            },
            {
                id: 'word',
                name: 'Word Chain',
                icon: 'fas fa-language',
                description: 'Create chains of words',
                minPlayers: 2,
                maxPlayers: 4,
                color: '#5f27cd'
            }
        ];
    }
    
    // Create game room
    createGameRoom(gameId, creator) {
        const gameConfig = this.availableGames.find(g => g.id === gameId);
        if (!gameConfig) return null;
        
        const gameRoom = {
            id: `${gameId}_${Date.now()}`,
            gameId: gameId,
            name: gameConfig.name,
            creator: creator,
            players: [creator],
            status: 'waiting',
            createdAt: new Date(),
            maxPlayers: gameConfig.maxPlayers,
            settings: {
                genderBalance: true,
                private: false,
                difficulty: 'medium'
            }
        };
        
        // Add AI player if needed for gender balance
        this.ensureGenderBalance(gameRoom);
        
        this.activeGames.set(gameRoom.id, gameRoom);
        this.updateRoomDisplay();
        
        return gameRoom;
    }
    
    // Ensure gender balance in game rooms
    ensureGenderBalance(gameRoom) {
        if (!gameRoom.settings.genderBalance) return;
        
        const players = gameRoom.players;
        if (players.length === 1) {
            // For single player, add AI of opposite gender
            const aiGender = players[0].gender === 'male' ? 'female' : 'male';
            const aiPlayer = {
                id: 'ai_' + Date.now(),
                name: aiGender === 'female' ? 'Priya' : 'Rohan',
                gender: aiGender,
                isAI: true
            };
            gameRoom.players.push(aiPlayer);
        } else if (players.length === 2 && players[0].gender === players[1].gender) {
            // For same gender pair, add AI of opposite gender
            const oppositeGender = players[0].gender === 'male' ? 'female' : 'male';
            const aiPlayer = {
                id: 'ai_' + Date.now(),
                name: oppositeGender === 'female' ? 'Sneha' : 'Amit',
                gender: oppositeGender,
                isAI: true
            };
            gameRoom.players.push(aiPlayer);
        }
    }
    
    // Join game room
    joinGameRoom(roomId, player) {
        const gameRoom = this.activeGames.get(roomId);
        if (!gameRoom || gameRoom.status !== 'waiting') return false;
        
        if (gameRoom.players.length >= gameRoom.maxPlayers) return false;
        
        // Check if player already in room
        if (gameRoom.players.find(p => p.id === player.id)) return false;
        
        gameRoom.players.push(player);
        
        // Ensure gender balance
        this.ensureGenderBalance(gameRoom);
        
        // Start game if enough players
        if (gameRoom.players.length >= gameRoom.maxPlayers) {
            this.startGame(roomId);
        } else {
            this.broadcastRoomUpdate(roomId, `${player.name} joined the game!`);
        }
        
        this.updateRoomDisplay();
        return true;
    }
    
    // Start game
    startGame(roomId) {
        const gameRoom = this.activeGames.get(roomId);
        if (!gameRoom) return;
        
        gameRoom.status = 'active';
        gameRoom.startedAt = new Date();
        
        // Start the specific game
        this.initializeGame(gameRoom);
        
        this.broadcastRoomUpdate(roomId, `🎮 Game "${gameRoom.name}" has started! 🎮`);
        this.updateRoomDisplay();
    }
    
    // Initialize specific game
    initializeGame(gameRoom) {
        switch(gameRoom.gameId) {
            case 'math':
                // Math game is handled separately
                break;
            case 'flirt':
                this.startFlirtGame(gameRoom);
                break;
            case 'trivia':
                this.startTriviaGame(gameRoom);
                break;
            // Add other games here
        }
    }
    
    // Start flirt game
    startFlirtGame(gameRoom) {
        const questions = [
            "What's your idea of a perfect romantic date? 💕",
            "Kya aap love at first sight mein believe karte hain? ❤️",
            "What's the most romantic thing you've ever done? 🌹",
            "Tumhare hisaab se pyaar ki sabse badi nishani kya hai? 💖",
            "What makes you feel truly loved and appreciated? 😊",
            "Kya aapko lagta hai ki soulmates exist karte hain? ✨",
            "What's your favorite love song and why? 🎵",
            "Tumhari dream partner ki sabse important quality kya hai? 💫",
            "What's the sweetest thing someone has ever said to you? 🥰",
            "Kya aap long distance relationship mein vishwas rakhte hain? 💌"
        ];
        
        let currentQuestion = 0;
        
        // Send first question
        this.sendToRoom(gameRoom, `💖 Romantic Quiz Started! 💖\n\nQuestion 1: ${questions[currentQuestion]}`);
        
        // Set up question timer
        gameRoom.questionTimer = setInterval(() => {
            currentQuestion++;
            if (currentQuestion < questions.length) {
                this.sendToRoom(gameRoom, `Question ${currentQuestion + 1}: ${questions[currentQuestion]}`);
            } else {
                clearInterval(gameRoom.questionTimer);
                this.endGame(gameRoom.id);
            }
        }, 30000); // 30 seconds per question
    }
    
    // Start trivia game
    startTriviaGame(gameRoom) {
        const triviaQuestions = [
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                answer: 2
            },
            {
                question: "Kis planet ko 'Red Planet' kehte hain?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                answer: 1
            },
            {
                question: "Who painted the Mona Lisa?",
                options: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"],
                answer: 2
            },
            {
                question: "Computer ka father kis ko mana jata hai?",
                options: ["Bill Gates", "Steve Jobs", "Charles Babbage", "Alan Turing"],
                answer: 2
            }
        ];
        
        gameRoom.currentTrivia = 0;
        gameRoom.triviaScores = {};
        gameRoom.players.forEach(p => gameRoom.triviaScores[p.id] = 0);
        
        this.nextTriviaQuestion(gameRoom);
    }
    
    // Next trivia question
    nextTriviaQuestion(gameRoom) {
        if (gameRoom.currentTrivia >= triviaQuestions.length) {
            this.endGame(gameRoom.id);
            return;
        }
        
        const trivia = triviaQuestions[gameRoom.currentTrivia];
        let message = `🧠 Trivia Question ${gameRoom.currentTrivia + 1}/${triviaQuestions.length}:\n`;
        message += `${trivia.question}\n\n`;
        message += `Options:\n`;
        trivia.options.forEach((opt, idx) => {
            message += `${idx + 1}. ${opt}\n`;
        });
        message += `\nReply with !answer [number]`;
        
        this.sendToRoom(gameRoom, message);
        
        gameRoom.currentTrivia++;
        gameRoom.currentAnswer = trivia.answer;
        
        // Set timeout for answer
        gameRoom.triviaTimer = setTimeout(() => {
            this.revealTriviaAnswer(gameRoom, trivia);
        }, 30000);
    }
    
    // Reveal trivia answer
    revealTriviaAnswer(gameRoom, trivia) {
        this.sendToRoom(gameRoom, `⏰ Time's up!\nCorrect answer: ${trivia.options[trivia.answer]} (Option ${trivia.answer + 1})\n\nNext question coming up...`);
        
        setTimeout(() => {
            this.nextTriviaQuestion(gameRoom);
        }, 5000);
    }
    
    // End game
    endGame(roomId) {
        const gameRoom = this.activeGames.get(roomId);
        if (!gameRoom) return;
        
        gameRoom.status = 'completed';
        gameRoom.completedAt = new Date();
        
        // Determine winner
        let winner = gameRoom.players[0];
        if (gameRoom.triviaScores) {
            let highestScore = -1;
            gameRoom.players.forEach(player => {
                if (gameRoom.triviaScores[player.id] > highestScore) {
                    highestScore = gameRoom.triviaScores[player.id];
                    winner = player;
                }
            });
        }
        
        this.sendToRoom(gameRoom, `🏆 Game Over! 🏆\n\n🎖️ Winner: ${winner.name}!\n\nThanks for playing! 👏`);
        
        // Remove game after delay
        setTimeout(() => {
            this.activeGames.delete(roomId);
            this.updateRoomDisplay();
        }, 60000);
    }
    
    // Send message to room
    sendToRoom(gameRoom, message) {
        addMessage({
            sender: gameRoom.name,
            text: message,
            type: 'game',
            time: new Date()
        });
    }
    
    // Broadcast room update
    broadcastRoomUpdate(roomId, message) {
        const gameRoom = this.activeGames.get(roomId);
        if (gameRoom) {
            this.sendToRoom(gameRoom, message);
        }
    }
    
    // Update room display
    updateRoomDisplay() {
        const roomList = document.getElementById('roomList');
        roomList.innerHTML = '';
        
        this.activeGames.forEach((gameRoom, id) => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-item';
            roomElement.onclick = () => this.showRoomDetails(id);
            
            const playerCount = gameRoom.players.length;
            const maxPlayers = gameRoom.maxPlayers;
            const statusColor = gameRoom.status === 'waiting' ? '#00b894' : 
                               gameRoom.status === 'active' ? '#fdcb6e' : '#d63031';
            
            roomElement.innerHTML = `
                <div class="room-icon" style="background: ${this.getGameColor(gameRoom.gameId)}">
                    <i class="${this.getGameIcon(gameRoom.gameId)}"></i>
                </div>
                <div class="room-info">
                    <strong>${gameRoom.name}</strong>
                    <div class="room-details">
                        <span>👤 ${playerCount}/${maxPlayers}</span>
                        <span style="color: ${statusColor}">● ${gameRoom.status}</span>
                    </div>
                </div>
            `;
            
            roomList.appendChild(roomElement);
        });
    }
    
    // Get game color
    getGameColor(gameId) {
        const game = this.availableGames.find(g => g.id === gameId);
        return game ? game.color : '#636e72';
    }
    
    // Get game icon
    getGameIcon(gameId) {
        const game = this.availableGames.find(g => g.id === gameId);
        return game ? game.icon : 'fas fa-gamepad';
    }
    
    // Show room details
    showRoomDetails(roomId) {
        const gameRoom = this.activeGames.get(roomId);
        if (!gameRoom) return;
        
        let playersList = '';
        gameRoom.players.forEach(player => {
            playersList += `👤 ${player.name} (${player.gender}) ${player.isAI ? '(AI)' : ''}\n`;
        });
        
        const message = `🎮 ${gameRoom.name}\n\n` +
                       `Status: ${gameRoom.status}\n` +
                       `Players:\n${playersList}\n` +
                       `Created: ${gameRoom.createdAt.toLocaleTimeString()}\n\n` +
                       `Type !join ${roomId} to join this game`;
        
        addMessage({
            sender: 'Game Room',
            text: message,
            type: 'system',
            time: new Date()
        });
    }
}

// Global game manager instance
let gameManager = null;

// Initialize game manager
function initializeGameManager() {
    gameManager = new GameManager();
    
    // Create sample game rooms
    setTimeout(() => {
        if (currentUser) {
            gameManager.createGameRoom('flirt', currentUser);
            gameManager.createGameRoom('trivia', currentUser);
        }
    }, 5000);
}

// Join specific game
function joinSpecificGame(gameId) {
    if (!gameManager || !currentUser) return;
    
    const gameRoom = gameManager.createGameRoom(gameId, currentUser);
    if (gameRoom) {
        addMessage({
            sender: 'System',
            text: `Created ${gameRoom.name}! Waiting for players...`,
            type: 'system',
            time: new Date()
        });
    }
}

// Show game rooms
function showGameRooms() {
    gameManager.updateRoomDisplay();
    document.getElementById('gameModal').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('gameModal').classList.add('hidden');
}

// Create new game room
function createGameRoom() {
    const modal = document.getElementById('gameModal');
    const gameRoomsDiv = document.getElementById('gameRooms');
    
    gameRoomsDiv.innerHTML = '';
    
    gameManager.availableGames.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'game-room';
        gameElement.style.borderLeft = `5px solid ${game.color}`;
        gameElement.onclick = () => {
            joinSpecificGame(game.id);
            closeModal();
        };
        
        gameElement.innerHTML = `
            <h4><i class="${game.icon}"></i> ${game.name}</h4>
            <p>${game.description}</p>
            <div class="room-info">
                <span>👤 ${game.minPlayers}-${game.maxPlayers} players</span>
                <span>⭐ ${game.id === 'math' ? 'Quick Game' : 'Social Game'}</span>
            </div>
        `;
        
        gameRoomsDiv.appendChild(gameElement);
    });
}
