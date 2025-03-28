const API_KEY = "AIzaSyCUNTxwwkTO5kEBTFcYDYrMhadLcQQFNUk";

function findNearbyHospitals(map, location) {
    var service = new google.maps.places.PlacesService(map);
    var request = {
        location: location,
        radius: 5000, // 5km radius
        type: ["hospital"]
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(place => {
                new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name
                });
            });
        } else {
            console.error("No hospitals found.");
        }
    });
}
