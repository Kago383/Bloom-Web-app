<?php
require_once 'config.php';

try {
    // Remove profile_picture data from all users
    $stmt = $pdo->prepare("UPDATE farmers SET profile_picture = NULL");
    $stmt->execute();
    
    echo "All profile pictures removed from database successfully!";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>