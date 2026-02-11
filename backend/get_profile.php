<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

$farmer_id = $_SESSION['farmer_id'] ?? 1;

try {
    // First, check what columns exist in the table
    $check_columns = $pdo->prepare("SHOW COLUMNS FROM farmers");
    $check_columns->execute();
    $existing_columns = $check_columns->fetchAll(PDO::FETCH_COLUMN);
    
    // Build query based on available columns
    $base_columns = ['first_name', 'last_name', 'email', 'phone', 'location', 'farm_type', 'created_at'];
    $profile_columns = ['profile_picture', 'farm_size', 'experience_years', 'bio'];
    
    $selected_columns = $base_columns;
    foreach ($profile_columns as $column) {
        if (in_array($column, $existing_columns)) {
            $selected_columns[] = $column;
        }
    }
    
    $columns_sql = implode(', ', $selected_columns);
    
    $stmt = $pdo->prepare("SELECT $columns_sql FROM farmers WHERE id = ?");
    $stmt->execute([$farmer_id]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($profile) {
        // Ensure all expected fields are present, even if null
        $default_fields = [
            'profile_picture' => null, // Always null now
            'farm_size' => null,
            'experience_years' => null,
            'bio' => null
        ];
        
        $profile = array_merge($default_fields, $profile);
        
        // Force profile_picture to be null
        $profile['profile_picture'] = null;
        
        echo json_encode([
            'success' => true,
            'data' => $profile
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Profile not found'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>