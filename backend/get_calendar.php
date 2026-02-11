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

$farmer_id = $_SESSION['farmer_id'] ?? 1;

try {
    $stmt = $pdo->prepare("
        SELECT 
            fa.*,
            fc.crop_name,
            fa.status
        FROM farming_activities fa
        JOIN farmer_crops fc ON fa.crop_id = fc.id
        WHERE fa.farmer_id = ?
        AND fa.activity_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)
        ORDER BY fa.activity_date ASC
    ");
    
    $stmt->execute([$farmer_id]);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'events' => $events
    ]);
    
} catch(PDOException $e) {
    error_log("Calendar data error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>