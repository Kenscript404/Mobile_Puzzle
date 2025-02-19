<?php
session_start();

// Redirect if already logged in
if (isset($_SESSION['username'])) {
    header("Location: ../dashboard/dashboard.php");
    exit();
}

$error = "";

// Handle login form submission
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST["username"]);
    $password = trim($_POST["password"]);

    if (!empty($username) && !empty($password)) {
        // Open users.txt file safely
        if ($file = fopen("users.txt", "r")) {
            while (($line = fgets($file)) !== false) {
                list($stored_username, $stored_hash) = explode("|", trim($line));

                // Verify username and password
                if ($username === $stored_username && password_verify($password, $stored_hash)) {
                    fclose($file);

                    // Secure session handling
                    session_regenerate_id(true); // Prevent session fixation
                    $_SESSION["username"] = $username;

                    header("Location: ../dashboard/dashboard.php?success=login");
                    exit();
                }
            }
            fclose($file);
        }
        $error = "Invalid username or password.";
    } else {
        $error = "Please enter both username and password.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login & Register</title>
    <link rel="shortcut icon" href="../images/icon.png">
    <link rel="stylesheet" href="../css/login.css">
    <link href="https://fonts.googleapis.com/css2?family=Jost:wght@500&display=swap" rel="stylesheet">  
</head>
<body>

<div class="main">  
    <input type="checkbox" id="chk" aria-hidden="true">

    <div class="register">
        <form action="register.php" method="POST">
            <label for="chk" aria-hidden="true">Register</label>
            <input type="text" name="username" placeholder="Username" required>
            <input type="email" name="email" placeholder="Email" required>
            <input type="text" name="phone" placeholder="Phone Number" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Register</button>
        </form>
    </div>

    <div class="login">
        <form action="" method="POST">
            <label for="chk" aria-hidden="true">Login</label>
            <?php if (!empty($error)) { echo "<p style='color:red'>$error</p>"; } ?>
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
</div>

</body>
</html>
