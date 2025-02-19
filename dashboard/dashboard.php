<?php
session_start();

// Check if the user is logged in
if (!isset($_SESSION["username"])) {
    session_destroy();
    header("Location: ../index.php");
    exit();
}

// Regenerate session ID for security
session_regenerate_id(true);

// Store username for display
$username = htmlspecialchars($_SESSION["username"]);
?>






<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Educational Games Hub</title>
    <link rel="shortcut icon" href="../images/icon.png">
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    
    <!-- Loading Screen -->
    <!-- <div id="loadingScreen" class="loading-screen">
        <div class="loader"></div>
        <p>Loading...</p>
    </div> -->

    <div id="app">
        <!-- Home Screen -->
        <div id="homeScreen" class="screen active">
            <h1>Educational Games Hub</h1>
            <div class="menu">
                <button onclick="showScreen('subjectSelect')">
                    <i class="fas fa-play"></i>
                    Start Game
                </button>
                <button onclick="showScreen('instructions')">
                    <i class="fas fa-info-circle"></i>
                    Instructions
                </button>
                <button onclick="showScreen('progress')">
                    <i class="fas fa-chart-line"></i>
                    View Progress
                </button>
                <button onclick="showScreen('settings')">
                    <i class="fas fa-cog"></i>
                    Settings
                </button>
            <!--Logout-->
                <button onclick="logoutUser()" id="logoutButton">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        </div>
    <script>
        function logoutUser() {
            window.location.href = '../php/logout.php'; // Adjust the path as needed
        }
    </script>



        <!-- Game Intro Screen -->
        <div id="gameIntro" class="screen">
            <h2>Welcome to Educational Games Hub!</h2>
            <div class="intro-content">
                <p>Get ready to test your knowledge across different subjects!</p>
                <p>Complete challenges, earn points, and become a master learner.</p>
                <div class="objectives">
                    <h3>Objectives:</h3>
                    <ul>
                        <li>Answer questions correctly to earn points</li>
                        <li>Complete levels within the time limit</li>
                        <li>Use hints wisely to help with difficult questions</li>
                        <li>Try to achieve the highest score possible</li>
                    </ul>
                </div>
            </div>
            <div class="intro-buttons">
                <button onclick="showScreen('instructions')">
                    <i class="fas fa-info-circle"></i>
                    View Instructions
                </button>
                <button onclick="showScreen('subjectSelect')" class="primary-btn">
                    <i class="fas fa-play"></i>
                    Start Playing
                </button>
            </div>
        </div>

        <!-- Instructions Screen -->
        <div id="instructions" class="screen">
            <h2>How to Play</h2>
            <div class="instructions-content">
                <p>1. Select a subject from the menu</p>
                <p>2. Read the definition and guess the word</p>
                <p>3. Use hints if needed (costs 50 tokens)</p>
                <p>4. Earn points and tokens for correct answers</p>
                <p>5. Complete levels within the time limit</p>
                <p>6. Press Enter to submit your answer</p>
            </div>
            <button class="back-btn" onclick="showScreen('homeScreen')">
                <i class="fas fa-arrow-left"></i>
                Back
            </button>
        </div>

        <!-- Progress Screen -->
        <div id="progress" class="screen">
            <h2>Your Progress</h2>
            <div class="progress-content">
                <p>Total Score: <span id="totalScore">0</span></p>
                <p>Total Tokens: <span id="totalTokens">0</span></p>
                <p>Levels Completed: <span id="levelsCompleted">0</span></p>
                <div class="high-scores">
                    <h3>High Scores</h3>
                    <div id="highScoresList"></div>
                </div>
            </div>
            <button class="reset-btn" onclick="resetGame()">
                <i class="fas fa-redo"></i>
                Reset Progress
            </button>
            <button class="back-btn" onclick="showScreen('homeScreen')">
                <i class="fas fa-arrow-left"></i>
                Back
            </button>
        </div>

        <!-- Settings Screen -->
        <div id="settings" class="screen">
            <h2>Settings</h2>
            <div class="settings-content">
                <div class="setting-item">
                    <label>Sound Effects</label>
                    <button onclick="AudioManager.toggleSound()" id="soundToggle">
                        <i class="fas fa-volume-up"></i>
                        On
                    </button>
                </div>
                <div class="setting-item">
                    <label>Volume</label>
                    <input type="range" id="volumeSlider" min="0" max="100" value="100"
                           onchange="AudioManager.setVolume(this.value/100)">
                </div>
                <div class="setting-item">
                    <label>Difficulty</label>
                    <select id="difficultySelect" onchange="changeDifficulty(this.value)">
                        <option value="easy">Easy</option>
                        <option value="normal" selected>Normal</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>
            <button class="back-btn" onclick="showScreen('homeScreen')">
                <i class="fas fa-arrow-left"></i>
                Back
            </button>
        </div>

        <!-- Subject Selection Screen -->
        <div id="subjectSelect" class="screen">
            <h2>Select Subject</h2>
            <div class="subjects-grid">
                <button onclick="startGame('math')" class="subject-btn">
                    <i class="fas fa-calculator"></i>
                    <span>Math</span>
                </button>
                <button onclick="startGame('english')" class="subject-btn">
                    <i class="fas fa-book"></i>
                    <span>English</span>
                </button>
                <button onclick="startGame('science')" class="subject-btn">
                    <i class="fas fa-flask"></i>
                    <span>Science</span>
                </button>
                <button onclick="startGame('mapeh')" class="subject-btn">
                    <i class="fas fa-music"></i>
                    <span>MAPEH</span>
                </button>
                <button onclick="startGame('filipino')" class="subject-btn">
                    <i class="fas fa-flag"></i>
                    <span>Filipino</span>
                </button>
                <button onclick="startGame('ap')" class="subject-btn">
                    <i class="fas fa-landmark"></i>
                    <span>AP</span>
                </button>
                <button onclick="startGame('values')" class="subject-btn">
                    <i class="fas fa-heart"></i>
                    <span>Values</span>
                </button>
                <button onclick="startGame('ict')" class="subject-btn">
                    <i class="fas fa-laptop-code"></i>
                    <span>ICT</span>
                </button>
                <button onclick="startGame('cookery')" class="subject-btn">
                    <i class="fas fa-utensils"></i>
                    <span>Cookery</span>
                </button>
                <button onclick="startGame('agriculture')" class="subject-btn">
                    <i class="fas fa-seedling"></i>
                    <span>Agriculture</span>
                </button>
            </div>
            <button class="back-btn" onclick="showScreen('homeScreen')">
                <i class="fas fa-arrow-left"></i>
                Back
            </button>
        </div>

        <!-- Game Screen -->
        <div id="gameScreen" class="screen">
            <div class="game-header">
                <span id="level">Level: 1</span>
                <span id="score">Score: 0</span>
                <span id="tokens">Tokens: 0</span>
                <span id="timer" class="timer">Time: 60s</span>
            </div>
            <div id="gameArea"></div>
            <div class="game-controls">
                <button id="hintBtn" onclick="useHint()">
                    <i class="fas fa-lightbulb"></i>
                    Use Hint (50 tokens)
                </button>
                <button onclick="exitGame()" id="exitButton">
                <i class="fas fa-door-open"></i>
                Exit Game
            </button>

            <script>
                function exitGame() {
                    window.location.href = '../dashboard/dashboard.php?success=login'; // Redirects similar to Logout
                }
            </script>

            </div>
        </div>

<style>
    #logoutButton, #exitButton {
    background-color: #d9534f; /* Match button color */
    color: white;
    font-size: 16px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
}

#logoutButton i, #exitButton i {
    font-size: 18px;
}
</style>


        <!-- Game Over Screen -->
        <div id="gameOver" class="screen">
            <h2>Game Over!</h2>
            <div class="game-over-content">
                <div class="final-stats">
                    <h3>Your Results:</h3>
                    <p>Final Score: <span id="finalScore">0</span></p>
                    <p>Tokens Earned: <span id="finalTokens">0</span></p>
                    <p>Level Reached: <span id="finalLevel">1</span></p>
                </div>
                <div class="game-over-buttons">
                    <button onclick="startGame(gameState.currentSubject)" class="retry-btn">
                        <i class="fas fa-redo"></i>
                        Play Again
                    </button>
                    <button onclick="showScreen('subjectSelect')">
                        <i class="fas fa-book"></i>
                        Try Different Subject
                    </button>
                    <button onclick="showScreen('homeScreen')" class="home-btn">
                        <i class="fas fa-home"></i>
                        Return to Home
                    </button>
                </div>
            </div>
        </div>

        <!-- Audio Elements -->
        <audio id="correctSound" src="https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"></audio>
        <audio id="wrongSound" src="https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3"></audio>
    </div>

    <!-- Notification System -->
    <div id="notification" class="notification"></div>

    <!-- Scripts -->
    <script src="../js/scripts.js"></script>
</body>
</html>
