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

try {
    if (empty($_GET['post_id'])) {
        throw new Exception("Post ID is required");
    }

    $post_id = $_GET['post_id'];
    
    $stmt = $pdo->prepare("
        SELECT cc.*, f.name as farmer_name 
        FROM community_comments cc 
        JOIN farmers f ON cc.farmer_id = f.id 
        WHERE cc.post_id = ? 
        ORDER BY cc.created_at ASC
    ");
    $stmt->execute([$post_id]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'comments' => $comments
    ]);
    
} catch (Exception $e) {
    error_log("Get comments error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>