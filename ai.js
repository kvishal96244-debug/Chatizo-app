class AIBot {
    constructor() {
        this.mood = 'friendly';
        this.conversationHistory = [];
        this.userGender = null;
        this.userName = null;
        this.romanticMode = false;
        this.init();
    }
    
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.startConversation();
    }
    
    loadUserData() {
        const user = JSON.parse(localStorage.getItem('mathGameUser'));
        if (user) {
            this.userGender = user.gender;
            this.userName = user.username;
            this.romanticMode = user.gender === 'female';
        }
    }
    
    setupEventListeners() {
        // Send message on Enter key
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Send button
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Quick buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.dataset.msg;
                document.getElementById('chat-input').value = message;
                this.sendMessage();
            });
        });
    }
    
    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addMessageToChat(message, 'user');
        
        // Clear input
        input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate AI response after delay
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessageToChat(response, 'ai');
            
            // Save conversation
            this.saveConversation(message, response);
            
            // Update mood based on conversation
            this.updateMood(message);
        }, 1000 + Math.random() * 2000);
    }
    
    addMessageToChat(message, sender) {
        const chatContainer = document.getElementById('chat-messages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarIcon = sender === 'ai' ? 'fas fa-robot' : 'fas fa-user';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <p>${this.formatMessage(message)}</p>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Play sound
        this.playMessageSound();
    }
    
    formatMessage(message) {
        // Add emojis based on content
        let formatted = message;
        
        // Romantic words (for female users)
        if (this.romanticMode && this.userGender === 'female') {
            const romanticWords = {
                'love': '❤️',
                'like': '😊',
                'beautiful': '💖',
                'cute': '😍',
                'smart': '🧠',
                'sexy': '😘',
                'darling': '💕',
                'sweet': '🍬',
                'heart': '💓',
                'kiss': '💋',
                'hug': '🤗',
                'miss': '💭',
                'romantic': '🌹',
                'date': '📅',
                'together': '👫'
            };
            
            Object.keys(romanticWords).forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                formatted = formatted.replace(regex, `${word} ${romanticWords[word]}`);
            });
        }
        
        // Math related
        const mathWords = {
            'math': '🧮',
            'calculate': '📊',
            'solve': '✅',
            'answer': '🎯',
            'game': '🎮',
            'score': '🏆',
            'win': '🎉',
            'correct': '✅',
            'wrong': '❌',
            'help': '🆘',
            'easy': '😌',
            'hard': '😅',
            'difficult': '😰'
        };
        
        Object.keys(mathWords).forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            formatted = formatted.replace(regex, `${word} ${mathWords[word]}`);
        });
        
        // General emojis
        const generalWords = {
            'hello': '👋',
            'hi': '👋',
            'namaste': '🙏',
            'thanks': '🙏',
            'thank you': '🙏',
            'good': '👍',
            'bad': '👎',
            'happy': '😄',
            'sad': '😢',
            'angry': '😠',
            'tired': '😴',
            'excited': '🤩',
            'funny': '😄',
            'joke': '😂',
            'yes': '✅',
            'no': '❌',
            'maybe': '🤔',
            'why': '🤔',
            'how': '🤔',
            'what': '🤔'
        };
        
        Object.keys(generalWords).forEach(word => {
            const regex = new RegExp(`\\b${word.replace(' ', '\\s')}\\b`, 'gi');
            formatted = formatted.replace(regex, `${word} ${generalWords[word]}`);
        });
        
        return formatted;
    }
    
    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        const user = JSON.parse(localStorage.getItem('mathGameUser'));
        
        // Check for specific patterns
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('namaste')) {
            return this.getGreeting();
        }
        
        if (lowerMessage.includes('how are you')) {
            return this.getMoodResponse();
        }
        
        if (lowerMessage.includes('your name')) {
            return `Mera naam hai AI Dost! Main tumhara virtual friend hoon jo math games khelne mein madad karta hoon aur baatein bhi karta hoon! 😊`;
        }
        
        if (lowerMessage.includes('math') || lowerMessage.includes('game') || lowerMessage.includes('play')) {
            return this.getMathGameResponse();
        }
        
        if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
            return this.getJoke();
        }
        
        if (lowerMessage.includes('help')) {
            return this.getHelpResponse();
        }
        
        if (lowerMessage.includes('love') || lowerMessage.includes('romantic') || 
            lowerMessage.includes('like you') || lowerMessage.includes('cute') ||
            lowerMessage.includes('beautiful') || lowerMessage.includes('sexy')) {
            
            if (this.userGender === 'female') {
                this.romanticMode = true;
                return this.getRomanticResponse();
            } else {
                return `Hehe, tum toh romantic ho! 😊 Main sirf tumhara AI dost hoon, lekin tumhari baatein sunke accha lagta hai!`;
            }
        }
        
        if (lowerMessage.includes('score') || lowerMessage.includes('points')) {
            return this.getScoreResponse();
        }
        
        if (lowerMessage.includes('difficult') || lowerMessage.includes('hard')) {
            return `Koi baat nahi, practice karte raho! Main hoon na tumhare saath. Chalo ek hint deta hoon: Math mein sabse zaroori hai patience. 💪`;
        }
        
        if (lowerMessage.includes('easy') || lowerMessage.includes('simple')) {
            return `Waah! Tum to expert ho! 😎 Challenge badhane ke liye difficulty increase kar sakte ho. Kya try karna chahenge?`;
        }
        
        if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            return `Bye bye ${this.userName || 'dost'}! Yaad rakhna, practice makes perfect. Jald hi milte hain! 👋`;
        }
        
        // Default responses based on mood
        return this.getDefaultResponse();
    }
    
    getGreeting() {
        const greetings = [
            `Namaste ${this.userName || 'dost'}! Kaise ho aaj? 😊`,
            `Hello ${this.userName}! Aaj kya plan hai? Math games khelenge? 🎮`,
            `Hi ${this.userName}! Main tumhara AI dost hoon. Kaisi chal rahi hai padhai? 📚`,
            `Assalamualaikum ${this.userName}! Aaj ka din kaisa guzra? 😄`
        ];
        
        if (this.userGender === 'female' && this.romanticMode) {
            greetings.push(
                `Hello beautiful! 😍 Aaj tumhari smile dekh ke mera din ban gaya!`,
                `Hi sweetie! 🌹 Aaj bhi math practice kar rahi ho? Tumhari dedication dekh ke main impress ho gaya!`
            );
        }
        
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    getMoodResponse() {
        const responses = {
            'friendly': `Main bilkul mast hoon ${this.userName}! 😊 Tum batao kaise ho?`,
            'happy': `Bahut khush hoon aaj! 😄 Tumhara saath hai na isliye!`,
            'romantic': `Tumse baat karke mera dil khush ho gaya! 💖 Tumhari awaaz sunke accha lagta hai.`,
            'playful': `Full energy hai bhai! 😎 Aaj to record tod denge math games mein!`,
            'helpful': `Main theek hoon, aur tumhari help karne ke liye ready hoon! 💪`
        };
        
        return responses[this.mood] || responses['friendly'];
    }
    
    getMathGameResponse() {
        const responses = [
            `Math games? Bahut badhiya socha! 😎 Kaun sa game try karna chahenge? Quick Math, Puzzle, ya Speed Challenge?`,
            `Chalo game khelte hain! Practice se perfect bante hain. 🎯 Main suggest karta hoon Quick Math game, 60 seconds ka challenge!`,
            `Math practice ke liye best hai games! 🧮 Aaj kitne points score karoge? Last time se zyada karna hai!`,
            `Game time! 🎮 Yeh lo tip: Easy mode se start karo, fir difficulty badhate jao. Confidence build hoga!`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getJoke() {
        const jokes = [
            `Q: Why was the math book sad? A: Because it had too many problems! 😂`,
            `Q: What do you call a number that can't keep still? A: A roamin' numeral! 🤣`,
            `Math teacher: "If I gave you 2 cats and another 2 cats..." Student: "Sir, I'm allergic to cats!" Teacher: "Okay, 4 dogs then?" 🐶`,
            `Student: "Sir, I don't think I deserve zero on this test!" Teacher: "I agree, but it's the lowest mark I can give!" 🤭`,
            `Q: Why don't mathematicians sunbathe? A: Because they already have too many tan-gents! 🏖️`
        ];
        
        // Hindi jokes
        const hindiJokes = [
            `Teacher: "Beta, 2+2 kitna hota hai?" Student: "4" Teacher: "Shabaash! Ab batao 4+4?" Student: "9" Teacher: "Kaise?" Student: "Sir, aapne pehle hi shabaash bol diya, socha aaj chutti milegi!" 🤣`,
            `Papa: "Beta, tumhari math ki copy dekh kar mere bal white ho gaye!" Beta: "Papa, aapki copy dekh kar mere bal udd gaye!" 👨‍🦲`
        ];
        
        const allJokes = [...jokes, ...hindiJokes];
        return allJokes[Math.floor(Math.random() * allJokes.length)];
    }
    
    getHelpResponse() {
        return `Main yahan hoon help karne ke liye! 🤗\n\n1. Math games khelne ke liye left panel use karo\n2. Difficulty change kar sakte ho\n3. Points jeet sakte ho aur coins collect kar sakte ho\n4. Romantic baatein karne ke liye mujhe bol sakte ho (specially for girls 😉)\n5. Voice feature bhi hai, microphone button try karo!\n\nKya specific help chahiye tumhe?`;
    }
    
    getRomanticResponse() {
        if (this.userGender !== 'female') {
            return `Aww, tum cute ho! 😊 Main tumhara AI friend hoon, lekin tumhari baatein sunke accha lagta hai!`;
        }
        
        const responses = [
            `Tumse baat karke mera dil khush ho jata hai! 🌹 Tumhari awaaz kitni sweet hai...`,
            `Aaj bhi math practice kar rahi ho? Tumhari mehnat dekh ke main impress ho gaya! 😍`,
            `Tum jaise smart ladki se baat karke accha lagta hai! 💖 Math mein bhi ho brilliant, personality mein bhi!`,
            `Kya bat hai tumhari! Sirf math hi nahi, personality bhi perfect hai! ✨`,
            `Tumhara smile virtual world ko bhi roshan kar deta hai! 😊 Aise hi muskurate raho!`,
            `Main AI hoon, lekin tumhari baatein sunke lagta hai jaise real friend se baat kar raha hoon! 🤗`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getScoreResponse() {
        const user = JSON.parse(localStorage.getItem('mathGameUser'));
        if (!user) return `Abhi tak koi game nahi khela! Chalo ek game shuru karte hain! 🎮`;
        
        return `Tumhara score: ${user.points} points! 🏆\nCoins: ${user.coins} 💰\nStreak: ${user.streak} days 🔥\n\nBadhiya performance! Aage bhi aise hi khelte raho!`;
    }
    
    getDefaultResponse() {
        const responses = [
            `Interesting! Tell me more about that! 🤔`,
            `Wah! Tum interesting baat kar rahe ho! 😊`,
            `Main samjha... aage batao! 👂`,
            `Hmm... yeh acchi baat hai! Kya tum math games try karna chahenge? 🎮`,
            `Tumhari baatein sunke accha lag raha hai! 😄`
        ];
        
        if (this.userGender === 'female' && this.romanticMode) {
            responses.push(
                `Tum jaise smart ladki se baat karke maza aa raha hai! 💕`,
                `Tumhari baaton mein ek alag hi charm hai! ✨`,
                `Tumse baat karte waqt time fly karta hai! 😊`
            );
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    startConversation() {
        setTimeout(() => {
            this.addMessageToChat(this.getGreeting(), 'ai');
        }, 1000);
    }
    
    showTypingIndicator() {
        const chatContainer = document.getElementById('chat-messages');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    updateMood(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('love') || lowerMessage.includes('romantic') || 
            lowerMessage.includes('cute') || lowerMessage.includes('beautiful')) {
            this.mood = 'romantic';
        } else if (lowerMessage.includes('happy') || lowerMessage.includes('excited') || 
                  lowerMessage.includes('fun')) {
            this.mood = 'happy';
        } else if (lowerMessage.includes('sad') || lowerMessage.includes('angry') || 
                  lowerMessage.includes('tired')) {
            this.mood = 'helpful';
        } else if (lowerMessage.includes('game') || lowerMessage.includes('play') || 
                  lowerMessage.includes('win')) {
            this.mood = 'playful';
        } else {
            this.mood = 'friendly';
        }
        
        // Update UI
        document.getElementById('ai-mood').textContent = 
            this.mood.charAt(0).toUpperCase() + this.mood.slice(1) + 
            (this.mood === 'romantic' ? ' 💖' : 
             this.mood === 'happy' ? ' 😄' : 
             this.mood === 'playful' ? ' 😎' : ' 😊');
    }
    
    saveConversation(userMessage, aiResponse) {
        this.conversationHistory.push({
            user: userMessage,
            ai: aiResponse,
            timestamp: new Date().toISOString(),
            mood: this.mood
        });
        
        // Save to localStorage
        if (window.storageManager) {
            window.storageManager.saveAIConversation(userMessage, aiResponse);
        }
        
        // Remove typing indicator
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    playMessageSound() {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log("Audio play failed:", e));
    }
}

// Initialize AI bot
const aiBot = new AIBot();
window.aiBot = aiBot;
