<?php
session_start();

// Hardcoded credentials
$valid_users = [
    "admin" => "12345",
    "user" => "password"
];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST["username"];
    $password = $_POST["password"];

    if (isset($valid_users[$username]) && $valid_users[$username] === $password) {
        $_SESSION["username"] = $username;
        header("Location: dashboard.php");
        exit();
    } else {
        header("Location: login.php?error=Invalid credentials");
        exit();
    }
} else {
    header("Location: login.php");
    exit();
}
?>
