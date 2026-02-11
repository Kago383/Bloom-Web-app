<?php
require_once 'config.php';

try {
    // Create community_posts table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS community_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            farmer_id INT NOT NULL,
            content TEXT NOT NULL,
            type ENUM('post', 'question', 'tip') DEFAULT 'post',
            category VARCHAR(100),
            likes INT DEFAULT 0,
            comments_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");

    // Create community_comments table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS community_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            farmer_id INT NOT NULL,
            content TEXT NOT NULL,
            likes INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
        )
    ");

    // Create post_likes table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS post_likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            farmer_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_like (post_id, farmer_id),
            FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
        )
    ");

    echo json_encode(['success' => true, 'message' => 'Community tables created successfully']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error creating tables: ' . $e->getMessage()]);
}
?>