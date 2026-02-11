<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

$farmer_id = $_SESSION['farmer_id'] ?? 1;

try {
    // Get last 30 days of data
    $date_condition = date('Y-m-d', strtotime('-30 days'));
    
    // Total costs
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(cost), 0) as total_cost FROM farming_activities WHERE farmer_id = ? AND activity_date >= ?");
    $stmt->execute([$farmer_id, $date_condition]);
    $total_cost = $stmt->fetch(PDO::FETCH_ASSOC)['total_cost'];
    
    // Activities count
    $stmt = $pdo->prepare("SELECT COUNT(*) as activities_count FROM farming_activities WHERE farmer_id = ? AND activity_date >= ?");
    $stmt->execute([$farmer_id, $date_condition]);
    $activities_count = $stmt->fetch(PDO::FETCH_ASSOC)['activities_count'];
    
    // Active crops count
    $stmt = $pdo->prepare("SELECT COUNT(DISTINCT crop_id) as crops_count FROM farming_activities WHERE farmer_id = ? AND activity_date >= ?");
    $stmt->execute([$farmer_id, $date_condition]);
    $crops_count = $stmt->fetch(PDO::FETCH_ASSOC)['crops_count'];
    
    // Completion rate
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' OR activity_date < CURDATE() THEN 1 ELSE 0 END) as completed
        FROM farming_activities 
        WHERE farmer_id = ? AND activity_date >= ?
    ");
    $stmt->execute([$farmer_id, $date_condition]);
    $completion = $stmt->fetch(PDO::FETCH_ASSOC);
    $completion_rate = $completion['total'] > 0 ? round(($completion['completed'] / $completion['total']) * 100) : 0;
    
    // Cost breakdown
    $stmt = $pdo->prepare("
        SELECT activity_type, SUM(cost) as total_cost 
        FROM farming_activities 
        WHERE farmer_id = ? AND activity_date >= ?
        GROUP BY activity_type 
        ORDER BY total_cost DESC
    ");
    $stmt->execute([$farmer_id, $date_condition]);
    $cost_breakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Recent activities for all charts
    $stmt = $pdo->prepare("
        SELECT fa.activity_date, fc.crop_name, fa.activity_type, fa.cost,
               CASE WHEN fa.activity_date < CURDATE() THEN 'completed' ELSE 'scheduled' END as status
        FROM farming_activities fa
        JOIN farmer_crops fc ON fa.crop_id = fc.id
        WHERE fa.farmer_id = ? AND fa.activity_date >= ?
        ORDER BY fa.activity_date DESC
        LIMIT 20
    ");
    $stmt->execute([$farmer_id, $date_condition]);
    $recent_activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Generate insights
    $insights = [];
    if ($total_cost > 0) {
        $insights[] = [
            'title' => 'Farm Investment',
            'description' => "You've invested P {$total_cost} in farm operations over the last 30 days.",
            'recommendation' => 'Track your yields to measure return on investment'
        ];
    }
    
    if ($activities_count > 0) {
        $insights[] = [
            'title' => 'Active Management',
            'description' => "You've completed {$activities_count} farming activities across {$crops_count} crops.",
            'recommendation' => 'Maintain consistent farm management practices'
        ];
    }
    
    if (empty($insights)) {
        $insights[] = [
            'title' => 'Get Started',
            'description' => 'No farming activities recorded yet.',
            'recommendation' => 'Add your first farming activity to start tracking'
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'totalCost' => (float)$total_cost,
            'activitiesCount' => (int)$activities_count,
            'cropsCount' => (int)$crops_count,
            'completionRate' => $completion_rate,
            'costBreakdown' => $cost_breakdown,
            'recentActivities' => $recent_activities,
            'insights' => $insights
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error loading reports: ' . $e->getMessage()
    ]);
}
?>