<?php
require_once 'config.php';

try {
    // Check if profile_picture column exists
    $check_column = $pdo->prepare("SHOW COLUMNS FROM farmers LIKE 'profile_picture'");
    $check_column->execute();
    $column_exists = $check_column->fetch();

    if (!$column_exists) {
        // Add the missing columns
        $alter_sql = "
            ALTER TABLE farmers 
            ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL,
            ADD COLUMN farm_size DECIMAL(10,2) DEFAULT NULL,
            ADD COLUMN experience_years INT DEFAULT NULL,
            ADD COLUMN bio TEXT DEFAULT NULL,
            ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ";
        
        $pdo->exec($alter_sql);
        echo "Successfully added profile columns to farmers table";
    } else {
        echo "Profile columns already exist";
    }
    
} catch (PDOException $e) {
    echo "Error updating schema: " . $e->getMessage();
}
?>