<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username"]);
    $email = trim($_POST["email"]);
    $phone = trim($_POST["phone"]);
    $password = trim($_POST["password"]);

    if (!empty($username) && !empty($email) && !empty($phone) && !empty($password)) {
        // Hash the password for security
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Save user data to users.txt (Format: username|hashed_password)
        $file = fopen("users.txt", "a");
        fwrite($file, "$username|$hashed_password\n");
        fclose($file);

        // Redirect to login page
        header("Location: login.php?register=success");
        exit();
    } else {
        echo "All fields are required!";
    }
}
?>
