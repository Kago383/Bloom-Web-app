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

// For demo purposes - in production, use actual session
$farmer_id = $_SESSION['farmer_id'] ?? 1;

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['question'])) {
        throw new Exception("Question is required");
    }

    // Simple rule-based answer generation
    $answer = generateExpertAnswer($input['question']);
    $category = categorizeQuestion($input['question']);

    // Insert question and answer
    $stmt = $pdo->prepare("
        INSERT INTO expert_questions 
        (farmer_id, question, answer, category, status, answered_at) 
        VALUES (?, ?, ?, ?, 'answered', NOW())
    ");
    
    $stmt->execute([
        $farmer_id,
        $input['question'],
        $answer,
        $category
    ]);
    
    $question_id = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Question submitted successfully',
        'question_id' => $question_id,
        'answer' => $answer,
        'category' => $category
    ]);
    
} catch (Exception $e) {
    error_log("Submit question error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Error submitting question: ' . $e->getMessage()
    ]);
}

function categorizeQuestion($question) {
    $question = strtolower($question);
    
    if (strpos($question, 'pest') !== false || strpos($question, 'worm') !== false || strpos($question, 'insect') !== false) {
        return 'pest_control';
    } elseif (strpos($question, 'fertiliz') !== false || strpos($question, 'nutrient') !== false || strpos($question, 'soil') !== false) {
        return 'soil_management';
    } elseif (strpos($question, 'water') !== false || strpos($question, 'irrigat') !== false || strpos($question, 'rain') !== false) {
        return 'irrigation';
    } elseif (strpos($question, 'plant') !== false || strpos($question, 'seed') !== false || strpos($question, 'sow') !== false) {
        return 'planting';
    } elseif (strpos($question, 'harvest') !== false || strpos($question, 'yield') !== false) {
        return 'harvesting';
    } elseif (strpos($question, 'weed') !== false) {
        return 'weed_management';
    } elseif (strpos($question, 'disease') !== false || strpos($question, 'sick') !== false) {
        return 'disease_management';
    } else {
        return 'general';
    }
}

function generateExpertAnswer($question) {
    $question = strtolower($question);
    
    // Pest Control Answers
    if (strpos($question, 'armyworm') !== false) {
        return "For Fall Armyworm control: Use recommended insecticides like Emamectin benzoate or Spinosad. Apply early in the morning or late afternoon. Remove and destroy infected plants. Practice crop rotation to break the pest cycle.";
    }
    
    if (strpos($question, 'pest') !== false) {
        return "For general pest management: Monitor crops regularly, use integrated pest management (IPM) approaches, consider biological controls like neem extracts, and only use chemical pesticides as a last resort following recommended dosages.";
    }
    
    // Soil and Fertilizer Answers
    if (strpos($question, 'fertiliz') !== false) {
        return "For fertilizer application: Conduct soil testing first. Generally, apply 200-400kg/ha of compound D at planting and 150-200kg/ha of ammonium nitrate as top dressing 4-6 weeks after planting for maize. Adjust based on soil test results.";
    }
    
    if (strpos($question, 'soil') !== false) {
        return "For soil health: Practice conservation agriculture, use organic manure (5-10 tons/ha), incorporate crop residues, and consider liming if soil pH is below 5.5. Soil testing every 2-3 years is recommended.";
    }
    
    // Irrigation Answers
    if (strpos($question, 'water') !== false || strpos($question, 'irrigat') !== false) {
        return "For irrigation: Most crops need 500-700mm of water per growing season. Water deeply but infrequently to encourage deep root growth. Monitor soil moisture and adjust based on rainfall. Drip irrigation is most efficient for water conservation.";
    }
    
    // Planting Answers
    if (strpos($question, 'plant') !== false || strpos($question, 'seed') !== false) {
        return "For planting: Use certified seeds, plant at recommended depths (2-5cm depending on crop), ensure proper spacing (maize: 75cm between rows, 25cm within rows), and plant at the onset of rains for optimal germination.";
    }
    
    // Harvesting Answers
    if (strpos($question, 'harvest') !== false) {
        return "For harvesting: Harvest at physiological maturity. For maize, harvest when kernels are hard and moisture content is 20-25%. Use clean equipment, dry properly to 13% moisture, and store in clean, pest-free conditions.";
    }
    
    // Weed Management
    if (strpos($question, 'weed') !== false) {
        return "For weed control: Practice early weeding (first 3-6 weeks after planting is critical). Use integrated approaches: cultural (crop rotation), mechanical (hoeing), and chemical (herbicides). Always follow herbicide labels carefully.";
    }
    
    // Disease Management
    if (strpos($question, 'disease') !== false) {
        return "For disease management: Use disease-resistant varieties, practice crop rotation, ensure proper spacing for air circulation, remove infected plants, and use fungicides only when necessary following expert recommendations.";
    }
    
    // General farming advice
    if (strpos($question, 'maize') !== false) {
        return "For maize farming: Plant certified hybrid seeds, apply basal fertilizer at planting, top dress 4-6 weeks after emergence, control weeds early, and monitor for pests like stalk borers and armyworms regularly.";
    }
    
    if (strpos($question, 'sorghum') !== false) {
        return "For sorghum: Sorghum is drought-tolerant. Plant when soil temperature reaches 18°C, use 5-8kg seeds/ha, apply 200kg/ha compound D, and watch for birds as grain matures. Harvest when grains are hard.";
    }
    
    if (strpos($question, 'bean') !== false) {
        return "For beans: Plant 50-80kg seeds/ha, inoculate with rhizobium for nitrogen fixation, control weeds carefully as beans are sensitive to competition, and harvest when pods are dry but before shattering.";
    }
    
    // Default answer for unrecognized questions
    return "Thank you for your question about farming practices. For detailed, specific advice, consider contacting your local agricultural extension officer who can provide personalized guidance based on your specific conditions and location. Remember to always follow recommended practices for your region and crop variety.";
}
?>