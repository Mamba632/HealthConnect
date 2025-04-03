// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyAFLLQx9eIXGZvrEKJ_j9j0tY0HFEmXhEo'; // Replace with your YouTube API key

const YOUTUBE_CONFIG = {
    // Health-related channels and playlists
    channels: {
        'health': 'UCk0BTPQwXQwQwQwQwQwQwQwQ', // Replace with actual channel IDs
        'medical': 'UCk0BTPQwXQwQwQwQwQwQwQwQ',
        'wellness': 'UCk0BTPQwXQwQwQwQwQwQwQwQ'
    },
    
    // Search parameters
    search: {
        maxResults: 10,
        order: 'relevance',
        type: 'video',
        videoDuration: 'medium',
        videoEmbeddable: true
    }
}; 