// YouTube API Functions
class YouTubeAPI {
    constructor() {
        this.apiKey = YOUTUBE_API_KEY;
        this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    }

    async searchVideos(query, category = '') {
        try {
            const params = new URLSearchParams({
                key: this.apiKey,
                part: 'snippet',
                q: `${query} ${category} health`,
                maxResults: YOUTUBE_CONFIG.search.maxResults,
                order: YOUTUBE_CONFIG.search.order,
                type: YOUTUBE_CONFIG.search.type,
                videoDuration: YOUTUBE_CONFIG.search.videoDuration,
                videoEmbeddable: YOUTUBE_CONFIG.search.videoEmbeddable
            });

            const response = await fetch(`${this.baseUrl}/search?${params}`);
            const data = await response.json();
            
            return this.formatVideoResults(data.items);
        } catch (error) {
            console.error('Error fetching YouTube videos:', error);
            return [];
        }
    }

    formatVideoResults(videos) {
        return videos.map(video => ({
            id: video.id.videoId,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.medium.url,
            channelTitle: video.snippet.channelTitle,
            publishedAt: new Date(video.snippet.publishedAt).toLocaleDateString()
        }));
    }

    async getChannelVideos(channelId) {
        try {
            const params = new URLSearchParams({
                key: this.apiKey,
                part: 'snippet',
                channelId: channelId,
                maxResults: YOUTUBE_CONFIG.search.maxResults,
                order: 'date',
                type: 'video'
            });

            const response = await fetch(`${this.baseUrl}/search?${params}`);
            const data = await response.json();
            
            return this.formatVideoResults(data.items);
        } catch (error) {
            console.error('Error fetching channel videos:', error);
            return [];
        }
    }
}

// Initialize YouTube API
const youtubeAPI = new YouTubeAPI();

// Function to display videos in the UI
function displayVideos(videos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = videos.map(video => `
        <div class="video-card">
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="video-duration">10:00</div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-channel">${video.channelTitle}</p>
                <p class="video-date">Published: ${video.publishedAt}</p>
                <p class="video-description">${video.description.substring(0, 100)}...</p>
                <button class="watch-btn" onclick="playVideo('${video.id}')">
                    <i class="fas fa-play"></i> Watch Video
                </button>
            </div>
        </div>
    `).join('');
}

// Function to play video in modal
function playVideo(videoId) {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <iframe width="100%" height="500" 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.close-modal').onclick = () => modal.remove();
}

// Event listeners for category clicks
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', async () => {
        const category = card.querySelector('h3').textContent;
        const videos = await youtubeAPI.searchVideos('', category);
        displayVideos(videos, 'videos-container');
    });
}); 