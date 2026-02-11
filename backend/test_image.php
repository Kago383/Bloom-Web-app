<?php
require_once 'config.php';

session_start();
$farmer_id = $_SESSION['farmer_id'] ?? 1;

try {
    $stmt = $pdo->prepare("SELECT profile_picture FROM farmers WHERE id = ?");
    $stmt->execute([$farmer_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "<h1>Image Test</h1>";
    echo "<p>Database value: " . htmlspecialchars($result['profile_picture']) . "</p>";
    
    if ($result['profile_picture']) {
        echo "<p>Image URL: <a href='" . htmlspecialchars($result['profile_picture']) . "' target='_blank'>" . htmlspecialchars($result['profile_picture']) . "</a></p>";
        echo "<img src='" . htmlspecialchars($result['profile_picture']) . "' style='max-width: 200px; border: 2px solid red;' alt='Test Image'>";
    } else {
        echo "<p>No profile picture found</p>";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>