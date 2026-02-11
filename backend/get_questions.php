<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

$farmer_id = $_SESSION['farmer_id'] ?? 1;

try {
    $stmt = $pdo->prepare("
        SELECT id, question, answer, category, created_at 
        FROM expert_questions 
        WHERE farmer_id = ? 
        ORDER BY created_at DESC
        LIMIT 50
    ");
    
    $stmt->execute([$farmer_id]);
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'questions' => $questions
    ]);
    
} catch(PDOException $e) {
    error_log("Get questions error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>