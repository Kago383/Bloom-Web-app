<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    // Check if tables exist
    $tables = ['community_posts', 'community_comments', 'post_likes'];
    $results = [];
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $results[$table] = ['exists' => true, 'count' => $result['count']];
        } catch (Exception $e) {
            $results[$table] = ['exists' => false, 'error' => $e->getMessage()];
        }
    }
    
    echo json_encode([
        'success' => true,
        'database_status' => $results,
        'config_file' => file_exists('config.php') ? 'exists' : 'missing'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>