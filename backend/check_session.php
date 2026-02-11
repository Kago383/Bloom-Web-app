<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['farmer_id'])) {
    echo json_encode([
        'success' => true,
        'farmer' => [
            'id' => $_SESSION['farmer_id'],
            'name' => $_SESSION['farmer_name'],
            'email' => $_SESSION['farmer_email'],
            'location' => $_SESSION['farmer_location'],
            'farm_type' => $_SESSION['farm_type']
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
}
?>