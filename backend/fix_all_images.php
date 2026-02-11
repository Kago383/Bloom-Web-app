<?php
require_once 'config.php';

try {
    // Get all farmers with profile pictures
    $stmt = $pdo->prepare("SELECT id, profile_picture FROM farmers WHERE profile_picture IS NOT NULL");
    $stmt->execute();
    $farmers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($farmers as $farmer) {
        // Extract filename from current path
        $filename = basename($farmer['profile_picture']);
        
        // Build new correct URL
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        
        $new_url = $protocol . '://' . $host . '/bloom_app/uploads/profile_pictures/' . $filename;
        
        // Update database
        $update_stmt = $pdo->prepare("UPDATE farmers SET profile_picture = ? WHERE id = ?");
        $update_stmt->execute([$new_url, $farmer['id']]);
        
        echo "Updated farmer {$farmer['id']}: {$new_url}<br>";
        
        // Check if file exists in correct location
        $correct_file_path = __DIR__ . '/../../uploads/profile_pictures/' . $filename;
        if (file_exists($correct_file_path)) {
            echo "File exists: {$filename}<br>";
        } else {
            echo "File NOT found: {$filename}<br>";
        }
    }
    
    echo "All profile pictures updated!<br>";
    echo "Correct URL format: http://localhost/bloom_app/uploads/profile_pictures/filename.jpg";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>