<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

$farmer_id = $_SESSION['farmer_id'] ?? 1;

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['post_id'])) {
        throw new Exception("Post ID is required");
    }

    $post_id = $input['post_id'];
    $action = $input['action'] ?? 'like'; // 'like' or 'unlike'

    if ($action === 'like') {
        // Check if already liked
        $stmt = $pdo->prepare("SELECT id FROM post_likes WHERE post_id = ? AND farmer_id = ?");
        $stmt->execute([$post_id, $farmer_id]);
        
        if ($stmt->rowCount() === 0) {
            $stmt = $pdo->prepare("INSERT INTO post_likes (post_id, farmer_id) VALUES (?, ?)");
            $stmt->execute([$post_id, $farmer_id]);
        }
    } else {
        // Unlike
        $stmt = $pdo->prepare("DELETE FROM post_likes WHERE post_id = ? AND farmer_id = ?");
        $stmt->execute([$post_id, $farmer_id]);
    }
    
    // Get updated like count
    $stmt = $pdo->prepare("SELECT COUNT(*) as likes_count FROM post_likes WHERE post_id = ?");
    $stmt->execute([$post_id]);
    $likes_count = $stmt->fetch(PDO::FETCH_ASSOC)['likes_count'];
    
    echo json_encode([
        'success' => true,
        'likes_count' => $likes_count,
        'action' => $action
    ]);
    
} catch (Exception $e) {
    error_log("Like post error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>