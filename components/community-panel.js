class CommunityPanel extends HTMLElement {
    constructor() {
        super();
        this.posts = [];
        this.categories = [
            { value: 'all', label: 'All Topics', icon: 'globe' },
            { value: 'crops', label: 'Crops', icon: 'sun' },
            { value: 'livestock', label: 'Livestock', icon: 'git-merge' },
            { value: 'pests', label: 'Pests & Diseases', icon: 'bug' },
            { value: 'weather', label: 'Weather', icon: 'cloud' },
            { value: 'market', label: 'Market Prices', icon: 'dollar-sign' },
            { value: 'equipment', label: 'Equipment', icon: 'tool' },
            { value: 'general', label: 'General', icon: 'message-circle' }
        ];
        this.postTypes = [
            { value: 'all', label: 'All Posts', icon: 'message-square' },
            { value: 'post', label: 'Discussions', icon: 'message-square' },
            { value: 'question', label: 'Questions', icon: 'help-circle' },
            { value: 'tip', label: 'Tips & Advice', icon: 'award' }
        ];
        this.selectedCategory = 'all';
        this.selectedType = 'all';
    }

    connectedCallback() {
        this.render();
        this.loadPosts();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="community-panel">
                <!-- Create Post Section -->
                <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <i data-feather="user" class="w-5 h-5 text-green-600"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-800 mb-2">Share with the community</h3>
                            <div class="space-y-3">
                                <textarea 
                                    id="postContent" 
                                    rows="3" 
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" 
                                    placeholder="Share your farming experience, ask a question, or post a tip..."
                                ></textarea>
                                
                                <div class="flex flex-wrap gap-3 items-center justify-between">
                                    <div class="flex gap-2">
                                        <select id="postType" class="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                            <option value="post">Discussion</option>
                                            <option value="question">Question</option>
                                            <option value="tip">Tip</option>
                                        </select>
                                        <select id="postCategory" class="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                            <option value="general">General</option>
                                            <option value="crops">Crops</option>
                                            <option value="livestock">Livestock</option>
                                            <option value="pests">Pests & Diseases</option>
                                            <option value="weather">Weather</option>
                                            <option value="market">Market Prices</option>
                                            <option value="equipment">Equipment</option>
                                        </select>
                                    </div>
                                    <button 
                                        id="createPostBtn"
                                        class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <i data-feather="send" class="w-4 h-4"></i>
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <!-- Sidebar -->
                    <div class="lg:col-span-1">
                        <!-- Categories -->
                        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
                            <div class="space-y-2">
                                ${this.categories.map(category => `
                                    <button 
                                        class="category-filter w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${this.selectedCategory === category.value ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'text-gray-600 hover:bg-gray-100'}"
                                        data-category="${category.value}"
                                    >
                                        <i data-feather="${category.icon}" class="w-4 h-4"></i>
                                        <span class="flex-1">${category.label}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Post Types -->
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Post Types</h3>
                            <div class="space-y-2">
                                ${this.postTypes.map(type => `
                                    <button 
                                        class="type-filter w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${this.selectedType === type.value ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'text-gray-600 hover:bg-gray-100'}"
                                        data-type="${type.value}"
                                    >
                                        <i data-feather="${type.icon}" class="w-4 h-4"></i>
                                        <span class="flex-1">${type.label}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Posts Feed -->
                    <div class="lg:col-span-3">
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-xl font-bold text-gray-800">Community Feed</h3>
                                <div class="flex items-center gap-2 text-sm text-gray-600">
                                    <i data-feather="users" class="w-4 h-4"></i>
                                    <span id="postsCount">0 posts</span>
                                </div>
                            </div>

                            <div id="postsFeed" class="space-y-4">
                                <!-- Posts will be loaded here -->
                                <div class="text-center py-8">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p class="mt-2 text-gray-500">Loading community posts...</p>
                                </div>
                            </div>

                            <div id="noPosts" class="text-center py-8 hidden">
                                <i data-feather="users" class="w-12 h-12 text-gray-300 mx-auto mb-3"></i>
                                <h4 class="text-lg font-medium text-gray-600 mb-2">No posts yet</h4>
                                <p class="text-gray-500 mb-4">Be the first to share in the community!</p>
                                <button class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                    Create First Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        feather.replace();
    }

    async loadPosts() {
        try {
            const params = new URLSearchParams({
                category: this.selectedCategory,
                type: this.selectedType
            });

            const response = await fetch(`backend/get_posts.php?${params}`);
            const result = await response.json();
            
            if (result.success) {
                this.posts = result.posts;
                this.renderPosts();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showNotification('Error loading community posts', 'error');
            this.renderPosts();
        }
    }

    renderPosts() {
        const postsFeed = this.querySelector('#postsFeed');
        const noPosts = this.querySelector('#noPosts');
        const postsCount = this.querySelector('#postsCount');

        postsCount.textContent = `${this.posts.length} ${this.posts.length === 1 ? 'post' : 'posts'}`;

        if (this.posts.length === 0) {
            postsFeed.classList.add('hidden');
            noPosts.classList.remove('hidden');
            return;
        }

        postsFeed.classList.remove('hidden');
        noPosts.classList.add('hidden');

        postsFeed.innerHTML = this.posts.map(post => `
            <div class="post-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-${this.getCategoryColor(post.category)}-100 rounded-full flex items-center justify-center">
                            <i data-feather="user" class="w-5 h-5 text-${this.getCategoryColor(post.category)}-600"></i>
                        </div>
                        <div>
                            <div class="font-semibold text-gray-800">${this.escapeHtml(post.farmer_name)}</div>
                            <div class="text-xs text-gray-500 flex items-center gap-1">
                                <i data-feather="map-pin" class="w-3 h-3"></i>
                                ${post.location || 'Botswana'}
                                <span class="mx-1">•</span>
                                ${this.formatTimeAgo(post.created_at)}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-medium px-2 py-1 rounded-full ${this.getTypeBadgeColor(post.type)}">
                            ${this.getTypeLabel(post.type)}
                        </span>
                        <span class="text-xs font-medium px-2 py-1 rounded-full ${this.getCategoryBadgeColor(post.category)}">
                            ${this.getCategoryLabel(post.category)}
                        </span>
                    </div>
                </div>
                
                <div class="post-content mb-4">
                    <p class="text-gray-700 whitespace-pre-wrap">${this.escapeHtml(post.content)}</p>
                </div>
                
                <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div class="flex gap-4">
                        <button class="like-btn flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors ${post.user_liked ? 'text-red-500' : ''}" data-post-id="${post.id}">
                            <i data-feather="heart" class="w-4 h-4 ${post.user_liked ? 'fill-current' : ''}"></i>
                            <span class="text-sm">${post.likes_count || 0}</span>
                        </button>
                        <button class="comment-btn flex items-center gap-1 text-gray-500 hover:text-indigo-500 transition-colors" data-post-id="${post.id}">
                            <i data-feather="message-square" class="w-4 h-4"></i>
                            <span class="text-sm">${post.comments_count || 0}</span>
                        </button>
                    </div>
                    <button class="share-btn flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors">
                        <i data-feather="share-2" class="w-4 h-4"></i>
                        <span class="text-sm">Share</span>
                    </button>
                </div>

                <!-- Comments Section (Initially Hidden) -->
                <div id="comments-${post.id}" class="comments-section hidden mt-4 pt-4 border-t border-gray-100">
                    <div class="space-y-3 mb-3" id="comments-list-${post.id}">
                        <!-- Comments will be loaded here -->
                    </div>
                    <div class="flex gap-2">
                        <input 
                            type="text" 
                            id="comment-input-${post.id}"
                            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                            placeholder="Write a comment..."
                        >
                        <button class="add-comment-btn bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors" data-post-id="${post.id}">
                            Post
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        feather.replace();
        this.setupPostEventListeners();
    }

    getCategoryLabel(category) {
        const cat = this.categories.find(c => c.value === category);
        return cat ? cat.label : 'General';
    }

    getTypeLabel(type) {
        const typeObj = this.postTypes.find(t => t.value === type);
        return typeObj ? typeObj.label : 'Post';
    }

    getCategoryColor(category) {
        const colors = {
            'crops': 'green',
            'livestock': 'yellow',
            'pests': 'red',
            'weather': 'blue',
            'market': 'purple',
            'equipment': 'orange',
            'general': 'indigo'
        };
        return colors[category] || 'gray';
    }

    getCategoryBadgeColor(category) {
        const colors = {
            'crops': 'bg-green-100 text-green-700',
            'livestock': 'bg-yellow-100 text-yellow-700',
            'pests': 'bg-red-100 text-red-700',
            'weather': 'bg-blue-100 text-blue-700',
            'market': 'bg-purple-100 text-purple-700',
            'equipment': 'bg-orange-100 text-orange-700',
            'general': 'bg-indigo-100 text-indigo-700'
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    }

    getTypeBadgeColor(type) {
        const colors = {
            'post': 'bg-blue-100 text-blue-700',
            'question': 'bg-orange-100 text-orange-700',
            'tip': 'bg-green-100 text-green-700'
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    setupEventListeners() {
        // Create post
        this.querySelector('#createPostBtn').addEventListener('click', () => {
            this.createPost();
        });

        // Category filters
        this.querySelectorAll('.category-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedCategory = e.currentTarget.getAttribute('data-category');
                this.render();
                this.loadPosts();
            });
        });

        // Type filters
        this.querySelectorAll('.type-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedType = e.currentTarget.getAttribute('data-type');
                this.render();
                this.loadPosts();
            });
        });

        // Enter key to create post
        this.querySelector('#postContent').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.createPost();
            }
        });
    }

    setupPostEventListeners() {
        // Like buttons
        this.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.currentTarget.getAttribute('data-post-id');
                this.toggleLike(postId, e.currentTarget);
            });
        });

        // Comment buttons
        this.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.currentTarget.getAttribute('data-post-id');
                this.toggleComments(postId);
            });
        });

        // Add comment buttons
        this.querySelectorAll('.add-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.currentTarget.getAttribute('data-post-id');
                this.addComment(postId);
            });
        });

        // Enter key in comment inputs
        this.querySelectorAll('input[type="text"][id^="comment-input-"]').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const postId = input.id.replace('comment-input-', '');
                    this.addComment(postId);
                }
            });
        });
    }

    async createPost() {
        const contentInput = this.querySelector('#postContent');
        const typeInput = this.querySelector('#postType');
        const categoryInput = this.querySelector('#postCategory');
        
        const content = contentInput.value.trim();
        const type = typeInput.value;
        const category = categoryInput.value;

        if (!content) {
            this.showNotification('Please enter post content', 'error');
            return;
        }

        const submitBtn = this.querySelector('#createPostBtn');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>';
            submitBtn.disabled = true;

            const response = await fetch('backend/create_post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content, type, category })
            });

            const result = await response.json();

            if (result.success) {
                contentInput.value = '';
                this.showNotification('Post created successfully!', 'success');
                
                // Reload posts to show the new one
                await this.loadPosts();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            this.showNotification('Error creating post: ' + error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            feather.replace();
        }
    }

    async toggleLike(postId, likeBtn) {
        const isLiked = likeBtn.classList.contains('text-red-500');
        const action = isLiked ? 'unlike' : 'like';

        try {
            const response = await fetch('backend/like_post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id: postId, action })
            });

            const result = await response.json();

            if (result.success) {
                const likeCount = likeBtn.querySelector('span');
                likeCount.textContent = result.likes_count;

                if (action === 'like') {
                    likeBtn.classList.add('text-red-500');
                    likeBtn.querySelector('i').classList.add('fill-current');
                } else {
                    likeBtn.classList.remove('text-red-500');
                    likeBtn.querySelector('i').classList.remove('fill-current');
                }
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            this.showNotification('Error updating like', 'error');
        }
    }

    async toggleComments(postId) {
        const commentsSection = this.querySelector(`#comments-${postId}`);
        const commentsList = this.querySelector(`#comments-list-${postId}`);

        if (commentsSection.classList.contains('hidden')) {
            // Load comments
            await this.loadComments(postId, commentsList);
            commentsSection.classList.remove('hidden');
        } else {
            commentsSection.classList.add('hidden');
        }
    }

    async loadComments(postId, commentsList) {
        try {
            const response = await fetch(`backend/get_comments.php?post_id=${postId}`);
            const result = await response.json();

            if (result.success) {
                commentsList.innerHTML = result.comments.map(comment => `
                    <div class="comment-item flex gap-3">
                        <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <i data-feather="user" class="w-3 h-3 text-gray-600"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-medium text-sm text-gray-800">${this.escapeHtml(comment.farmer_name)}</span>
                                <span class="text-xs text-gray-500">${this.formatTimeAgo(comment.created_at)}</span>
                            </div>
                            <p class="text-sm text-gray-700">${this.escapeHtml(comment.content)}</p>
                        </div>
                    </div>
                `).join('');

                feather.replace();
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            commentsList.innerHTML = '<div class="text-sm text-gray-500">Error loading comments</div>';
        }
    }

    async addComment(postId) {
        const commentInput = this.querySelector(`#comment-input-${postId}`);
        const content = commentInput.value.trim();

        if (!content) {
            this.showNotification('Please enter a comment', 'error');
            return;
        }

        try {
            const response = await fetch('backend/add_comment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id: postId, content })
            });

            const result = await response.json();

            if (result.success) {
                commentInput.value = '';
                this.showNotification('Comment added!', 'success');
                
                // Reload comments
                const commentsList = this.querySelector(`#comments-list-${postId}`);
                await this.loadComments(postId, commentsList);
                
                // Update comment count
                const commentBtn = this.querySelector(`.comment-btn[data-post-id="${postId}"] span`);
                const currentCount = parseInt(commentBtn.textContent) || 0;
                commentBtn.textContent = currentCount + 1;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            this.showNotification('Error adding comment', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.community-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `community-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

customElements.define('community-panel', CommunityPanel);