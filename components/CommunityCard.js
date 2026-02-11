class CommunityCard extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="community-widget bg-white rounded-xl shadow-sm p-5">
                <div class="flex items-center mb-4">
                    <i data-feather="users" class="text-indigo-500 mr-2"></i>
                    <h3 class="text-lg font-semibold">Community</h3>
                </div>
                
                <div class="community-updates space-y-3 mb-4">
                    ${this.innerHTML} <!-- This preserves the slotted content -->
                </div>
                
                <button class="join-discussion w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-indigo-600 rounded-lg text-sm font-medium flex items-center justify-center">
                    Join Discussion <i data-feather="chevron-right" class="ml-1 w-4 h-4"></i>
                </button>
            </div>
        `;
        
        feather.replace();
    }
}

class CommunityPost extends HTMLElement {
    connectedCallback() {
        const author = this.getAttribute('author') || '--';
        const text = this.getAttribute('text') || '--';
        
        this.innerHTML = `
            <div class="update-item p-3 bg-gray-50 rounded-lg">
                <p class="text-sm">"${text}"</p>
                <div class="text-xs text-gray-500 mt-1">- ${author}</div>
            </div>
        `;
    }
}

customElements.define('community-card', CommunityCard);
customElements.define('community-post', CommunityPost);