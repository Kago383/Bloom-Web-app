<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

$farmer_id = $_SESSION['farmer_id'] ?? 1;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Check if file was uploaded
if (!isset($_FILES['profile_picture']) || $_FILES['profile_picture']['error'] !== UPLOAD_ERR_OK) {
    $upload_errors = [
        UPLOAD_ERR_INI_SIZE => 'File size exceeds server limit',
        UPLOAD_ERR_FORM_SIZE => 'File size exceeds form limit',
        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
    ];
    
    $error_msg = $upload_errors[$_FILES['profile_picture']['error']] ?? 'Unknown upload error';
    echo json_encode(['success' => false, 'message' => 'Upload failed: ' . $error_msg]);
    exit;
}

$file = $_FILES['profile_picture'];
$max_file_size = 5 * 1024 * 1024; // 5MB
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Validate file size
if ($file['size'] > $max_file_size) {
    echo json_encode(['success' => false, 'message' => 'File size too large (max 5MB)']);
    exit;
}

// Validate file type
if (!in_array($file['type'], $allowed_types)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.']);
    exit;
}

// Create upload directory if it doesn't exist
$upload_dir = __DIR__ . '/../../uploads/profile_pictures/';
if (!file_exists($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        echo json_encode(['success' => false, 'message' => 'Failed to create upload directory']);
        exit;
    }
}

// Check if directory is writable
if (!is_writable($upload_dir)) {
    echo json_encode(['success' => false, 'message' => 'Upload directory is not writable']);
    exit;
}

try {
    // Generate unique filename
    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = 'profile_' . $farmer_id . '_' . time() . '.' . $file_extension;
    $filepath = $upload_dir . $filename;
    
    // Validate and process image
    $image_info = getimagesize($file['tmp_name']);
    if (!$image_info) {
        echo json_encode(['success' => false, 'message' => 'Invalid image file']);
        exit;
    }
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Build the CORRECT full URL
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        
        // For your structure: http://localhost/bloom_app/uploads/profile_pictures/filename.jpg
        $full_url = $protocol . '://' . $host . '/bloom_app/uploads/profile_pictures/' . $filename;
        
        // Update database with the full URL
        $stmt = $pdo->prepare("UPDATE farmers SET profile_picture = ?, updated_at = NOW() WHERE id = ?");
        $success = $stmt->execute([$full_url, $farmer_id]);
        
        if ($success) {
            echo json_encode([
                'success' => true,
                'message' => 'Profile picture updated successfully',
                'image_url' => $full_url,
                'filename' => $filename
            ]);
        } else {
            // Remove uploaded file if DB update fails
            if (file_exists($filepath)) {
                unlink($filepath);
            }
            echo json_encode(['success' => false, 'message' => 'Failed to update profile in database']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
    }
} catch (PDOException $e) {
    // Remove uploaded file if error occurs
    if (isset($filepath) && file_exists($filepath)) {
        unlink($filepath);
    }
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // Remove uploaded file if error occurs
    if (isset($filepath) && file_exists($filepath)) {
        unlink($filepath);
    }
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>