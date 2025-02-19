<?php
session_start();

// Prevent session fixation attacks
if (!isset($_SESSION['username'])) {
    session_destroy();
    header("Location: ../Mobile/php/login.php?error=Please login to access this page");
    exit();
}

// Regenerate session ID for added security
session_regenerate_id(true);

// Optional: Store the username in a variable for later use
$username = htmlspecialchars($_SESSION['username']);
?>







<!--?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    header("Location: ../Mobile/php/login.php?error=Invalid credentials"); // Redirect to login page
    exit();
}

// // If logged in, display the content
// echo "<h2>Welcome to the protected folder, " . htmlspecialchars($_SESSION['username']) . "!</h2>";
?>
