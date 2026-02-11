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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// For demo purposes - in production, use actual session
$farmer_id = $_SESSION['farmer_id'] ?? 1;

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['crop_name', 'activity_type', 'activity_date'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // First, get the crop_id from farmer_crops
    $stmt = $pdo->prepare("SELECT id FROM farmer_crops WHERE crop_name = ? AND farmer_id = ? LIMIT 1");
    $stmt->execute([$input['crop_name'], $farmer_id]);
    $crop = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$crop) {
        // If crop doesn't exist, create it
        $stmt = $pdo->prepare("INSERT INTO farmer_crops (farmer_id, crop_name, planting_date, area_planted) VALUES (?, ?, CURDATE(), 1)");
        $stmt->execute([$farmer_id, $input['crop_name']]);
        $crop_id = $pdo->lastInsertId();
    } else {
        $crop_id = $crop['id'];
    }

    // Insert the activity
    $stmt = $pdo->prepare("
        INSERT INTO farming_activities 
        (farmer_id, crop_id, activity_type, activity_date, description, cost, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, 'scheduled', NOW())
    ");
    
    $stmt->execute([
        $farmer_id,
        $crop_id,
        $input['activity_type'],
        $input['activity_date'],
        $input['description'] ?? '',
        $input['cost'] ?? 0
    ]);
    
    $activity_id = $pdo->lastInsertId();
    
    // Get the complete activity data to return
    $stmt = $pdo->prepare("
        SELECT fa.*, fc.crop_name 
        FROM farming_activities fa 
        JOIN farmer_crops fc ON fa.crop_id = fc.id 
        WHERE fa.id = ?
    ");
    $stmt->execute([$activity_id]);
    $new_activity = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Activity added successfully',
        'activity' => $new_activity
    ]);
    
} catch (Exception $e) {
    error_log("Add activity error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Error adding activity: ' . $e->getMessage()
    ]);
}
?>