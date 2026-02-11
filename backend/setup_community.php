<?php
require_once 'config.php';

try {
    // Drop and recreate tables
    $pdo->exec("DROP TABLE IF EXISTS post_likes, community_comments, community_posts");
    
    // Create simplified tables
    $pdo->exec("
        CREATE TABLE community_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            farmer_id INT NOT NULL,
            content TEXT NOT NULL,
            type ENUM('post', 'question', 'tip') DEFAULT 'post',
            category VARCHAR(100),
            likes_count INT DEFAULT 0,
            comments_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    
    $pdo->exec("
        CREATE TABLE community_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            farmer_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    $pdo->exec("
        CREATE TABLE post_likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            farmer_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Insert sample posts
    $sample_posts = [
        [1, 'Just harvested my maize crop! Yield is looking good this season despite the dry spell. Anyone else seeing similar results?', 'post', 'crops', 3, 2],
        [2, 'What\'s the best organic method to control aphids on my vegetables? Chemical sprays are getting expensive.', 'question', 'pests', 1, 1],
        [3, 'Tip: Planting sunflowers around your field helps attract beneficial insects and can reduce pest problems naturally.', 'tip', 'pests', 2, 0],
        [4, 'Market prices for groundnuts are rising in Gaborone. Good time to sell if you have stored produce!', 'post', 'market', 3, 0],
        [1, 'How often should I water my tomato plants during the hot season? My current schedule doesn\'t seem to be working well.', 'question', 'crops', 0, 0],
        [2, 'Just attended a great workshop on soil conservation techniques. The key is mulching and crop rotation!', 'tip', 'soil', 0, 0]
    ];
    
    foreach ($sample_posts as $post) {
        $stmt = $pdo->prepare("INSERT INTO community_posts (farmer_id, content, type, category, likes_count, comments_count) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute($post);
    }
    
    echo "✅ Community system setup successfully!<br>";
    echo "✅ Tables created with sample data<br>";
    echo "✅ You can now use the Community panel<br>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>