<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $commodity = $_GET['commodity'] ?? null;
    $location = $_GET['location'] ?? null;
    
    // Get latest market prices with enhanced data
    $sql = "
        SELECT 
            mp.*,
            COALESCE(mp.unit, 'kg') as unit,
            COALESCE(mp.change_percentage, 0) as change_percentage,
            COALESCE(mp.previous_price, mp.price) as previous_price,
            COALESCE(mp.quality_grade, 'Grade A') as quality_grade,
            COALESCE(mp.supply_level, 'Medium') as supply_level
        FROM market_prices mp
        WHERE mp.price_date = CURDATE()
    ";
    
    $params = [];
    
    if ($commodity) {
        $sql .= " AND mp.commodity LIKE ?";
        $params[] = "%$commodity%";
    }
    
    if ($location) {
        $sql .= " AND mp.market_location LIKE ?";
        $params[] = "%$location%";
    }
    
    $sql .= " ORDER BY mp.commodity ASC, mp.market_location ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $prices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get available commodities and locations for filters
    $filterStmt = $pdo->prepare("
        SELECT 
            DISTINCT commodity,
            COUNT(*) as location_count
        FROM market_prices 
        WHERE price_date = CURDATE()
        GROUP BY commodity
        ORDER BY commodity
    ");
    $filterStmt->execute();
    $commodities = $filterStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $locationStmt = $pdo->prepare("
        SELECT DISTINCT market_location 
        FROM market_prices 
        WHERE price_date = CURDATE()
        ORDER BY market_location
    ");
    $locationStmt->execute();
    $locations = $locationStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'prices' => $prices,
        'filters' => [
            'commodities' => $commodities,
            'locations' => $locations
        ]
    ]);
    
} catch(PDOException $e) {
    error_log("Market prices error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Unable to fetch market data: ' . $e->getMessage()
    ]);
}
?>