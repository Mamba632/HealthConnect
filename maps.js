// Global variables
let map;
let userMarker;
let hospitalMarkers = [];
let directionsService;
let directionsRenderer;
let placesService;

// Sample hospital data (you can replace this with real data)
const hospitals = [
    {
        name: 'City Hospital',
        position: { lat: 23.0225, lng: 72.5714 },
        address: '123 Healthcare Ave, Medical City',
        phone: '+1 234 567 890',
        status: 'open',
        rating: 4.5,
        specialties: ['Emergency Care', 'Surgery', 'Pediatrics'],
        isEmergency: true,
        is24Hours: true
    },
    {
        name: 'Green Care Clinic',
        position: { lat: 23.0325, lng: 72.5814 },
        address: '456 Wellness Blvd, Medical District',
        phone: '+1 234 567 891',
        status: 'open',
        rating: 4.2,
        specialties: ['General Medicine', 'Dermatology'],
        isEmergency: false,
        is24Hours: false
    }
];

// Initialize the map
function initMap() {
    // Initialize services
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#1a237e',
            strokeWeight: 5
        }
    });

    // Create map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 23.0225, lng: 72.5714 },
        zoom: 12,
        styles: [
            {
                featureType: 'poi.medical',
                stylers: [{ visibility: 'on' }]
            }
        ]
    });

    // Initialize places service
    placesService = new google.maps.places.PlacesService(map);

    // Set up directions renderer
    directionsRenderer.setMap(map);
    
    // Add initial hospital markers
    hospitals.forEach(hospital => addHospitalMarker(hospital));
    updateHospitalList();
}

// Get user's current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Update user marker
                if (userMarker) userMarker.setMap(null);
                userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    icon: {
                        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                        scaledSize: new google.maps.Size(32, 32)
                    },
                    title: 'Your Location'
                });

                map.setCenter(userLocation);
                map.setZoom(13);

                // Hide location prompt
                document.getElementById('locationPrompt').style.display = 'none';
                hasLocation = true;

                // Find nearby hospitals and clinics
                findNearbyMedicalFacilities(userLocation);
            },
            error => {
                alert('Error getting location: ' + error.message);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Find nearby medical facilities using Places API
function findNearbyMedicalFacilities(location) {
    // Clear existing markers
    hospitalMarkers.forEach(({ marker }) => marker.setMap(null));
    hospitalMarkers = [];

    // Search for hospitals with multiple keywords to get more results
    const searchKeywords = [
        'hospital',
        'medical center',
        'clinic',
        'healthcare',
        'emergency room',
        'medical facility'
    ];

    searchKeywords.forEach(keyword => {
        const request = {
            location: location,
            radius: 10000, // Increased to 10km radius
            type: ['hospital', 'doctor', 'health'],
            keyword: keyword
        };

        placesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(place => {
                    // Check if we already have this place
                    if (!hospitalMarkers.some(({ hospital }) => hospital.place_id === place.place_id)) {
                        placesService.getDetails({
                            placeId: place.place_id,
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
                        }, (placeDetails, detailsStatus) => {
                            if (detailsStatus === google.maps.places.PlacesServiceStatus.OK) {
                                // Add emergency service check
                                placeDetails.isEmergency = placeDetails.types.includes('hospital') || 
                                                         placeDetails.types.includes('emergency_room');
                                addMedicalFacilityMarker(placeDetails, 'hospital');
                            }
                        });
                    }
                });
            }
        });
    });
}

// Add marker for a medical facility
function addMedicalFacilityMarker(place, type) {
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: {
            url: type === 'hospital' ? 
                'https://maps.google.com/mapfiles/ms/icons/red-dot.png' : 
                'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new google.maps.Size(32, 32)
        }
    });

    const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(place, type)
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
        showRoute(place);
    });

    hospitalMarkers.push({ marker, hospital: place });
    updateDistances(userMarker.getPosition());
    updateHospitalList();
}

// Create info window content
function createInfoWindowContent(place, type) {
    const isOpen = place.opening_hours ? place.opening_hours.isOpen() : false;
    const rating = place.rating ? place.rating : 'N/A';
    const totalRatings = place.user_ratings_total ? place.user_ratings_total : 'N/A';
    const priceLevel = place.price_level ? '$'.repeat(place.price_level) : 'N/A';
    
    return `
        <div class="info-window">
            <h3>${place.name}</h3>
            <p><i class="fas fa-map-marker-alt"></i> ${place.formatted_address}</p>
            <p><i class="fas fa-phone"></i> ${place.formatted_phone_number || 'N/A'}</p>
            <p><i class="fas fa-star"></i> Rating: ${rating} (${totalRatings} reviews)</p>
            <p><i class="fas fa-dollar-sign"></i> Price Level: ${priceLevel}</p>
            <p><i class="fas fa-clock"></i> ${isOpen ? 'Open Now' : 'Closed'}</p>
            <p><i class="fas fa-hospital"></i> ${type === 'hospital' ? 'Hospital' : 'Clinic'}</p>
            ${place.website ? `<p><i class="fas fa-globe"></i> <a href="${place.website}" target="_blank">Website</a></p>` : ''}
            ${place.photos ? `<img src="${place.photos[0].getUrl()}" alt="${place.name}" style="width: 100%; max-width: 200px;">` : ''}
            ${place.reviews ? `
                <div class="reviews">
                    <h4>Recent Reviews:</h4>
                    ${place.reviews.slice(0, 3).map(review => `
                        <div class="review">
                            <p><strong>${review.author_name}</strong> (${review.rating}★)</p>
                            <p>${review.text}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Add marker for a predefined hospital
function addHospitalMarker(hospital) {
    const marker = new google.maps.Marker({
        position: hospital.position,
        map: map,
        title: hospital.name,
        icon: {
            url: hospital.isEmergency ? 
                'https://maps.google.com/mapfiles/ms/icons/red-dot.png' : 
                'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new google.maps.Size(32, 32)
        }
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="info-window">
                <h3>${hospital.name}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${hospital.address}</p>
                <p><i class="fas fa-phone"></i> ${hospital.phone}</p>
                <p><i class="fas fa-star"></i> Rating: ${hospital.rating}</p>
                <p><i class="fas fa-clock"></i> ${hospital.is24Hours ? '24/7' : 'Regular Hours'}</p>
                ${hospital.isEmergency ? '<p><i class="fas fa-ambulance"></i> Emergency Services Available</p>' : ''}
                <div class="specialties">
                    ${hospital.specialties.map(spec => `<span class="tag">${spec}</span>`).join('')}
                </div>
            </div>
        `
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
        showRoute(hospital);
    });

    hospitalMarkers.push({ marker, hospital });
}

// Update distances for all hospitals
function updateDistances(userLocation) {
    hospitalMarkers.forEach(({ marker, hospital }) => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(userLocation),
            marker.getPosition()
        );
        hospital.distance = (distance / 1000).toFixed(1); // Convert to kilometers
    });

    updateHospitalList();
}

// Show route to selected hospital
function showRoute(hospital) {
    if (!userMarker) {
        alert('Please share your location first');
        return;
    }

    const request = {
        origin: userMarker.getPosition(),
        destination: hospital.position || hospital.geometry.location,
        travelMode: 'DRIVING'
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            const route = result.routes[0];
            const distance = route.legs[0].distance.text;
            const duration = route.legs[0].duration.text;
            
            document.querySelectorAll('.hospital-card').forEach(card => {
                card.classList.remove('active');
                if (card.dataset.name === hospital.name) {
                    card.classList.add('active');
                    card.querySelector('.distance-badge').textContent = 
                        `${distance} (${duration} by car)`;
                }
            });
        }
    });
}

// Update the search function
function searchHospital() {
    if (!hasLocation) {
        alert('Please click "Use My Location" first to find nearby hospitals');
        return;
    }
    
    const searchInput = document.getElementById('hospitalSearch');
    const searchTerm = searchInput.value.toLowerCase();
    
    // Clear previous search results
    hospitalMarkers.forEach(({ marker }) => {
        marker.setVisible(false);
    });
    
    // Filter hospitals based on search term
    const matchingHospitals = hospitalMarkers.filter(({ hospital }) => {
        const hospitalName = hospital.name.toLowerCase();
        const hospitalAddress = (hospital.formatted_address || hospital.address || '').toLowerCase();
        return hospitalName.includes(searchTerm) || hospitalAddress.includes(searchTerm);
    });
    
    if (matchingHospitals.length === 0) {
        // If no matches found, try to find new places
        const request = {
            location: userMarker.getPosition(),
            radius: 10000,
            type: ['hospital', 'doctor', 'health'],
            keyword: searchTerm
        };

        placesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(place => {
                    placesService.getDetails({
                        placeId: place.place_id,
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
                    }, (placeDetails, detailsStatus) => {
                        if (detailsStatus === google.maps.places.PlacesServiceStatus.OK) {
                            placeDetails.isEmergency = placeDetails.types.includes('hospital') || 
                                                     placeDetails.types.includes('emergency_room');
                            addMedicalFacilityMarker(placeDetails, 'hospital');
                        }
                    });
                });
            }
        });
    } else {
        // Show matching hospitals
        matchingHospitals.forEach(({ marker }) => {
            marker.setVisible(true);
        });
        
        // Center map on the first matching hospital
        if (matchingHospitals.length > 0) {
            map.setCenter(matchingHospitals[0].marker.getPosition());
            map.setZoom(13);
        }
    }
    
    updateHospitalList();
}

// Update the hospital list display
function updateHospitalList() {
    const listContainer = document.getElementById('hospital-list');
    listContainer.innerHTML = '';

    const searchTerm = document.querySelector('.search-input').value.toLowerCase();
    
    // Sort hospitals by priority (rating, emergency services, distance)
    const sortedHospitals = [...hospitalMarkers]
        .filter(({ hospital }) => hospital.name.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
            // First sort by rating (higher rating first)
            const ratingDiff = (b.hospital.rating || 0) - (a.hospital.rating || 0);
            if (ratingDiff !== 0) return ratingDiff;

            // Then by emergency services (emergency services first)
            const emergencyDiff = (b.hospital.isEmergency ? 1 : 0) - (a.hospital.isEmergency ? 1 : 0);
            if (emergencyDiff !== 0) return emergencyDiff;

            // Finally by distance (closer first)
            return (a.hospital.distance || 0) - (b.hospital.distance || 0);
        });

    if (sortedHospitals.length === 0) {
        listContainer.innerHTML = '<div class="no-results">No healthcare facilities found. Try a different search term.</div>';
        return;
    }

    // Add a header for the best facilities
    const header = document.createElement('div');
    header.className = 'facilities-header';
    header.innerHTML = `
        <h3><i class="fas fa-star"></i> Best Healthcare Facilities Near You</h3>
        <p>Sorted by rating, emergency services, and distance</p>
    `;
    listContainer.appendChild(header);

    sortedHospitals.forEach(({ hospital }, index) => {
        const card = document.createElement('div');
        card.className = 'hospital-card';
        if (index < 3) card.classList.add('top-facility');
        card.dataset.name = hospital.name;
        
        const isOpen = hospital.opening_hours ? hospital.opening_hours.isOpen() : hospital.status === 'open';
        const rating = hospital.rating ? hospital.rating : 'N/A';
        
        card.innerHTML = `
            ${index < 3 ? `<div class="top-badge">Top ${index + 1}</div>` : ''}
            <div class="hospital-name">${hospital.name}</div>
            <div class="hospital-info">${hospital.formatted_address || hospital.address}</div>
            <div class="hospital-status">
                <span class="status-indicator status-${isOpen ? 'open' : 'closed'}"></span>
                ${isOpen ? 'Open Now' : 'Closed'}
            </div>
            <div class="hospital-rating">
                <i class="fas fa-star"></i> ${rating}
            </div>
            <div class="distance-badge">
                ${hospital.distance ? hospital.distance + ' km' : 'Calculate distance...'}
            </div>
            ${hospital.isEmergency ? '<div class="emergency-badge"><i class="fas fa-ambulance"></i> Emergency Services Available</div>' : ''}
            <div class="hospital-specialties">
                ${hospital.specialties ? hospital.specialties.map(spec => `<span class="specialty-tag">${spec}</span>`).join('') : ''}
            </div>
            <div class="hospital-actions">
                <button class="action-btn directions-btn" onclick="showRoute(${JSON.stringify(hospital)})">
                    <i class="fas fa-directions"></i> Get Directions
                </button>
                <button class="action-btn call-btn" onclick="window.location.href='tel:${hospital.phone || hospital.formatted_phone_number}'">
                    <i class="fas fa-phone"></i> Call
                </button>
            </div>
        `;
        
        card.onclick = () => {
            showRoute(hospital);
            map.setCenter(hospital.position || hospital.geometry.location);
            map.setZoom(15);
        };
        
        listContainer.appendChild(card);
    });
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    searchInput.addEventListener('input', searchHospital);
    searchBtn.addEventListener('click', searchHospital);
    
    // Add enter key support
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchHospital();
        }
    });
});

// Filter results based on user selection
function filterResults() {
    const facilityType = document.getElementById('facilityFilter').value;
    const specialization = document.getElementById('specializationFilter').value;
    const availability = document.getElementById('availabilityFilter').value;

    hospitalMarkers.forEach(({ marker, hospital }) => {
        let showMarker = true;

        // Apply filters
        if (facilityType !== 'all') {
            if (facilityType === 'hospital' && !hospital.isEmergency) showMarker = false;
            if (facilityType === 'clinic' && hospital.isEmergency) showMarker = false;
        }

        if (availability === 'open' && !hospital.opening_hours?.isOpen()) showMarker = false;
        if (availability === '24/7' && !hospital.is24Hours) showMarker = false;

        marker.setVisible(showMarker);
    });

    updateHospitalList();
} 