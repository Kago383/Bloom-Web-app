<?php
require_once 'config.php';

// Add profile fields to farmers table
$alter_table = "
ALTER TABLE farmers 
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS farm_size DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
";

try {
    $pdo->exec($alter_table);
    echo "Profile tables updated successfully";
} catch (PDOException $e) {
    echo "Error updating tables: " . $e->getMessage();
}
?>