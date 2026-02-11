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

$farmer_id = $_SESSION['farmer_id'] ?? 1;

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['activity_id'])) {
        throw new Exception("Activity ID is required");
    }

    // Update activity status
    $stmt = $pdo->prepare("
        UPDATE farming_activities 
        SET status = ? 
        WHERE id = ? AND farmer_id = ?
    ");
    
    $success = $stmt->execute([
        $input['status'],
        $input['activity_id'],
        $farmer_id
    ]);
    
    if ($success && $stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Activity updated successfully'
        ]);
    } else {
        throw new Exception("Activity not found or update failed");
    }
    
} catch (Exception $e) {
    error_log("Update activity error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Error updating activity: ' . $e->getMessage()
    ]);
}
?>