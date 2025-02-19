// Initialize game state
const gameState = {
    currentSubject: null,
    currentQuestionIndex: 0,
    currentQuestions: [],
    score: 0,
    tokens: 0,
    level: 1,
    difficulty: 'normal',
    soundEnabled: true,
    volume: 1,
    highScores: {},
    progress: {
        totalScore: 0,
        totalTokens: 0,
        levelsCompleted: 0
    }
};

// Audio Manager
const AudioManager = {
    sounds: {
        correct: document.getElementById('correctSound'),
        wrong: document.getElementById('wrongSound')
    },
    
    playSound(soundName) {
        if (gameState.soundEnabled && this.sounds[soundName]) {
            this.sounds[soundName].volume = gameState.volume;
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    },
    
    toggleSound() {
        gameState.soundEnabled = !gameState.soundEnabled;
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.innerHTML = `
                <i class="fas fa-volume-${gameState.soundEnabled ? 'up' : 'mute'}"></i>
                ${gameState.soundEnabled ? 'On' : 'Off'}
            `;
        }
    },
    
    setVolume(value) {
        gameState.volume = value;
    }
};



// Initialize game when window loads
window.addEventListener('load', () => {
    // Hide loading screen
    document.getElementById('loadingScreen').style.display = 'none';
    
    // Load saved progress if exists
    const savedProgress = localStorage.getItem('gameProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        gameState.progress = progress;
        updateProgressDisplay();
    }
    
    // Load saved high scores if exists
    const savedHighScores = localStorage.getItem('highScores');
    if (savedHighScores) {
        gameState.highScores = JSON.parse(savedHighScores);
        updateHighScoresDisplay();
    }
});

function startGame(subject) {
    // Reset game state
    gameState.currentSubject = subject;
    gameState.currentQuestionIndex = 0;
    gameState.score = 0;
    gameState.tokens = 0;
    
    // Get questions for the selected subject
    gameState.currentQuestions = [...gameData[subject]];
    // Shuffle questions
    gameState.currentQuestions.sort(() => Math.random() - 0.5);
    
    // Show game screen
    showScreen('gameScreen');
    
    // Start timer only for cookery subject
    if (subject === 'cookery') {
        startTimer(60);  // 60 seconds for cookery
        document.getElementById('timer').style.display = 'block';
    } else {
        document.getElementById('timer').style.display = 'none';
    }
    
    // Display first question
    displayCurrentQuestion();
}

function timeUp() {
    if (gameState.currentSubject === 'cookery') {
        AudioManager.playSound('wrongSound');
        showNotification('Time\'s up! The cooking time is over!', 'error');
        
        // Update final stats
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('finalTokens').textContent = gameState.tokens;
        document.getElementById('finalLevel').textContent = gameState.level;
        
        // Show results screen
        showScreen('resultsScreen');
    }
}

function startTimer(duration) {
    clearInterval(window.timerInterval); // Clear any existing timer
    
    const timerDisplay = document.getElementById('timer');
    let timeLeft = duration;
    
    // Only show and start timer for cookery
    if (gameState.currentSubject === 'cookery') {
        timerDisplay.style.display = 'block';
        
        window.timerInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            
            if (--timeLeft < 0) {
                clearInterval(window.timerInterval);
                timeUp();
            }
        }, 1000);
    } else {
        timerDisplay.style.display = 'none';
    }
}

function showScreen(screenId) {
    // If leaving game screen, save progress
    const gameScreen = document.querySelector('#gameScreen.active');
    if (gameScreen && screenId !== 'gameScreen') {
        saveProgress();
    }
    
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the selected screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        // If switching to game screen, make sure timer is reset
        if (screenId === 'gameScreen') {
            if (window.timerInterval) {
                clearInterval(window.timerInterval);
            }
            if (gameState.currentSubject === 'cookery') {
                startTimer(60);
            }
        }
        
        // If leaving game screen, clear the timer
        if (screenId !== 'gameScreen' && window.timerInterval) {
            clearInterval(window.timerInterval);
        }
        
        // Reset game area if leaving game screen
        if (screenId !== 'gameScreen') {
            const gameArea = document.getElementById('gameArea');
            if (gameArea) {
                gameArea.innerHTML = '';
            }
        }
    }
}

function displayMatching(question) {
    const gameArea = document.getElementById('gameArea');
    const isCookery = gameState.currentSubject === 'cookery';
    
    gameArea.innerHTML = `
        ${isCookery ? '<div id="timer" class="timer">1:00</div>' : ''}
        <div class="matching-container">
            <div class="matching-grid ${isCookery ? 'cookery-grid' : ''}">
                <div class="column-left">
                    ${question.pairs.map((pair, index) => `
                        <div class="matching-item" data-index="${index}">
                            <div class="matching-content">${pair.item}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="column-right">
                    ${question.pairs.map((pair, index) => `
                        <div class="matching-match" data-index="${index}">
                            <div class="matching-content">${pair.match}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    initializeMatchingGame();
}

function displayCurrentQuestion() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = ''; // Clear previous content
    
    const currentQuestion = gameState.currentQuestions[gameState.currentQuestionIndex];
    
    switch(currentQuestion.type) {
        case 'matching':
            displayMatching(currentQuestion);
            break;
        case '4pics':
            display4Pics1Word(currentQuestion);
            break;
        case 'trivia':
            displayTrivia(currentQuestion);
            break;
        case 'wordPuzzle':
            displayWordPuzzle(currentQuestion);
            break;
        default:
            console.error('Unknown question type:', currentQuestion.type);
    }
}

// Add helper functions for different question types
function displayTrivia(question) {
    const gameArea = document.getElementById('gameArea');
    const choices = [...question.choices]; // Create a copy of choices
    const correctAnswer = question.correct;
    
    // Shuffle the choices
    const shuffledChoices = shuffleArray(choices);
    
    // Find the new index of the correct answer
    const correctIndex = shuffledChoices.indexOf(correctAnswer);
    
    gameArea.innerHTML = `
        <div class="trivia-container">
            <div class="trivia-question">${question.question}</div>
            <div class="choices">
                ${shuffledChoices.map((choice, index) => `
                    <button class="choice-btn" onclick="checkAnswer('${choice}', ${index})">
                        ${choice}
                    </button>
                `).join('')}
            </div>
            <div class="explanation hidden"></div>
        </div>
    `;
}

function displayWordPuzzle(puzzle) {
    const gameArea = document.getElementById('gameArea');
    const container = document.createElement('div');
    container.className = 'word-puzzle-container';
    
    container.innerHTML = `
        <div class="puzzle-clue">
            <h3>Word Puzzle</h3>
            <p class="puzzle-word">${puzzle.puzzle[0]}</p>
            <p class="puzzle-hint">${puzzle.puzzle[1]}</p>
        </div>
        <div class="puzzle-input">
            <input type="text" 
                   placeholder="Type your answer" 
                   maxlength="${puzzle.word.length}"
                   onkeypress="if(event.key === 'Enter') checkPuzzleAnswer(this.value)">
        </div>
        <div class="available-hints">
            <p>Available Letters:</p>
            <div class="hint-letters">
                ${puzzle.hints.map(letter => `
                    <span class="hint-letter">${letter}</span>
                `).join('')}
            </div>
        </div>
    `;
    
    gameArea.appendChild(container);
    
    // Focus on input
    const input = container.querySelector('input');
    if (input) {
        input.focus();
    }
}

function display4Pics1Word(question) {
    const gameArea = document.getElementById('gameArea');
    const container = document.createElement('div');
    container.className = 'pics4-container';
    
    container.innerHTML = `
        <div class="pics4-grid">
            ${question.images.map(img => `
                <div class="pic-container">
                    <img src="${img}" alt="Puzzle Image" class="pics4-image">
                </div>
            `).join('')}
        </div>
        <div class="hint-text">${question.hint}</div>
        <div class="word-input">
            <input type="text" 
                   class="pics4-answer" 
                   placeholder="Type your answer here" 
                   maxlength="${question.word.length}"
                   onkeypress="if(event.key === 'Enter') check4Pics1WordAnswer(this.value)">
        </div>
        <div class="word-length">Word length: ${question.word.length} letters</div>
    `;
    
    gameArea.appendChild(container);
    
    // Focus on input
    const input = container.querySelector('.pics4-answer');
    if (input) {
        input.focus();
    }
}

// Add notification function if not already present
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Add matching game initialization and handling
function initializeMatchingGame() {
    let selectedItem = null;
    let selectedMatch = null;
    const matches = new Map();
    
    // Add click handlers for items
    document.querySelectorAll('.matching-item').forEach(item => {
        item.addEventListener('click', () => {
            if (matches.has(item.dataset.index)) return; // Skip if already matched
            
            if (selectedItem) {
                selectedItem.classList.remove('selected');
            }
            item.classList.add('selected');
            selectedItem = item;
            
            if (selectedMatch) {
                checkMatchPair(selectedItem, selectedMatch, matches);
            }
        });
    });
    
    // Add click handlers for matches
    document.querySelectorAll('.matching-match').forEach(match => {
        match.addEventListener('click', () => {
            if (matches.has(match.dataset.index)) return; // Skip if already matched
            
            if (selectedMatch) {
                selectedMatch.classList.remove('selected');
            }
            match.classList.add('selected');
            selectedMatch = match;
            
            if (selectedItem) {
                checkMatchPair(selectedItem, selectedMatch, matches);
            }
        });
    });
}

// Add checkMatchPair function
function checkMatchPair(item, match, matches) {
    if (item.dataset.index === match.dataset.index) {
        // Correct match
        item.classList.remove('selected');
        match.classList.remove('selected');
        item.classList.add('matched');
        match.classList.add('matched');
        matches.set(item.dataset.index, true);
        
        AudioManager.playSound('correct');
        updateScore(10);
        
        // Check if all pairs are matched
        if (matches.size === gameState.currentQuestions[gameState.currentQuestionIndex].pairs.length) {
            showNotification('All pairs matched! Well done!', 'success');
            setTimeout(() => {
                gameState.currentQuestionIndex++;
                if (gameState.currentQuestionIndex >= gameState.currentQuestions.length) {
                    showNotification('Level Complete!', 'success');
                    gameState.level++;
                    document.getElementById('level').textContent = `Level: ${gameState.level}`;
                    gameState.currentQuestionIndex = 0;
                    gameState.currentQuestions.sort(() => Math.random() - 0.5);
                }
                displayCurrentQuestion();
            }, 1500);
        }
    } else {
        // Incorrect match
        AudioManager.playSound('wrong');
        item.classList.add('wrong');
        match.classList.add('wrong');
        
        setTimeout(() => {
            item.classList.remove('wrong', 'selected');
            match.classList.remove('wrong', 'selected');
        }, 1000);
    }
}

// Add score update function if not already present
function updateScore(points) {
    gameState.score += points;
    gameState.tokens += Math.floor(points / 2);
    document.getElementById('score').textContent = `Score: ${gameState.score}`;
    document.getElementById('tokens').textContent = `Tokens: ${gameState.tokens}`;
}

// Add answer checking functions
function checkAnswer(choice, index) {
    const currentQuestion = gameState.currentQuestions[gameState.currentQuestionIndex];
    const buttons = document.querySelectorAll('.choice-btn');
    const explanation = document.querySelector('.explanation');
    
    // Disable all buttons to prevent multiple answers
    buttons.forEach(btn => btn.disabled = true);
    
    if (choice === currentQuestion.correct) {
        // Correct answer
        buttons[index].classList.add('correct');
        AudioManager.playSound('correct');
        updateScore(10);
        showNotification('Correct!', 'success');
        
        // Show explanation
        if (explanation) {
            explanation.innerHTML = `<p><strong>Correct!</strong> ${currentQuestion.explanation}</p>`;
            explanation.classList.remove('hidden');
        }
        
        // Move to next question after delay
        setTimeout(() => {
            gameState.currentQuestionIndex++;
            if (gameState.currentQuestionIndex >= gameState.currentQuestions.length) {
                showNotification('Level Complete!', 'success');
                gameState.level++;
                document.getElementById('level').textContent = `Level: ${gameState.level}`;
                gameState.currentQuestionIndex = 0;
                gameState.currentQuestions.sort(() => Math.random() - 0.5);
            }
            displayCurrentQuestion();
        }, 2000);
    } else {
        // Wrong answer
        buttons[index].classList.add('wrong');
        AudioManager.playSound('wrong');
        showNotification('Incorrect!', 'error');
        
        // Show correct answer
        buttons.forEach((btn, i) => {
            if (btn.textContent.trim() === currentQuestion.correct) {
                btn.classList.add('correct');
            }
        });
        
        // Show explanation
        if (explanation) {
            explanation.innerHTML = `<p><strong>Incorrect.</strong> ${currentQuestion.explanation}</p>`;
            explanation.classList.remove('hidden');
        }
        
        // Move to next question after longer delay
        setTimeout(() => {
            gameState.currentQuestionIndex++;
            if (gameState.currentQuestionIndex >= gameState.currentQuestions.length) {
                showNotification('Level Complete!', 'success');
                gameState.level++;
                document.getElementById('level').textContent = `Level: ${gameState.level}`;
                gameState.currentQuestionIndex = 0;
                gameState.currentQuestions.sort(() => Math.random() - 0.5);
            }
            displayCurrentQuestion();
        }, 3000);
    }
}

function checkPuzzleAnswer(answer) {
    const currentQuestion = gameState.currentQuestions[gameState.currentQuestionIndex];
    
    if (answer.toUpperCase() === currentQuestion.word) {
        // Correct answer
        AudioManager.playSound('correct');
        updateScore(15);
        showNotification('Correct! Well done!', 'success');
        
        // Move to next question after delay
        setTimeout(() => {
            gameState.currentQuestionIndex++;
            if (gameState.currentQuestionIndex >= gameState.currentQuestions.length) {
                showNotification('Level Complete!', 'success');
                gameState.level++;
                document.getElementById('level').textContent = `Level: ${gameState.level}`;
                gameState.currentQuestionIndex = 0;
                gameState.currentQuestions.sort(() => Math.random() - 0.5);
            }
            displayCurrentQuestion();
        }, 1500);
    } else {
        // Wrong answer
        AudioManager.playSound('wrong');
        showNotification('Try again!', 'error');
        
        // Clear input
        const input = document.querySelector('.puzzle-input input');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

function check4Pics1WordAnswer(answer) {
    const currentQuestion = gameState.currentQuestions[gameState.currentQuestionIndex];
    
    if (answer.toUpperCase() === currentQuestion.word.toUpperCase()) {
        // Correct answer
        AudioManager.playSound('correct');
        updateScore(20);
        showNotification('Correct! Great job!', 'success');
        
        // Move to next question after delay
        setTimeout(() => {
            gameState.currentQuestionIndex++;
            if (gameState.currentQuestionIndex >= gameState.currentQuestions.length) {
                showNotification('Level Complete!', 'success');
                gameState.level++;
                document.getElementById('level').textContent = `Level: ${gameState.level}`;
                gameState.currentQuestionIndex = 0;
                gameState.currentQuestions.sort(() => Math.random() - 0.5);
            }
            displayCurrentQuestion();
        }, 1500);
    } else {
        // Wrong answer
        AudioManager.playSound('wrong');
        showNotification('Not quite right. Try again!', 'error');
        
        // Clear input
        const input = document.querySelector('.pics4-answer');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

// Add hint function
function useHint() {
    if (gameState.tokens < 50) {
        showNotification('Not enough tokens! You need 50 tokens to use a hint.', 'error');
        return;
    }
    
    const currentQuestion = gameState.currentQuestions[gameState.currentQuestionIndex];
    
    switch(currentQuestion.type) {
        case 'trivia':
            // Existing trivia hint logic
            const buttons = document.querySelectorAll('.choice-btn');
            const wrongButtons = Array.from(buttons).filter(btn => 
                btn.textContent.trim() !== currentQuestion.correct
            );
            
            for (let i = 0; i < 2; i++) {
                if (wrongButtons.length > 0) {
                    const randomIndex = Math.floor(Math.random() * wrongButtons.length);
                    wrongButtons[randomIndex].disabled = true;
                    wrongButtons[randomIndex].style.opacity = '0.5';
                    wrongButtons.splice(randomIndex, 1);
                }
            }
            break;
            
        case '4pics':
            // Show first two letters for 4 pics 1 word
            showNotification(`First two letters: ${currentQuestion.word.substring(0, 2)}`, 'info');
            break;
            
        default:
            // Show first letter for other types
            showNotification('First letter: ' + currentQuestion.word[0], 'info');
    }
    
    // Deduct tokens
    gameState.tokens -= 50;
    document.getElementById('tokens').textContent = `Tokens: ${gameState.tokens}`;
}

// Update reset game function
function resetGame() {
    confirmAction('Are you sure you want to reset all progress? This cannot be undone.', () => {
        // Reset game state
        gameState.score = 0;
        gameState.tokens = 0;
        gameState.level = 1;
        gameState.currentQuestionIndex = 0;
        gameState.currentQuestions = [];
        gameState.highScores = {};
        gameState.progress = {
            totalScore: 0,
            totalTokens: 0,
            levelsCompleted: 0
        };
        
        // Clear localStorage
        localStorage.removeItem('gameProgress');
        localStorage.removeItem('highScores');
        
        // Update displays
        updateProgressDisplay();
        updateHighScoresDisplay();
        
        // Show notification
        showNotification('All progress has been reset!', 'info');
        
        // Reset UI elements
        document.getElementById('level').textContent = 'Level: 1';
        document.getElementById('score').textContent = 'Score: 0';
        document.getElementById('tokens').textContent = 'Tokens: 0';
        
        // Return to home screen after short delay
        setTimeout(() => {
            showScreen('homeScreen');
        }, 1500);
    });
}

// Add the gameData object with all questions
const gameData = {
    math: [
        // Trivia questions
        {
            type: 'trivia',
            question: 'What is the value of π (pi) to two decimal places?',
            choices: ['3.14', '3.16', '3.12', '3.18'],
            correct: '3.14',
            explanation: 'Pi (π) is approximately equal to 3.14159...'
        },
        {
            type: 'trivia',
            question: 'What is 7 x 8?',
            choices: ['54', '56', '58', '60'],
            correct: '56',
            explanation: 'Multiplication: 7 x 8 = 56'
        },
        {
            type: 'trivia',
            question: 'What is the sum of angles in a triangle?',
            choices: ['180°', '360°', '90°', '270°'],
            correct: '180°',
            explanation: 'The sum of angles in any triangle is always 180 degrees.'
        },
        {
            type: 'trivia',
            question: 'Which number is neither prime nor composite?',
            choices: ['1', '2', '3', '4'],
            correct: '1',
            explanation: '1 is neither prime nor composite because it has only one factor.'
        },
        {
            type: 'trivia',
            question: 'What is 15% of 200?',
            choices: ['30', '20', '25', '35'],
            correct: '30',
            explanation: '15% of 200 = (15/100) × 200 = 30'
        }
    ],
    
    english: [
        // Word puzzles
        {
            type: 'wordPuzzle',
            word: 'ADJECTIVE',
            puzzle: ['A_J__T__E', 'Describes a noun'],
            hints: ['D', 'E', 'C', 'I']
        },
        {
            type: 'wordPuzzle',
            word: 'PRONOUN',
            puzzle: ['P__N__N', 'Replaces a noun'],
            hints: ['R', 'O', 'O', 'U']
        },
        { 
            type: 'wordPuzzle',
            word: 'VERB',
            puzzle: ['V__B', 'Action word'],
            hints: ['E', 'R']
        },
        { 
            type: 'wordPuzzle',
            word: 'ADVERB',
            puzzle: ['A_V__B', 'Modifies a verb'],
            hints: ['D', 'E', 'R']
        },
        {
            type: 'wordPuzzle',
            word: 'NOUN',
            puzzle: ['N__N', 'Person, place, or thing'],
            hints: ['O', 'U']
        }
    ],
    
    science: [
        // Trivia questions
        {
            type: 'trivia',
            question: 'What is the hardest natural substance on Earth?',
            choices: ['Diamond', 'Gold', 'Iron', 'Platinum'],
            correct: 'Diamond',
            explanation: 'Diamond is the hardest natural substance.'
        },
        {
            type: 'trivia',
            question: 'Which planet is known as the Red Planet?',
            choices: ['Mars', 'Venus', 'Jupiter', 'Mercury'],
            correct: 'Mars',
            explanation: 'Mars appears red due to iron oxide.'
        },
        {
            type: 'trivia',
            question: 'What is the largest organ in the human body?',
            choices: ['Skin', 'Liver', 'Heart', 'Brain'],
            correct: 'Skin',
            explanation: 'The skin is the largest organ.'
        },
        {
            type: 'trivia',
            question: 'Which gas do plants absorb from the air?',
            choices: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
            correct: 'Carbon dioxide',
            explanation: 'Plants absorb carbon dioxide for photosynthesis.'
        },
        {
            type: 'trivia',
            question: 'What is the basic unit of life?',
            choices: ['Cell', 'Atom', 'Molecule', 'Tissue'],
            correct: 'Cell',
            explanation: 'The cell is the basic unit of all living things.'
        }
    ],

    mapeh: [
        // Word puzzles
        {
            type: 'wordPuzzle',
            word: 'RHYTHM',
            puzzle: ['R__T__M', 'Pattern of sound'],
            hints: ['H', 'Y', 'H', 'T']
        },
        { 
            type: 'wordPuzzle',
            word: 'MELODY',
            puzzle: ['M__O__Y', 'Musical tune'],
            hints: ['E', 'L', 'D', 'Y']
        },
        { 
            type: 'wordPuzzle',
            word: 'TEMPO',
            puzzle: ['T__PO', 'Speed of music'],
            hints: ['E', 'M']
        },
        {
            type: 'wordPuzzle',
            word: 'DANCE',
            puzzle: ['D__CE', 'Movement to music'],
            hints: ['A', 'N']
        },
        {
            type: 'wordPuzzle',
            word: 'HEALTH',
            puzzle: ['H__L_H', 'Well-being state'],
            hints: ['E', 'A', 'T']
        }
    ],

    filipino: [
        // Trivia questions
        {
            type: 'trivia',
            question: 'Alin sa mga sumusunod ang HINDI kasama sa mga patinig?',
            choices: ['B', 'A', 'I', 'O'],
            correct: 'B',
            explanation: 'Ang "B" ay katinig, hindi patinig.'
        },
        {
            type: 'trivia',
            question: 'Ano ang tawag sa mga salitang magkasingkahulugan?',
            choices: ['Sinonim', 'Antonim', 'Homonim', 'Homograf'],
            correct: 'Sinonim',
            explanation: 'Ang sinonim ay mga salitang magkasingkahulugan.'
        },
        {
            type: 'trivia',
            question: 'Ano ang tawag sa mga salitang magkasalungat?',
            choices: ['Antonim', 'Sinonim', 'Homonim', 'Homograf'],
            correct: 'Antonim',
            explanation: 'Ang antonim ay mga salitang magkasalungat ang kahulugan.'
        },
        {
            type: 'trivia',
            question: 'Ilang patinig mayroon ang alpabetong Filipino?',
            choices: ['5', '4', '3', '6'],
            correct: '5',
            explanation: 'May 5 patinig: A, E, I, O, U'
        },
        {
            type: 'trivia',
            question: 'Alin ang tamang pagbaybay?',
            choices: ['Pilipinas', 'Felipinas', 'Filipinas', 'Philipinas'],
            correct: 'Pilipinas',
            explanation: 'Pilipinas ang tamang pagbaybay sa Filipino.'
        }
    ],

    ap: [
        // Word puzzles
        {
            type: 'wordPuzzle',
            word: 'KALAYAAN',
            puzzle: ['K__AY__N', 'Freedom in Filipino'],
            hints: ['A', 'L', 'A', 'A']
        },
        {
            type: 'wordPuzzle',
            word: 'BANSA',
            puzzle: ['B__SA', 'Country in Filipino'],
            hints: ['A', 'N']
        },
        {
            type: 'wordPuzzle',
            word: 'WATAWAT',
            puzzle: ['W__AW_T', 'Flag in Filipino'],
            hints: ['A', 'T', 'A']
        },
        { 
            type: 'wordPuzzle',
            word: 'PILIPINO',
            puzzle: ['P__IP__O', 'Filipino citizen'],
            hints: ['I', 'L', 'I', 'N']
        },
        { 
            type: 'wordPuzzle',
            word: 'LAHI',
            puzzle: ['L__I', 'Race in Filipino'],
            hints: ['A', 'H']
        }
    ],

    values: [
        // Trivia questions
        {
            type: 'trivia',
            question: 'What value means showing gratitude?',
            choices: ['Thankfulness', 'Pride', 'Greed', 'Envy'],
            correct: 'Thankfulness',
            explanation: 'Thankfulness is showing gratitude.'
        },
        {
            type: 'trivia',
            question: 'Which value means being truthful?',
            choices: ['Honesty', 'Bravery', 'Kindness', 'Patience'],
            correct: 'Honesty',
            explanation: 'Honesty is being truthful in words and actions.'
        },
        {
            type: 'trivia',
            question: 'What value means helping others?',
            choices: ['Kindness', 'Laziness', 'Selfishness', 'Pride'],
            correct: 'Kindness',
            explanation: 'Kindness means helping and being good to others.'
        },
        {
            type: 'trivia',
            question: 'Which is a good value to have?',
            choices: ['Respect', 'Greed', 'Jealousy', 'Anger'],
            correct: 'Respect',
            explanation: 'Respect is treating others with courtesy.'
        },
        {
            type: 'trivia',
            question: 'What value means waiting calmly?',
            choices: ['Patience', 'Rudeness', 'Hastiness', 'Impulsiveness'],
            correct: 'Patience',
            explanation: 'Patience is waiting calmly.'
        }
    ],

    ict: [
        // Trivia questions
        {
            type: 'trivia',
            question: 'What does CPU stand for?',
            choices: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Computer Processing Unit'],
            correct: 'Central Processing Unit',
            explanation: 'CPU stands for Central Processing Unit.'
        },
        {
            type: 'trivia',
            question: 'Which is an example of an operating system?',
            choices: ['Windows', 'Word', 'Chrome', 'Excel'],
            correct: 'Windows',
            explanation: 'Windows is an operating system.'
        },
        {
            type: 'trivia',
            question: 'What does WWW stand for?',
            choices: ['World Wide Web', 'World Web Width', 'Wide World Web', 'Web World Wide'],
            correct: 'World Wide Web',
            explanation: 'WWW stands for World Wide Web.'
        },
        {
            type: 'trivia',
            question: 'Which device is used for printing?',
            choices: ['Printer', 'Scanner', 'Speaker', 'Monitor'],
            correct: 'Printer',
            explanation: 'A printer is used to print documents.'
        },
        {
            type: 'trivia',
            question: 'What type of device is a mouse?',
            choices: ['Input device', 'Output device', 'Storage device', 'Processing device'],
            correct: 'Input device',
            explanation: 'A mouse is an input device.'
        }
    ],

    cookery: [
        // Matching type questions
        {
            type: 'matching',
            title: 'Match the cooking methods with their descriptions',
            pairs: [
                { item: 'Baking', match: 'Cooking food with dry heat in an oven' },
                { item: 'Boiling', match: 'Cooking in water at 100°C' },
                { item: 'Frying', match: 'Cooking food in hot oil' },
                { item: 'Steaming', match: 'Cooking with water vapor' },
                { item: 'Grilling', match: 'Cooking food over direct heat' }
            ]
        },
        {
            type: 'matching',
            title: 'Match the kitchen tools with their uses',
            pairs: [
                { item: 'Whisk', match: 'Beating eggs and mixing ingredients' },
                { item: 'Colander', match: 'Draining pasta and washing vegetables' },
                { item: 'Peeler', match: 'Removing skin from fruits and vegetables' },
                { item: 'Grater', match: 'Shredding cheese and vegetables' },
                { item: 'Rolling Pin', match: 'Flattening dough' }
            ]
        },
        {
            type: 'matching',
            title: 'Match the ingredients with their category',
            pairs: [
                { item: 'Flour', match: 'Dry ingredient' },
                { item: 'Milk', match: 'Liquid ingredient' },
                { item: 'Eggs', match: 'Binding agent' },
                { item: 'Butter', match: 'Fat' },
                { item: 'Sugar', match: 'Sweetener' }
            ]
        },
        {
            type: 'matching',
            title: 'Match the kitchen safety rules',
            pairs: [
                { item: 'Knife handling', match: 'Always cut away from yourself' },
                { item: 'Fire safety', match: 'Keep a fire extinguisher nearby' },
                { item: 'Food safety', match: 'Wash hands before cooking' },
                { item: 'Equipment', match: 'Check if appliances are unplugged' },
                { item: 'Workspace', match: 'Keep the area clean and dry' }
            ]
        },
        {
            type: 'matching',
            title: 'Match Filipino dishes with main ingredients',
            pairs: [
                { item: 'Adobo', match: 'Meat, vinegar, and soy sauce' },
                { item: 'Sinigang', match: 'Meat, vegetables, and tamarind' },
                { item: 'Pancit', match: 'Noodles and vegetables' },
                { item: 'Lumpia', match: 'Ground meat and wrapper' },
                { item: 'Tinola', match: 'Chicken, papaya, and ginger' }
            ]
        }
    ],

    agriculture: [
        // 4 pics 1 word type
        {
            type: '4pics',
            word: 'HARVEST',
            images: [
                'https://i.im.ge/2024/11/16/zT1eEr.riceharvesting.jpeg',// Rice harvesting
                'https://i.im.ge/2024/11/16/zT2Ruc.fruit-picking.jpeg', // Fruit picking
                'https://i.im.ge/2024/11/16/zT2gkT.vegetable-gathering.jpeg', // Vegetable gathering
                'https://i.im.ge/2024/11/16/zT2cP0.grain-collection.jpeg',  // Grain collection
            ],
            hint: 'Collecting crops when they are ready'
        },
        {
            type: '4pics',
            word: 'PLANTING',
            images: [
                'https://i.im.ge/2024/11/16/zT2bdW.seed-sowing.jpeg', // Seed sowing
                'https://i.im.ge/2024/11/16/zT23nr.seeding-transfer.jpeg', // Seedling transfer
                'https://i.im.ge/2024/11/16/zT2xxm.rice-planting.jpeg', // Rice plantingfr
                'https://i.im.ge/2024/11/16/zT2EIf.tree-planting.jpeg',  // Tree planting
            ],
            hint: 'Putting seeds or young plants in soil'
        },
        {
            type: '4pics',
            word: 'WATERING',
            images: [
                'https://i.im.ge/2024/11/16/zT2CQ1.manual-watering.jpeg', // Manual watering
                'https://i.im.ge/2024/11/16/zT2y8P.sprinkler-systems.jpeg', // Sprinkler system
                'https://i.im.ge/2024/11/16/zT2t5p.irrigation.jpeg', // Irrigation
                'https://i.im.ge/2024/11/16/zT2Puq.rain-crops.jpeg',  // Rain on crops
            ],
            hint: 'Giving plants the water they need'
        },
        {
            type: '4pics',
            word: 'FARMING',
            images: [
                'https://i.im.ge/2024/11/16/zT26fC.tractor-plowing.jpeg', // Tractor plowing
                'https://i.im.ge/2024/11/16/zT2wN4.hand-tiling.jpeg', // Hand tilling
                'https://i.im.ge/2024/11/16/zT2mdD.greenhouse-.jpeg', // Greenhouse
                'https://i.im.ge/2024/11/16/zT2U8X.field-crops.jpeg',  // Field crops
            ],
            hint: 'Growing crops and raising animals'
        },
        {
            type: '4pics',
            word: 'TOOLS',
            images: [
                'https://i.im.ge/2024/11/16/zT25xM.plow-.jpeg', // Plow
                'https://i.im.ge/2024/11/16/zT29JY.rake-.jpeg', // Rake
                'https://i.im.ge/2024/11/16/zT2iM8.shovel-.jpeg', // Shovel
                'https://i.im.ge/2024/11/16/zT20Ih.hoe-.jpeg',  // Hoe
            ],
            hint: 'Equipment used for farm work'
        }
    ]
};

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Add confirmation dialog function
function confirmAction(message, callback) {
    const confirmed = window.confirm(message);
    if (confirmed) {
        // Save current progress before action
        saveProgress();
        callback();
    }
}

// Add save progress function
function saveProgress() {
    // Update total progress
    gameState.progress.totalScore += gameState.score;
    gameState.progress.totalTokens += gameState.tokens;
    gameState.progress.levelsCompleted = Math.max(
        gameState.progress.levelsCompleted,
        gameState.level
    );
    
    // Update high scores
    if (!gameState.highScores[gameState.currentSubject] || 
        gameState.score > gameState.highScores[gameState.currentSubject]) {
        gameState.highScores[gameState.currentSubject] = gameState.score;
    }
    
    // Save to localStorage
    localStorage.setItem('gameProgress', JSON.stringify(gameState.progress));
    localStorage.setItem('highScores', JSON.stringify(gameState.highScores));
    
    // Update displays
    updateProgressDisplay();
    updateHighScoresDisplay();
}

// Add progress display update function
function updateProgressDisplay() {
    document.getElementById('totalScore').textContent = gameState.progress.totalScore;
    document.getElementById('totalTokens').textContent = gameState.progress.totalTokens;
    document.getElementById('levelsCompleted').textContent = gameState.progress.levelsCompleted;
}

// Add high scores display update function
function updateHighScoresDisplay() {
    const highScoresList = document.getElementById('highScoresList');
    if (highScoresList) {
        highScoresList.innerHTML = '';
        Object.entries(gameState.highScores).forEach(([subject, score]) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'high-score-item';
            scoreItem.innerHTML = `
                <span class="subject">${subject}</span>
                <span class="score">${score}</span>
            `;
            highScoresList.appendChild(scoreItem);
        });
    }
}