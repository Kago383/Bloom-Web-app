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

$input = json_decode(file_get_contents('php://input'), true);

try {
    // Check what columns actually exist
    $check_columns = $pdo->prepare("SHOW COLUMNS FROM farmers");
    $check_columns->execute();
    $existing_columns = $check_columns->fetchAll(PDO::FETCH_COLUMN);
    
    // Define allowed fields that might exist
    $possible_fields = [
        'first_name', 'last_name', 'phone', 'location', 'farm_type',
        'farm_size', 'experience_years', 'bio'
    ];
    
    $update_fields = [];
    $params = [];
    
    foreach ($possible_fields as $field) {
        if (isset($input[$field]) && in_array($field, $existing_columns)) {
            // Handle empty values for numeric fields
            if (($field === 'farm_size' || $field === 'experience_years') && $input[$field] === '') {
                $update_fields[] = "$field = NULL";
            } else {
                $update_fields[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
    }
    
    if (empty($update_fields)) {
        echo json_encode(['success' => false, 'message' => 'No valid fields to update']);
        exit;
    }
    
    $params[] = $farmer_id;
    
    // Add updated_at if it exists
    if (in_array('updated_at', $existing_columns)) {
        $sql = "UPDATE farmers SET " . implode(', ', $update_fields) . ", updated_at = NOW() WHERE id = ?";
    } else {
        $sql = "UPDATE farmers SET " . implode(', ', $update_fields) . " WHERE id = ?";
    }
    
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute($params);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update profile'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>