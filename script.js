// Main Chat Functionality for Chatizo

// Chat variables
let currentRoom = 'lobby';
let messages = [];
let onlineUsers = [];
let isTyping = false;
let typingTimeout = null;

// Initialize chat
function initializeChat() {
    // Add default online users (simulated)
    onlineUsers = [
        { id: 'user1', name: 'Rahul', gender: 'male', age: 25, isAI: false },
        { id: 'user2', name: 'Priya', gender: 'female', age: 22, isAI: true },
        { id: 'user3', name: 'Amit', gender: 'male', age: 28, isAI: false },
        { id: 'user4', name: 'Sneha', gender: 'female', age: 24, isAI: false },
        { id: 'user5', name: 'Karan', gender: 'male', age: 26, isAI: false }
    ];
    
    updateOnlineUsers();
    updateRoomList();
    
    // Add welcome message
    setTimeout(() => {
        addMessage({
            sender: 'System',
            text: 'Welcome to Chatizo! 💖\n\nYou can:\n• Type normally to chat\n• Use !join [room] to join rooms\n• Use !game to see available games\n• Type "romantic" for romantic messages\n• The AI will join if no one responds in 30-60 seconds',
            type: 'system',
            time: new Date()
        });
    }, 1000);
    
    // Set up message input
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', function() {
        if (!isTyping) {
            isTyping = true;
            // In a real app, you would send typing indicator to server
        }
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            isTyping = false;
        }, 1000);
    });
    
    // Initialize game manager
    initializeGameManager();
}

// Send message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Check for commands
    if (message.startsWith('!')) {
        handleCommand(message);
        input.value = '';
        return;
    }
    
    // Add user message
    addMessage({
        sender: currentUser.name,
        text: message,
        type: 'sent',
        time: new Date()
    });
    
    // Handle AI response
    if (aiCompanion) {
        aiCompanion.handleUserMessage(message);
    }
    
    // Simulate other users responding (in demo)
    simulateResponse(message);
    
    input.value = '';
    input.focus();
}

// Add message to chat
function addMessage(messageData) {
    const messagesDiv = document.getElementById('messages');
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${messageData.type} ${messageData.isAI ? 'ai' : ''}`;
    
    const timeString = messageData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
        <div class="sender">${messageData.sender}</div>
        <div class="text">${messageData.text}</div>
        <div class="time">${timeString}</div>
    `;
    
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Add to messages array
    messages.push(messageData);
}

// Handle commands
function handleCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Check if it's a game command first
    if (handleMathGameCommand(cmd, args)) {
        return;
    }
    
    switch(cmd) {
        case '!join':
            if (args.length > 0) {
                joinRoom(args[0]);
            }
            break;
            
        case '!room':
            createNewRoom();
            break;
            
        case '!game':
            showGameRooms();
            break;
            
        case '!users':
            showOnlineUsers();
            break;
            
        case '!clear':
            document.getElementById('messages').innerHTML = '';
            break;
            
        case '!help':
            addMessage({
                sender: 'System',
                text: 'Available commands:\n' +
                      '!join [room] - Join a room\n' +
                      '!room - Create new room\n' +
                      '!game - Show available games\n' +
                      '!users - Show online users\n' +
                      '!clear - Clear chat\n' +
                      '!help - Show this help',
                type: 'system',
                time: new Date()
            });
            break;
            
        case '!romantic':
            sendRomanticMessage();
            break;
            
        case '!flirt':
            sendFlirtMessage();
            break;
            
        default:
            addMessage({
                sender: 'System',
                text: `Unknown command: ${cmd}. Type !help for available commands.`,
                type: 'system',
                time: new Date()
            });
    }
}

// Join room
function joinRoom(roomName) {
    currentRoom = roomName.toLowerCase();
    document.getElementById('currentRoom').textContent = roomName;
    
    addMessage({
        sender: 'System',
        text: `You joined room: ${roomName}`,
        type: 'system',
        time: new Date()
    });
    
    // Simulate room users
    const roomUsers = Math.floor(Math.random() * 5) + 1;
    document.getElementById('roomStats').textContent = `${roomUsers} users`;
}

// Create new room
function createNewRoom() {
    const roomName = prompt('Enter room name:');
    if (roomName && roomName.trim()) {
        joinRoom(roomName.trim());
        
        // Add to room list
        updateRoomList();
    }
}

// Update online users display
function updateOnlineUsers() {
    const usersList = document.getElementById('onlineUsers');
    usersList.innerHTML = '';
    
    onlineUsers.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.onclick = () => startPrivateChat(user.id);
        
        const avatarClass = user.gender === 'female' ? 'female' : '';
        const aiBadge = user.isAI ? ' 🤖' : '';
        
        userElement.innerHTML = `
            <div class="user-avatar ${avatarClass}">
                ${user.gender === 'female' ? '👩' : '👨'}
            </div>
            <div class="user-details">
                <strong>${user.name}${aiBadge}</strong>
                <small>${user.age} years</small>
            </div>
        `;
        
        usersList.appendChild(userElement);
    });
}

// Update room list
function updateRoomList() {
    const roomList = document.getElementById('roomList');
    
    // Default rooms
    const defaultRooms = ['Lobby', 'Romantic', 'Friendship', 'Games', 'Hindi Chat', 'English Chat'];
    
    defaultRooms.forEach(room => {
        const roomElement = document.createElement('div');
        roomElement.className = 'room-item';
        roomElement.onclick = () => joinRoom(room);
        
        const userCount = Math.floor(Math.random() * 10) + 1;
        
        roomElement.innerHTML = `
            <div class="room-icon">
                <i class="fas fa-hashtag"></i>
            </div>
            <div class="room-info">
                <strong>${room}</strong>
                <div class="room-details">
                    <span>👤 ${userCount} online</span>
                </div>
            </div>
        `;
        
        roomList.appendChild(roomElement);
    });
}

// Simulate response from other users (for demo)
function simulateResponse(userMessage) {
    if (Math.random() > 0.7) { // 30% chance of response
        setTimeout(() => {
            const responses = [
                "That's interesting!",
                "Kya baat hai!",
                "Tell me more about that",
                "I agree with you",
                "Really? That's cool!",
                "Mujhe bhi aisa hi lagta hai",
                "Nice point!",
                "Can you explain more?"
            ];
            
            const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
            const response = responses[Math.floor(Math.random() * responses.length)];
            
            if (!randomUser.isAI) { // Don't simulate AI responses
                addMessage({
                    sender: randomUser.name,
                    text: response,
                    type: 'received',
                    time: new Date()
                });
            }
        }, 2000 + Math.random() * 3000);
    }
}

// Send romantic message
function sendRomanticMessage() {
    const romanticMessages = [
        "You have a beautiful soul 💖",
        "Tumhari aankhon mein kuch aisa hai jo dil chu jata hai 😊",
        "I feel so happy when I talk to you 🌹",
        "Tum mere liye khaas ho 💕",
        "Your smile could light up the whole room 😘",
        "Tumse baat karke mera din ban jata hai 🥰",
        "You're amazing just the way you are ✨",
        "Tumhari har baat dil ko chhu jati hai 💫"
    ];
    
    const message = romanticMessages[Math.floor(Math.random() * romanticMessages.length)];
    
    document.getElementById('messageInput').value = message;
    sendMessage();
}

// Send flirt message
function sendFlirtMessage() {
    const flirtMessages = [
        "Kya tumhe pata hai ki tum kitne cute ho? 😉",
        "Is someone this cute even allowed? 😊",
        "Tumhari muskurahat dekh kar mera dil kho jata hai 💖",
        "Are you a magician? Because whenever I look at you, everyone else disappears 🎩",
        "Tumhara naam Google par bhi hai kya? Kyunki tum sab kuch perfect ho 🔍",
        "Do you have a map? I keep getting lost in your eyes 🗺️",
        "Kya tum wifi signal ho? Kyunki main tumhe strongly feel kar raha hoon 📶",
        "Tum chocolate ho kya? Kyunki tum har cheez meethi kar dete ho 🍫"
    ];
    
    const message = flirtMessages[Math.floor(Math.random() * flirtMessages.length)];
    
    document.getElementById('messageInput').value = message;
    sendMessage();
}

// Send game invite
function sendGameInvite() {
    const games = ['Math Challenge', 'Romantic Quiz', 'Truth or Dare', 'Word Game'];
    const game = games[Math.floor(Math.random() * games.length)];
    
    const message = `🎮 Anyone want to play ${game}? Type !join${game.toLowerCase().replace(' ', '')} to play!`;
    
    document.getElementById('messageInput').value = message;
    sendMessage();
}

// Show emoji picker
function showEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    picker.classList.toggle('hidden');
}

// Insert emoji
function insertEmoji(emoji) {
    const input = document.getElementById('messageInput');
    input.value += emoji;
    input.focus();
    document.getElementById('emojiPicker').classList.add('hidden');
}

// Leave room
function leaveRoom() {
    if (currentRoom !== 'lobby') {
        addMessage({
            sender: 'System',
            text: `You left ${currentRoom}`,
            type: 'system',
            time: new Date()
        });
        
        currentRoom = 'lobby';
        document.getElementById('currentRoom').textContent = 'Lobby';
        document.getElementById('roomStats').textContent = '0 users';
    }
}

// Invite friend
function inviteFriend() {
    const friendName = prompt("Enter friend's name:");
    if (friendName) {
        addMessage({
            sender: 'System',
            text: `You invited ${friendName} to join ${currentRoom} room!`,
            type: 'system',
            time: new Date()
        });
    }
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    const icon = document.querySelector('.header-right .fa-moon');
    if (newTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Show online users
function showOnlineUsers() {
    let userList = '👥 Online Users:\n\n';
    onlineUsers.forEach(user => {
        userList += `• ${user.name} (${user.gender}, ${user.age}) ${user.isAI ? '🤖' : '👤'}\n`;
    });
    
    addMessage({
        sender: 'System',
        text: userList,
        type: 'system',
        time: new Date()
    });
}

// Start private chat
function startPrivateChat(userId) {
    const user = onlineUsers.find(u => u.id === userId);
    if (user) {
        const roomName = `private_${currentUser.id}_${userId}`;
        joinRoom(`Private with ${user.name}`);
    }
}

// View game stats
function viewGameStats() {
    addMessage({
        sender: 'Game Stats',
        text: `🎮 Your Game Statistics:\n\n` +
              `Games Played: ${Math.floor(Math.random() * 10)}\n` +
              `Wins: ${Math.floor(Math.random() * 8)}\n` +
              `Math Score: ${Math.floor(Math.random() * 1000)} points\n` +
              `Trivia Score: ${Math.floor(Math.random() * 500)} points\n` +
              `Romantic Quizzes: ${Math.floor(Math.random() * 5)}\n\n` +
              `Keep playing to improve your stats! 💪`,
        type: 'game',
        time: new Date()
    });
}

// Join trivia game
function joinTriviaGame() {
    joinSpecificGame('trivia');
}

// Join flirt game
function joinFlirtGame() {
    joinSpecificGame('flirt');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme
    const savedTheme = localStorage.getItem('chatizo_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Save theme on change
    document.documentElement.addEventListener('data-theme-changed', function() {
        const theme = document.documentElement.getAttribute('data-theme');
        localStorage.setItem('chatizo_theme', theme);
    });
});
