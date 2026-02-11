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

// Use session user ID or default to 1 for demo
$user_id = $_SESSION['user_id'] ?? $_SESSION['farmer_id'] ?? 1;

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['content'])) {
        throw new Exception("Post content is required");
    }

    $type = $input['type'] ?? 'post';
    $category = $input['category'] ?? 'general';

    // Insert post
    $stmt = $pdo->prepare("
        INSERT INTO community_posts 
        (farmer_id, content, type, category) 
        VALUES (?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $user_id,
        $input['content'],
        $type,
        $category
    ]);
    
    $post_id = $pdo->lastInsertId();
    
    // Get the created post
    $stmt = $pdo->prepare("SELECT * FROM community_posts WHERE id = ?");
    $stmt->execute([$post_id]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Add farmer name for response
    $farmer_names = ['Kabelo M.', 'Sarah T.', 'David K.', 'Ministry Alert', 'Botswana Farms'];
    $post['farmer_name'] = $farmer_names[$user_id % count($farmer_names)] ?? 'Farmer';
    $post['location'] = 'Botswana';
    $post['likes_count'] = 0;
    $post['comments_count'] = 0;
    $post['user_liked'] = false;
    
    echo json_encode([
        'success' => true,
        'message' => 'Post created successfully',
        'post' => $post
    ]);
    
} catch (Exception $e) {
    error_log("Create post error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Error creating post: ' . $e->getMessage()
    ]);
}
?>