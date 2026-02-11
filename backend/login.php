<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        exit;
    }
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    // Validate required fields
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        exit;
    }
    
    try {
        // Check if farmer exists
        $stmt = $pdo->prepare("SELECT * FROM farmers WHERE email = ?");
        $stmt->execute([$email]);
        $farmer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($farmer && password_verify($password, $farmer['password'])) {
            // Start session and store farmer data
            session_start();
            $_SESSION['farmer_id'] = $farmer['id'];
            $_SESSION['farmer_email'] = $farmer['email'];
            $_SESSION['farmer_name'] = $farmer['first_name'] . ' ' . $farmer['last_name'];
            $_SESSION['farmer_location'] = $farmer['location'];
            $_SESSION['farm_type'] = $farmer['farm_type'];
            
            echo json_encode([
                'success' => true, 
                'message' => 'Login successful!',
                'farmer' => [
                    'id' => $farmer['id'],
                    'name' => $farmer['first_name'] . ' ' . $farmer['last_name'],
                    'email' => $farmer['email'],
                    'location' => $farmer['location'],
                    'farm_type' => $farmer['farm_type']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>