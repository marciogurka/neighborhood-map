var placeMarkers = [];

placesList = ko.observableArray();

function initMap() {


    var pg_marker = {lat: -25.0942395, lng: -50.1626071};

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: pg_marker
    });

    // This autocomplete is for use in the search within time entry box.
    var searchBox = new google.maps.places.SearchBox(
        document.getElementById('searchAutoComplete'));
    // Bias the searchbox to within the bounds of the map.
    searchBox.bindTo('bounds', map);

    document.getElementById('searchAutoComplete').addEventListener('keypress', function () {
        zoomToArea();
    });


    // This function takes the input value in the find nearby area text input
    // locates it, and then zooms into that area. This is so that the user can
    // show all listings, then decide to focus on one area of the map.
    function zoomToArea() {
        // Initialize the geocoder.
        var geocoder = new google.maps.Geocoder();
        // Get the address or place that the user entered.
        var address = document.getElementById('searchAutoComplete').value;

        // Make sure the address isn't blank.
        if (address != '') {
            // Geocode the address/area entered to get the center. Then, center the map
            // on it and zoom in
            geocoder.geocode(
                {
                    address: address,
                    componentRestrictions: {locality: address}
                }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        map.setCenter(results[0].geometry.location);
                        map.setZoom(15);
                    } else {
                        window.alert('We could not find that location - try entering a more' +
                            ' specific place.');
                    }
                });
        }
    }

    // This function fires when the user selects a searchbox picklist item.
    // It will do a nearby search using the selected query string or place.
    function searchBoxPlaces(searchBox) {
        hideMarkers(placeMarkers);
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            placesList.removeAll();
        } else {
            populateList(places);
            // For each place, get the icon, name and location.
            createMarkersForPlaces(places);
        }
    }

    // Listen for the event fired when the user selects a prediction from the
    // picklist and retrieve more details for that place.
    searchBox.addListener('places_changed', function () {
        searchBoxPlaces(this);
    });

    // This function will loop through the places and list them.
    function populateList(places) {
        placesList.removeAll();
        places.forEach(function (place) {
            placesList.push(place);
        });
    }

    // This function will loop through the listings and hide them all.
    function hideMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    // This function creates markers for each place found in either places search.
    function createMarkersForPlaces(places) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < places.length; i++) {
            var place = places[i];
            var marker = new google.maps.Marker({
                map: map,
                title: place.name,
                position: place.geometry.location,
                id: place.place_id,
                animation: google.maps.Animation.DROP
            });

            // Create a single infowindow to be used with the place details information
            // so that only one is open at once.
            var placeInfoWindow = new google.maps.InfoWindow();


            google.maps.event.addListener(placeInfoWindow, 'closeclick', function () {
                marker.setAnimation(null);
            });

            // If a marker is clicked, do a place details search on it in the next function.
            marker.addListener('click', function () {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                if (placeInfoWindow.marker != this) {
                    getPlacesDetails(this, placeInfoWindow);
                }
            });
            placeMarkers.push(marker);
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        }
        map.fitBounds(bounds);
    }

    // This is the PLACE DETAILS search - it's the most detailed so it's only
    // executed when a marker is selected, indicating the user wants more
    // details about that place.
    function getPlacesDetails(marker, infowindow) {
        var service = new google.maps.places.PlacesService(map);
        service.getDetails({
            placeId: marker.id
        }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Set the marker property on this infowindow so it isn't created again.
                infowindow.marker = marker;
                var innerHTML = '<div>';
                if (place.name) {
                    innerHTML += '<strong>' + place.name + '</strong>';
                }
                if (place.formatted_address) {
                    innerHTML += '<br>' + place.formatted_address;
                }
                if (place.formatted_phone_number) {
                    innerHTML += '<br>' + place.formatted_phone_number;
                }
                if (place.opening_hours) {
                    innerHTML += '<br><br><strong>Hours:</strong><br>' +
                        place.opening_hours.weekday_text[0] + '<br>' +
                        place.opening_hours.weekday_text[1] + '<br>' +
                        place.opening_hours.weekday_text[2] + '<br>' +
                        place.opening_hours.weekday_text[3] + '<br>' +
                        place.opening_hours.weekday_text[4] + '<br>' +
                        place.opening_hours.weekday_text[5] + '<br>' +
                        place.opening_hours.weekday_text[6];
                }
                if (place.photos) {
                    innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                        {maxHeight: 100, maxWidth: 200}) + '">';
                }
                innerHTML += '</div>';
                infowindow.setContent(innerHTML);
                infowindow.open(map, marker);
                // Make sure the marker property is cleared if the infowindow is closed.
                infowindow.addListener('closeclick', function () {
                    infowindow.marker = null;
                });
            }
        });
    }

}


var App = function () {
    this.address = ko.observable();
};

$(document).ready(function(){
    ko.applyBindings(new App());
});

