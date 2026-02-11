<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    // Sample community posts
    $sample_posts = [
        [
            'farmer_id' => 1,
            'content' => 'Just harvested my maize crop! Yield is looking good this season despite the dry spell. Anyone else seeing similar results?',
            'type' => 'post',
            'category' => 'crops'
        ],
        [
            'farmer_id' => 2,
            'content' => 'What\'s the best organic method to control aphids on my vegetables? Chemical sprays are getting expensive.',
            'type' => 'question',
            'category' => 'pests'
        ],
        [
            'farmer_id' => 3,
            'content' => 'Tip: Planting sunflowers around your field helps attract beneficial insects and can reduce pest problems naturally.',
            'type' => 'tip',
            'category' => 'pests'
        ],
        [
            'farmer_id' => 1,
            'content' => 'Market prices for groundnuts are rising in Gaborone. Good time to sell if you have stored produce!',
            'type' => 'post',
            'category' => 'market'
        ],
        [
            'farmer_id' => 4,
            'content' => 'How often should I water my tomato plants during the hot season? My current schedule doesn\'t seem to be working well.',
            'type' => 'question',
            'category' => 'crops'
        ],
        [
            'farmer_id' => 2,
            'content' => 'Just attended a great workshop on soil conservation techniques. The key is mulching and crop rotation!',
            'type' => 'tip',
            'category' => 'soil'
        ],
        [
            'farmer_id' => 3,
            'content' => 'Has anyone tried the new drought-resistant maize varieties? Looking for feedback before planting next season.',
            'type' => 'question',
            'category' => 'crops'
        ],
        [
            'farmer_id' => 1,
            'content' => 'Livestock farmers: What\'s your experience with rotational grazing? Does it really improve pasture quality?',
            'type' => 'question',
            'category' => 'livestock'
        ]
    ];

    $added_count = 0;
    foreach ($sample_posts as $post) {
        $stmt = $pdo->prepare("INSERT INTO community_posts (farmer_id, content, type, category) VALUES (?, ?, ?, ?)");
        $stmt->execute([$post['farmer_id'], $post['content'], $post['type'], $post['category']]);
        $added_count++;
    }

    echo json_encode([
        'success' => true,
        'message' => "Successfully added $added_count sample posts to the community",
        'posts_added' => $added_count
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error adding sample posts: ' . $e->getMessage()
    ]);
}
?>