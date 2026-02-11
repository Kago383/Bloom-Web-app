<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

$farmer_id = $_SESSION['farmer_id'] ?? 1; // Fallback to 1 for demo

try {
    $stmt = $pdo->prepare("
        SELECT first_name, last_name, email, phone, location, farm_type, 
               profile_picture, farm_size, experience_years, bio, created_at
        FROM farmers 
        WHERE id = ?
    ");
    $stmt->execute([$farmer_id]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($profile) {
        echo json_encode([
            'success' => true,
            'data' => $profile
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Profile not found'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>