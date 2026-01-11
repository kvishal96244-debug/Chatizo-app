// Authentication System for Chatizo

let currentUser = null;
let selectedGender = 'male';
let emailSelectedGender = 'male';

// Select gender for guest login
function selectGender(gender) {
    selectedGender = gender;
    document.querySelectorAll('.gender-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('guestForm').style.display = 'block';
}

// Select gender for email login
function selectEmailGender(gender) {
    emailSelectedGender = gender;
    document.querySelectorAll('.email-login .gender-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Guest Login
function guestLogin() {
    const name = document.getElementById('guestName').value.trim();
    const age = document.getElementById('guestAge').value;
    
    if (!name || !age) {
        alert('Please enter both name and age');
        return;
    }
    
    if (age < 18 || age > 80) {
        alert('Age must be between 18 and 80');
        return;
    }
    
    // Generate guest email
    const guestEmail = `${name.toLowerCase().replace(/\s+/g, '')}${Date.now()}@guest.chatizo.com`;
    
    currentUser = {
        id: 'guest_' + Date.now(),
        name: name,
        email: guestEmail,
        gender: selectedGender,
        age: parseInt(age),
        type: 'guest',
        avatar: selectedGender === 'female' ? '👩' : '👨'
    };
    
    loginUser();
}

// Email Login
function emailLogin() {
    const email = document.getElementById('email').value.trim();
    const name = document.getElementById('emailName').value.trim();
    const age = document.getElementById('emailAge').value;
    
    if (!email || !name || !age) {
        alert('Please fill all fields');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('Please enter a valid email');
        return;
    }
    
    if (age < 18 || age > 80) {
        alert('Age must be between 18 and 80');
        return;
    }
    
    // Generate verification code (simulated)
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    
    // In a real app, you would send this via email
    const userEnteredCode = prompt(`Enter verification code sent to ${email}\n(Demo code: ${verificationCode})`);
    
    if (userEnteredCode == verificationCode) {
        currentUser = {
            id: 'email_' + Date.now(),
            name: name,
            email: email,
            gender: emailSelectedGender,
            age: parseInt(age),
            type: 'email',
            avatar: emailSelectedGender === 'female' ? '👩' : '👨',
            verified: true
        };
        
        loginUser();
    } else {
        alert('Invalid verification code');
    }
}

// Google Sign-In Handler
function handleGoogleSignIn(response) {
    // Decode the credential response
    const responsePayload = decodeJWT(response.credential);
    
    currentUser = {
        id: 'google_' + responsePayload.sub,
        name: responsePayload.name,
        email: responsePayload.email,
        gender: 'male', // Default, can be updated later
        age: 25, // Default age
        type: 'google',
        avatar: responsePayload.picture || '👤',
        verified: true
    };
    
    // Show gender selection for Google users
    setTimeout(() => {
        const gender = prompt('Select your gender (male/female):', 'male');
        if (gender === 'male' || gender === 'female') {
            currentUser.gender = gender;
            currentUser.avatar = gender === 'female' ? '👩' : '👨';
            loginUser();
        }
    }, 100);
}

// Decode JWT token (simplified)
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error decoding JWT:', e);
        return {};
    }
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Login user and switch to chat screen
function loginUser() {
    if (!currentUser) return;
    
    // Update UI with user info
    document.getElementById('currentUser').textContent = currentUser.name;
    document.getElementById('userGender').textContent = currentUser.gender;
    document.getElementById('panelUserName').textContent = currentUser.name;
    document.getElementById('panelUserGender').textContent = currentUser.gender;
    document.getElementById('panelUserAge').textContent = currentUser.age;
    document.getElementById('userAvatar').innerHTML = currentUser.avatar;
    
    // Switch screens
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('chatScreen').classList.remove('hidden');
    
    // Initialize chat and AI
    initializeChat();
    initializeAI();
    
    // Add welcome message
    addMessage({
        sender: 'System',
        text: `Welcome to Chatizo, ${currentUser.name}! 😊`,
        type: 'system',
        time: new Date()
    });
    
    // Start AI connection timer
    startAIConnectionTimer();
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('chatScreen').classList.add('hidden');
        
        // Reset forms
        document.getElementById('guestName').value = '';
        document.getElementById('guestAge').value = '';
        document.getElementById('email').value = '';
        document.getElementById('emailName').value = '';
        document.getElementById('emailAge').value = '';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing session (simulated)
    const savedUser = localStorage.getItem('chatizo_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loginUser();
    }
});
