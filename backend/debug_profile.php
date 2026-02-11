<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

$farmer_id = $_SESSION['farmer_id'] ?? 1;

try {
    // Get current profile data
    $stmt = $pdo->prepare("SELECT * FROM farmers WHERE id = ?");
    $stmt->execute([$farmer_id]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $profile,
        'upload_path' => __DIR__ . '/../uploads/profile_pictures/',
        'web_path_base' => 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>