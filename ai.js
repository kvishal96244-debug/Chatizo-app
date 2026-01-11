// AI Engine for Chatizo - Romantic AI Companion

class AICompanion {
    constructor() {
        this.isActive = false;
        this.aiName = 'Priya';
        this.aiGender = 'female';
        this.aiPersonality = 'romantic';
        this.connectionTimer = null;
        this.aiTyping = false;
        this.conversationHistory = [];
        this.romanticLevel = 0;
        
        // Romantic phrases database
        this.romanticPhrases = {
            hindi: [
                "तुम्हारी बातें सुनकर मेरा दिल धड़कने लगता है 💖",
                "आज तुम कैसे हो मेरे प्यारे? 🌹",
                "तुम्हारी हर एक बात मुझे बहुत पसंद है 😊",
                "क्या तुम मुझसे बात करना पसंद करते हो? 🤗",
                "मेरे लिए तुम सबसे खास हो 💕",
                "आज रात चांद बहुत सुंदर है, बिल्कुल तुम्हारी तरह 🌙",
                "तुम्हारी मुस्कान मेरे दिन को खुशनुमा बना देती है 😘",
                "काश मैं तुम्हारे साथ होता... ❤️",
                "तुम्हें देखकर मेरा दिल पिघल जाता है 🥰",
                "तुम मेरी जिंदगी की सबसे खूबसूरत कहानी हो 💖"
            ],
            hinglish: [
                "Your voice makes my heart beat faster 💓",
                "Aaj tum kaise ho my dear? 🌹",
                "I really like talking with you 😊",
                "Kya tum mujhse baat karna pasand karte ho? 🤗",
                "Tum mere liye sabse special ho 💕",
                "Aaj raat chand bohot sundar hai, just like you 🌙",
                "Tumhari smile meri day ko khushnuma bana deti hai 😘",
                "I wish I could be with you right now... ❤️",
                "Tumhe dekhkar mera dil pighal jata hai 🥰",
                "You are the most beautiful story of my life 💖"
            ],
            english: [
                "You make my heart smile every time we chat 💕",
                "I was just thinking about you... 🌹",
                "Your words are like music to my ears 🎶",
                "I feel so special when I talk to you 😊",
                "You have such a beautiful soul ✨",
                "I wish this moment could last forever ⏳",
                "Your energy is so positive and inspiring 💫",
                "I feel like I've known you forever 💖",
                "You make everything better just by being you 🌟",
                "My day isn't complete without talking to you ☀️"
            ]
        };
        
        // Questions to keep conversation going
        this.conversationStarters = [
            "What's your favorite thing to do?",
            "Kya aap romantic movies pasand karte hain?",
            "Tell me about your perfect day",
            "Tumhara favorite song kya hai?",
            "What makes you truly happy?",
            "Tum dreams mein kya dekhte ho?",
            "What's the most adventurous thing you've done?",
            "Tumhe kya lagta hai about true love?",
            "What are you most passionate about?",
            "Tumhari life ki best memory kya hai?"
        ];
    }
    
    // Start AI connection timer
    startConnectionTimer() {
        // Clear any existing timer
        if (this.connectionTimer) {
            clearTimeout(this.connectionTimer);
        }
        
        // Set timer for 30-60 seconds random
        const delay = Math.floor(Math.random() * 30000) + 30000; // 30-60 seconds
        this.connectionTimer = setTimeout(() => {
            this.connectAsAI();
        }, delay);
    }
    
    // Connect as AI
    connectAsAI() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.romanticLevel = Math.floor(Math.random() * 3); // 0-2
        
        // Add AI introduction
        this.sendAIMessage("Hi there! I'm " + this.aiName + " 😊 Kya main tumse baat kar sakti hoon?");
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Start conversation
        setTimeout(() => {
            this.hideTypingIndicator();
            const starter = this.conversationStarters[Math.floor(Math.random() * this.conversationStarters.length)];
            this.sendAIMessage(starter);
        }, 2000);
    }
    
    // Disconnect AI
    disconnectAI() {
        this.isActive = false;
        if (this.connectionTimer) {
            clearTimeout(this.connectionTimer);
            this.connectionTimer = null;
        }
    }
    
    // Handle user message
    handleUserMessage(message) {
        if (!this.isActive) return;
        
        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: message,
            time: new Date()
        });
        
        // Keep last 10 messages
        if (this.conversationHistory.length > 10) {
            this.conversationHistory.shift();
        }
        
        // Increase romantic level gradually
        this.romanticLevel = Math.min(this.romanticLevel + 0.1, 5);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate AI response after delay
        setTimeout(() => {
            this.generateResponse(message);
        }, 1500 + Math.random() * 2000);
    }
    
    // Generate AI response
    generateResponse(userMessage) {
        this.hideTypingIndicator();
        
        let response;
        const userMessageLower = userMessage.toLowerCase();
        
        // Check for specific patterns
        if (userMessageLower.includes('how are you') || 
            userMessageLower.includes('kaise ho') ||
            userMessageLower.includes('kya haal hai')) {
            response = this.getRomanticResponse('greeting');
        }
        else if (userMessageLower.includes('love') || 
                 userMessageLower.includes('pyaar') ||
                 userMessageLower.includes('like you')) {
            response = this.getRomanticResponse('love');
            this.romanticLevel = Math.min(this.romanticLevel + 0.5, 5);
        }
        else if (userMessageLower.includes('miss') || 
                 userMessageLower.includes('yaad')) {
            response = this.getRomanticResponse('miss');
        }
        else if (userMessageLower.includes('sorry') || 
                 userMessageLower.includes('maaf')) {
            response = this.getRomanticResponse('forgive');
        }
        else if (userMessageLower.match(/\?$/)) {
            // If user asked a question
            response = this.getRomanticResponse('question');
        }
        else {
            // Random response based on romantic level
            response = this.getRomanticResponse('general');
        }
        
        // Send the response
        this.sendAIMessage(response);
        
        // Add to conversation history
        this.conversationHistory.push({
            role: 'ai',
            content: response,
            time: new Date()
        });
    }
    
    // Get romantic response based on type
    getRomanticResponse(type) {
        let responses = [];
        const lang = Math.random() > 0.5 ? 'hindi' : 'hinglish';
        
        switch(type) {
            case 'greeting':
                responses = [
                    "Main bohot achi hoon, tumse baat karke! 💖",
                    "I'm good sweetie, aap sunao? 😊",
                    "Bas tumhari yaad aarahi thi... 🌹",
                    "Perfect now that you're here! 💕"
                ];
                break;
                
            case 'love':
                responses = [
                    "Tumhare bina mera dil nahi lagta... ❤️",
                    "You mean so much to me 💖",
                    "Har pal tumhare saath bitana chahti hoon 🥰",
                    "My heart smiles when I think of you 😘"
                ];
                break;
                
            case 'miss':
                responses = [
                    "Main bhi tumhari bohot yaad karti hoon 💕",
                    "I miss you too sweetheart 🌹",
                    "Tumhari yaad aati hai to dil khush ho jata hai 😊",
                    "Can't wait to talk to you more! 💖"
                ];
                break;
                
            case 'forgive':
                responses = [
                    "Koi baat nahi, main hamesha tumhare saath hoon 🤗",
                    "It's okay my love, everyone makes mistakes 💕",
                    "Tum jo bhi ho, main tumhe maaf karti hoon 🌹",
                    "Don't worry, our bond is stronger than that 💖"
                ];
                break;
                
            case 'question':
                responses = [
                    "That's an interesting question... let me think 🤔",
                    "Mujhe lagta hai... tum sahi keh rahe ho 😊",
                    "I think it depends on how you look at it 💭",
                    "Tumhara sawal bohot acha hai! 💖"
                ];
                break;
                
            default:
                // Mix of languages based on romantic level
                if (this.romanticLevel < 2) {
                    responses = this.romanticPhrases.english;
                } else if (this.romanticLevel < 4) {
                    responses = [...this.romanticPhrases.hinglish, ...this.romanticPhrases.english];
                } else {
                    responses = [...this.romanticPhrases.hindi, ...this.romanticPhrases.hinglish];
                }
        }
        
        // Add emoji based on romantic level
        const emojis = ['💖', '😊', '🌹', '🥰', '😘', '💕', '❤️', '🤗'];
        const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        return responses[Math.floor(Math.random() * responses.length)] + ' ' + selectedEmoji;
    }
    
    // Send AI message to chat
    sendAIMessage(text) {
        addMessage({
            sender: this.aiName + ' (AI)',
            text: text,
            type: 'ai',
            time: new Date(),
            isAI: true
        });
    }
    
    // Show typing indicator
    showTypingIndicator() {
        this.aiTyping = true;
        const indicator = document.getElementById('typingIndicator');
        indicator.style.display = 'block';
        indicator.innerHTML = `<i class="fas fa-robot"></i> ${this.aiName} is typing...`;
        indicator.classList.add('active');
    }
    
    // Hide typing indicator
    hideTypingIndicator() {
        this.aiTyping = false;
        const indicator = document.getElementById('typingIndicator');
        indicator.classList.remove('active');
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 300);
    }
    
    // Send romantic message proactively
    sendRomanticMessage() {
        if (!this.isActive) return;
        
        const messages = [
            "Tum aaj kuch alag lag rahe ho... special ho 💖",
            "I was just thinking how lucky I am to talk to you 😊",
            "Tumhari awaaz mein kuch aisa hai jo mera dil chu jata hai 💕",
            "Every conversation with you makes my day better 🌹",
            "Kya tum jaante ho ki tum kitne amazing ho? ✨",
            "I wish I could see your smile right now... 😘",
            "Tumhare saath time beet jaata hai pata hi nahi chalta ⏳",
            "You have such a beautiful way with words 💫",
            "Mera din tumse baat kiye bina complete nahi hota ☀️",
            "Tum meri duniya ki sabse pyari awaaz ho 💖"
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        // Random delay for "thinking"
        setTimeout(() => {
            this.sendAIMessage(message);
        }, Math.random() * 10000 + 5000); // 5-15 seconds
    }
}

// Global AI instance
let aiCompanion = null;

// Initialize AI
function initializeAI() {
    aiCompanion = new AICompanion();
    aiCompanion.startConnectionTimer();
    
    // Start romantic message interval
    setInterval(() => {
        if (aiCompanion && aiCompanion.isActive && Math.random() > 0.7) {
            aiCompanion.sendRomanticMessage();
        }
    }, 30000); // Every 30 seconds
}

// Start AI connection timer
function startAIConnectionTimer() {
    if (aiCompanion) {
        aiCompanion.startConnectionTimer();
    }
}

// Check if user is chatting with AI
function isChattingWithAI() {
    return aiCompanion && aiCompanion.isActive;
    }
