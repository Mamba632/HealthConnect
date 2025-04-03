// Google Maps API Configuration
const API_KEY = 'AIzaSyCUNTxwwkTO5kEBTFcYDYrMhadLcQQFNUk'; // Replace with your actual API key

// API Configuration
const API_CONFIG = {
    // Google Maps API settings
    maps: {
        zoom: 12,
        center: { lat: 23.0225, lng: 72.5714 }, // Default center
        mapTypeId: 'roadmap',
        styles: [
            {
                featureType: 'poi.medical',
                stylers: [{ visibility: 'on' }]
            }
        ]
    },
    
    // Places API settings
    places: {
        radius: 10000, // 10km radius for nearby search
        types: ['hospital', 'doctor', 'health'],
        fields: [
            'name',
            'formatted_address',
            'formatted_phone_number',
            'rating',
            'opening_hours',
            'photos',
            'geometry',
            'types',
            'website',
            'reviews',
            'price_level',
            'user_ratings_total'
        ]
    }
};
