class MathGame {
    constructor() {
        this.gameTypes = {
            'quick-math': this.quickMathGame,
            'puzzle': this.puzzleGame,
            'memory': this.memoryGame,
            'speed': this.speedGame
        };
    }
    
    quickMathGame(difficulty) {
        // This is already implemented in game-manager.js
        return {
            type: 'quick-math',
            description: 'Fast calculations with time pressure',
            timeLimit: 60
        };
    }
    
    puzzleGame(difficulty) {
        const puzzles = [
            {
                question: "A number when divided by 3 leaves remainder 1, when divided by 4 leaves remainder 2. What is the smallest such number?",
                answer: "10",
                explanation: "10 ÷ 3 = 3 remainder 1, 10 ÷ 4 = 2 remainder 2",
                options: ["8", "10", "14", "16"],
                points: 25
            },
            {
                question: "If 2 cats catch 2 mice in 2 minutes, how many cats are needed to catch 100 mice in 100 minutes?",
                answer: "2",
                explanation: "2 cats catch 2 mice in 2 minutes, so 1 cat catches 1 mouse in 2 minutes. In 100 minutes, 1 cat catches 50 mice. So 2 cats catch 100 mice.",
                options: ["2", "4", "50", "100"],
                points: 30
            },
            {
                question: "What comes next: 1, 1, 2, 3, 5, 8, ?",
                answer: "13",
                explanation: "Fibonacci sequence: Each number is sum of previous two",
                options: ["11", "12", "13", "14"],
                points: 15
            },
            {
                question: "A bat and a ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost?",
                answer: "0.05",
                explanation: "Ball = x, Bat = x + 1, Total = 2x + 1 = 1.10, so x = 0.05",
                options: ["0.05", "0.10", "0.15", "1.00"],
                points: 20
            }
        ];
        
        return puzzles[Math.floor(Math.random() * puzzles.length)];
    }
    
    memoryGame(difficulty) {
        // Generate numbers to remember
        const length = difficulty === 'easy' ? 3 : 
                      difficulty === 'medium' ? 4 :
                      difficulty === 'hard' ? 5 : 6;
        
        let numbers = [];
        for (let i = 0; i < length; i++) {
            numbers.push(Math.floor(Math.random() * 20) + 1);
        }
        
        // Create operation
        const operations = ['+', '-'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let question = "";
        let answer = numbers[0];
        
        if (operation === '+') {
            question = numbers.join(' + ');
            answer = numbers.reduce((a, b) => a + b, 0);
        } else {
            question = numbers.join(' - ');
            answer = numbers.reduce((a, b) => a - b);
        }
        
        // Show question for limited time
        setTimeout(() => {
            document.getElementById('game-question').innerHTML = `
                <h1>What was the result?</h1>
                <p>You had: ${question}</p>
            `;
        }, 3000);
        
        return {
            question: `Memorize this: ${question} = ?`,
            answer: answer,
            options: this.generateOptions(answer, difficulty),
            type: 'memory',
            points: 20
        };
    }
    
    speedGame(difficulty) {
        // Generate multiple rapid-fire questions
        const questions = [];
        const count = difficulty === 'easy' ? 5 : 
                     difficulty === 'medium' ? 7 :
                     difficulty === 'hard' ? 10 : 15;
        
        for (let i = 0; i < count; i++) {
            const num1 = Math.floor(Math.random() * 50) + 1;
            const num2 = Math.floor(Math.random() * 50) + 1;
            const operation = ['+', '-', '×'][Math.floor(Math.random() * 3)];
            
            let answer;
            switch(operation) {
                case '+': answer = num1 + num2; break;
                case '-': answer = num1 - num2; break;
                case '×': answer = num1 * num2; break;
            }
            
            questions.push({
                question: `${num1} ${operation} ${num2} = ?`,
                answer: answer,
                options: this.generateOptions(answer, difficulty)
            });
        }
        
        return {
            type: 'speed',
            questions: questions,
            timePerQuestion: difficulty === 'easy' ? 10 : 
                           difficulty === 'medium' ? 8 :
                           difficulty === 'hard' ? 6 : 4,
            totalPoints: count * 10
        };
    }
    
    generateOptions(correctAnswer, difficulty) {
        const options = [correctAnswer];
        const variance = difficulty === 'easy' ? 5 : 
                        difficulty === 'medium' ? 10 :
                        difficulty === 'hard' ? 15 : 20;
        
        while (options.length < 4) {
            let wrongAnswer;
            const offset = Math.floor(Math.random() * variance) + 1;
            
            if (Math.random() > 0.5) {
                wrongAnswer = correctAnswer + offset;
            } else {
                wrongAnswer = Math.max(1, correctAnswer - offset);
            }
            
            // Make sure wrong answer is different from correct and other wrong answers
            if (!options.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
                options.push(wrongAnswer);
            }
        }
        
        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    }
    
    getGameInstructions(gameType) {
        const instructions = {
            'quick-math': 'Solve as many problems as you can in 60 seconds!',
            'puzzle': 'Solve the math puzzle. Think carefully!',
            'memory': 'Memorize the equation, then solve it after it disappears!',
            'speed': 'Answer questions quickly! Limited time per question.'
        };
        
        return instructions[gameType] || 'Solve the math problems!';
    }
}

// Initialize math game
const mathGame = new MathGame();
window.mathGame = mathGame;
