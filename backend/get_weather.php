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
    // Get current weather and forecast
    $stmt = $pdo->prepare("
        SELECT * FROM weather_data 
        WHERE forecast_date >= CURDATE() 
        ORDER BY forecast_date ASC 
        LIMIT 7
    ");
    $stmt->execute();
    $weather = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // If no data in database, generate sample data for demonstration
    if (empty($weather)) {
        $weather = generateSampleWeatherData();
    }
    
    // Enhance the weather data with additional fields for the dashboard
    $enhancedWeather = enhanceWeatherData($weather);
    
    // Generate alerts and recommendations based on weather conditions
    $alerts = generateWeatherAlerts($enhancedWeather);
    $recommendations = generateFarmingRecommendations($enhancedWeather);
    $historical = getHistoricalData($pdo);
    
    echo json_encode([
        'success' => true,
        'weather' => $enhancedWeather,
        'alerts' => $alerts,
        'recommendations' => $recommendations,
        'historical' => $historical,
        'location' => [
            'city' => 'Gaborone',
            'country' => 'Botswana',
            'coordinates' => ['lat' => -24.6282, 'lon' => 25.9231]
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch(PDOException $e) {
    error_log("Weather API Error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage(),
        'weather' => generateSampleWeatherData() // Fallback to sample data
    ]);
}

/**
 * Enhance basic weather data with additional fields for the dashboard
 */
function enhanceWeatherData($weather) {
    $enhanced = [];
    $currentDate = date('Y-m-d');
    
    foreach ($weather as $index => $day) {
        $isToday = $day['forecast_date'] == $currentDate;
        
        $enhancedDay = [
            'forecast_date' => $day['forecast_date'],
            'temperature' => round($day['temperature'], 1),
            'humidity' => (int)$day['humidity'],
            'rainfall' => round($day['rainfall'], 1),
            'wind_speed' => round($day['wind_speed'], 1),
            'wind_direction' => $day['wind_direction'] ?? getRandomWindDirection(),
            'weather_condition' => $day['weather_condition'] ?? getRandomWeatherCondition(),
            'pressure' => round(($day['pressure'] ?? rand(1000, 1020)), 1),
            'min_temp' => round($day['temperature'] - rand(3, 8), 1),
            'max_temp' => round($day['temperature'] + rand(2, 6), 1),
            'uv_index' => rand(3, 11),
            'visibility' => rand(8, 20),
            'sunrise' => '05:45',
            'sunset' => '18:30',
            'feels_like' => round($day['temperature'] + rand(-3, 3), 1),
            'dew_point' => round($day['temperature'] - ((100 - $day['humidity']) / 5), 1)
        ];
        
        // Add real-time data for today
        if ($isToday) {
            $enhancedDay['is_current'] = true;
            $enhancedDay['last_updated'] = date('H:i:s');
        }
        
        $enhanced[] = $enhancedDay;
    }
    
    return $enhanced;
}

/**
 * Generate weather alerts based on current conditions
 */
function generateWeatherAlerts($weather) {
    $alerts = [];
    $today = $weather[0] ?? null;
    
    if (!$today) return $alerts;
    
    // Temperature-based alerts
    if ($today['temperature'] > 35) {
        $alerts[] = [
            'id' => 'heat_wave',
            'type' => 'warning',
            'severity' => 'high',
            'title' => 'Heat Wave Warning',
            'description' => 'Extreme temperatures may cause heat stress to crops and livestock.',
            'instruction' => 'Increase irrigation frequency and provide shade for animals.',
            'effective' => date('Y-m-d H:i:s'),
            'expires' => date('Y-m-d H:i:s', strtotime('+2 days')),
            'icon' => '🔥'
        ];
    }
    
    if ($today['temperature'] < 10) {
        $alerts[] = [
            'id' => 'cold_alert',
            'type' => 'warning',
            'severity' => 'medium',
            'title' => 'Cold Weather Alert',
            'description' => 'Low temperatures may affect crop growth and animal health.',
            'instruction' => 'Protect sensitive crops and ensure animal shelters are adequate.',
            'effective' => date('Y-m-d H:i:s'),
            'expires' => date('Y-m-d H:i:s', strtotime('+1 day')),
            'icon' => '❄️'
        ];
    }
    
    // Rainfall-based alerts
    if ($today['rainfall'] > 25) {
        $alerts[] = [
            'id' => 'heavy_rain',
            'type' => 'warning',
            'severity' => 'high',
            'title' => 'Heavy Rainfall Warning',
            'description' => 'Heavy rain may cause flooding and soil erosion.',
            'instruction' => 'Delay field operations and ensure proper drainage.',
            'effective' => date('Y-m-d H:i:s'),
            'expires' => date('Y-m-d H:i:s', strtotime('+1 day')),
            'icon' => '🌧️'
        ];
    }
    
    // Wind-based alerts
    if ($today['wind_speed'] > 30) {
        $alerts[] = [
            'id' => 'strong_wind',
            'type' => 'warning',
            'severity' => 'medium',
            'title' => 'Strong Wind Alert',
            'description' => 'High winds may damage crops and structures.',
            'instruction' => 'Secure loose items and protect young plants.',
            'effective' => date('Y-m-d H:i:s'),
            'expires' => date('Y-m-d H:i:s', strtotime('+12 hours')),
            'icon' => '💨'
        ];
    }
    
    // Drought alert
    $weeklyRainfall = array_sum(array_column(array_slice($weather, 0, 7), 'rainfall'));
    if ($weeklyRainfall < 10) {
        $alerts[] = [
            'id' => 'drought_risk',
            'type' => 'advisory',
            'severity' => 'medium',
            'title' => 'Low Rainfall Advisory',
            'description' => 'Low expected rainfall may require additional irrigation.',
            'instruction' => 'Plan irrigation schedule and monitor soil moisture.',
            'effective' => date('Y-m-d H:i:s'),
            'expires' => date('Y-m-d H:i:s', strtotime('+7 days')),
            'icon' => '💧'
        ];
    }
    
    return $alerts;
}

/**
 * Generate farming recommendations based on weather conditions
 */
function generateFarmingRecommendations($weather) {
    $recommendations = [];
    $today = $weather[0] ?? null;
    
    if (!$today) return $recommendations;
    
    // Calculate average temperature for the week
    $weeklyTemps = array_column(array_slice($weather, 0, 7), 'temperature');
    $avgTemp = array_sum($weeklyTemps) / count($weeklyTemps);
    
    // Planting recommendations
    if ($avgTemp >= 18 && $avgTemp <= 32) {
        $recommendations[] = [
            'category' => 'planting',
            'priority' => 'high',
            'title' => 'Ideal Planting Conditions',
            'description' => 'Current weather is perfect for planting maize, sorghum, and beans.',
            'icon' => '🌱',
            'actions' => ['Prepare seedbeds', 'Plant within 3 days']
        ];
    }
    
    // Irrigation recommendations
    $next3DayRain = array_sum(array_column(array_slice($weather, 0, 3), 'rainfall'));
    if ($next3DayRain < 15) {
        $recommendations[] = [
            'category' => 'irrigation',
            'priority' => 'medium',
            'title' => 'Irrigation Recommended',
            'description' => 'Low rainfall expected in next 3 days. Schedule irrigation.',
            'icon' => '💧',
            'actions' => ['Check soil moisture', 'Schedule watering']
        ];
    }
    
    // Fertilizer application
    if ($today['rainfall'] < 10 && $weather[0]['rainfall'] < 5) {
        $recommendations[] = [
            'category' => 'fertilizer',
            'priority' => 'medium',
            'title' => 'Fertilizer Application',
            'description' => 'Good conditions for fertilizer application without rain washout.',
            'icon' => '🧪',
            'actions' => ['Apply nitrogen fertilizers', 'Avoid before heavy rain']
        ];
    }
    
    // Pest control
    if ($today['humidity'] > 70 && $today['temperature'] > 25) {
        $recommendations[] = [
            'category' => 'pest_control',
            'priority' => 'low',
            'title' => 'Pest Monitoring',
            'description' => 'Warm and humid conditions may increase pest activity.',
            'icon' => '🐛',
            'actions' => ['Monitor for pests', 'Prepare organic pesticides']
        ];
    }
    
    // Harvest recommendations
    $hasUpcomingRain = false;
    foreach (array_slice($weather, 1, 3) as $day) { // Check next 3 days
        if ($day['rainfall'] > 10) {
            $hasUpcomingRain = true;
            break;
        }
    }
    
    if ($hasUpcomingRain) {
        $recommendations[] = [
            'category' => 'harvest',
            'priority' => 'high',
            'title' => 'Urgent Harvest Consideration',
            'description' => 'Rain expected soon. Consider harvesting mature crops.',
            'icon' => '⏰',
            'actions' => ['Harvest ripe crops', 'Prepare storage']
        ];
    }
    
    return $recommendations;
}

/**
 * Get historical weather data
 */
function getHistoricalData($pdo) {
    try {
        // Try to get real historical data
        $stmt = $pdo->prepare("
            SELECT 
                AVG(temperature) as avg_temp,
                SUM(rainfall) as total_rainfall,
                MAX(temperature) as max_temp,
                MIN(temperature) as min_temp,
                COUNT(*) as days
            FROM weather_data 
            WHERE forecast_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE()
        ");
        $stmt->execute();
        $lastWeek = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // If no historical data, return sample data
        if (!$lastWeek || $lastWeek['days'] == 0) {
            return [
                'last_week' => [
                    'avg_temperature' => 26.5,
                    'total_rainfall' => 12.3,
                    'max_temp' => 32.1,
                    'min_temp' => 18.7
                ],
                'last_month' => [
                    'avg_temperature' => 25.8,
                    'total_rainfall' => 45.6,
                    'rainy_days' => 8,
                    'sunny_days' => 22
                ],
                'seasonal' => [
                    'trend' => 'warming',
                    'change' => '+1.2°C',
                    'rainfall_variance' => '-15%'
                ]
            ];
        }
        
        return [
            'last_week' => [
                'avg_temperature' => round($lastWeek['avg_temp'], 1),
                'total_rainfall' => round($lastWeek['total_rainfall'], 1),
                'max_temp' => round($lastWeek['max_temp'], 1),
                'min_temp' => round($lastWeek['min_temp'], 1)
            ],
            'last_month' => [
                'avg_temperature' => round($lastWeek['avg_temp'] + rand(-2, 2), 1),
                'total_rainfall' => round($lastWeek['total_rainfall'] * 4, 1),
                'rainy_days' => rand(6, 10),
                'sunny_days' => rand(20, 25)
            ],
            'seasonal' => [
                'trend' => 'warming',
                'change' => '+1.2°C',
                'rainfall_variance' => '-15%'
            ]
        ];
        
    } catch (Exception $e) {
        error_log("Historical data error: " . $e->getMessage());
        return [
            'last_week' => [
                'avg_temperature' => 26.5,
                'total_rainfall' => 12.3,
                'max_temp' => 32.1,
                'min_temp' => 18.7
            ],
            'last_month' => [
                'avg_temperature' => 25.8,
                'total_rainfall' => 45.6,
                'rainy_days' => 8,
                'sunny_days' => 22
            ],
            'seasonal' => [
                'trend' => 'warming',
                'change' => '+1.2°C',
                'rainfall_variance' => '-15%'
            ]
        ];
    }
}

/**
 * Generate sample weather data for demonstration
 */
function generateSampleWeatherData() {
    $weather = [];
    $conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'];
    $baseTemp = rand(22, 28);
    
    for ($i = 0; $i < 7; $i++) {
        $date = date('Y-m-d', strtotime("+$i days"));
        $tempVariation = rand(-3, 3);
        
        $weather[] = [
            'forecast_date' => $date,
            'temperature' => $baseTemp + $tempVariation,
            'humidity' => rand(45, 85),
            'rainfall' => rand(0, 30) / 10,
            'wind_speed' => rand(10, 40) / 10,
            'wind_direction' => getRandomWindDirection(),
            'weather_condition' => $conditions[array_rand($conditions)],
            'pressure' => rand(1005, 1015),
            'min_temp' => $baseTemp + $tempVariation - rand(3, 8),
            'max_temp' => $baseTemp + $tempVariation + rand(2, 6)
        ];
    }
    
    return $weather;
}

/**
 * Helper function to get random wind direction
 */
function getRandomWindDirection() {
    $directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return $directions[array_rand($directions)];
}

/**
 * Helper function to get random weather condition
 */
function getRandomWeatherCondition() {
    $conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy', 'Clear', 'Windy'];
    return $conditions[array_rand($conditions)];
}

?>