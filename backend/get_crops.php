<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Debug session
error_log("Session status: " . json_encode($_SESSION));
error_log("Farmer ID in session: " . ($_SESSION['farmer_id'] ?? 'NOT SET'));

if (!isset($_SESSION['farmer_id'])) {
    error_log("User not authenticated - redirecting to login");
    echo json_encode([
        'success' => false, 
        'message' => 'Not authenticated. Please log in again.',
        'debug' => ['session' => $_SESSION]
    ]);
    exit;
}

$farmer_id = $_SESSION['farmer_id'];
error_log("Processing request for farmer_id: " . $farmer_id);

try {
    // Test database connection
    $pdo->query("SELECT 1");
    error_log("Database connection successful");

    // Get farmer's crops with detailed information
    $stmt = $pdo->prepare("
        SELECT 
            fc.*,
            DATEDIFF(CURDATE(), fc.planting_date) as days_since_planting,
            DATEDIFF(fc.expected_harvest_date, CURDATE()) as days_until_harvest,
            (SELECT health_status FROM crop_health WHERE crop_id = fc.id ORDER BY check_date DESC LIMIT 1) as latest_health,
            (SELECT SUM(quantity) FROM yield_records WHERE crop_id = fc.id) as total_harvested
        FROM farmer_crops fc
        WHERE fc.farmer_id = ? 
        ORDER BY fc.planting_date DESC
    ");
    
    error_log("Executing crops query for farmer_id: " . $farmer_id);
    $stmt->execute([$farmer_id]);
    $crops = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Found " . count($crops) . " crops");
    
    // Get recent activities
    $activityStmt = $pdo->prepare("
        SELECT a.*, c.crop_name 
        FROM farming_activities a 
        LEFT JOIN farmer_crops c ON a.crop_id = c.id 
        WHERE a.farmer_id = ? 
        ORDER BY a.activity_date DESC, a.created_at DESC 
        LIMIT 10
    ");
    $activityStmt->execute([$farmer_id]);
    $activities = $activityStmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Found " . count($activities) . " activities");

    // Get crop health overview
    $healthStmt = $pdo->prepare("
        SELECT 
            c.crop_name,
            ch.health_status,
            ch.check_date,
            DATEDIFF(CURDATE(), ch.check_date) as days_since_check
        FROM crop_health ch
        JOIN farmer_crops c ON ch.crop_id = c.id
        WHERE ch.farmer_id = ? 
        AND ch.check_date = (
            SELECT MAX(check_date) 
            FROM crop_health 
            WHERE crop_id = c.id
        )
        ORDER BY ch.check_date DESC
    ");
    $healthStmt->execute([$farmer_id]);
    $health_data = $healthStmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Found " . count($health_data) . " health records");

    // Get upcoming activities (next 7 days)
    $upcomingStmt = $pdo->prepare("
        SELECT 
            a.*,
            c.crop_name,
            DATEDIFF(a.activity_date, CURDATE()) as days_until
        FROM farming_activities a
        JOIN farmer_crops c ON a.crop_id = c.id
        WHERE a.farmer_id = ? 
        AND a.activity_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ORDER BY a.activity_date ASC
        LIMIT 5
    ");
    $upcomingStmt->execute([$farmer_id]);
    $upcoming_activities = $upcomingStmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Found " . count($upcoming_activities) . " upcoming activities");
    
    $response = [
        'success' => true,
        'crops' => $crops,
        'activities' => $activities,
        'health_data' => $health_data,
        'upcoming_activities' => $upcoming_activities,
        'debug' => [
            'farmer_id' => $farmer_id,
            'crops_count' => count($crops),
            'activities_count' => count($activities)
        ]
    ];
    
    error_log("Sending successful response");
    echo json_encode($response);
    
} catch(PDOException $e) {
    error_log("Database error in get_crops.php: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage(),
        'debug' => ['error' => $e->getMessage()]
    ]);
} catch(Exception $e) {
    error_log("General error in get_crops.php: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>