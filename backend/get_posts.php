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

// Use session user ID or default to 1 for demo
$current_user_id = $_SESSION['user_id'] ?? $_SESSION['farmer_id'] ?? 1;

try {
    $category = $_GET['category'] ?? 'all';
    $type = $_GET['type'] ?? 'all';
    
    $query = "SELECT * FROM community_posts WHERE 1=1";
    $params = [];
    
    if ($category !== 'all') {
        $query .= " AND category = ?";
        $params[] = $category;
    }
    
    if ($type !== 'all') {
        $query .= " AND type = ?";
        $params[] = $type;
    }
    
    $query .= " ORDER BY created_at DESC LIMIT 50";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Add farmer names and check likes for each post
    foreach ($posts as &$post) {
        // Generate farmer name based on ID for demo
        $farmer_names = ['Kabelo M.', 'Sarah T.', 'David K.', 'Ministry Alert', 'Botswana Farms'];
        $post['farmer_name'] = $farmer_names[$post['farmer_id'] % count($farmer_names)] ?? 'Farmer';
        $post['location'] = 'Botswana';
        
        // Get likes count
        $stmt = $pdo->prepare("SELECT COUNT(*) as likes_count FROM post_likes WHERE post_id = ?");
        $stmt->execute([$post['id']]);
        $post['likes_count'] = $stmt->fetch(PDO::FETCH_ASSOC)['likes_count'] ?? 0;
        
        // Get comments count
        $stmt = $pdo->prepare("SELECT COUNT(*) as comments_count FROM community_comments WHERE post_id = ?");
        $stmt->execute([$post['id']]);
        $post['comments_count'] = $stmt->fetch(PDO::FETCH_ASSOC)['comments_count'] ?? 0;
        
        // Check if current user liked this post
        $stmt = $pdo->prepare("SELECT COUNT(*) as user_liked FROM post_likes WHERE post_id = ? AND farmer_id = ?");
        $stmt->execute([$post['id'], $current_user_id]);
        $post['user_liked'] = ($stmt->fetch(PDO::FETCH_ASSOC)['user_liked'] ?? 0) > 0;
    }
    
    echo json_encode([
        'success' => true,
        'posts' => $posts
    ]);
    
} catch(PDOException $e) {
    error_log("Get posts error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Error loading posts: ' . $e->getMessage()
    ]);
}
?>